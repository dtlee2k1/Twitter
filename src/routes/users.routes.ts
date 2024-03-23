import { Router } from 'express'
import {
  verifyEmailController,
  loginController,
  logoutController,
  registerController,
  resendVerifyEmailController,
  forgotPasswordController,
  verifyForgotPasswordController,
  resetPasswordController,
  getMeController,
  updateMeController,
  getProfileController,
  followController,
  unfollowController,
  changePasswordController,
  oauthController,
  refreshTokenController
} from '~/controllers/users.controllers'
import { filterMiddlewares } from '~/middlewares/common.middlewares'
import {
  accessTokenValidator,
  changePasswordValidator,
  emailVerifyTokenValidator,
  followValidator,
  forgotPasswordValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator,
  resetPasswordValidator,
  unfollowValidator,
  updateMeValidator,
  verifyUserValidator,
  verifyForgotPasswordTokenValidator
} from '~/middlewares/users.middlewares'
import { UpdateMeReqBody } from '~/models/requests/User.requests'
import { wrapRequestHandler } from '~/utils/handlers'

const usersRouter = Router()

/**
 *  Description: Login a user
 *  Path: '/login'
 *  Method: POST
 *  Body: { email: string, password: string }
 */
usersRouter.post('/login', loginValidator, wrapRequestHandler(loginController))

/**
 *  Description: Verify OAuth with Google
 *  Path: '/oauth/google'
 *  Method: GET
 *  Query: { code: string }
 */
usersRouter.get('/oauth/google', wrapRequestHandler(oauthController))

/**
 *  Description: Register a new user
 *  Path: '/register'
 *  Method: POST
 *  Body: {name:string, email: string, password: string, confirm_password: string, date_of_birth: ISO8601}
 */
usersRouter.post('/register', registerValidator, wrapRequestHandler(registerController))

/**
 *  Description: Logout a user
 *  Path: '/logout'
 *  Method: POST
 *  Header: { Authorization: Bearer <access_token> }
 *  Body: { refresh_token: string }
 */
usersRouter.post('/logout', accessTokenValidator, refreshTokenValidator, wrapRequestHandler(logoutController))

/**
 *  Description: Refresh token
 *  Path: '/refresh-token'
 *  Method: POST
 *  Body: { refresh_token: string }
 */
usersRouter.post('/refresh-token', refreshTokenValidator, wrapRequestHandler(refreshTokenController))

/**
 *  Description: Verify email
 *  Path: '/verify-email'
 *  Method: POST
 *  Body: { email_verify_token: string }
 */
usersRouter.post('/verify-email', emailVerifyTokenValidator, wrapRequestHandler(verifyEmailController))

/**
 *  Description: Resend Verify email
 *  Path: '/resend-verify-email'
 *  Method: POST
 *  Header: { Authorization: Bearer <access_token> }
 */
usersRouter.post('/resend-verify-email', accessTokenValidator, wrapRequestHandler(resendVerifyEmailController))

/**
 *  Description: Submit email to reset password, send password to user
 *  Path: '/forgot-password'
 *  Method: POST
 *  Body: { email: string }
 */
usersRouter.post('/forgot-password', forgotPasswordValidator, wrapRequestHandler(forgotPasswordController))

/**
 *  Description: Verify link in email to reset password
 *  Path: '/verify-forgot-password'
 *  Method: POST
 *  Body: { forgot_password_token: string }
 */
usersRouter.post(
  '/verify-forgot-password',
  verifyForgotPasswordTokenValidator,
  wrapRequestHandler(verifyForgotPasswordController)
)

/**
 *  Description: RESET password
 *  Path: '/reset-password'
 *  Method: POST
 *  Body: { forgot_password_token: string, password: string,confirm_password: string }
 */
usersRouter.post('/reset-password', resetPasswordValidator, wrapRequestHandler(resetPasswordController))

/**
 *  Description: Change password
 *  Path: '/change-password'
 *  Method: PUT
 *  Header: { Authorization: Bearer <access_token> }
 *  Body: { old_password: string, password: string , confirm_password: string }
 */
usersRouter.put(
  '/change-password',
  accessTokenValidator,
  verifyUserValidator,
  changePasswordValidator,
  wrapRequestHandler(changePasswordController)
)

/**
 *  Description: Get my profile
 *  Path: '/me'
 *  Method: GET
 *  Header: { Authorization: Bearer <access_token> }
 */
usersRouter.get('/me', accessTokenValidator, wrapRequestHandler(getMeController))

/**
 *  Description: Update my profile
 *  Path: '/me'
 *  Method: PATCH
 *  Header: { Authorization: Bearer <access_token> }
 *  Body: UserSchema
 */
usersRouter.patch(
  '/me',
  accessTokenValidator,
  verifyUserValidator,
  updateMeValidator,
  filterMiddlewares<UpdateMeReqBody>([
    'name',
    'date_of_birth',
    'bio',
    'location',
    'website',
    'username',
    'avatar',
    'cover_photo'
  ]),
  wrapRequestHandler(updateMeController)
)

/**
 *  Description: Get user profile
 *  Path: '/:username'
 *  Method: GET
 */
usersRouter.get('/:username', wrapRequestHandler(getProfileController))

/**
 *  Description: Follow someone
 *  Path: '/follow'
 *  Method: POST
 *  Body: { followed_user_id }
 */
usersRouter.post(
  '/follow',
  accessTokenValidator,
  verifyUserValidator,
  followValidator,
  wrapRequestHandler(followController)
)

/**
 *  Description: Unfollow someone
 *  Path: '/follow/:user_id'
 *  Method: DELETE
 *  Params: { user_id }
 */
usersRouter.delete(
  '/follow/:user_id',
  accessTokenValidator,
  verifyUserValidator,
  unfollowValidator,
  wrapRequestHandler(unfollowController)
)

export default usersRouter
