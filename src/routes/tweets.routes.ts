import { Router } from 'express'
import {
  createTweetController,
  getNewFeedsController,
  getTweetChildrenController,
  getTweetDetailController
} from '~/controllers/tweets.controllers'
import {
  audienceValidator,
  createTweetValidator,
  getTweetChildrenValidator,
  paginationValidator,
  tweetIdValidator
} from '~/middlewares/tweets.middlewares'
import { accessTokenValidator, isUserLoggedInValidator, verifyUserValidator } from '~/middlewares/users.middlewares'
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
  verifyUserValidator,
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
  isUserLoggedInValidator(verifyUserValidator),
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
  paginationValidator,
  getTweetChildrenValidator,
  isUserLoggedInValidator(accessTokenValidator),
  isUserLoggedInValidator(verifyUserValidator),
  wrapRequestHandler(audienceValidator),
  wrapRequestHandler(getTweetChildrenController)
)

/**
 *  Description: Get new feeds
 *  Path: '/'
 *  Method: GET
 *  Header: { Authorization: Bearer <access_token> }
 *  Query: { limit: number, page: number }
 */
tweetsRouter.get(
  '/',
  paginationValidator,
  accessTokenValidator,
  verifyUserValidator,
  wrapRequestHandler(getNewFeedsController)
)

export default tweetsRouter
