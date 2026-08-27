const express = require('express');
const router = express.Router();
const {
  getNextOrderNumber,
  getOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  updateOrderPayment,
  deleteOrder,
} = require('../controllers/orderController');

router.get('/next-number', getNextOrderNumber);
router.get('/', getOrders);
router.get('/:id', getOrderById);
router.post('/', createOrder);
router.patch('/:id/status', updateOrderStatus);
router.put('/:id', updateOrderStatus);
router.patch('/:id/payment', updateOrderPayment);
router.delete('/:id', deleteOrder);

module.exports = router;
