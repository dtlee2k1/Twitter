import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import { Server } from 'socket.io'
import databaseService from './services/database.services'
import { defaultErrorHandler } from './middlewares/error.middlewares'
import usersRouter from './routes/users.routes'
import mediasRouter from './routes/medias.routes'
import { initFolder } from './utils/file'
import { UPLOAD_VIDEO_DIR } from './constants/dir'
import staticRouter from './routes/static.routes'
import tweetsRouter from './routes/tweets.routes'
import bookmarksRouter from './routes/bookmarks.routes'
import likesRouter from './routes/likes.routes'
import searchRouter from './routes/search.routes'
import './utils/s3'
import Conversation from './models/schemas/Conversation.schema'
import conversationsRouter from './routes/conversations.routes'
import { ObjectId } from 'mongodb'
import { verifyAccessToken } from './utils/commons'
import { TokenPayload } from './models/requests/User.requests'
import { HttpStatusCode, UserVerifyStatus } from './constants/enums'
import { ErrorWithStatus } from './models/Errors'
import { UsersMessages } from './constants/messages'

databaseService.connect().then(() => {
  databaseService.indexUsers()
  databaseService.indexRefreshTokens()
  databaseService.indexFollowers()
  databaseService.indexHashtags()
  databaseService.indexBookmarks()
  databaseService.indexLikes()
  databaseService.indexTweets()
})
// Khởi tạo ứng dụng Express
const app = express()
const httpServer = createServer(app)

app.use(cors())
const port = process.env.PORT || 4000

// Khởi tạo upload folder
initFolder()

// Sử dụng middleware để parse dữ liệu (`JSON` hoặc `URL-encoded forms`) từ body của POST request
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

// Sử dụng routing trong usersRouter khi các yêu cầu được gửi đến đường dẫn "/users"
app.use('/users', usersRouter)
// Medias route
app.use('/medias', mediasRouter)
// Tweets route
app.use('/tweets', tweetsRouter)
// Bookmarks route
app.use('/bookmarks', bookmarksRouter)
// Likes route
app.use('/likes', likesRouter)
// Search route
app.use('/search', searchRouter)
// Conversations route
app.use('/conversations', conversationsRouter)

// Serving static files
app.use('/static', staticRouter)
app.use('/static/video', express.static(UPLOAD_VIDEO_DIR))

// Khi app xuất hiện lỗi sẽ được xử lý lỗi tại Error handler này
app.use(defaultErrorHandler)

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

// Lắng nghe các yêu cầu đến cổng 4000
httpServer.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
