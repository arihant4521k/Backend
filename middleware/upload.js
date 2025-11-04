const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const dotenv = require('dotenv')
dotenv.config()
// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Cloudinary storage for Multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'uploads',
    allowed_formats: ['png', 'jpg', 'jpeg', 'webp', 'gif'], // ✅ Restrict allowed formats here
    public_id: (req, file) => 'menu-item-' + Date.now(), // More descriptive name
  },
});

// Configure multer with file validation
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Validate file types at multer level (before Cloudinary)
    const allowedMimes = ['image/png', 'image/jpg', 'image/jpeg', 'image/webp', 'image/gif'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true); // Accept file
    } else {
      cb(new Error('Invalid file type. Only PNG, JPG, JPEG, WEBP, and GIF are allowed.'), false);
    }
  }
});

module.exports = upload;
