import { NextFunction, Request, Response } from 'express'
import path from 'path'
import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR } from '~/constants/dir'
import { HttpStatusCode, MediasMessages } from '~/constants/enums'
import mediaService from '~/services/medias.services'
import fs from 'fs'

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
      res.status(HttpStatusCode.NotFound).send('NOT FOUND')
    }
  })
}

export const ServeStaticVideoStreamController = async (req: Request, res: Response, next: NextFunction) => {
  const mime = (await import('mime')).default
  // Lấy header `Range` từ request
  const range = req.headers.range

  if (!range) {
    return res.status(HttpStatusCode.BadRequest).send('Requires Range header')
  }

  const { fileName } = req.params
  const videoPath = path.resolve(UPLOAD_VIDEO_DIR, fileName)

  // 1MB = 10^6 bytes
  // Dung lượng toàn bộ của file video
  const videoSize = fs.statSync(videoPath).size
  // Dung lượng video cho mỗi phân đoạn stream
  const chunkSize = 10 ** 7 // 10MB
  // Lấy giá trị bytes bắt đầu từ header Range (Range: bytes=1048576-)
  const start = Number(range.replace(/\D/g, ''))

  // Lấy giá trị bytes kết thúc
  const end = Math.min(start + chunkSize, videoSize - 1)

  // Dung lượng thực tế cho mỗi đoạn video stream
  const contentLength = end - start + 1

  const contentType = mime.getType(videoPath) || 'video/*'

  const headers = {
    'Content-Range': `bytes ${start}-${end}/${videoSize}`,
    'Accept-Ranges': 'bytes',
    'Content-Length': contentLength,
    'Content-Type': contentType
  }

  // Phản hồi về client với headers
  res.writeHead(HttpStatusCode.PartialContent, headers)
  //  Tạo một đối tượng Readable stream để đọc phần của tệp video được yêu cầu.
  const videoStreams = fs.createReadStream(videoPath, { start, end })
  //  Điều hướng dữ liệu từ Readable stream đến Writable stream (trong TH này, từ tệp video đến phản hồi của client)
  videoStreams.pipe(res)
}
