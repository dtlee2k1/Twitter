import { Request, Response } from 'express'
import { ConversationsMessages } from '~/constants/messages'
import { GetConversationsParams } from '~/models/requests/Conversation.requests'
import { PaginationQuery } from '~/models/requests/Tweet.requests'
import { TokenPayload } from '~/models/requests/User.requests'
import conversationService from '~/services/conversations.services'

export const getConversationsController = async (
  req: Request<GetConversationsParams, any, PaginationQuery>,
  res: Response
) => {
  const sender_id = (req.decoded_authorization as TokenPayload)?.user_id
  const { receiver_id } = req.params
  const page = Number(req.query.page) || 1
  const limit = Number(req.query.limit) || 10

  const { conversations, conversationsCount } = await conversationService.getConversations({
    sender_id,
    receiver_id,
    page,
    limit
  })

  // Trả về phản hồi cho client
  res.json({
    message: ConversationsMessages.GetConversationsSuccess,
    result: {
      conversations,
      limit,
      page,
      total_pages: Math.ceil(conversationsCount / limit)
    }
  })
}
