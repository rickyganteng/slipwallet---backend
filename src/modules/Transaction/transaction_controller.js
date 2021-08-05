const helper = require('../../helpers/wrapper')
const transactionModel = require('./transaction_model')
const ejs = require('ejs')
const pdf = require('html-pdf')
const path = require('path')

module.exports = {
  createTransaction: async (req, res) => {
    try {
      const { transactionSenderId, transactionReceiverId } = req.query
      const { transactionAmount, transactionStatus, transactionMessage, transactionType } =
        req.body
      const setData = {
        transaction_sender_id: transactionSenderId,
        transaction_receiver_id: transactionReceiverId,
        transaction_amount: transactionAmount,
        transaction_status: transactionStatus,
        transaction_message: transactionMessage,
        // eslint-disable-next-line eqeqeq
        transaction_type: transactionType == 0 ? 'Top Up' : 'Transfer'
      }
      // console.log('set fata', setData);
      const result = await transactionModel.createData(setData)
      return helper.response(res, 200, 'Success Transaction', result)
    } catch (error) {
      return helper.response(res, 400, 'Bad Request', error)
      // console.log(error)
    }
  },
  getTransactionHistory: async (req, res) => {
    try {
      const { id } = req.params
      const resultSender = await transactionModel.getTransactionBySenderId(id)
      // const resultReceiver = await transactionModel.getTransactionByReceiverId(
      //   id
      // )
      const result = [...resultSender]
      // console.log(result)
      result
        .sort((a, b) => {
          return a.transaction_id - b.transaction_id
        })
        .reverse()

      return helper.response(
        res,
        200,
        'Success Get Transaction History',
        result.slice(0, 5)
      )
    } catch (error) {
      return helper.response(res, 400, 'Bad Request', error)
    }
  },
  getTransferDataByWeek: async (req, res) => {
    try {
      const { id } = req.params
      const condition =
        ' AND YEARWEEK(transaction_created_at, 1) = YEARWEEK(CURDATE(), 1)'
      const result = await transactionModel.filterTransactionData(id, condition)

      for (const value of result) {
        const conditionId =
          // eslint-disable-next-line eqeqeq
          value.transaction_sender_id != id
            ? value.transaction_sender_id
            : value.transaction_receiver_id
        value.user = await transactionModel.getUserDataById({
          user_id: conditionId
        })
      }
      return helper.response(
        res,
        200,
        'Success Get Transaction By Week',
        result
      )
    } catch (error) {
      return helper.response(res, 400, 'Bad Request', error)
    }
  },
  getTransferDataByMonth: async (req, res) => {
    try {
      const { id } = req.params
      const condition = ' AND MONTH(transaction_created_at) = MONTH(CURDATE())'
      const result = await transactionModel.filterTransactionData(id, condition)
      for (const value of result) {
        const conditionId =
          // eslint-disable-next-line eqeqeq
          value.transaction_sender_id != id
            ? value.transaction_sender_id
            : value.transaction_receiver_id
        value.user = await transactionModel.getUserDataById({
          user_id: conditionId
        })
      }
      return helper.response(
        res,
        200,
        'Success Get Transaction By Month',
        result
      )
    } catch (error) {
      return helper.response(res, 400, 'Bad Request', error)
    }
  },
  getTransactionDataByDayOnWeek: async (req, res) => {
    try {
      const { id } = req.params
      const checkIdUser = await transactionModel.getUserDataById({
        user_id: id
      })
      if (checkIdUser.length > 0) {
        const result = await transactionModel.transactionDataByDayOnWeek(id)
        return helper.response(res, 200, 'Success Get Data User By Day', result)
      } else {
        return helper.response(res, 404, `Id: ${id} not found`, null)
      }
    } catch (error) {
      return helper.response(res, 400, 'Bad Request', error)
    }
  },
  exportPdfTransaction: async (req, res) => {
    try {
      const {
        amount,
        balanceLeft,
        dateTime,
        notes,
        receiverName,
        receiverPhone
      } = req.body
      const fileName = `laporan transfer anda ke - ${receiverName}.pdf`
      const result = {
        amount,
        balanceLeft,
        dateTime,
        notes,
        receiverName,
        receiverPhone
      }

      ejs.renderFile(
        path.join(__dirname, '../../templates', 'report-transfer-template.ejs'),
        { result: result },
        (err, data) => {
          if (err) {
            return helper.response(res, 400, 'Failed Export Transaction', err)
            // console.log(err);
          } else {
            const options = {
              height: '11.25in',
              width: '8.5in',
              header: {
                height: '20mm'
              },
              footer: {
                height: '20mm'
              }
            }
            pdf
              .create(data, options)
              .toFile(
                path.join(__dirname, '../../../public/transfer/', fileName),
                function (err, data) {
                  if (err) {
                    return helper.response(
                      res,
                      400,
                      'Failed Export Transaction',
                      err
                    )
                  } else {
                    return helper.response(
                      res,
                      200,
                      'Success Export File Transaction',
                      {
                        url: `http://localhost:3004/backend4/api/${fileName}`
                      }
                    )
                  }
                }
              )
          }
        }
      )
    } catch (error) {
      console.log(error)
      return helper.response(res, 400, 'Bad Request', error)
    }
  }
}
