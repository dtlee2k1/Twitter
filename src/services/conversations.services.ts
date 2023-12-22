import { ObjectId } from 'mongodb'
import databaseService from './database.services'

class ConversationService {
  async getConversations({
    sender_id,
    receiver_id,
    page,
    limit
  }: {
    sender_id: string
    receiver_id: string
    page: number
    limit: number
  }) {
    const match = {
      $or: [
        {
          sender_id: new ObjectId(sender_id),
          receiver_id: new ObjectId(receiver_id)
        },
        {
          sender_id: new ObjectId(receiver_id),
          receiver_id: new ObjectId(sender_id)
        }
      ]
    }

    const [conversations, conversationsCount] = await Promise.all([
      databaseService.conversations
        .find({
          $or: [
            {
              sender_id: new ObjectId(sender_id),
              receiver_id: new ObjectId(receiver_id)
            },
            {
              sender_id: new ObjectId(receiver_id),
              receiver_id: new ObjectId(sender_id)
            }
          ]
        })
        .skip(limit * (page - 1))
        .limit(limit)
        .sort({ created_at: -1 })
        .toArray(),
      databaseService.conversations.countDocuments(match)
    ])

    return {
      conversations,
      conversationsCount
    }
  }
}

const conversationService = new ConversationService()
export default conversationService
