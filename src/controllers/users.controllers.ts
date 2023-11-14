import { Request, Response } from 'express'
import userService from '~/services/users.services'

// Controller có tác vụ xử lý logic kết quả trả về
export const loginController = (req: Request, res: Response) => {
  const { email, password } = req.body
  // Thực hiện xử lý với dữ liệu
  if (email === 'leducthai2001@gmail.com' && password === '123456') {
    // Trả về phản hồi cho client
    return res.json({
      message: 'Login successfully'
    })
  }
  // Trả về phản hồi cho client
  return res.status(400).json({ message: 'email or password incorrect' })
}

export const registerController = async (req: Request, res: Response) => {
  const { email, password } = req.body
  // Thực hiện xử lý với dữ liệu
  try {
    const result = await userService.register({ email, password })
    // Trả về phản hồi cho client
    res.json({
      message: 'Register successfully',
      result
    })
  } catch (error) {
    return res.status(400).json({ message: 'Register failed' })
  }
}
