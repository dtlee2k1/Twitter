import 'dotenv/config'
import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { ObjectId } from 'mongodb'
import { HttpStatusCode, UserVerifyStatus } from '~/constants/enums'
import { UsersMessages } from '~/constants/messages'
import {
  LoginReqBody,
  TokenPayload,
  RegisterReqBody,
  LogoutReqBody,
  VerifyEmailReqBody,
  VerifyForgotPasswordReqBody,
  ForgotPasswordReqBody,
  ResetPasswordReqBody,
  UpdateMeReqBody,
  GetProfileReqParams,
  FollowReqBody,
  UnfollowReqParams,
  ChangePasswordReqBody,
  refreshTokenReqBody
} from '~/models/requests/User.requests'
import User from '~/models/schemas/User.schema'
import databaseService from '~/services/database.services'
import userService from '~/services/users.services'

// Chứa các file nhận request, gọi đến service để xử lý logic nghiệp vụ, trả về response

export const loginController = async (req: Request<ParamsDictionary, any, LoginReqBody>, res: Response) => {
  // Thực hiện xử lý với dữ liệu
  // Destructuring lấy ra user được set trong req ở middlewares
  const { _id: user_id, verify } = req.user as User

  const result = await userService.login({ user_id: (user_id as ObjectId).toString(), verify })
  // Trả về phản hồi cho client
  res.json({
    message: UsersMessages.LoginSuccess,
    result
  })
}

export const oauthController = async (req: Request, res: Response) => {
  // Thực hiện xử lý với dữ liệu
  // Nhận giá trị `code` thông qua query từ client-side và tiến hành gọi lên Google API để lấy thông tin `id_token` và `access_token`
  const { code } = req.query

  const result = await userService.oauth(code as string)

  const urlRedirect = `${process.env.CLIENT_REDIRECT_CALLBACK}?access_token=${result.access_token}&refresh_token=${result.refresh_token}&new_user=${result.new_user}&verify=${result.verify}`

  // Trả về phản hồi cho client
  res.redirect(urlRedirect)
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

export const refreshTokenController = async (
  req: Request<ParamsDictionary, any, refreshTokenReqBody>,
  res: Response
) => {
  const { user_id, verify, exp } = req.decoded_refresh_token as TokenPayload

  const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })

  if (!user) {
    return res.status(HttpStatusCode.NotFound).json({
      message: UsersMessages.UserNotFound
    })
  }

  const result = await userService.refreshToken({ user_id, verify, exp })

  res.json({
    message: UsersMessages.RefreshTokenSuccess,
    result
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

export const forgotPasswordController = async (
  req: Request<ParamsDictionary, any, ForgotPasswordReqBody>,
  res: Response
) => {
  const { _id, verify } = req.user as User

  const result = await userService.forgotPassword({ user_id: (_id as ObjectId).toString(), verify })

  res.json(result)
}

export const verifyForgotPasswordController = async (
  req: Request<ParamsDictionary, any, VerifyForgotPasswordReqBody>,
  res: Response
) => {
  // Trả về phản hồi cho client
  res.json({
    message: UsersMessages.VerifyForgotPasswordSuccess
  })
}

export const resetPasswordController = async (
  req: Request<ParamsDictionary, any, ResetPasswordReqBody>,
  res: Response
) => {
  const { user_id } = req.decoded_forgot_password_token as TokenPayload
  const { password } = req.body

  const result = await userService.resetPassword(user_id, password)

  // Trả về phản hồi cho client
  res.json(result)
}

export const changePasswordController = async (
  req: Request<ParamsDictionary, any, ChangePasswordReqBody>,
  res: Response
) => {
  // Trả về phản hồi cho client
  const { user_id } = req.decoded_authorization as TokenPayload
  const { password } = req.body

  const result = await userService.changePassword(user_id, password)
  res.json(result)
}

export const getMeController = async (req: Request<ParamsDictionary, any, ResetPasswordReqBody>, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload

  // Get user profile from database
  const user = await userService.getMe(user_id)

  // Trả về phản hồi cho client
  res.json({
    message: UsersMessages.GetMeSuccess,
    result: user
  })
}

export const updateMeController = async (req: Request<ParamsDictionary, any, UpdateMeReqBody>, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { body } = req

  const user = await userService.updateMe(user_id, body)
  // Trả về phản hồi cho client
  res.json({
    message: UsersMessages.GetMeSuccess,
    result: user
  })
}

export const getProfileController = async (req: Request<GetProfileReqParams>, res: Response) => {
  const { username } = req.params
  const user = await userService.getProfile(username)

  // Trả về phản hồi cho client
  res.json({
    message: UsersMessages.GetProfileSuccess,
    result: user
  })
}

export const followController = async (req: Request<ParamsDictionary, any, FollowReqBody>, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { followed_user_id } = req.body

  if (user_id === followed_user_id) {
    return res.status(HttpStatusCode.Conflict).json({
      message: UsersMessages.CannotFollowYourself
    })
  }

  const result = await userService.follow(user_id, followed_user_id)

  // Trả về phản hồi cho client
  res.json(result)
}

export const unfollowController = async (req: Request<UnfollowReqParams>, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { user_id: followed_user_id } = req.params

  const result = await userService.unfollow(user_id, followed_user_id)

  // Trả về phản hồi cho client
  res.json(result)
}
