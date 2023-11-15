import { Request, Response, NextFunction } from 'express'
import { checkSchema } from 'express-validator'
import userService from '~/services/users.services'
import { validate } from '~/utils/validation'

export const loginValidator = (req: Request, res: Response, next: NextFunction) => {
  // Lấy dữ liệu từ phần thân của yêu cầu
  const { email, password } = req.body
  // Thực hiện xử lý với dữ liệu
  if (!email || !password) {
    // Trả về phản hồi cho client
    return res.status(400).json({
      error: 'Missing email or password'
    })
  }

  next()
}

export const registerValidator = validate(
  checkSchema({
    username: {
      notEmpty: true,
      isString: true,
      isLength: {
        options: { max: 100, min: 1 }
      },
      trim: true
    },
    email: {
      isEmail: true,
      notEmpty: true,
      custom: {
        options: async (value) => {
          const isExistEmail = await userService.checkEmailExist(value)
          if (isExistEmail) {
            throw new Error('Email already in use')
          }

          return true
        }
      },
      trim: true
    },
    password: {
      notEmpty: true,
      isString: true,
      isLength: {
        options: { min: 6, max: 50 },
        errorMessage: 'Password must be at least 6 characters long'
      },
      isStrongPassword: {
        options: { minLength: 6, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 },
        errorMessage:
          'Password must be at least 6 characters long and contain at least 1 lowercase letter, 1 uppercase letter, 1 number and 1 symbols'
      },
      trim: true
    },

    confirm_password: {
      notEmpty: true,
      isString: true,
      isLength: {
        options: { min: 6, max: 50 },
        errorMessage: 'Password must be at least 6 characters long'
      },
      custom: {
        options: (value, { req }) => {
          if (value !== req.body.confirm_password) {
            throw new Error('Passwords do not match')
          }
          return true
        },
        bail: true
      }
    },
    date_of_birth: {
      isISO8601: {
        options: {
          strict: true,
          strictSeparator: true
        }
      },
      notEmpty: true,
      trim: true
    }
  })
)
