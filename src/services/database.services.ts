import { MongoClient, ServerApiVersion } from 'mongodb'
import 'dotenv/config'

const { DB_USERNAME, DB_PASSWORD } = process.env
const uri = `mongodb+srv://${DB_USERNAME}:${DB_PASSWORD}@twitter.7erkx9h.mongodb.net/?retryWrites=true&w=majority`

class DatabaseService {
  private client: MongoClient

  constructor() {
    // Create a MongoClient with a MongoClientOptions object to set the Stable API version
    this.client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true
      }
    })
  }

  public async connect() {
    try {
      // Send a ping to confirm a successful connection
      await this.client.db('admin').command({ ping: 1 })
      console.log('Pinged your deployment. You successfully connected to MongoDB!')
    } catch (error) {
      console.dir(error)
    } finally {
      // Ensures that the client will close when you finish/error
      await this.client.close()
    }
  }
}

const databaseService = new DatabaseService()
export default databaseService
