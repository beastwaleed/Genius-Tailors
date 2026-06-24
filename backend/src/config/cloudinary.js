const cloudinary = require('cloudinary');
// multer-storage-cloudinary v2 exports the constructor as a default (not named) export
const CloudinaryStorage = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary with credentials from .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Set up Cloudinary as the multer storage destination
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    // All reference images go into a dedicated folder in your Cloudinary account
    folder: 'genius-tailors/reference-images',

    // Accept JPG, PNG, WEBP — reject everything else (v2 uses 'allowedFormats')
    allowedFormats: ['jpg', 'jpeg', 'png', 'webp'],

    // Auto-compress and limit dimensions to save bandwidth
    // Max 1200px wide — plenty for a tailor reference image
    transformation: [{ width: 1200, height: 1200, crop: 'limit', quality: 'auto' }]
  }
});

// Multer middleware — enforces a 5 MB file size limit per upload
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10 MB
});

module.exports = { cloudinary, upload };
