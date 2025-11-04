// const express = require('express');
// const router = express.Router();
// const orderController = require('../controllers/order.controller');
// const { authMiddleware, roleCheck, optionalAuth } = require('../middleware/auth.middleware');

// router.post('/', optionalAuth, orderController.createOrder);

// router.get('/', 
//   authMiddleware, 
//   roleCheck('staff', 'admin'), 
//   orderController.getOrders
// );

// router.get('/stats', 
//   authMiddleware, 
//   roleCheck('staff', 'admin'), 
//   orderController.getOrderStats
// );

// router.get('/me', 
//   authMiddleware, 
//   orderController.getMyOrders
// );

// router.get('/:id', 
//   authMiddleware, 
//   orderController.getOrder
// );

// router.patch('/:id/status', 
//   authMiddleware, 
//   roleCheck('staff', 'admin'), 
//   orderController.updateOrderStatus
// );

// module.exports = router;


const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { authMiddleware, roleCheck, optionalAuth } = require('../middleware/auth.middleware');

// Create order - guest allowed
router.post('/', optionalAuth, orderController.createOrder);

// Get all orders - staff/admin only
router.get('/', authMiddleware, roleCheck('staff', 'admin'), orderController.getOrders);

// Get order stats - staff/admin only
router.get('/stats', authMiddleware, roleCheck('staff', 'admin'), orderController.getOrderStats);

// Get my orders - authenticated users only
router.get('/me', authMiddleware, orderController.getMyOrders);

// Get single order by ID - CHANGED TO optionalAuth (allows guest access)
router.get('/:id', optionalAuth, orderController.getOrder);

// Update order status - staff/admin only
router.patch('/:id/status', authMiddleware, roleCheck('staff', 'admin'), orderController.updateOrderStatus);

module.exports = router;
