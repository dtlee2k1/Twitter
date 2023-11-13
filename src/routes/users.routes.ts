import { Router } from 'express'
import { usersController } from '~/controllers/users.controllers'
import { loginValidator } from '~/middlewares/users.middlewares'

const usersRouter = Router()

// Định nghĩa route POST
usersRouter.post('/login', loginValidator, usersController)

export default usersRouter
