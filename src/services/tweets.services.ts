import { TweetRequestBody } from '~/models/requests/Tweet.requests'
import databaseService from './database.services'
import Tweet from '~/models/schemas/Tweet.schema'
import { ObjectId, WithId } from 'mongodb'
import { TweetsMessages } from '~/constants/messages'
import Hashtag from '~/models/schemas/Hashtag.schema'
import { TweetAudience, TweetType } from '~/constants/enums'
import Follower from '~/models/schemas/Follower.schema'

class TweetService {
  async checkAndCreateHashtag(hashtags: string[]) {
    const hashtagsDocument = await Promise.all(
      hashtags.map(async (hashtag) => {
        // Tìm trong DB, nếu có thì lấy còn ko thì tạo mới
        const result = await databaseService.hashtags.findOneAndUpdate(
          { name: hashtag },
          {
            $setOnInsert: new Hashtag({
              name: hashtag
            })
          },
          { upsert: true, returnDocument: 'after' }
        )

        return result
      })
    )

    return hashtagsDocument.map((hashtag) => (hashtag as WithId<Hashtag>)._id)
  }

  async createTweet(body: TweetRequestBody, user_id: string) {
    const { type, audience, content, parent_id, mentions, medias } = body

    const hashtags = await this.checkAndCreateHashtag(body.hashtags)

    await databaseService.tweets.insertOne(
      new Tweet({
        user_id: new ObjectId(user_id),
        type,
        audience,
        content,
        parent_id,
        hashtags,
        mentions,
        medias
      })
    )

    return {
      message: TweetsMessages.CreateTweetSuccess
    }
  }

  async increaseView(tweet_id: string, user_id?: string) {
    const inc = user_id ? { user_views: 1 } : { guest_views: 1 }

    const result = await databaseService.tweets.findOneAndUpdate(
      {
        _id: new ObjectId(tweet_id)
      },
      {
        $inc: inc,
        $currentDate: {
          updated_at: true
        }
      },
      {
        returnDocument: 'after',
        projection: {
          user_views: 1,
          guest_views: 1,
          updated_at: 1
        }
      }
    )

    return result as WithId<Tweet>
  }

  async getTweetChildren({
    tweet_id,
    user_id,
    tweet_type = TweetType.Comment,
    limit = 10,
    page = 1
  }: {
    tweet_id: string
    user_id?: string
    tweet_type: TweetType
    limit: number
    page: number
  }) {
    const tweets = await databaseService.tweets
      .aggregate<Tweet>([
        {
          $match: {
            parent_id: new ObjectId(tweet_id),
            type: tweet_type
          }
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
                  email: '$$mention.email',
                  twitter_circle: '$$mention.twitter_circle'
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
            tweet_children: 0
          }
        }
      ])
      .toArray()

    // Tăng views cho mỗi tweet children khi được GET + get total tweet children documents
    const inc = user_id ? { user_views: 1 } : { guest_views: 1 }
    const ids = tweets.map((tweet) => tweet._id as ObjectId)
    const date = new Date()
    const [_, tweetsCount] = await Promise.all([
      databaseService.tweets.updateMany(
        { _id: { $in: ids } },
        {
          $inc: inc,
          $set: {
            updated_at: date
          }
        }
      ),
      databaseService.tweets.countDocuments({
        parent_id: new ObjectId(tweet_id),
        type: tweet_type
      })
    ])

    // Lấy data mới trả về sau khi tăng view (p/s:`updateMany` method không có tính năng trả về new data sau khi update)
    tweets.forEach((tweet) => {
      tweet.updated_at = date
      if (user_id) tweet.user_views += 1
      else tweet.guest_views += 1
    })

    return { tweets, tweetsCount }
  }

  async getNewFeeds({ user_id, limit = 10, page = 1 }: { user_id: string; limit: number; page: number }) {
    const userIdObj = new ObjectId(user_id)

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

    // Aggregate tweets for new feeds + get total tweet documents
    const [tweets, tweetsCount] = await Promise.all([
      databaseService.tweets
        .aggregate<Tweet>([
          {
            $match: {
              user_id: {
                $in: ids
              }
            }
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
            $skip: limit * (page - 1)
          },
          {
            $limit: 10
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
            $match: {
              user_id: {
                $in: ids
              }
            }
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

    return { tweets, tweetsCount: tweetsCount[0].total }
  }
}

const tweetService = new TweetService()
export default tweetService
