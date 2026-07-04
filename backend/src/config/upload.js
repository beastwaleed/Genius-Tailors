const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

// Use memory storage so we can process the image buffer with sharp before saving
const storage = multer.memoryStorage();
const uploadMiddleware = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10 MB limit per file
});

// Create the public uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '../../public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const optimizeAndSave = async (req, res, next) => {
  if (!req.files && !req.file) return next();
  
  const files = req.files || (req.file ? [req.file] : []);
  
  try {
    await Promise.all(files.map(async (file) => {
      // Only process images
      if (!file.mimetype.startsWith('image/')) return;
      
      const filename = `${Date.now()}-${Math.round(Math.random() * 1E9)}.webp`;
      const filepath = path.join(uploadDir, filename);
      
      // Use sharp to resize and compress to WebP
      await sharp(file.buffer)
        .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(filepath);
        
      // Instead of relying on req.protocol which might be http behind Cloudflare, 
      // we generate an absolute URL dynamically if needed, or simply return the relative path.
      // Many modern frontends can handle relative paths if served on the same domain.
      // However, to ensure absolute URL works in all cases, we use a basic fallback:
      const host = req.get('host');
      const protocol = req.headers['x-forwarded-proto'] || req.protocol;
      const baseUrl = `${protocol}://${host}`;
      
      // The frontend uses secure_url and path depending on the component
      file.path = `${baseUrl}/uploads/${filename}`;
      file.secure_url = `${baseUrl}/uploads/${filename}`;
      file.url = `${baseUrl}/uploads/${filename}`;
    }));
    
    next();
  } catch (error) {
    console.error('Image optimization failed:', error);
    res.status(500).json({ message: 'Failed to process and save image', error: error.message });
  }
};

// Create wrapper functions that match the original multer API but inject our processing step
const uploadWrapper = {
  any: () => {
    return (req, res, next) => {
      uploadMiddleware.any()(req, res, (err) => {
        if (err) return next(err);
        optimizeAndSave(req, res, next);
      });
    };
  },
  single: (fieldName) => {
    return (req, res, next) => {
      uploadMiddleware.single(fieldName)(req, res, (err) => {
        if (err) return next(err);
        optimizeAndSave(req, res, next);
      });
    };
  }
};

module.exports = { upload: uploadWrapper };
