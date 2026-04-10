const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const auth = require('../middleware/auth');

router.post('/', auth, paymentController.processPayment);
router.get('/:orderId', auth, paymentController.getPaymentByOrder);
router.put('/:id', auth, paymentController.updatePaymentStatus);
router.delete('/:id', auth, paymentController.deletePayment);

module.exports = router;
