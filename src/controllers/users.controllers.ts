import { Request, Response } from 'express'

// Controller có tác vụ xử lý logic kết quả trả về
export const usersController = (req: Request, res: Response) => {
  const { email, password } = req.body
  // Thực hiện xử lý với dữ liệu
  if (email === 'leducthai2001@gmail.com' && password === '123456') {
    // Trả về phản hồi cho client
    return res.json({
      message: 'Login successful'
    })
  }
  // Trả về phản hồi cho client
  return res.status(400).json({ error: 'email or password incorrect' })
}
