const mysql = require('mysql2')
require('dotenv').config()

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
})

connection.connect((error) => {
  if (error) throw error
  console.log('You are now connected')
})

module.exports = connection
