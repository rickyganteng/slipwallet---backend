const helper = require('../../helpers/wrapper')
const userModel = require('./user_model')
const bcrypt = require('bcrypt')
const fs = require('fs')

module.exports = {
  getAllData: async (req, res) => {
    try {
      let { userId, page, limit, search, sort } = req.query
      if (!page) {
        page = '1'
      }
      if (!limit) {
        limit = '10'
      }
      if (!search) {
        search = ''
      }
      if (!sort) {
        sort = 'user_id'
      }
      const totalData = await userModel.getDataCount(userId, search)
      page = parseInt(page)
      limit = parseInt(limit)
      const totalPage = Math.ceil(totalData / limit)
      const offset = page * limit - limit
      const pageInfo = {
        page,
        totalPage,
        limit,
        totalData
      }
      const result = await userModel.getAllUserData(
        userId,
        search,
        sort,
        limit,
        offset
      )
      return helper.response(
        res,
        200,
        'Success Get All User Data',
        result,
        pageInfo
      )
    } catch (error) {
      return helper.response(res, 400, 'Bad Request', error)
    }
  },
  updatePin: async (req, res) => {
    try {
      const { id } = req.params
      const { userPin } = req.body
      const setData = {
        user_pin: userPin
      }
      const userId = {
        user_id: id
      }
      const checkUserData = await userModel.getUserDataByCondition({
        user_id: id
      })
      const result = await userModel.updateData(setData, userId, checkUserData)
      if (checkUserData.length > 0) {
        return helper.response(res, 200, 'Success Insert Pin', result)
      } else {
        return helper.response(res, 404, `Id: ${id} Not Found`)
      }
    } catch (error) {
      return helper.response(res, 400, 'Bad Request', error)
    }
  },
  getUserDataById: async (req, res) => {
    try {
      const { id } = req.params
      const result = await userModel.getUserDataByCondition({
        user_id: id
      })
      if (result.length > 0) {
        return helper.response(
          res,
          200,
          `Success Get User Data By Id: ${id}`,
          result
        )
      } else {
        return helper.response(
          res,
          404,
          `Data User By Id: ${id} Not Found`,
          null
        )
      }
    } catch (error) {
      return helper.response(res, 'Bad Request', 400, error)
    }
  },
  updatePassword: async (req, res) => {
    try {
      const { currentPassword, newPassword, confirmPassword } = req.body
      const { id } = req.params
      const userId = {
        user_id: id
      }
      const checkNewPassword = newPassword === confirmPassword

      const checkUserData = await userModel.getUserDataByCondition(userId)

      const checkCurrentPassword = bcrypt.compareSync(
        currentPassword,
        checkUserData[0].user_password
      )

      if (checkUserData.length > 0) {
        if (checkCurrentPassword === true) {
          if (checkNewPassword) {
            const salt = bcrypt.genSaltSync(10)
            const encryptPassword = bcrypt.hashSync(confirmPassword, salt)
            const setData = {
              user_password: encryptPassword
            }
            const result = await userModel.updateData(setData, userId)
            return helper.response(res, 200, 'Succes Update Password', result)
          } else {
            return helper.response(
              res,
              403,
              "New password and confirm password didn't match",
              null
            )
          }
        } else {
          return helper.response(res, 405, 'Wrong current password', null)
        }
      } else {
        return helper.response(
          res,
          404,
          `Data User By Id: ${id} Not Found`,
          null
        )
      }
    } catch (error) {
      return helper.response(res, 400, 'Bad Request', error)
    }
  },
  updateProfile: async (req, res) => {
    try {
      const { userName, userEmail, userPhone } = req.body
      const { id } = req.params
      const userId = { user_id: id }
      const setData = {
        user_name: userName,
        user_email: userEmail,
        user_phone: userPhone,
        user_updated_at: new Date(Date.now())
      }
      const checkUserData = await userModel.getUserDataByCondition(userId)
      if (checkUserData.length > 0) {
        const result = await userModel.updateData(setData, userId)
        return helper.response(res, 200, 'Succes Update Profile', result)
      } else {
        return helper.response(res, 404, `Data User By Id: ${id} Not Found`)
      }
    } catch (error) {
      return helper.response(res, 400, 'Bad Request', error)
    }
  },
  updateImage: async (req, res) => {
    try {
      const { id } = req.params
      const userId = { user_id: id }
      const setData = {
        user_image: req.file ? req.file.filename : '',
        user_updated_at: new Date(Date.now())
      }
      const checkUserData = await userModel.getUserDataByCondition(userId)
      if (checkUserData.length > 0) {
        const imageToDelete = checkUserData[0].user_image
        const isImageExist = fs.existsSync(`src/uploads/${imageToDelete}`)

        if (isImageExist && imageToDelete) {
          fs.unlink(`src/uploads/${imageToDelete}`, (err) => {
            if (err) throw err
          })
        }

        const result = await userModel.updateData(setData, userId)
        return helper.response(res, 200, 'Success Update Image', result)
      } else {
        return helper.response(res, 404, 'Failed! No Image Is Updated')
      }
    } catch (error) {
      return helper.response(res, 400, 'Bad Request', error)
    }
  },
  updateUserBalance: async (req, res) => {
    try {
      const { userBalance } = req.body
      const { SenderId, ReceiverId } = req.query
      const userSenderId = { user_id: SenderId }
      const userReceiverId = { user_id: ReceiverId }

      const checkUserSenderData = await userModel.getUserDataByCondition(
        userSenderId
      )
      const checkUserReceiverData = await userModel.getUserDataByCondition(
        userReceiverId
      )
      let receiverBalance
      if (checkUserReceiverData[0].user_balance === '') {
        receiverBalance = 0
      } else {
        receiverBalance = parseInt(checkUserReceiverData[0].user_balance)
      }

      const setDataSender = {
        user_balance:
          parseInt(checkUserSenderData[0].user_balance) - parseInt(userBalance),
        user_updated_at: new Date(Date.now())
      }
      const setDataReceiver = {
        user_balance: receiverBalance + parseInt(userBalance),
        user_updated_at: new Date(Date.now())
      }
      if (checkUserSenderData.length > 0 && checkUserReceiverData.length > 0) {
        const resultSender = await userModel.updateData(
          setDataSender,
          userSenderId
        )
        const resultReceiver = await userModel.updateData(
          setDataReceiver,
          userReceiverId
        )
        return helper.response(res, 200, 'Succes Update Balance', [
          resultSender,
          resultReceiver
        ])
      } else {
        return helper.response(
          res,
          404,
          `Data User Sender By Id: ${SenderId} Or User Receiver By Id: ${ReceiverId} Not Found`
        )
      }
    } catch (error) {
      return helper.response(res, 400, 'Bad Request', error)
    }
  },
  verificationAccount: async (req, res) => {
    try {
      const { id } = req.params
      const setData = {
        user_verify: 1
      }
      const getUserId = await userModel.getUserDataByCondition({ user_id: id })
      await userModel.updateData(setData, { user_id: id })
      if (getUserId.length > 0) {
        return helper.response(res, 200, 'Succes User Verification')
      } else {
        return helper.response(res, 404, `Data By Id ${id} Not Found`, null)
      }
    } catch (error) {
      return helper.response(res, 400, 'Bad Request', error)
    }
  },
  getUsers: async (req, res) => {
    try {
      const result = await userModel.getAllUsersData()
      return helper.response(res, 200, 'Success Get All Data', result)
    } catch (error) {
      return helper.response(res, 400, 'Bad Request', error)
    }
  },
  userTopup: async (req, res) => {
    try {
      const { id } = req.params
      const { userTopup } = req.body
      const getDataUser = await userModel.getUserDataByCondition({
        user_id: id
      })
      const setData = {
        user_balance:
          parseInt(getDataUser[0].user_balance) + parseInt(userTopup)
      }
      const result = await userModel.updateData(setData, { user_id: id })
      return helper.response(res, 200, 'Success Top Up', result)
    } catch (error) {
      return helper.response(res, 400, 'Bad Request', error)
    }
  }
}
