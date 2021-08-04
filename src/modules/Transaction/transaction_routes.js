const express = require('express')
const { authentication } = require('../../middleware/auth')
const Route = express.Router()

const {
  createTransaction,
  getTransactionHistory,
  getTransferDataByWeek,
  getTransferDataByMonth,
  getTransactionDataByDayOnWeek,
  exportPdfTransaction
} = require('./transaction_controller')

Route.post('/', authentication, createTransaction)
Route.get('/:id', authentication, getTransactionHistory)
Route.get('/week/:id', getTransferDataByWeek)
Route.get('/month/:id', getTransferDataByMonth)
Route.get('/day/:id', authentication, getTransactionDataByDayOnWeek)
Route.post('/export/:id', authentication, exportPdfTransaction)

module.exports = Route
