const connection = require('../../config/mysql')

module.exports = {
  getUserDataByCondition: (condition) => {
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
  getDataCount: (id, search) => {
    return new Promise((resolve, reject) => {
      connection.query(
        `SELECT COUNT(*) AS total FROM user WHERE user_id != ${id} AND user_name LIKE '%${search}%'`,
        id,
        (error, result) => {
          !error ? resolve(result[0].total) : reject(new Error(error))
        }
      )
    })
  },
  getAllUserData: (id, search, sort, limit, offset) => {
    return new Promise((resolve, reject) => {
      connection.query(
        `SELECT * FROM user WHERE user_id != ${id} AND user_name LIKE '%${search}%' ORDER BY ${sort} LIMIT ${limit} OFFSET ${offset}`,
        (error, result) => {
          !error ? resolve(result) : reject(new Error(error))
        }
      )
    })
  },
  updateData: (setData, condition) => {
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
  getAllUsersData: () => {
    return new Promise((resolve, reject) => {
      connection.query('SELECT * FROM user', (error, result) => {
        !error ? resolve(result) : reject(new Error(error))
      })
    })
  }
}
