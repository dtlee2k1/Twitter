import 'dotenv/config'
import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { TweetRequestBody } from '~/models/requests/Tweet.requests'

export const createTweetController = async (req: Request<ParamsDictionary, any, TweetRequestBody>, res: Response) => {
  // Trả về phản hồi cho client
  res.json({
    message: 'Create a new Tweet successfully'
  })
}
