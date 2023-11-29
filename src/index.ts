import 'dotenv/config'
import express from 'express'
import databaseService from './services/database.services'
import { defaultErrorHandler } from './middlewares/error.middlewares'
import usersRouter from './routes/users.routes'
import mediasRouter from './routes/medias.routes'
import { initFolder } from './utils/file'
import { UPLOAD_DIR } from './constants/dir'
import staticRouter from './routes/static.routes'

databaseService.connect()
// Khởi tạo ứng dụng Express
const app = express()
const port = process.env.PORT || 4000

// Khởi tạo upload folder
initFolder()

// Sử dụng middleware để parse dữ liệu (`JSON` hoặc `URL-encoded forms`) từ body của POST request
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

// Sử dụng routing trong usersRouter khi các yêu cầu được gửi đến đường dẫn "/users"
app.use('/users', usersRouter)

app.use('/medias', mediasRouter)

// Serving static files
app.use('/static', staticRouter)

// Khi app xuất hiện lỗi sẽ được xử lý lỗi tại Error handler này
app.use(defaultErrorHandler)

// Lắng nghe các yêu cầu đến cổng 4000
app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
