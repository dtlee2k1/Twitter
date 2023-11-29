import { Request } from 'express'
import path from 'path'
import sharp from 'sharp'
import { UPLOAD_DIR } from '~/constants/dir'
import { getNameFromFullName, handleUploadImage } from '~/utils/file'
import fs from 'fs'
import { isProduction } from '~/constants/config'
import { Media } from '~/models/Others'
import { MediaType } from '~/constants/enums'
class MediaService {
  async handleImageProcessing(req: Request) {
    const files = await handleUploadImage(req)

    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        //  tạo file path mới dẫn tới folder uploads/images nếu xử lý ảnh thành công
        const newFilename = getNameFromFullName(file.newFilename)
        const newPath = path.resolve(UPLOAD_DIR, `${newFilename}.jpg`)

        // Xử lý ảnh bằng sharp biến đổi image file upload sang định dạng jpeg
        await sharp(file.filepath).jpeg().toFile(newPath)
        // Xóa file path trong folder uploads/temp sau khi xử lý ảnh thành công
        fs.unlinkSync(file.filepath)

        return {
          url: isProduction
            ? `${process.env.HOST}/static/image/${newFilename}.jpg`
            : `http://localhost:${process.env.PORT}/static/image/${newFilename}.jpg`,
          type: MediaType.Image
        }
      })
    )

    return result
  }
}

const mediaService = new MediaService()
export default mediaService
