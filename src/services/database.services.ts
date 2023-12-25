import { Collection, Db, MongoClient } from 'mongodb'
import User from '~/models/schemas/User.schema'
import RefreshToken from '~/models/schemas/ReFreshToken.schema'
import Follower from '~/models/schemas/Follower.schema'
import Tweet from '~/models/schemas/Tweet.schema'
import Hashtag from '~/models/schemas/Hashtag.schema'
import { Bookmark } from '~/models/schemas/Bookmark.schema'
import { Like } from '~/models/schemas/Like.schema'
import Conversation from '~/models/schemas/Conversation.schema'
import { envConfig } from '~/constants/config'

const {
  dbName,
  dbUsername,
  dbPassword,
  dbUsersCollection,
  dbRefreshTokensCollection,
  dbFollowersCollection,
  dbTweetsCollection,
  dbHashtagsCollection,
  dbBookmarksCollection,
  dbLikesCollection,
  dbConversationCollection
} = envConfig

const uri = `mongodb+srv://${dbUsername}:${dbPassword}@twitter.7erkx9h.mongodb.net/?retryWrites=true&w=majority`

class DatabaseService {
  private client: MongoClient
  private db: Db

  constructor() {
    // Create a MongoClient with a MongoClientOptions object to set the Stable API version
    this.client = new MongoClient(uri)

    this.db = this.client.db(dbName)
  }

  async connect() {
    try {
      // Send a ping to confirm a successful connection
      await this.db.command({ ping: 1 })
      console.log('Pinged your deployment. You successfully connected to MongoDB!')
    } catch (error) {
      console.log('Error:', error)
      throw error
    }
  }

  async indexUsers() {
    const exist = await this.users.indexExists(['email_1', 'email_1_password_1', 'username_1'])

    if (exist) return

    this.users.createIndex({ email: 1, password: 1 })
    this.users.createIndex({ email: 1 }, { unique: true })
    this.users.createIndex({ username: 1 }, { unique: true })
  }

  async indexRefreshTokens() {
    const exist = await this.refreshTokens.indexExists(['exp_1', 'token_1'])

    if (exist) return

    this.refreshTokens.createIndex({ token: 1 }, { unique: true })
    this.refreshTokens.createIndex({ exp: 1 }, { expireAfterSeconds: 0 })
  }

  async indexFollowers() {
    const exist = await this.followers.indexExists(['user_id_1_followed_user_id_1'])

    if (exist) return

    this.followers.createIndex({ user_id: 1, followed_user_id: 1 })
  }

  async indexHashtags() {
    const exist = await this.hashtags.indexExists(['name_1'])

    if (exist) return

    this.hashtags.createIndex({ name: 1 }, { unique: true })
  }

  async indexBookmarks() {
    const exist = await this.hashtags.indexExists(['tweet_id_1_user_id_1'])

    if (exist) return

    this.bookmarks.createIndex({ user_id: 1, tweet_id: 1 })
  }

  async indexLikes() {
    const exist = await this.hashtags.indexExists(['tweet_id_1_user_id_1'])

    if (exist) return

    this.likes.createIndex({ user_id: 1, tweet_id: 1 })
  }

  async indexTweets() {
    const exist = await this.tweets.indexExists(['content_text'])

    if (exist) return

    this.tweets.createIndex({ content: 'text' }, { default_language: 'none' })
  }

  get users(): Collection<User> {
    return this.db.collection(dbUsersCollection as string)
  }

  get refreshTokens(): Collection<RefreshToken> {
    return this.db.collection(dbRefreshTokensCollection as string)
  }

  get followers(): Collection<Follower> {
    return this.db.collection(dbFollowersCollection as string)
  }

  get tweets(): Collection<Tweet> {
    return this.db.collection(dbTweetsCollection as string)
  }

  get hashtags(): Collection<Hashtag> {
    return this.db.collection(dbHashtagsCollection as string)
  }

  get bookmarks(): Collection<Bookmark> {
    return this.db.collection(dbBookmarksCollection as string)
  }

  get likes(): Collection<Like> {
    return this.db.collection(dbLikesCollection as string)
  }

  get conversations(): Collection<Conversation> {
    return this.db.collection(dbConversationCollection as string)
  }
}

const databaseService = new DatabaseService()
export default databaseService
