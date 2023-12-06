import { checkSchema } from 'express-validator'
import isEmpty from 'lodash/isEmpty'
import { ObjectId } from 'mongodb'
import { HttpStatusCode, MediaType, TweetAudience, TweetType } from '~/constants/enums'
import { TweetsMessages } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
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
          options: async (value: string) => {
            if (!ObjectId.isValid(value)) {
              throw new ErrorWithStatus({
                message: TweetsMessages.InvalidTweetId,
                status: HttpStatusCode.BadRequest
              })
            }

            const tweet = await databaseService.tweets.findOne({ _id: new ObjectId(value) })

            if (!tweet) {
              throw new ErrorWithStatus({
                message: TweetsMessages.TweetNotFound,
                status: HttpStatusCode.NotFound
              })
            }

            return true
          }
        }
      }
    },
    ['body', 'params']
  )
)
