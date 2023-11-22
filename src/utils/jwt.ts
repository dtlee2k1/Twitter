import jwt from 'jsonwebtoken'
import 'dotenv/config'
import { TokenPayload } from '~/models/requests/User.requests'

export function signToken({
  payload,
  privateKey,
  options = {
    algorithm: 'HS256'
  }
}: {
  payload: string | Buffer | object
  privateKey: string
  options?: jwt.SignOptions
}) {
  return new Promise<string>((resolve, reject) => {
    jwt.sign(payload, privateKey, options, function (error, token) {
      if (error) throw reject(error)
      resolve(token as string)
    })
  })
}

export function verifyToken({ token, secretOrPublicKey }: { token: string; secretOrPublicKey: string }) {
  return new Promise<TokenPayload>((resolve, reject) => {
    jwt.verify(token, secretOrPublicKey, (err, decoded) => {
      if (err) throw reject(err)
      resolve(decoded as TokenPayload)
    })
  })
}
