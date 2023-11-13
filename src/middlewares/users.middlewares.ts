import { Request, Response, NextFunction } from 'express'

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
