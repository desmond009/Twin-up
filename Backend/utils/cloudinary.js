const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Upload image to Cloudinary
const uploadToCloudinary = async (filePath, folder = 'skill-swap') => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder,
      use_filename: true,
      unique_filename: true,
      overwrite: false,
      resource_type: 'auto',
      transformation: [
        { width: 800, height: 800, crop: 'limit' },
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ]
    });

    return {
      public_id: result.public_id,
      secure_url: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
      size: result.bytes
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload image to Cloudinary');
  }
};

// Delete image from Cloudinary
const deleteFromCloudinary = async (publicIdOrUrl) => {
  try {
    let publicId = publicIdOrUrl;

    // If URL is provided, extract public ID
    if (publicIdOrUrl.includes('cloudinary.com')) {
      const urlParts = publicIdOrUrl.split('/');
      const uploadIndex = urlParts.findIndex(part => part === 'upload');
      if (uploadIndex !== -1 && uploadIndex + 2 < urlParts.length) {
        const versionAndPublicId = urlParts[uploadIndex + 2];
        const parts = versionAndPublicId.split('/');
        if (parts.length > 1) {
          publicId = parts.slice(1).join('/').split('.')[0]; // Remove file extension
        }
      }
    }

    if (!publicId) {
      throw new Error('Invalid public ID or URL');
    }

    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error('Failed to delete image from Cloudinary');
  }
};

// Generate optimized image URL
const getOptimizedImageUrl = (publicId, options = {}) => {
  const {
    width = 400,
    height = 400,
    crop = 'fill',
    quality = 'auto',
    format = 'auto'
  } = options;

  return cloudinary.url(publicId, {
    width,
    height,
    crop,
    quality,
    format,
    secure: true
  });
};

// Upload profile photo with specific transformations
const uploadProfilePhoto = async (filePath) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'profile-photos',
      use_filename: true,
      unique_filename: true,
      overwrite: false,
      resource_type: 'auto',
      transformation: [
        { width: 400, height: 400, crop: 'fill', gravity: 'face' },
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ]
    });

    return {
      public_id: result.public_id,
      secure_url: result.secure_url,
      thumbnail_url: getOptimizedImageUrl(result.public_id, { width: 100, height: 100 }),
      medium_url: getOptimizedImageUrl(result.public_id, { width: 200, height: 200 })
    };
  } catch (error) {
    console.error('Profile photo upload error:', error);
    throw new Error('Failed to upload profile photo');
  }
};

// Generate different sizes for an image
const generateImageVariants = (publicId) => {
  return {
    thumbnail: getOptimizedImageUrl(publicId, { width: 100, height: 100, crop: 'fill' }),
    small: getOptimizedImageUrl(publicId, { width: 200, height: 200, crop: 'fill' }),
    medium: getOptimizedImageUrl(publicId, { width: 400, height: 400, crop: 'fill' }),
    large: getOptimizedImageUrl(publicId, { width: 800, height: 800, crop: 'limit' }),
    original: getOptimizedImageUrl(publicId)
  };
};

// Validate image file
const validateImageFile = (file) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowedTypes.includes(file.mimetype)) {
    throw new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.');
  }

  if (file.size > maxSize) {
    throw new Error('File size too large. Maximum size is 5MB.');
  }

  return true;
};

module.exports = {
  uploadToCloudinary,
  deleteFromCloudinary,
  getOptimizedImageUrl,
  uploadProfilePhoto,
  generateImageVariants,
  validateImageFile
}; 