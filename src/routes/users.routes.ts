import { Router } from 'express'
import { loginController, registerController } from '~/controllers/users.controllers'
import { loginValidator } from '~/middlewares/users.middlewares'

const usersRouter = Router()

// Định nghĩa route POST
usersRouter.post('/login', loginValidator, loginController)
usersRouter.post('/register', registerController)

export default usersRouter
