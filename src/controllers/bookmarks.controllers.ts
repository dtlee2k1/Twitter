import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { BookmarksMessages } from '~/constants/messages'
import { BookmarkTweetRequestBody } from '~/models/requests/Bookmark.requests'
import { TokenPayload } from '~/models/requests/User.requests'
import bookmarkService from '~/services/bookmarks.services'

export const bookmarkTweetController = async (
  req: Request<ParamsDictionary, any, BookmarkTweetRequestBody>,
  res: Response
) => {
  const { user_id } = req.decoded_authorization as TokenPayload

  const result = await bookmarkService.bookmarkTweet(user_id, req.body.tweet_id)

  // Trả về phản hồi cho client
  res.json({
    message: BookmarksMessages.BookmarkTweetSuccess,
    result
  })
}

export const unbookmarkTweetController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload

  const result = await bookmarkService.unbookmarkTweet(user_id, req.params.tweet_id)

  // Trả về phản hồi cho client
  res.json(result)
}
