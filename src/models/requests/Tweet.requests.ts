import { ParamsDictionary, Query } from 'express-serve-static-core'
import { TweetAudience, TweetType } from '~/constants/enums'
import { Media } from '../Other'

export interface TweetRequestBody {
  type: TweetType
  audience: TweetAudience
  content: string
  parent_id: null | string // null khi tweet gốc || tweet_id cha dạng string
  hashtags: string[] //  hashtag name dạng ['javascript', 'reactJs']
  mentions: string[] // user_id[]
  medias: Media[]
}

export interface TweetParams extends ParamsDictionary {
  tweet_id: string
}

export interface TweetQuery extends Query {
  limit: string
  page: string
  tweet_type: string
}
