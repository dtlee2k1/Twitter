import { NextFunction, Request, Response } from 'express'
import omit from 'lodash/omit'
import { HttpStatusCode } from '~/constants/enums'
import { ErrorWithStatus } from '~/models/Errors'

export const defaultErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  try {
    if (err instanceof ErrorWithStatus) {
      return res.status(err.status).json(omit(err, ['status']))
    }

    // Lấy ra các lỗi thuộc original `Error`
    Object.getOwnPropertyNames(err).forEach((key) => {
      Object.defineProperty(err, key, {
        enumerable: true
      })
    })

    res.status(HttpStatusCode.InternalServerError).json({
      message: err.message,
      errorInfo: omit(err, ['stack'])
    })
  } catch (err) {
    res.status(HttpStatusCode.InternalServerError).json({
      message: 'Internal Server Error'
    })
  }
}
