const express = require('express')
const Route = express.Router()
const { register, login, refresh } = require('./auth_controller')

Route.post('/register', register)
Route.post('/login', login)
Route.post('/refresh', refresh)

module.exports = Route
