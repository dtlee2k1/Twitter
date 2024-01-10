import { MediaType, MediaTypeQuery, TweetAudience, TweetType } from '~/constants/enums'
import databaseService from './database.services'
import Tweet from '~/models/schemas/Tweet.schema'
import { ObjectId, WithId } from 'mongodb'
import Follower from '~/models/schemas/Follower.schema'

class SearchService {
  async search({
    page,
    limit,
    content,
    user_id,
    media_type,
    people_follow
  }: {
    page: number
    limit: number
    content: string
    user_id?: string
    media_type?: MediaTypeQuery
    people_follow?: boolean
  }) {
    const userIdObj = new ObjectId(user_id)

    const $match: any = {
      $text: {
        $search: content
      }
    }

    if (media_type) {
      if (media_type === MediaTypeQuery.Image) {
        $match['medias.type'] = MediaType.Image
      }
      if (media_type === MediaTypeQuery.Video) {
        $match['medias.type'] = {
          $in: [MediaType.Video, MediaType.HLS]
        }
      }
    }

    const followedUserIds: WithId<Follower>[] = await databaseService.followers
      .find(
        { user_id: userIdObj },
        {
          projection: {
            followed_user_id: 1,
            _id: 0
          }
        }
      )
      .toArray()

    // Danh sách các user_id được main user followed
    const ids: ObjectId[] = followedUserIds.map((item) => {
      return new ObjectId(item.followed_user_id)
    })
    // Thêm user_id của main user để new feeds chứa cả tweet của user đó
    ids.push(userIdObj)

    if (people_follow && user_id) {
      $match['user_id'] = {
        $in: ids
      }
    }

    // Aggregate get tweets by search + get total tweet documents
    const [tweets, tweetsCount] = await Promise.all([
      databaseService.tweets
        .aggregate<Tweet>([
          {
            $match
          },
          {
            $lookup: {
              from: 'users',
              localField: 'user_id',
              foreignField: '_id',
              as: 'user_info'
            }
          },
          {
            $unwind: {
              path: '$user_info'
            }
          },
          {
            $match: {
              $or: [
                {
                  audience: TweetAudience.Everyone
                },
                {
                  $and: [
                    {
                      audience: TweetAudience.TwitterCircle
                    },
                    {
                      $or: [
                        {
                          'user_info.twitter_circle': {
                            $in: [followedUserIds]
                          }
                        },
                        {
                          user_id: userIdObj
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          },
          {
            $skip: limit * (page - 1)
          },
          {
            $limit: limit
          },
          {
            $lookup: {
              from: 'hashtags',
              localField: 'hashtags',
              foreignField: '_id',
              as: 'hashtags'
            }
          },
          {
            $lookup: {
              from: 'users',
              localField: 'mentions',
              foreignField: '_id',
              as: 'mentions'
            }
          },
          {
            $addFields: {
              mentions: {
                $map: {
                  input: '$mentions',
                  as: 'mention',
                  in: {
                    _id: '$$mention._id',
                    name: '$$mention.name',
                    username: '$$mention.username',
                    email: '$$mention.email'
                  }
                }
              }
            }
          },
          {
            $lookup: {
              from: 'bookmarks',
              localField: '_id',
              foreignField: 'tweet_id',
              as: 'bookmarks'
            }
          },
          {
            $lookup: {
              from: 'likes',
              localField: '_id',
              foreignField: 'tweet_id',
              as: 'likes'
            }
          },
          {
            $lookup: {
              from: 'tweets',
              localField: '_id',
              foreignField: 'parent_id',
              as: 'tweet_children'
            }
          },
          {
            $addFields: {
              bookmarks: {
                $size: '$bookmarks'
              },
              likes: {
                $size: '$likes'
              },
              retweet_count: {
                $size: {
                  $filter: {
                    input: '$tweet_children',
                    as: 'tweet_child',
                    cond: {
                      $eq: ['$$tweet_child.type', TweetType.Retweet]
                    }
                  }
                }
              },
              comment_count: {
                $size: {
                  $filter: {
                    input: '$tweet_children',
                    as: 'tweet_child',
                    cond: {
                      $eq: ['$$tweet_child.type', TweetType.Comment]
                    }
                  }
                }
              },
              quote_count: {
                $size: {
                  $filter: {
                    input: '$tweet_children',
                    as: 'tweet_child',
                    cond: {
                      $eq: ['$$tweet_child.type', TweetType.QuoteTweet]
                    }
                  }
                }
              }
            }
          },
          {
            $project: {
              tweet_children: 0,
              user_info: {
                password: 0,
                date_of_birth: 0,
                email_verify_token: 0,
                forgot_password_token: 0,
                verify: 0,
                twitter_circle: 0
              }
            }
          }
        ])
        .toArray(),
      databaseService.tweets
        .aggregate([
          {
            $match
          },
          {
            $lookup: {
              from: 'users',
              localField: 'user_id',
              foreignField: '_id',
              as: 'user_info'
            }
          },
          {
            $unwind: {
              path: '$user_info'
            }
          },
          {
            $match: {
              $or: [
                {
                  audience: TweetAudience.Everyone
                },
                {
                  $and: [
                    {
                      audience: TweetAudience.TwitterCircle
                    },
                    {
                      $or: [
                        {
                          'user_info.twitter_circle': {
                            $in: [userIdObj]
                          }
                        },
                        {
                          user_id: userIdObj
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          },
          {
            $count: 'total'
          }
        ])
        .toArray()
    ])

    // Tăng views cho mỗi tweet khi được GET
    const tweet_ids = tweets.map((tweet) => tweet._id as ObjectId)
    const date = new Date()
    await databaseService.tweets.updateMany(
      { _id: { $in: tweet_ids } },
      {
        $inc: { user_views: 1 },
        $set: {
          updated_at: date
        }
      }
    )

    // Lấy data mới trả về sau khi tăng view (p/s:`updateMany` method không có tính năng trả về new data sau khi update)
    tweets.forEach((tweet) => {
      tweet.updated_at = date
      tweet.user_views += 1
    })

    return { tweets, tweetsCount: tweetsCount[0]?.total || 0 }
  }
}

const searchService = new SearchService()
export default searchService
