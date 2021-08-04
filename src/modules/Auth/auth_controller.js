const helper = require('../../helpers/wrapper')
const bcrypt = require('bcrypt')
const authModel = require('./auth_model')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')
require('dotenv').config()
const dataRefreshToken = {}

module.exports = {
  register: async (req, res) => {
    try {
      const { userName, userEmail, userPassword } = req.body
      const salt = bcrypt.genSaltSync(10)
      const encryptPassword = bcrypt.hashSync(userPassword, salt)
      const setData = {
        user_name: userName,
        user_email: userEmail,
        user_password: encryptPassword
      }
      const checkEmailUser = await authModel.checUserData({
        user_email: userEmail
      })
      // cek email
      if (checkEmailUser.length <= 0) {
        const result = await authModel.register(setData)
        delete result.user_password
        const transporter = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 587,
          secure: false, // true for 465, false for other ports
          auth: {
            user: process.env.USER_EMAIL, // generated ethereal user
            pass: process.env.USER_PASS // generated ethereal password
          }
        })

        const mailOptions = {
          from: '"SlipWallet" <putericky@gmail.com>', // sender address
          to: userEmail, // list of receivers
          subject: 'SlipWallet - Activation Your Account', // Subject line
          html: `<b>Click Here to activate </b><a href='http://localhost:3004/backend4/api/v1/user/verification/${result.id}'>
            Click !</a>` // html body
        }
        await transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error)
          } else {
            console.log('Email sent: ' + info.response)
          }
        })
        return helper.response(
          res,
          200,
          'Succes register Account, Please Check your Email to Activate your Account !',
          result
        )
      } else {
        return helper.response(
          res,
          404,
          `${userEmail} already registered`,
          null
        )
      }
    } catch (error) {
      return helper.response(res, 400, 'Bad Request', error)
    }
  },
  login: async (req, res) => {
    try {
      const { userEmail, userPassword } = req.body
      const checkEmailUser = await authModel.checUserData({
        user_email: userEmail
      })
      if (checkEmailUser.length > 0 && checkEmailUser[0].user_verify === '1') {
        const checkPassword = bcrypt.compareSync(
          userPassword,
          checkEmailUser[0].user_password
        )
        if (checkPassword) {
          const payload = checkEmailUser[0]
          delete payload.user_password
          const token = jwt.sign({ ...payload }, 'RAHASIA', {
            expiresIn: '24h'
          })
          const refreshToken = jwt.sign({ ...payload }, 'RAHASIA', {
            expiresIn: '7d'
          })
          dataRefreshToken[checkEmailUser[0].user_id] = refreshToken
          const result = { ...payload, token, refreshToken }
          return helper.response(res, 200, 'Succes Login !', result)
        } else {
          return helper.response(res, 404, 'Wrong Password')
        }
      } else {
        return helper.response(
          res,
          404,
          'Please verified your email',
          null
        )
      }
    } catch (error) {
      return helper.response(res, 400, 'Bad Request', error)
    }
  },
  refresh: async (req, res) => {
    try {
      const { refreshToken } = req.body
      // user id 1 = refreshtoken = 1234
      // generate si access token yang baru
      jwt.verify(refreshToken, 'RAHASIA', (error, result) => {
        if (
          (error && error.name === 'JsonWebTokenError') ||
          (error && error.name === 'TokenExpiredError')
        ) {
          delete dataRefreshToken.userId
          return helper.response(res, 403, error.message)
        } else {
          if (
            result.user_id in dataRefreshToken &&
            dataRefreshToken[result.user_id] === refreshToken
          ) {
            delete result.iat
            delete result.exp
            const token = jwt.sign(result, 'RAHASIA', { expiresIn: '24h' })
            const newResult = { ...result, token, refreshToken }
            return helper.response(
              res,
              200,
              'Success Refresh Token !',
              newResult
            )
          } else {
            return helper.response(res, 403, 'Wrong Refresh Token')
          }
        }
      })
    } catch (error) {
      return helper.response(res, 400, 'Bad Request', error)
    }
  }
}
