import { JwtPayload } from 'jsonwebtoken'
import { TokenType } from '~/constants/enums'

export interface UserReqBody {
  username: string
  email: string
  password: string
  confirm_password: string
  date_of_birth: string
}

export interface TokenPayload extends JwtPayload {
  user_id: string
  type: TokenType
}
