import { Request } from 'express'
import { ParamSchema, checkSchema } from 'express-validator'
import { HttpStatusCode, UsersMessages } from '~/constants/enums'
import { ErrorWithStatus } from '~/models/Errors'
import userService from '~/services/users.services'
import { verifyToken } from '~/utils/jwt'
import { validate } from '~/utils/validation'
import { JsonWebTokenError } from 'jsonwebtoken'
import capitalize from 'lodash/capitalize'
import databaseService from '~/services/database.services'
import { ObjectId } from 'mongodb'

// Chứa các file chứa các hàm xử lý middleware, như validate, check token, ...

const passwordSchema: ParamSchema = {
  notEmpty: { bail: true, errorMessage: UsersMessages.PasswordIsRequired },
  isString: { bail: true, errorMessage: UsersMessages.PasswordMustBeAString },
  isLength: {
    options: { min: 6, max: 50 },
    bail: true,
    errorMessage: UsersMessages.PasswordLengthRequired
  },
  isStrongPassword: {
    options: { minLength: 6, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 },
    errorMessage: UsersMessages.PasswordMustBeStrong
  },
  trim: true
}

const confirmPasswordSchema: ParamSchema = {
  notEmpty: { errorMessage: UsersMessages.ConfirmPasswordIsRequired },
  isString: { errorMessage: UsersMessages.ConfirmPasswordMustBeAString },
  custom: {
    options: (value, { req }) => {
      if (value !== req.body.password) {
        throw new Error(UsersMessages.PasswordsDoNotMatch)
      }
      return true
    }
  }
}

const forgotPasswordTokenSchema: ParamSchema = {
  trim: true,
  custom: {
    options: async (value, { req }) => {
      // Kiểm tra forgot password token có được gửi cùng request method POST hay chưa?
      if (!value)
        throw new ErrorWithStatus({
          message: UsersMessages.ForgotPasswordTokenIsRequired,
          status: HttpStatusCode.Unauthorized
        })

      try {
        // Decoded forgot password token được gửi từ client
        const decodedForgotPasswordToken = await verifyToken({
          token: value,
          secretOrPublicKey: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string
        })

        // Destructuring payload của forgot password token
        const { user_id } = decodedForgotPasswordToken

        const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })

        if (!user) {
          throw new ErrorWithStatus({
            message: UsersMessages.UserNotFound,
            status: HttpStatusCode.NotFound
          })
        }

        if (user.forgot_password_token !== value) {
          throw new ErrorWithStatus({
            message: UsersMessages.ForgotPasswordTokenIsInvalid,
            status: HttpStatusCode.Unauthorized
          })
        }

        req.decoded_forgot_password_token = decodedForgotPasswordToken

        return true
      } catch (error) {
        // Lỗi truyền refresh token sai định dạng trả về bởi verifyToken
        if (error instanceof JsonWebTokenError) {
          throw new ErrorWithStatus({
            message: capitalize(error.message),
            status: HttpStatusCode.Unauthorized
          })
        }
        throw error
      }
    }
  }
}

export const loginValidator = validate(
  checkSchema(
    {
      email: {
        notEmpty: { bail: true, errorMessage: UsersMessages.EmailIsRequired },
        isEmail: { bail: true, errorMessage: UsersMessages.EmailIsInvalid },
        custom: {
          options: async (value, { req }) => {
            const user = await userService.checkUserExist({ email: value, password: req.body.password })

            if (user === null) {
              throw new Error(UsersMessages.EmailOrPasswordIsIncorrect)
            }

            // set user info vào request
            ;(req as Request).user = user
            return true
          }
        },
        trim: true
      },
      password: passwordSchema
    },
    ['body']
  )
)

export const registerValidator = validate(
  checkSchema(
    {
      username: {
        notEmpty: { bail: true, errorMessage: UsersMessages.NameIsRequired },
        isString: { bail: true, errorMessage: UsersMessages.NameMustBeAString },
        isLength: {
          options: { max: 100, min: 1 }
        },
        trim: true
      },
      email: {
        notEmpty: { bail: true, errorMessage: UsersMessages.EmailIsRequired },
        isEmail: { bail: true, errorMessage: UsersMessages.EmailIsInvalid },
        custom: {
          options: async (value) => {
            const isExistEmail = await userService.checkEmailExist(value)
            if (isExistEmail) {
              throw new Error(UsersMessages.EmailAlreadyExists)
            }
            return true
          }
        },
        trim: true
      },
      password: passwordSchema,

      confirm_password: confirmPasswordSchema,
      date_of_birth: {
        isISO8601: {
          options: {
            strict: true,
            strictSeparator: true
          },
          errorMessage: UsersMessages.DateOfBirthMustBeISO8601
        }
      }
    },
    ['body']
  )
)

export const accessTokenValidator = validate(
  checkSchema(
    {
      Authorization: {
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            // lấy ra access token từ Headers được gửi đi khi user logout
            const access_token = value.split(' ')[1]

            if (!access_token)
              throw new ErrorWithStatus({
                message: UsersMessages.AccessTokenIsRequired,
                status: HttpStatusCode.Unauthorized
              })
            try {
              // decode access token trả về payload gửi lên khi login/register
              const decodedAuthorization = await verifyToken({
                token: access_token,
                secretOrPublicKey: process.env.JWT_SECRET_ACCESS_TOKEN as string
              })
              ;(req as Request).decoded_authorization = decodedAuthorization
              return true
            } catch (error) {
              throw new ErrorWithStatus({
                message: capitalize((error as JsonWebTokenError).message),
                status: HttpStatusCode.Unauthorized
              })
            }
          }
        }
      }
    },
    ['headers']
  )
)

export const refreshTokenValidator = validate(
  checkSchema(
    {
      refresh_token: {
        trim: true,
        custom: {
          options: async (value, { req }) => {
            // Kiểm tra refresh token có được gửi cùng request method POST hay chưa?
            if (!value)
              throw new ErrorWithStatus({
                message: UsersMessages.RefreshTokenIsRequired,
                status: HttpStatusCode.Unauthorized
              })
            try {
              // Decoded refresh token được gửi từ client & kiểm tra tồn tại của refresh token đó trong database (Nếu true thì xóa luôn trong DB)
              const [decodedRefreshToken, refresh_token] = await Promise.all([
                verifyToken({ token: value, secretOrPublicKey: process.env.JWT_SECRET_REFRESH_TOKEN as string }),
                userService.checkAndDeleteRefreshTokenInDB(value)
              ])

              // Lỗi không tồn tại refresh token trong database
              if (refresh_token === null) {
                throw new ErrorWithStatus({
                  message: UsersMessages.UsedRefreshTokenOrNotExist,
                  status: HttpStatusCode.Unauthorized
                })
              }

              // set decoded refresh token vào req
              ;(req as Request).decoded_refresh_token = decodedRefreshToken

              return true
            } catch (error) {
              // Lỗi truyền refresh token sai định dạng trả về bởi verifyToken
              if (error instanceof JsonWebTokenError) {
                throw new ErrorWithStatus({
                  message: capitalize(error.message),
                  status: HttpStatusCode.Unauthorized
                })
              }
              throw error
            }
          }
        }
      }
    },
    ['body']
  )
)

export const emailVerifyTokenValidator = validate(
  checkSchema(
    {
      email_verify_token: {
        trim: true,
        custom: {
          options: async (value, { req }) => {
            // Kiểm tra email verify token có được gửi cùng request method POST hay chưa?
            if (!value)
              throw new ErrorWithStatus({
                message: UsersMessages.EmailVerifyTokenIsRequired,
                status: HttpStatusCode.Unauthorized
              })

            try {
              // Decoded email verify token được gửi từ client
              const decodedEmailVerifyToken = await verifyToken({
                token: value,
                secretOrPublicKey: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string
              })

              // set decoded email verify token vào req
              ;(req as Request).decoded_email_verify_token = decodedEmailVerifyToken

              return true
            } catch (error) {
              // Lỗi truyền refresh token sai định dạng trả về bởi verifyToken
              if (error instanceof JsonWebTokenError) {
                throw new ErrorWithStatus({
                  message: capitalize(error.message),
                  status: HttpStatusCode.Unauthorized
                })
              }
              throw error
            }
          }
        }
      }
    },
    ['body']
  )
)

export const forgotPasswordValidator = validate(
  checkSchema(
    {
      email: {
        notEmpty: { bail: true, errorMessage: UsersMessages.EmailIsRequired },
        isEmail: { bail: true, errorMessage: UsersMessages.EmailIsInvalid },
        custom: {
          options: async (value, { req }) => {
            const user = await userService.checkEmailExist(value)

            if (user == null) {
              throw new Error(UsersMessages.UserNotFound)
            }

            // set user info vào request
            req.user = user
            return true
          }
        },
        trim: true
      }
    },
    ['body']
  )
)

export const verifyForgotPasswordTokenValidator = validate(
  checkSchema(
    {
      forgot_password_token: forgotPasswordTokenSchema
    },
    ['body']
  )
)

export const resetPasswordValidator = validate(
  checkSchema(
    {
      forgot_password_token: forgotPasswordTokenSchema,
      password: passwordSchema,
      confirm_password: confirmPasswordSchema
    },

    ['body']
  )
)
