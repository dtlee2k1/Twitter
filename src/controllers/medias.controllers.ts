import { NextFunction, Request, Response } from 'express'
import { MediasMessages } from '~/constants/enums'
import { handleUploadSingleImage } from '~/utils/file'

export const uploadSingleImageController = async (req: Request, res: Response, next: NextFunction) => {
  const data = await handleUploadSingleImage(req)

  res.json({
    message: MediasMessages.UploadImageSuccess,
    result: data
  })
}
