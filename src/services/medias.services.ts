import { Request } from 'express'
import path from 'path'
import sharp from 'sharp'
import { UPLOAD_IMAGE_DIR } from '~/constants/dir'
import { getNameFromFullName, handleUploadImage, handleUploadVideo } from '~/utils/file'
import fsPromise from 'fs/promises'
import { Media } from '~/models/Other'
import { MediaType } from '~/constants/enums'
import { uploadFileToS3 } from '~/utils/s3'

class MediaService {
  async handleImageProcessing(req: Request) {
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
          filename: 'images/' + newFullFilename,
          filepath: newPath,
          contentType: file.mimetype as string
        })
        // Xóa file path trong folder uploads/images sau khi xử lý ảnh và upload image lên s3 thành công
        await Promise.all([fsPromise.unlink(file.filepath), fsPromise.unlink(newPath)])

        return {
          url: s3Result.Location as string,
          type: MediaType.Image
        }
      })
    )

    return result
  }

  async handleVideoProcessing(req: Request) {
    const files = await handleUploadVideo(req)

    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        const s3Result = await uploadFileToS3({
          filename: 'videos/' + file.newFilename,
          filepath: file.filepath,
          contentType: file.mimetype as string
        })

        fsPromise.unlink(file.filepath)

        return {
          url: s3Result.Location as string,
          type: MediaType.Video
        }
      })
    )
    return result
  }
}

const mediaService = new MediaService()
export default mediaService
