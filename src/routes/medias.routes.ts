import { Router } from 'express'
import { uploadImageController, uploadVideoController } from '~/controllers/medias.controllers'
import { accessTokenValidator, verifyUserValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const mediasRouter = Router()

/**
 *  Description: upload image
 *  Path: '/upload-image'
 *  Method: POST
 *  Header: 'Content-Type': 'multipart/form-data'
 *  Body: FormData with `image` is key value
 */
mediasRouter.post('/upload-image', accessTokenValidator, verifyUserValidator, wrapRequestHandler(uploadImageController))

/**
 *  Description: upload video
 *  Path: '/upload-video'
 *  Method: POST
 *  Header: 'Content-Type': 'multipart/form-data'
 *  Body: FormData with `video` is key value
 */
mediasRouter.post('/upload-video', accessTokenValidator, verifyUserValidator, wrapRequestHandler(uploadVideoController))

export default mediasRouter
