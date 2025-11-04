const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menu.controller');
const { authMiddleware, roleCheck } = require('../middleware/auth.middleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadsDir = 'uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const fileFilter = (req, file, cb) => {
  // Accept images only
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(null, false); // Changed from cb(new Error(...)) to cb(null, false)
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

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
