import { Router } from 'express'
import { ServeStaticImageController, ServeStaticVideoStreamController } from '~/controllers/medias.controllers'

const staticRouter = Router()

staticRouter.get('/image/:fileName', ServeStaticImageController)
staticRouter.get('/video-stream/:fileName', ServeStaticVideoStreamController)

export default staticRouter
