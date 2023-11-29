import { Router } from 'express'
import { ServeStaticImageController } from '~/controllers/medias.controllers'

const staticRouter = Router()

staticRouter.get('/image/:fileName', ServeStaticImageController)

export default staticRouter
