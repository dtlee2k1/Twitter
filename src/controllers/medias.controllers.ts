import { NextFunction, Request, Response } from 'express'
import path from 'path'
import { UPLOAD_DIR } from '~/constants/dir'
import { MediasMessages } from '~/constants/enums'
import mediaService from '~/services/medias.services'

export const uploadSingleImageController = async (req: Request, res: Response, next: NextFunction) => {
  const result = await mediaService.handleImageProcessing(req)

  res.json({
    message: MediasMessages.UploadImageSuccess,
    result
  })
}

export const ServeStaticImageController = (req: Request, res: Response, next: NextFunction) => {
  const { fileName } = req.params
  console.log(UPLOAD_DIR)
  res.sendFile(path.join(UPLOAD_DIR, fileName), (error) => {
    if (error) {
      res.status(404).send('NOT FOUND')
    }
  })
}
