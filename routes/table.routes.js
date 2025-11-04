const express = require('express');
const router = express.Router();
const tableController = require('../controllers/table.controller.js');
const { authMiddleware, roleCheck } = require('../middleware/auth.middleware.js');

router.get('/by-slug/:slug', tableController.getTableBySlug);

router.post('/', 
  authMiddleware, 
  roleCheck('admin'), 
  tableController.createTable
);

router.get('/', 
  authMiddleware, 
  roleCheck('staff', 'admin'), 
  tableController.getTables
);

router.get('/:id', 
  authMiddleware, 
  roleCheck('staff', 'admin'), 
  tableController.getTable
);

router.get('/:id/qr', 
  authMiddleware, 
  roleCheck('admin'), 
  tableController.generateQR
);

router.put('/:id', 
  authMiddleware, 
  roleCheck('admin'), 
  tableController.updateTable
);

router.delete('/:id', 
  authMiddleware, 
  roleCheck('admin'), 
  tableController.deleteTable
);

module.exports = router;
