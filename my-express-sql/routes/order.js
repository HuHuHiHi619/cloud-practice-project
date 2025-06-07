const express = require('express')
const { createOrder, getOrder, cancelOrder, getOrderList } = require('../controllers/orderController')
const { isAuthenticated } = require('../middleware/isAuthenticated')

const router = express.Router()

router.get('/getOrder/:orderId', isAuthenticated , getOrder)
router.get('/getOrderList', isAuthenticated , getOrderList)
router.post('/createOrder', isAuthenticated  ,createOrder)
router.put('/cancelOrder/:orderId', isAuthenticated , cancelOrder)
module.exports = router