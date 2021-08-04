const connection = require('../../config/mysql')

module.exports = {
  register: (data) => {
    return new Promise((resolve, reject) => {
      connection.query('INSERT INTO user SET ?', data, (error, result) => {
        console.log(error)
        if (!error) {
          const newData = {
            id: result.insertId,
            ...data
          }
          resolve(newData)
        } else {
          reject(new Error(error))
        }
      })
    })
  },
  checUserData: (data) => {
    return new Promise((resolve, reject) => {
      connection.query('SELECT * FROM user WHERE ?', data, (error, result) => {
        console.log(error)
        !error ? resolve(result) : reject(new Error(error))
      })
    })
  }
}
