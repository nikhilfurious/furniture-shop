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
  const limit = req.query.limit ? parseInt(req.query.limit) : null; // Check if limit exists
  let query = Product.find();

  if (limit) {
    query = query.limit(limit); // Apply limit only if it's provided
  }

  const products = await query; // Execute query
  res.status(200).json(products);
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
router.post('/', upload.array('images', 5), checkAdmin, async (req, res) => {
  try {
    const {
      name,
      basePrice,
      category,
      description,
      refundableDeposit,
      brand,
      dimensions,
      color,
      tenureOptions,
      location,
    } = req.body;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'At least one image is required' });
    }

    // Upload images to Cloudinary using the same function as in PUT request
    const uploadPromises = req.files.map(file => cloudinary.uploadToCloudinary(file.path));
    const imageUrls = await Promise.all(uploadPromises);


    let parsedLocation = [];
    if (location) {
      try {
        parsedLocation = JSON.parse(location);
        if (!Array.isArray(parsedLocation)) {
          parsedLocation = [parsedLocation];
        }
      } catch (e) {
        // If parsing fails, assume it's a plain string
        parsedLocation = [location];
      }
    }

    const product = new Product({
      name,
      basePrice,
      category,
      description,
      refundableDeposit,
      brand,
      dimensions,
      color,
      images: imageUrls,
      tenureOptions: JSON.parse(tenureOptions),
      location: parsedLocation,
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
router.put('/:id', checkAdmin, upload.array('images', 5), async (req, res) => {
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
    const allowedFields = [
      'name',
      'description',
      'price',
      'category',
      'quantity',
      'refundableDeposit',
      'brand',
      'dimensions',
      'color',
      'location'
    ];
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined && req.body[field] !== null) {
        if (field === 'location') {
          // Parse location field and ensure it is stored as an array
          try {
            // Try to parse the value in case it's sent as a JSON string
            let parsed = JSON.parse(req.body[field]);
            if (!Array.isArray(parsed)) {
              // If parsed value is not an array, check if it's a comma-separated string
              if (typeof parsed === 'string') {
                parsed = parsed.split(',').map(loc => loc.trim()).filter(loc => loc !== "");
              } else {
                parsed = [parsed];
              }
            }
            updateData[field] = parsed;
          } catch (e) {
            // If parsing fails, treat it as a comma-separated string or a single value
            let locations = req.body[field];
            if (typeof locations === 'string') {
              locations = locations.split(',').map(loc => loc.trim()).filter(loc => loc !== "");
            }
            updateData[field] = Array.isArray(locations) ? locations : [locations];
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
        if (Array.isArray(existingImages)) {
          finalImages = existingImages;
        } else {
          return res.status(400).json({ message: 'existingImages must be an array' });
        }
      } catch (error) {
        return res.status(400).json({ message: 'Failed to parse existingImages JSON' });
      }
    } else {
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