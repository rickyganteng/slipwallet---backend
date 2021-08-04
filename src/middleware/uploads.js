const multer = require('multer')
const path = require('path')
const helper = require('../helpers/wrapper')

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'src/uploads')
  },
  filename: function (req, file, cb) {
    console.log(file)
    cb(null, new Date().toISOString().replace(/:/g, '-') + file.originalname)
  }
})

const fileFilter = (req, file, cb) => {
  const listExt = ['.jpg', '.png', '.jpeg']
  const ext = path.extname(file.originalname).toLowerCase()
  if (listExt.includes(ext)) {
    cb(null, true)
  } else {
    cb(new Error('Extension file harus jpg/png !'), false)
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 1024 * 1024 }
}).single('image')

const uploadFilter = (req, res, next) => {
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading.
      return helper.response(res, 401, err.message, null)
    } else if (err) {
      // An unknown error occurred when uploading.
      return helper.response(res, 401, err.message, null)
    }
    next()
    // Everything went fine.
  })
}
module.exports = uploadFilter
