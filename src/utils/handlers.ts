import { NextFunction, Request, RequestHandler, Response } from 'express'

// wrapRequestHandler function dùng để xử lý bắt lỗi các request, tránh việc sử dụng lặp lại try catch ở nhiều nơi
export const wrapRequestHandler = <P>(func: RequestHandler<P, any, any, any>) => {
  return async (req: Request<P>, res: Response, next: NextFunction) => {
    try {
      await func(req, res, next)
    } catch (error) {
      next(error)
    }
  }
}
