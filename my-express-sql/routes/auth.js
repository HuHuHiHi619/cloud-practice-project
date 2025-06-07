const express = require('express')
const { register, login, getAllUsers, logout } = require('../controllers/userController')
const { isAuthenticated } = require('../middleware/isAuthenticated')

const router = express.Router()

router.get('/getAllUsers', isAuthenticated , getAllUsers)


router.post('/register' , register)
router.post('/login' , login)
router.post('/logout', logout)

module.exports = router