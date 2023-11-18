import { checkSchema } from 'express-validator'
import { UsersMessages } from '~/constants/enums'
import userService from '~/services/users.services'
import { validate } from '~/utils/validation'

export const loginValidator = validate(
  checkSchema({
    email: {
      trim: true,
      isEmail: { bail: true, errorMessage: UsersMessages.EmailIsInvalid },
      custom: {
        options: async (value, { req }) => {
          const user = await userService.checkUserExist({ email: value, password: req.body.password })

          if (user === null) {
            throw new Error(UsersMessages.EmailOrPasswordIsIncorrect)
          }

          // set user info vào request
          req.user = user
          return true
        }
      }
    },
    password: {
      notEmpty: { bail: true, errorMessage: UsersMessages.PasswordIsRequired },
      isString: { bail: true, errorMessage: UsersMessages.PasswordMustBeAString },
      isLength: {
        options: { min: 6, max: 50 },
        bail: true,
        errorMessage: UsersMessages.PasswordLengthRequired
      },
      trim: true
    }
  })
)

export const registerValidator = validate(
  checkSchema({
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
    password: {
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
    },

    confirm_password: {
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
    },
    date_of_birth: {
      isISO8601: {
        options: {
          strict: true,
          strictSeparator: true
        },
        errorMessage: UsersMessages.DateOfBirthMustBeISO8601
      }
    }
  })
)
