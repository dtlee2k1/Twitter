import { Request } from 'express'
import path from 'path'
import sharp from 'sharp'
import { UPLOAD_DIR } from '~/constants/dir'
import { getNameFromFullName, handleUploadSingleImage } from '~/utils/file'
import fs from 'fs'
class MediaService {
  async handleImageProcessing(req: Request) {
    const file = await handleUploadSingleImage(req)

    //  tạo file path mới dẫn tới folder uploads/images nếu xử lý ảnh thành công
    const newFilename = getNameFromFullName(file.newFilename)
    const newPath = path.join(UPLOAD_DIR, `${newFilename}.jpg`)

    // Xử lý ảnh bằng sharp biến đổi image file upload sang định dạng jpeg
    await sharp(file.filepath).jpeg().toFile(newPath)
    // Xóa file path trong folder uploads/temp sau khi xử lý ảnh thành công
    fs.unlinkSync(file.filepath)
    return `http://localhost:4000/uploads/images/${newFilename}.jpg`
  }
}

const mediaService = new MediaService()
export default mediaService
