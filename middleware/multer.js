const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Determine folder based on route or file type
    let folder = 'babyCare/others';
    const url = req.originalUrl;
    
    if (file.fieldname === 'Image' || file.fieldname === 'image') {
      if (url.includes('Banner')) folder = 'babyCare/banners';
      else if (url.includes('Category')) folder = 'babyCare/categories';
      else if (url.includes('Plan')) folder = 'babyCare/plans';
      else folder = 'babyCare/profiles';
    } else if (url.includes('doctorInfo')) {
      folder = 'babyCare/documents';
    }

    return {
      folder: folder,
      public_id: Date.now() + '-' + file.originalname.split('.')[0],
      resource_type: 'auto', // Important for non-image files like PDFs
    };
  },
});

const uploadImage = multer({ storage: storage });

module.exports = {
  uploadImage
};