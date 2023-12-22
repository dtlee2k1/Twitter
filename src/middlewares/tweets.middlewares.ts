import { Request, Response, NextFunction } from 'express'
import { checkSchema } from 'express-validator'
import isEmpty from 'lodash/isEmpty'
import { ObjectId } from 'mongodb'
import { HttpStatusCode, MediaType, TweetAudience, TweetType, UserVerifyStatus } from '~/constants/enums'
import { TweetsMessages, UsersMessages } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import { TokenPayload } from '~/models/requests/User.requests'
import Tweet from '~/models/schemas/Tweet.schema'
import databaseService from '~/services/database.services'
import { numberEnumToArray } from '~/utils/commons'
import { validate } from '~/utils/validation'

const tweetTypes = numberEnumToArray(TweetType)
const tweetAudiences = numberEnumToArray(TweetAudience)
const tweetMedias = numberEnumToArray(MediaType)

export const createTweetValidator = validate(
  checkSchema(
    {
      type: {
        notEmpty: { errorMessage: TweetsMessages.TypeIsRequired },
        isIn: {
          options: [tweetTypes],
          errorMessage: TweetsMessages.InvalidType
        }
      },
      audience: {
        notEmpty: { errorMessage: TweetsMessages.AudienceIsRequired },
        isIn: {
          options: [tweetAudiences],
          errorMessage: TweetsMessages.InvalidAudience
        }
      },
      parent_id: {
        custom: {
          options: (value, { req }) => {
            const type = req.body.type as TweetType
            // Nếu `type` là retweet, comment, quotetweet thì `parent_id` phải là `tweet_id` của tweet cha
            if (
              [TweetType.Retweet, TweetType.Comment, TweetType.QuoteTweet].includes(type) &&
              !ObjectId.isValid(value)
            ) {
              throw new Error(TweetsMessages.ParentIdMustBeAValidTweetId)
            }

            // Nếu `type` là tweet thì `parent_id` phải là `null`
            if (type === TweetType.Tweet && value !== null) {
              throw new Error(TweetsMessages.ParentIdMustBeNull)
            }
            return true
          }
        }
      },
      content: {
        isString: true,
        custom: {
          options: (value, { req }) => {
            const type = req.body.type as TweetType
            const mentions = req.body.mentions as string[]
            const hashtags = req.body.mentions as string[]

            // Nếu `type` là retweet thì `content` phải là `''`
            if (type === TweetType.Retweet && value !== '') {
              throw new Error(TweetsMessages.ContentMustBeEmptyString)
            }

            // Nếu `type` là comment, quotetweet, tweet và không có `mentions` và `hashtags` thì `content` phải là string và không được rỗng
            if (
              [TweetType.Comment, TweetType.QuoteTweet, TweetType.Tweet].includes(type) &&
              isEmpty(mentions) &&
              isEmpty(hashtags) &&
              value.trim() === ''
            ) {
              throw new Error(TweetsMessages.ContentMustBeAnNonEmptyString)
            }
            return true
          }
        }
      },
      hashtags: {
        isArray: true,
        custom: {
          options: (value: any[]) => {
            // Mỗi phần tử trong array là string
            if (!value.every((el) => typeof el === 'string')) {
              throw new Error(TweetsMessages.HashtagsMustBeAnArrayOfString)
            }
            return true
          }
        }
      },
      mentions: {
        isArray: true,
        custom: {
          options: (value: any[]) => {
            // Mỗi phần tử trong array là userId có dạng string
            if (!value.every((el) => ObjectId.isValid(el))) {
              throw new Error(TweetsMessages.MentionsMustBeAnArrayOfUserId)
            }
            return true
          }
        }
      },
      medias: {
        isArray: true,
        custom: {
          options: (value: any[]) => {
            // Mỗi phần tử trong array là Media Object
            if (!value.every((el) => typeof el.url === 'string' && tweetMedias.includes(el.type))) {
              throw new Error(TweetsMessages.MediasMustBeAnArrayOfMediaObject)
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const tweetIdValidator = validate(
  checkSchema(
    {
      tweet_id: {
        custom: {
          options: async (value: string, { req }) => {
            if (!ObjectId.isValid(value)) {
              throw new ErrorWithStatus({
                message: TweetsMessages.InvalidTweetId,
                status: HttpStatusCode.BadRequest
              })
            }

            const [tweet] = await databaseService.tweets
              .aggregate<Tweet>([
                {
                  $match: {
                    _id: new ObjectId(value)
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
                    tweet_children: 0
                  }
                }
              ])
              .toArray()

            if (!tweet) {
              throw new ErrorWithStatus({
                message: TweetsMessages.TweetNotFound,
                status: HttpStatusCode.NotFound
              })
            }

            // Set tweet detail into request
            ;(req as Request).tweet = tweet
            return true
          }
        }
      }
    },
    ['body', 'params']
  )
)

export const audienceValidator = async (req: Request, res: Response, next: NextFunction) => {
  const { audience, user_id: author_id } = req.tweet as Tweet
  const viewer_id = (req.decoded_authorization as TokenPayload)?.user_id

  if (audience === TweetAudience.TwitterCircle) {
    // Kiểm tra viewer đã login hay chưa?
    if (!req.decoded_authorization) {
      throw new ErrorWithStatus({
        message: UsersMessages.AccessTokenIsRequired,
        status: HttpStatusCode.Unauthorized
      })
    }

    // Kiểm tra tài khoản author có ổn(banned hay deleted) không?
    const author = await databaseService.users.findOne({ _id: new ObjectId(author_id) })

    if (!author || author.verify === UserVerifyStatus.Banned) {
      throw new ErrorWithStatus({
        message: TweetsMessages.TweetNotFound,
        status: HttpStatusCode.NotFound
      })
    }

    // Kiểm tra viewer xem tweet này có nằm trong Twitter Circle của author hay không?
    const isInTwitterCircle = author.twitter_circle.some((twitter_circle_id) => twitter_circle_id.equals(viewer_id))
    // Kiểm tra viewer có phải là author hay không?
    const isAuthor = author._id.equals(viewer_id)

    if (!isInTwitterCircle && !isAuthor) {
      throw new ErrorWithStatus({
        message: TweetsMessages.TweetIsNotPublic,
        status: HttpStatusCode.Forbidden
      })
    }
  }

  next()
}

export const getTweetChildrenValidator = validate(
  checkSchema(
    {
      tweet_type: {
        isIn: {
          options: [tweetTypes],
          errorMessage: TweetsMessages.InvalidType
        }
      }
    },
    ['query']
  )
)

export const paginationValidator = validate(
  checkSchema(
    {
      limit: {
        optional: true,
        isNumeric: true,
        custom: {
          options: (value) => {
            const num = Number(value)
            if (num > 100 || num < 1) {
              throw new Error(TweetsMessages.LimitRangeRequired)
            }
            return true
          }
        }
      },
      page: {
        optional: true,
        isNumeric: true,
        custom: {
          options: (value) => {
            const num = Number(value)
            if (num < 1) {
              throw new Error(TweetsMessages.PageMinimumRequired)
            }
            return true
          }
        }
      }
    },
    ['query']
  )
)
