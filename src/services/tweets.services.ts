import { TweetRequestBody } from '~/models/requests/Tweet.requests'
import databaseService from './database.services'
import Tweet from '~/models/schemas/Tweet.schema'
import { ObjectId, WithId } from 'mongodb'
import { TweetsMessages } from '~/constants/messages'
import { Hashtag } from '~/models/schemas/Hashtag.schema'
import { result } from 'lodash'

class TweetService {
  async checkAndCreateHashtag(hashtags: string[]) {
    const hashtagsDocument = await Promise.all(
      hashtags.map(async (hashtag) => {
        // Tìm trong DB, nếu có thì lấy còn ko thì tạo mới
        const result = await databaseService.hashtags.findOneAndUpdate(
          { name: hashtag },
          {
            $setOnInsert: new Hashtag({
              name: hashtag
            })
          },
          { upsert: true, returnDocument: 'after' }
        )

        return result
      })
    )

    return hashtagsDocument.map((hashtag) => (hashtag as WithId<Hashtag>)._id)
  }

  async createTweet(body: TweetRequestBody, user_id: string) {
    const { type, audience, content, parent_id, mentions, medias } = body

    const hashtags = await this.checkAndCreateHashtag(body.hashtags)

    await databaseService.tweets.insertOne(
      new Tweet({
        user_id: new ObjectId(user_id),
        type,
        audience,
        content,
        parent_id,
        hashtags,
        mentions,
        medias
      })
    )

    return {
      message: TweetsMessages.CreateTweetSuccess
    }
  }

  async getTweetDetail(tweet_id: string) {
    const result = await databaseService.tweets.findOne({
      _id: new ObjectId(tweet_id)
    })
    return result
  }
}

const tweetService = new TweetService()
export default tweetService
