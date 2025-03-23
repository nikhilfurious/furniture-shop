// routes/products.js
const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const checkAdmin = require('../middleware/checkAdmin');
const upload = require('../middleware/upload');
const storage = require('../middleware/upload')
const cloudinary = require('../config/cloudinary');
const fs = require("fs");

// @desc    Get all products
// @route   GET /api/products
// @access  Public
router.get('/', async (req, res) => {
  try {
/*     // Add filtering and pagination if needed
    const { location } = req.query;  // Get location from query params
    const filter = location ? { location } : {}; */

    const products = await Product.find({ isActive: true });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Create new product
// @route   POST /api/products
// @access  Private/Admin
router.post('/', storage.array('images',5) ,checkAdmin, async (req, res) => {
  try {
    const { name,
      basePrice,
      category,
      description,
      refundableDeposit,
      operationType,
      loadType,
      brand,
      dimensions,
      color,
      tenureOptions,
    } = req.body;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'At least one image is required' });
    }

    const imageUrls = await Promise.all(
      req.files?.map(async (file) => {
        const result = await cloudinary.uploader.upload(file.path);
        return result.secure_url;
      })
    );

    const product = new Product({
      name,
      basePrice,
      category,
      description,
      refundableDeposit,
      operationType,
      loadType,
      brand,
      dimensions,
      color,
      images: imageUrls,
      tenureOptions: JSON.parse(tenureOptions),
    });

    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
router.put('/:id', checkAdmin, upload.array('images',5), async (req, res) => {
  try {
    const productId = req.params.id;
    
    // Find the product to update
    const product = await Product.findById(productId);
    
    if (!product) {
      // Clean up any uploaded files before responding
      if (req.files && req.files.length > 0) {
        req.files.forEach(file => {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
      }
      return res.status(404).json({ message: 'Product not found' });
    }

    const updateData = {};
    
    // Handle text fields from the request body
    const allowedFields = ['name', 'description', 'price', 'category', 'refundableDeposit', 'operationType', 'loadType', 'brand', 'dimensions', 'color', 'tenureOptions'];
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        // Try to parse JSON if the field could be an object or array
        if (typeof req.body[field] === 'string' && 
            (req.body[field].startsWith('{') || req.body[field].startsWith('['))) {
          try {
            updateData[field] = JSON.parse(req.body[field]);
          } catch (e) {
            updateData[field] = req.body[field];
          }
        } else {
          updateData[field] = req.body[field];
        }
      }
    });
    
    // Handle images - start with existing images
    let finalImages = [];
    
    // Parse existingImages if provided, otherwise keep current product images
    if (req.body.existingImages) {
      try {
        const existingImages = JSON.parse(req.body.existingImages);
        // Validate that existingImages is an array
        if (Array.isArray(existingImages)) {
          finalImages = existingImages;
        } else {
          return res.status(400).json({ message: 'existingImages must be an array' });
        }
      } catch (error) {
        return res.status(400).json({ message: 'Failed to parse existingImages JSON' });
      }
    } else {
      // If no existingImages provided, use current images
      finalImages = [...product.images];
    }
    
    // Find images to remove (images in the database but not in existingImages)
    const imagesToRemove = product.images.filter(img => !finalImages.includes(img));
    
    // Delete removed images from Cloudinary
    for (const imageUrl of imagesToRemove) {
      try {
        await cloudinary.deleteFromCloudinary(imageUrl);
      } catch (error) {
        console.error('Error deleting image from Cloudinary:', error);
        // Continue with update even if image deletion fails
      }
    }
    
    // Upload new images to Cloudinary
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(file => cloudinary.uploadToCloudinary(file.path));
      const newImageUrls = await Promise.all(uploadPromises);
      
      // Add new image URLs to final images array
      finalImages = [...finalImages, ...newImageUrls];
    }
    
    // Update the product data with the final images array
    updateData.images = finalImages;
    updateData.updatedAt = new Date();
    
    // Update the product in the database
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      updateData,
      { new: true, runValidators: true }
    );
    
    return res.status(200).json({
      message: 'Product updated successfully',
      product: updatedProduct
    });
    
  } catch (error) {
    console.error('Error updating product:', error);
    
    // Clean up any uploaded files in case of error
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }
    
    return res.status(500).json({
      message: 'Server error while updating product',
      error: error.message
    });
  }
});



// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
router.delete('/:id', checkAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    await Product.deleteOne({ _id: id });
    res.json({ message: 'Product removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Search products
// @route   GET /api/products/search/:query
// @access  Public
router.get('/search/:query', async (req, res) => {
  try {
    const products = await Product.find({ 
      $text: { $search: req.params.query },
      isActive: true 
    });
    
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;