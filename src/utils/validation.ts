import { Request, Response, NextFunction } from 'express'
import { validationResult, ValidationChain, ResultFactory } from 'express-validator'
import { RunnableValidationChains } from 'express-validator/src/middlewares/schema'
import { HttpStatusCode } from '~/constants/enums'
import { EntityError, ErrorWithStatus } from '~/models/Errors'

// can be reused by many routes

// sequential processing, stops running validations chain if the previous one fails.
export const validate = (validations: RunnableValidationChains<ValidationChain>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await validations.run(req)

    // Extracts the validation errors of an express request
    const errors = validationResult(req)

    // Không có lỗi thì tiếp tục chạy next request
    if (errors.isEmpty()) {
      return next()
    }

    const errorsObject = errors.mapped()

    // Tạo instance chứa các lỗi trả về do validation (422)
    const entityError = new EntityError({ errors: {} })

    // Xử lý những lỗi có status khác 422 (lỗi thường do form validation)
    for (const key in errorsObject) {
      const { msg } = errorsObject[key]

      // Trả về lỗi không phải do validate
      if (msg instanceof ErrorWithStatus && msg.status !== HttpStatusCode.UnprocessableEntity) {
        return next(msg)
      }

      // format lỗi trả về cho các validation error
      entityError.errors[key] = errorsObject[key]
    }

    // Chuyển request sang error handler
    next(entityError)
  }
}
