import { Router } from 'express'
import {
  createTweetController,
  getTweetChildrenController,
  getTweetDetailController
} from '~/controllers/tweets.controllers'
import {
  audienceValidator,
  createTweetValidator,
  getTweetChildrenValidator,
  tweetIdValidator
} from '~/middlewares/tweets.middlewares'
import { accessTokenValidator, isUserLoggedInValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const tweetsRouter = Router()

/**
 *  Description: Create a new tweet
 *  Path: '/'
 *  Method: POST
 *  Body: TweetRequestBody
 *  Header: { Authorization: Bearer <access_token> }
 */
tweetsRouter.post(
  '/',
  accessTokenValidator,
  verifiedUserValidator,
  createTweetValidator,
  wrapRequestHandler(createTweetController)
)

/**
 *  Description: Get tweet detail
 *  Path: '/:tweet_id'
 *  Method: GET
 *  Header: { Authorization?: Bearer <access_token> }
 */
tweetsRouter.get(
  '/:tweet_id',
  tweetIdValidator,
  isUserLoggedInValidator(accessTokenValidator),
  isUserLoggedInValidator(verifiedUserValidator),
  wrapRequestHandler(audienceValidator),
  wrapRequestHandler(getTweetDetailController)
)

/**
 *  Description: Get tweet children
 *  Path: '/:tweet_id/children'
 *  Method: GET
 *  Header: { Authorization?: Bearer <access_token> }
 *  Query: { limit: number, page: number, tweet_type: TweetType }
 */
tweetsRouter.get(
  '/:tweet_id/children',
  tweetIdValidator,
  isUserLoggedInValidator(accessTokenValidator),
  isUserLoggedInValidator(verifiedUserValidator),
  wrapRequestHandler(audienceValidator),
  getTweetChildrenValidator,
  wrapRequestHandler(getTweetChildrenController)
)

export default tweetsRouter
