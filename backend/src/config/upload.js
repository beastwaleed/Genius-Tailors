const multer = require('multer');
const path = require('path');
const fs = require('fs');

let sharp = null;
try {
  sharp = require('sharp');
} catch (err) {
  console.warn('Sharp module optional load warning:', err.message);
}

// Use memory storage so we can process the image buffer
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
      if (!file.mimetype || !file.mimetype.startsWith('image/')) return;
      
      const ext = file.originalname ? path.extname(file.originalname) : '.jpg';
      const filename = `${Date.now()}-${Math.round(Math.random() * 1E9)}${sharp ? '.webp' : ext}`;
      const filepath = path.join(uploadDir, filename);
      
      if (sharp) {
        try {
          await sharp(file.buffer)
            .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
            .webp({ quality: 80 })
            .toFile(filepath);
        } catch (sharpErr) {
          console.warn('Sharp compression warning, falling back to raw buffer write:', sharpErr.message);
          fs.writeFileSync(filepath, file.buffer);
        }
      } else {
        fs.writeFileSync(filepath, file.buffer);
      }
        
      const host = req.get('host');
      const protocol = req.headers['x-forwarded-proto'] || req.protocol;
      const baseUrl = `${protocol}://${host}`;
      
      file.path = `${baseUrl}/uploads/${filename}`;
      file.secure_url = `${baseUrl}/uploads/${filename}`;
      file.url = `${baseUrl}/uploads/${filename}`;
    }));
    
    next();
  } catch (error) {
    console.error('Image save warning:', error.message);
    next();
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
