const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const CarouselItem = require('../models/Carousel'); // Adjust path as needed

// Configure cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
}).single('image');

// Function to upload to Cloudinary
const uploadToCloudinary = async (filePath) => {
  try {
    // Upload the image
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'carousel',
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

// GET all carousel items
router.get('/', async (req, res) => {
  try {
    const carouselItems = await CarouselItem.find().sort({ createdAt: -1 });
    res.json(carouselItems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST create a new carousel item
router.post('/', (req, res) => {
  upload(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: `Multer error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ message: err.message });
    }
    
    try {
      // Check if image was uploaded
      if (!req.file) {
        return res.status(400).json({ message: 'Image is required' });
      }
      
      // Upload to Cloudinary
      const imageUrl = await uploadToCloudinary(req.file.path);
      
      // Create new carousel item
      const carouselItem = new CarouselItem({
        title: req.body.title,
        subtitle: req.body.subtitle,
        image: imageUrl
      });
      
      const savedItem = await carouselItem.save();
      res.status(201).json(savedItem);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
});

// GET a specific carousel item
router.get('/:id', async (req, res) => {
  try {
    const carouselItem = await CarouselItem.findById(req.params.id);
    if (!carouselItem) {
      return res.status(404).json({ message: 'Carousel item not found' });
    }
    res.json(carouselItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT update a carousel item
router.put('/:id', (req, res) => {
  upload(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: `Multer error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ message: err.message });
    }
    
    try {
      const updateData = {
        title: req.body.title,
        subtitle: req.body.subtitle
      };
      
      // If a new image was uploaded, update the image URL
      if (req.file) {
        updateData.image = await uploadToCloudinary(req.file.path);
      }
      
      const updatedItem = await CarouselItem.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true }
      );
      
      if (!updatedItem) {
        return res.status(404).json({ message: 'Carousel item not found' });
      }
      
      res.json(updatedItem);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
});

// DELETE a carousel item
router.delete('/:id', async (req, res) => {
  try {
    const carouselItem = await CarouselItem.findById(req.params.id);
    
    if (!carouselItem) {
      return res.status(404).json({ message: 'Carousel item not found' });
    }
    
    await CarouselItem.findByIdAndDelete(req.params.id);
    
    // Note: You may want to also delete the image from Cloudinary
    // This would require extracting and storing the public_id when uploading
    
    res.json({ message: 'Carousel item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;