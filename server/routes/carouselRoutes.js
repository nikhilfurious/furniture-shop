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
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
}).single('image');

// Helper to upload to Cloudinary
async function uploadToCloudinary(filePath) {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'carousel',
      resource_type: 'image'
    });
    fs.unlinkSync(filePath);
    return result.secure_url;
  } catch (error) {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    throw error;
  }
}

// GET all carousel items
router.get('/', async (req, res) => {
  try {
    const items = await CarouselItem.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create a new carousel item (image only)
router.post('/', (req, res) => {
  upload(req, res, async (err) => {
    if (err instanceof multer.MulterError) return res.status(400).json({ message: err.message });
    if (err) return res.status(400).json({ message: err.message });
    try {
      if (!req.file) return res.status(400).json({ message: 'Image is required' });
      const imageUrl = await uploadToCloudinary(req.file.path);
      const newItem = new CarouselItem({ image: imageUrl });
      const saved = await newItem.save();
      res.status(201).json(saved);
    } catch (e) {
      res.status(500).json({ message: e.message });
    }
  });
});

// PUT update a carousel item (image only)
router.put('/:id', (req, res) => {
  upload(req, res, async (err) => {
    if (err instanceof multer.MulterError) return res.status(400).json({ message: err.message });
    if (err) return res.status(400).json({ message: err.message });
    try {
      if (!req.file) return res.status(400).json({ message: 'Image is required' });
      const imageUrl = await uploadToCloudinary(req.file.path);
      const updated = await CarouselItem.findByIdAndUpdate(
        req.params.id,
        { image: imageUrl },
        { new: true }
      );
      if (!updated) return res.status(404).json({ message: 'Carousel item not found' });
      res.json(updated);
    } catch (e) {
      res.status(500).json({ message: e.message });
    }
  });
});

// DELETE a carousel item
router.delete('/:id', async (req, res) => {
  try {
    const item = await CarouselItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Carousel item not found' });
    await CarouselItem.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted successfully' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;
