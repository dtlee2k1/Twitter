import 'dotenv/config'
import express from 'express'
import cors from 'cors'
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

// Serving static files
app.use('/static', staticRouter)
app.use('/static/video', express.static(UPLOAD_VIDEO_DIR))

// Khi app xuất hiện lỗi sẽ được xử lý lỗi tại Error handler này
app.use(defaultErrorHandler)

// Lắng nghe các yêu cầu đến cổng 4000
app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
