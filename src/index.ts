import express from 'express'
import usersRouter from './routes/users.routes'
import databaseService from './services/database.services'

// Khởi tạo ứng dụng Express
const app = express()

const port = 3000

// Sử dụng middleware để parse dữ liệu (`JSON` hoặc `URL-encoded forms`) từ phần thân của yêu cầu POST
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

//Sử dụng routing trong usersRouter khi các yêu cầu được gửi đến đường dẫn "/users"
app.use('/users', usersRouter)

databaseService.connect()

// Lắng nghe các yêu cầu đến cổng 3000
app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
