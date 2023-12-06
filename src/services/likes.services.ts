import { ObjectId, WithId } from 'mongodb'
import databaseService from './database.services'
import { Like } from '~/models/schemas/Like.schema'
import { LikesMessages } from '~/constants/messages'

class LikeService {
  async likeTweet(user_id: string, tweet_id: string) {
    const result = await databaseService.likes.findOneAndUpdate(
      { user_id: new ObjectId(user_id), tweet_id: new ObjectId(tweet_id) },
      { $setOnInsert: new Like({ user_id: new ObjectId(user_id), tweet_id: new ObjectId(tweet_id) }) },
      { upsert: true, returnDocument: 'after' }
    )

    return result as WithId<Like>
  }

  async unlikeTweet(user_id: string, tweet_id: string) {
    await databaseService.likes.findOneAndDelete({
      user_id: new ObjectId(user_id),
      tweet_id: new ObjectId(tweet_id)
    })

    return {
      message: LikesMessages.UnlikeTweetSuccess
    }
  }
}

const likeService = new LikeService()
export default likeService
