import express from 'express'
import databaseService from './services/database.services'
import { defaultErrorHandler } from './middlewares/error.middlewares'
import usersRouter from './routes/users.routes'
import mediasRouter from './routes/medias.routes'
import { initFolder } from './utils/file'

databaseService.connect()
// Khởi tạo ứng dụng Express
const app = express()
const port = 4000

// Khởi tạo upload folder
initFolder()

// Sử dụng middleware để parse dữ liệu (`JSON` hoặc `URL-encoded forms`) từ phần thân của yêu cầu POST
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

// Sử dụng routing trong usersRouter khi các yêu cầu được gửi đến đường dẫn "/users"
app.use('/users', usersRouter)
// Sử dụng routing trong mediasRouter khi các yêu cầu được gửi đến đường dẫn "/medias"
app.use('/medias', mediasRouter)

// Khi app xuất hiện lỗi sẽ được xử lý lỗi tại Error handler này
app.use(defaultErrorHandler)

// Lắng nghe các yêu cầu đến cổng 4000
app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
