export enum UserVerifyStatus {
  Unverified, // chưa xác thực email, mặc định = 0
  Verified, // đã xác thực email
  Banned // bị khóa
}

export enum TokenType {
  AccessToken = 'access_token',
  RefreshToken = 'refresh_token',
  ForgotPasswordToken = 'forgot_password_token',
  EmailVerifyToken = 'email_verify_token'
}
