import { NextFunction, Request, Response } from 'express'
import path from 'path'
import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR } from '~/constants/dir'
import { MediasMessages } from '~/constants/enums'
import mediaService from '~/services/medias.services'

export const uploadImageController = async (req: Request, res: Response, next: NextFunction) => {
  const result = await mediaService.handleImageProcessing(req)

  res.json({
    message: MediasMessages.UploadImageSuccess,
    result
  })
}

export const uploadVideoController = async (req: Request, res: Response, next: NextFunction) => {
  const result = await mediaService.handleVideoProcessing(req)

  res.json({
    message: MediasMessages.UploadVideoSuccess,
    result
  })
}

export const ServeStaticImageController = (req: Request, res: Response, next: NextFunction) => {
  const { fileName } = req.params
  res.sendFile(path.join(UPLOAD_IMAGE_DIR, fileName), (error) => {
    if (error) {
      res.status(404).send('NOT FOUND')
    }
  })
}

export const ServeStaticVideoController = (req: Request, res: Response, next: NextFunction) => {
  const { fileName } = req.params
  res.sendFile(path.join(UPLOAD_VIDEO_DIR, fileName))
}
