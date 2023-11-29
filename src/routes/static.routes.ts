import { Router } from 'express'
import { ServeStaticImageController, ServeStaticVideoController } from '~/controllers/medias.controllers'

const staticRouter = Router()

staticRouter.get('/image/:fileName', ServeStaticImageController)
staticRouter.get('/video/:fileName', ServeStaticVideoController)

export default staticRouter
