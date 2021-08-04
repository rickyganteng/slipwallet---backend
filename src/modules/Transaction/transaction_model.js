const connection = require('../../config/mysql')

module.exports = {
  createData: (setData) => {
    return new Promise((resolve, reject) => {
      connection.query(
        'INSERT INTO transaction SET ?',
        setData,
        (error, result) => {
          if (!error) {
            const newResult = {
              transaction_id: result.insertId,
              ...setData
            }
            resolve(newResult)
          } else {
            reject(new Error(error))
          }
        }
      )
    })
  },
  updateDataUserBalance: (setData, condition) => {
    return new Promise((resolve, reject) => {
      connection.query(
        'UPDATE user SET ? WHERE ?',
        [setData, condition],
        (error, result) => {
          if (!error) {
            const newResult = {
              ...condition,
              ...setData
            }
            resolve(newResult)
          } else {
            reject(new Error(error))
          }
        }
      )
    })
  },
  getUserDataById: (condition) => {
    return new Promise((resolve, reject) => {
      connection.query(
        'SELECT * FROM user WHERE ?',
        condition,
        (error, result) => {
          !error ? resolve(result) : reject(new Error(error))
        }
      )
    })
  },
  getTransactionBySenderId: (id) => {
    return new Promise((resolve, reject) => {
      connection.query(
        `SELECT * FROM transaction JOIN user ON transaction.transaction_receiver_id = user.user_id WHERE transaction_sender_id = ${id} ORDER BY transaction_id DESC LIMIT 50`,
        (error, result) => {
          console.log(error)
          !error ? resolve(result) : reject(new Error(error))
        }
      )
    })
  },
  getTransactionByReceiverId: (id) => {
    return new Promise((resolve, reject) => {
      connection.query(
        `SELECT * FROM transaction JOIN user ON transaction.transaction_sender_id = user.user_id WHERE transaction_receiver_id = ${id} ORDER BY transaction_id DESC LIMIT 50`,
        (error, result) => {
          console.log(error)
          !error ? resolve(result) : reject(new Error(error))
        }
      )
    })
  },
  filterTransactionData: (id, condition) => {
    return new Promise((resolve, reject) => {
      connection.query(
        `SELECT * FROM transaction WHERE (transaction_sender_id = ${id} OR transaction_receiver_id = ${id}) ${condition} ORDER BY transaction_id DESC`,
        (error, result) => {
          !error ? resolve(result) : reject(new Error(error))
        }
      )
    })
  },
  transactionDataByDayOnWeek: (id) => {
    return new Promise((resolve, reject) => {
      connection.query(
        `SELECT DATE(transaction_created_at) AS date, SUM(transaction_amount) AS total FROM transaction WHERE WEEK(transaction_created_at) = WEEK(NOW()) AND transaction_sender_id = ${id} GROUP BY DAY(transaction_created_at)`,
        (error, result) => {
          !error ? resolve(result) : reject(new Error(error))
        }
      )
    })
  }
}
