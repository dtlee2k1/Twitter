import { NextFunction, Request, RequestHandler, Response } from 'express'

// wrapRequestHandler function dùng để xử lý bắt lỗi các request, tránh việc sử dụng lặp lại try catch ở nhiều nơi
export const wrapRequestHandler = (func: RequestHandler) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await func(req, res, next)
    } catch (error) {
      next(error)
    }
  }
}
