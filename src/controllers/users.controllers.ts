import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { ObjectId } from 'mongodb'
import { UsersMessages } from '~/constants/enums'
import { UserReqBody } from '~/models/requests/User.requests'
import userService from '~/services/users.services'

// Controller có tác vụ xử lý logic kết quả trả về
export const loginController = async (req: Request, res: Response) => {
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

export const registerController = async (
  req: Request<ParamsDictionary, UserReqBody, any>,
  res: Response,
  next: NextFunction
) => {
  // Thực hiện xử lý với dữ liệu
  const result = await userService.register(req.body)
  // Trả về phản hồi cho client
  res.json({
    message: UsersMessages.RegisterSuccess,
    result
  })
}
