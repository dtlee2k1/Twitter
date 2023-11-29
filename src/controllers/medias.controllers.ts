import { NextFunction, Request, Response } from 'express'
import { MediasMessages } from '~/constants/enums'
import mediaService from '~/services/medias.services'

export const uploadSingleImageController = async (req: Request, res: Response, next: NextFunction) => {
  const result = await mediaService.handleImageProcessing(req)

  res.json({
    message: MediasMessages.UploadImageSuccess,
    result
  })
}
