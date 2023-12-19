import { Request } from 'express'
import path from 'path'
import sharp from 'sharp'
import { UPLOAD_IMAGE_DIR } from '~/constants/dir'
import { getNameFromFullName, handleUploadImage, handleUploadVideo } from '~/utils/file'
import fs from 'fs'
import fsPromise from 'fs/promises'
import { isProduction } from '~/constants/config'
import { Media } from '~/models/Other'
import { MediaType } from '~/constants/enums'
import { uploadFileToS3 } from '~/utils/s3'

class MediaService {
  async handleImageProcessing(req: Request) {
    const mime = (await import('mime')).default

    const files = await handleUploadImage(req)

    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        //  tạo file path mới dẫn tới folder uploads/images nếu xử lý ảnh thành công
        const newFilename = getNameFromFullName(file.newFilename)
        const newFullFilename = `${newFilename}.jpg`
        const newPath = path.resolve(UPLOAD_IMAGE_DIR, newFullFilename)

        // Xử lý ảnh bằng sharp biến đổi image file upload sang định dạng jpeg
        await sharp(file.filepath).jpeg().toFile(newPath)
        // upload image file to S3
        const s3Result = await uploadFileToS3({
          filename: newFullFilename,
          filepath: newPath,
          contentType: mime.getType(newPath) as string
        })
        // Xóa file path trong folder uploads/images/temp sau khi xử lý ảnh thành công
        await Promise.all([fsPromise.unlink(file.filepath), fsPromise.unlink(newPath)])

        return {
          url: s3Result.Location as string,
          type: MediaType.Image
        }

        // return {
        //   url: isProduction
        //     ? `${process.env.HOST}/static/image/${newFullFilename}`
        //     : `http://localhost:${process.env.PORT}/static/image/${newFullFilename}`,
        //   type: MediaType.Image
        // }
      })
    )

    return result
  }

  async handleVideoProcessing(req: Request) {
    const files = await handleUploadVideo(req)

    const result: Media[] = files.map((file) => {
      return {
        url: isProduction
          ? `${process.env.HOST}/static/video/${file.newFilename}`
          : `http://localhost:${process.env.PORT}/static/video/${file.newFilename}`,
        type: MediaType.Video
      }
    })
    return result
  }
}

const mediaService = new MediaService()
export default mediaService
