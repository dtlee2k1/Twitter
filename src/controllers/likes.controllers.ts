import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { LikesMessages } from '~/constants/messages'
import { LikeRequestBody } from '~/models/requests/Like.requests'
import { TokenPayload } from '~/models/requests/User.requests'
import likeService from '~/services/likes.services'

export const likeTweetController = async (req: Request<ParamsDictionary, any, LikeRequestBody>, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload

  const result = await likeService.likeTweet(user_id, req.body.tweet_id)

  res.json({
    message: LikesMessages.LikeTweetSuccess,
    result
  })
}

export const unlikeTweetController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload

  const result = await likeService.unlikeTweet(user_id, req.params.tweet_id)

  res.json(result)
}
