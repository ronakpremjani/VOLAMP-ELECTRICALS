const express = require('express');
const router = express.Router();
const {
  getCustomers,
  getCustomerById,
  createCustomer,
  recordCustomerPayment,
  updateCustomer,
  deleteCustomer,
} = require('../controllers/customerController');

router.get('/', getCustomers);
router.get('/:id', getCustomerById);
router.post('/', createCustomer);
router.post('/:id/payments', recordCustomerPayment);
router.put('/:id', updateCustomer);
router.delete('/:id', deleteCustomer);

module.exports = router;
