const cloudinary = require('cloudinary').v2;
require('dotenv').config(); // Load environment variables
const fs = require('fs');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadToCloudinary = async (filePath) => {
  try {
    // Upload the image
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'products',
      use_filename: true,
      unique_filename: true,
      overwrite: false,
      resource_type: 'image'
    });

    // Remove the locally saved temporary file
    fs.unlinkSync(filePath);
    
    // Return the secure URL of the uploaded image
    return result.secure_url;
  } catch (error) {
    // Remove the locally saved temporary file in case of error
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    throw new Error(`Error uploading to Cloudinary: ${error.message}`);
  }
};

// Function to delete an image from Cloudinary
const deleteFromCloudinary = async (imageUrl) => {
  try {
    // Extract public_id from the Cloudinary URL
    const urlParts = imageUrl.split('/');
    const filename = urlParts[urlParts.length - 1];
    const publicId = `products/${filename.split('.')[0]}`;

    // Delete the image
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw new Error(`Error deleting from Cloudinary: ${error.message}`);
  }
};

module.exports = {
  uploadToCloudinary,
  deleteFromCloudinary,
  cloudinary
};
