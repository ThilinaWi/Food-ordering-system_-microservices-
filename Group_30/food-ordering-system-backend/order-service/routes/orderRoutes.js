const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { adminAuth, auth } = require('../middleware/auth');

router.post('/', auth, orderController.createOrder);
router.get('/', adminAuth, orderController.getAllOrders);
router.get('/:userId', auth, orderController.getOrdersByUser);
router.get('/detail/:id', auth, orderController.getOrderById);
router.put('/:id/status', adminAuth, orderController.updateOrderStatus);
router.delete('/:id', auth, orderController.deleteOrder);

module.exports = router;
