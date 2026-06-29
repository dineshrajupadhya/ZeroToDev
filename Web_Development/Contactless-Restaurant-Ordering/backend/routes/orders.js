const express = require('express');
const router = express.Router();
const { createOrder, getMyOrders, getOrder, getAllOrders, updateOrderStatus, cancelOrder } = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.post('/', createOrder);
router.get('/my-orders', getMyOrders);
router.get('/admin/all', authorize(['admin']), getAllOrders);
router.get('/:id', getOrder);
router.put('/:id/status', authorize(['admin']), updateOrderStatus);
router.put('/:id/cancel', cancelOrder);

module.exports = router;
