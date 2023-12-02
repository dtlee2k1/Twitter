import { Collection, Db, MongoClient, ServerApiVersion } from 'mongodb'
import 'dotenv/config'
import User from '~/models/schemas/User.schema'
import RefreshToken from '~/models/schemas/ReFreshToken.schema'
import { Follower } from '~/models/schemas/Follower.schema'

const {
  DB_NAME,
  DB_USERNAME,
  DB_PASSWORD,
  DB_USERS_COLLECTION,
  DB_REFRESH_TOKENS_COLLECTION,
  DB_FOLLOWERS_COLLECTION
} = process.env

const uri = `mongodb+srv://${DB_USERNAME}:${DB_PASSWORD}@twitter.7erkx9h.mongodb.net/?retryWrites=true&w=majority`

class DatabaseService {
  private client: MongoClient
  private db: Db

  constructor() {
    // Create a MongoClient with a MongoClientOptions object to set the Stable API version
    this.client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true
      }
    })
    this.db = this.client.db(DB_NAME)
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

  get users(): Collection<User> {
    return this.db.collection(DB_USERS_COLLECTION as string)
  }

  get refreshTokens(): Collection<RefreshToken> {
    return this.db.collection(DB_REFRESH_TOKENS_COLLECTION as string)
  }

  get followers(): Collection<Follower> {
    return this.db.collection(DB_FOLLOWERS_COLLECTION as string)
  }
}

const databaseService = new DatabaseService()
export default databaseService
