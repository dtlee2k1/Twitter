import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { ObjectId } from 'mongodb'
import { HttpStatusCode, UserVerifyStatus, UsersMessages } from '~/constants/enums'
import {
  LoginReqBody,
  TokenPayload,
  RegisterReqBody,
  LogoutReqBody,
  VerifyEmailReqBody
} from '~/models/requests/User.requests'
import databaseService from '~/services/database.services'
import userService from '~/services/users.services'

// Chứa các file nhận request, gọi đến service để xử lý logic nghiệp vụ, trả về response

export const loginController = async (req: Request<ParamsDictionary, any, LoginReqBody>, res: Response) => {
  // Thực hiện xử lý với dữ liệu
  // Destructuring lấy ra user được set trong req ở middlewares
  const user_id = req.user?._id as ObjectId
  const result = await userService.login(user_id.toString())
  // Trả về phản hồi cho client
  res.json({
    message: UsersMessages.LoginSuccess,
    result
  })
}

export const registerController = async (req: Request<ParamsDictionary, any, RegisterReqBody>, res: Response) => {
  // Thực hiện xử lý với dữ liệu
  const result = await userService.register(req.body)
  // Trả về phản hồi cho client
  res.json({
    message: UsersMessages.RegisterSuccess,
    result
  })
}

export const logoutController = async (req: Request<ParamsDictionary, any, LogoutReqBody>, res: Response) => {
  // Trả về phản hồi cho client
  res.json({
    message: UsersMessages.LogoutSuccess
  })
}

export const verifyEmailController = async (req: Request<ParamsDictionary, any, VerifyEmailReqBody>, res: Response) => {
  // Thực hiện xử lý với dữ liệu
  // Destructuring lấy ra user_id được set trong req ở middlewares
  const { user_id } = req.decoded_email_verify_token as TokenPayload

  const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })

  if (!user) {
    return res.status(HttpStatusCode.NotFound).json({
      message: UsersMessages.UserNotFound
    })
  }

  // Đã verified token thành công trước đó thì nó sẽ set lại thành chuỗi rỗng
  if (user.email_verify_token === '') {
    return res.json({
      message: UsersMessages.EmailAlreadyVerifiedBefore
    })
  }

  const result = await userService.verifyEmail(user_id)

  // Trả về phản hồi cho client
  res.json({
    message: UsersMessages.EmailVerifySuccess,
    result
  })
}

export const resendVerifyEmailController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload

  const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })

  if (!user) {
    return res.status(HttpStatusCode.NotFound).json({
      message: UsersMessages.UserNotFound
    })
  }

  if (user.verify === UserVerifyStatus.Verified) {
    return res.status(HttpStatusCode.NotFound).json({
      message: UsersMessages.EmailAlreadyVerifiedBefore
    })
  }

  const result = await userService.resendVerifyEmail(user_id)

  res.json(result)
}
