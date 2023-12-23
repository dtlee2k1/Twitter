import { Router } from 'express'
import { bookmarkTweetController, unbookmarkTweetController } from '~/controllers/bookmarks.controllers'
import { tweetIdValidator } from '~/middlewares/tweets.middlewares'
import { accessTokenValidator, verifyUserValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const bookmarksRouter = Router()

/**
 *  Description: Bookmark a tweet
 *  Path: '/'
 *  Method: POST
 *  Body: {tweet_id: string}
 *  Header: { Authorization: Bearer <access_token> }
 */
bookmarksRouter.post(
  '/',
  accessTokenValidator,
  verifyUserValidator,
  tweetIdValidator,
  wrapRequestHandler(bookmarkTweetController)
)

/**
 *  Description: Unbookmark a tweet
 *  Path: '/tweets/:tweet_id'
 *  Method: DELETE
 *  Params: {tweet_id: string}
 *  Header: { Authorization: Bearer <access_token> }
 */
bookmarksRouter.delete(
  '/tweets/:tweet_id',
  accessTokenValidator,
  verifyUserValidator,
  tweetIdValidator,
  wrapRequestHandler(unbookmarkTweetController)
)

export default bookmarksRouter
