import 'dotenv/config'
import User from '~/models/schemas/User.schema'
import databaseService from './database.services'
import { UserReqBody } from '~/models/requests/User.requests'
import { hashPassword } from '~/utils/crypto'
import { signToken } from '~/utils/jwt'
import { TokenType, UserVerifyStatus } from '~/constants/enums'
import { ObjectId } from 'mongodb'
import RefreshToken from '~/models/schemas/ReFreshToken.schema'

// Chứa các file chứa method gọi đến database để xử lý logic nghiệp vụ
class UserService {
  private signAccessToken(user_id: string) {
    return signToken({
      payload: {
        user_id,
        type: TokenType.AccessToken
      },
      privateKey: process.env.JWT_SECRET_ACCESS_TOKEN as string,
      options: {
        expiresIn: process.env.ACCESS_TOKEN_EXP
      }
    })
  }

  private signRefreshToken(user_id: string) {
    return signToken({
      payload: {
        user_id,
        type: TokenType.RefreshToken
      },
      privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string,
      options: {
        expiresIn: process.env.REFRESH_TOKEN_EXP
      }
    })
  }

  private signEmailVerifyToken(user_id: string) {
    return signToken({
      payload: {
        user_id,
        type: TokenType.EmailVerifyToken
      },
      privateKey: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string,
      options: {
        expiresIn: process.env.EMAIL_VERIFY_TOKEN_EXP
      }
    })
  }

  async signAccessAndRefreshToken(user_id: string) {
    return Promise.all([this.signAccessToken(user_id), this.signRefreshToken(user_id)])
  }

  async register(payload: UserReqBody) {
    const user_id = new ObjectId()

    const email_verify_token = await this.signEmailVerifyToken(user_id.toString())
    // Insert document vào collection "users"
    await databaseService.users.insertOne(
      new User({
        ...payload,
        _id: user_id,
        email_verify_token,
        date_of_birth: new Date(payload.date_of_birth),
        password: hashPassword(payload.password)
      })
    )

    const [access_token, refresh_token] = await this.signAccessAndRefreshToken(user_id.toString())

    // insert refresh token vào database sau khi login/register thành công
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({ user_id: new ObjectId(user_id), token: refresh_token })
    )

    return {
      access_token,
      refresh_token
    }
  }

  async login(user_id: string) {
    const [access_token, refresh_token] = await this.signAccessAndRefreshToken(user_id)

    // insert refresh token vào database sau khi login/register thành công
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({ user_id: new ObjectId(user_id), token: refresh_token })
    )

    return {
      access_token,
      refresh_token
    }
  }

  async checkEmailExist(email: string) {
    const user = await databaseService.users.findOne({ email })
    return Boolean(user)
  }

  async checkUserExist({ email, password }: { email: string; password: string }) {
    const user = await databaseService.users.findOne({ email, password: hashPassword(password) })
    return user
  }

  async checkAndDeleteRefreshTokenInDB(token: string) {
    return databaseService.refreshTokens.findOneAndDelete({ token })
  }

  async verifyEmail(user_id: string) {
    const [token] = await Promise.all([
      this.signAccessAndRefreshToken(user_id),
      databaseService.users.updateOne(
        { _id: new ObjectId(user_id) },
        { $set: { email_verify_token: '', verify: UserVerifyStatus.Verified, updated_at: new Date() } }
      )
    ])

    const [access_token, refresh_token] = token

    return {
      access_token,
      refresh_token
    }
  }
}

const userService = new UserService()
export default userService
