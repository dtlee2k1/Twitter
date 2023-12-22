import 'dotenv/config'
import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { TweetType } from '~/constants/enums'
import { TweetsMessages } from '~/constants/messages'
import { PaginationQuery, TweetParams, TweetQuery, TweetRequestBody } from '~/models/requests/Tweet.requests'
import { TokenPayload } from '~/models/requests/User.requests'
import tweetService from '~/services/tweets.services'

export const createTweetController = async (req: Request<ParamsDictionary, any, TweetRequestBody>, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload

  const result = await tweetService.createTweet(req.body, user_id)

  // Trả về phản hồi cho client
  res.json(result)
}

export const getTweetDetailController = async (req: Request<TweetParams>, res: Response) => {
  const { tweet_id } = req.params
  const user_id = req.decoded_authorization?.user_id

  const result = await tweetService.increaseView(tweet_id, user_id)

  const tweet = {
    ...req.tweet,
    user_views: result.user_views,
    guest_views: result.guest_views,
    updated_at: result.updated_at
  }

  // Trả về phản hồi cho client
  res.json({
    message: TweetsMessages.GetTweetSuccess,
    result: tweet
  })
}

export const getTweetChildrenController = async (req: Request<TweetParams, any, any, TweetQuery>, res: Response) => {
  const { tweet_id } = req.params
  const limit = Number(req.query.limit) || 10
  const page = Number(req.query.page) || 1
  const tweet_type = Number(req.query.tweet_type) as TweetType
  const user_id = req.decoded_authorization?.user_id

  const { tweets, tweetsCount } = await tweetService.getTweetChildren({
    tweet_id,
    user_id,
    tweet_type,
    limit,
    page
  })

  // Trả về phản hồi cho client
  res.json({
    message: TweetsMessages.GetTweetChildrenSuccess,
    result: {
      tweets,
      tweet_type,
      limit,
      page,
      total_pages: Math.ceil(tweetsCount / limit)
    }
  })
}

export const getNewFeedsController = async (
  req: Request<ParamsDictionary, any, any, PaginationQuery>,
  res: Response
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const limit = Number(req.query.limit)
  const page = Number(req.query.page)

  const { tweets, tweetsCount } = await tweetService.getNewFeeds({ user_id, limit, page })

  // Trả về phản hồi cho client
  res.json({
    message: TweetsMessages.GetNewFeedsSuccess,
    result: {
      tweets,
      limit,
      page,
      total_pages: Math.ceil(tweetsCount / limit)
    }
  })
}
