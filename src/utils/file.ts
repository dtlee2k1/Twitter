import path from 'path'
import fs from 'fs'
import { Request } from 'express'
import formidable from 'formidable'

export const initFolder = () => {
  const uploadFolderPath = path.resolve('uploads/images')

  if (!fs.existsSync(uploadFolderPath)) {
    // Nếu không tồn tại, tạo thư mục
    fs.mkdirSync(uploadFolderPath, {
      recursive: true // tạo folder nest
    })
  }
}

export const handleUploadSingleImage = async (req: Request) => {
  const form = formidable({
    uploadDir: path.resolve('uploads/images'),
    keepExtensions: true,
    maxFiles: 1,
    maxFileSize: 300 * 1024, // 300 kB,
    filter: function ({ mimetype }) {
      // keep only images
      const valid = mimetype && mimetype.includes('image')
      if (!valid) {
        form.emit('error' as any, new Error('File type is not valid') as any)
      }
      return true
    }
  })

  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err)
      }

      if (Object.keys(files).length === 0) {
        return reject(new Error('File is empty'))
      }

      return resolve(files)
    })
  })
}
