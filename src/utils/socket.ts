import { Server } from 'socket.io'
import Conversation from '../models/schemas/Conversation.schema'
import { ObjectId } from 'mongodb'
import { verifyAccessToken } from '../utils/commons'
import { TokenPayload } from '../models/requests/User.requests'
import { HttpStatusCode, UserVerifyStatus } from '../constants/enums'
import { ErrorWithStatus } from '../models/Errors'
import { UsersMessages } from '../constants/messages'
import databaseService from '~/services/database.services'
import { Server as HttpServer } from 'http'

export const initSocket = (httpServer: HttpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL
    }
  })

  const users: {
    [key: string]: {
      socket_id: string
    }
  } = {}

  io.use(async (socket, next) => {
    const { Authorization } = socket.handshake.auth
    const access_token = Authorization?.split(' ')[1]

    try {
      const decoded_authorization = await verifyAccessToken(access_token)
      const { verify } = decoded_authorization as TokenPayload

      if (verify !== UserVerifyStatus.Verified) {
        throw new ErrorWithStatus({ message: UsersMessages.UserNotVerified, status: HttpStatusCode.Forbidden })
      }

      // Truyền decoded_authorization vào socket để sử dụng ở các middleware khác
      socket.handshake.auth.decoded_authorization = decoded_authorization
      socket.handshake.auth.access_token = access_token
      next()
    } catch (error) {
      next({
        message: 'Unauthorized',
        name: 'UnauthorizedError',
        data: error
      })
    }
  })
  io.on('connection', (socket) => {
    console.log(`user ${socket.id} connected`)
    const { user_id } = socket.handshake.auth.decoded_authorization

    users[user_id] = {
      socket_id: socket.id
    }
    console.log(users)

    socket.use(async (packet, next) => {
      try {
        const access_token = socket.handshake.auth.access_token
        await verifyAccessToken(access_token)
        next()
      } catch (error) {
        next(new Error('Unauthorized'))
      }
    })

    socket.on('error', (err) => {
      if (err && err.message === 'Unauthorized') {
        socket.disconnect()
      }
    })

    socket.on('send_message', async (data) => {
      const { sender_id, receiver_id, content } = data.payload

      const receiver_socket_id = users[receiver_id]?.socket_id

      if (!receiver_id) return

      const conversation = new Conversation({
        sender_id: new ObjectId(sender_id),
        receiver_id: new ObjectId(receiver_id),
        content
      })

      const result = await databaseService.conversations.insertOne(conversation)
      conversation._id = result.insertedId

      socket.to(receiver_socket_id).emit('receive_message', {
        payload: conversation
      })
    })

    socket.on('disconnect', () => {
      delete users[user_id]
      console.log(`User ${socket.id} disconnected`)
    })
  })
}
