import { Collection, Db, MongoClient, ServerApiVersion } from 'mongodb'
import 'dotenv/config'
import User from '~/models/schemas/User.schema'
import RefreshToken from '~/models/schemas/ReFreshToken.schema'

const { DB_NAME, DB_USERNAME, DB_PASSWORD, DB_USERS_COLLECTION, DB_REFRESH_TOKENS_COLLECTION } = process.env

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

  get users(): Collection<User> {
    return this.db.collection(DB_USERS_COLLECTION as string)
  }

  get refreshTokens(): Collection<RefreshToken> {
    return this.db.collection(DB_REFRESH_TOKENS_COLLECTION as string)
  }
}

const databaseService = new DatabaseService()
export default databaseService
