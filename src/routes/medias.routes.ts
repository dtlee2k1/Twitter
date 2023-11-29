import { Router } from 'express'
import { uploadSingleImageController } from '~/controllers/medias.controllers'
import { wrapRequestHandler } from '~/utils/handlers'

const mediasRouter = Router()

/**
 *  Description: upload a single image
 *  Path: '/upload-image'
 *  Method: POST
 *  Header: 'Content-Type': 'multipart/form-data'
 *  Body: FormData with `image` is key value
 */
mediasRouter.post('/upload-image', wrapRequestHandler(uploadSingleImageController))

export default mediasRouter
