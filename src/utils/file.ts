import fs from 'fs'
import { Request } from 'express'
import formidable, { File } from 'formidable'
import { UPLOAD_DIR, UPLOAD_TEMP_DIR } from '~/constants/dir'
import { MediasMessages } from '~/constants/enums'

export const initFolder = () => {
  ;[UPLOAD_TEMP_DIR, UPLOAD_DIR].forEach((dir) => {
    if (!fs.existsSync(dir)) {
      // Nếu không tồn tại, tạo thư mục
      fs.mkdirSync(dir, {
        recursive: true // tạo nested folder
      })
    }
  })
}

export const handleUploadSingleImage = async (req: Request) => {
  const form = formidable({
    uploadDir: UPLOAD_TEMP_DIR,
    keepExtensions: true,
    maxFiles: 1,
    maxFileSize: 300 * 1024 * 1024, // 300 kB,
    filter: function ({ mimetype }) {
      // keep only images
      const valid = mimetype && mimetype.includes('image')
      if (!valid) {
        form.emit('error' as any, new Error(MediasMessages.FileTypeIsNoValid) as any)
        return false
      }
      return true
    }
  })

  return new Promise<File>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err)
      }

      if (Object.keys(files).length === 0) {
        return reject(new Error(MediasMessages.FileIsEmpty))
      }
      return resolve((files.image as File[])[0])
    })
  })
}

export const getNameFromFullName = (fullname: string) => {
  const nameArr = fullname.split('.')

  return nameArr[0]
}
