const express = require('express')
const Route = express.Router()
const uploadImage = require('../../middleware/uploads')
const { authentication } = require('../../middleware/auth')

const {
  updatePin,
  getUserDataById,
  updatePassword,
  updateProfile,
  updateImage,
  getAllData,
  updateUserBalance,
  verificationAccount,
  getUsers,
  userTopup
} = require('./user_controller')

Route.patch('/pin/:id', authentication, updatePin)
Route.patch('/password/:id', authentication, updatePassword)
Route.patch('/profile/:id', authentication, updateProfile)
Route.patch('/balance', updateUserBalance)
Route.patch('/topup/:id', authentication, userTopup)
Route.patch('/image/:id', authentication, uploadImage, updateImage)
Route.get('/:id', getUserDataById)
Route.get('/', authentication, getAllData)
Route.get('/users/all-data', getUsers)
Route.get('/verification/:id', verificationAccount)

module.exports = Route
