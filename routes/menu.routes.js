const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menu.controller.js');
const { authMiddleware, roleCheck } = require('../middleware/auth.middleware.js');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const upload=require('../middleware/upload.js')

// Public routes
router.get('/categories', menuController.getCategories);
router.get('/items', menuController.getMenuItems);
router.get('/items/:id', menuController.getMenuItem);

// Admin routes
router.post('/categories', authMiddleware, roleCheck('admin'), menuController.createCategory);
router.put('/categories/:id', authMiddleware, roleCheck('admin'), menuController.updateCategory);
router.delete('/categories/:id', authMiddleware, roleCheck('admin'), menuController.deleteCategory);

router.post('/items', authMiddleware, roleCheck('admin'), upload.single('image'), menuController.createMenuItem);
router.put('/items/:id', authMiddleware, roleCheck('admin'), upload.single('image'), menuController.updateMenuItem);
router.delete('/items/:id', authMiddleware, roleCheck('admin'), menuController.deleteMenuItem);

module.exports = router;
