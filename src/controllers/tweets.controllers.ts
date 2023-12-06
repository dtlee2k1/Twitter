import 'dotenv/config'
import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { TweetsMessages } from '~/constants/messages'
import { GetTweetDetailReqParams, TweetRequestBody } from '~/models/requests/Tweet.requests'
import { TokenPayload } from '~/models/requests/User.requests'
import tweetService from '~/services/tweets.services'

export const createTweetController = async (req: Request<ParamsDictionary, any, TweetRequestBody>, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload

  const result = await tweetService.createTweet(req.body, user_id)

  // Trả về phản hồi cho client
  res.json(result)
}

export const getTweetDetailController = async (req: Request<GetTweetDetailReqParams>, res: Response) => {
  const { tweet_id } = req.params

  const result = await tweetService.getTweetDetail(tweet_id)
  // Trả về phản hồi cho client
  res.json({
    message: TweetsMessages.GetTweetSuccess,
    result
  })
}
