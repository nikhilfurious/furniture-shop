// routes/products.js
const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const checkAdmin = require('../middleware/checkAdmin');
const upload = require('../middleware/upload');
const storage = require('../middleware/upload')
const cloudinary = require('../config/cloudinary');
const fs = require("fs");




function normalizeLocations(raw) {
  let arr = [];

  // 1) Try JSON.parse (expecting an array or single value)
  try {
    arr = JSON.parse(raw);
    // Ensure array
    if (!Array.isArray(arr)) {
      arr = [arr];
    }
  } catch {
    // 2) Fallback: comma-separated string or single value
    if (typeof raw === 'string') {
      arr = raw.split(',').map(i => i.trim()).filter(Boolean);
    } else {
      arr = [raw];
    }
  }

  // 3) Map objects → their id (or name)
  return arr.map(item => {
    if (item && typeof item === 'object') {
      // pick whichever you want stored
      return String(item.name ?? '');
    }
    return String(item);
  }).filter(i => i); // remove any empty strings
}



// @desc    Get all products
// @route   GET /api/products
// @access  Public
router.get('/', async (req, res) => {
  const limit = req.query.limit ? parseInt(req.query.limit) : null; // Check if limit exists
  const sort = req.query.sort || '-createdAt'; // Default sort field
  let query = Product.find().sort(sort);

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
      locations,
    } = req.body;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'At least one image is required' });
    }

    // Upload images to Cloudinary using the same function as in PUT request
    const uploadPromises = req.files.map(file => cloudinary.uploadToCloudinary(file.path));
    const imageUrls = await Promise.all(uploadPromises);


    let parsedLocations = [];
    if (locations) {
      parsedLocations = normalizeLocations(locations);
    }

    let parsedTenureOptions = [];
    if (tenureOptions) {
      try {
        parsedTenureOptions = JSON.parse(tenureOptions);
        // Ensure it's an array (or a valid structure you expect)
        if (!Array.isArray(parsedTenureOptions)) {
          parsedTenureOptions = [parsedTenureOptions];
        }
      } catch (e) {
        return res.status(400).json({ message: 'Invalid JSON format for tenureOptions' });
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
      tenureOptions: parsedTenureOptions, 
      images: imageUrls,
      location: parsedLocations,
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
      if (req.files && req.files.length) {
        req.files.forEach(file => {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
      }
      return res.status(404).json({ message: 'Product not found' });
    }

    const updateData = {};

    // Update basic fields (text, numbers, etc.)
    const allowedFields = [
      'name',
      'description',
      'price',
      'category',
      'quantity',
      'refundableDeposit',
      'brand',
      'dimensions',
      'color'
    ];
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined && req.body[field] !== null) {
        updateData[field] = req.body[field];
      }
    });

    // Handle tenureOptions field and ensure it is stored as an array of objects
    if (req.body.tenureOptions !== undefined && req.body.tenureOptions !== null) {
      try {
        let parsedTenure = JSON.parse(req.body.tenureOptions);
        if (!Array.isArray(parsedTenure)) {
          // In case a single tenure option is sent as an object
          parsedTenure = [parsedTenure];
        }
        updateData.tenureOptions = parsedTenure;
      } catch (err) {
        return res.status(400).json({ message: 'Invalid JSON format for tenureOptions' });
      }
    }

    // Optionally handle location field if needed (similar to tenureOptions)
    const rawLoc = req.body.locations ?? req.body.location;
    if (rawLoc != null) {
      updateData.location = normalizeLocations(rawLoc);
    }

    // Handle images
    // Start with existing images if provided, otherwise keep current product images.
    let finalImages = [];
    if (req.body.existingImages) {
      try {
        const existingImages = JSON.parse(req.body.existingImages);
        if (Array.isArray(existingImages)) {
          finalImages = existingImages;
        } else {
          return res.status(400).json({ message: 'existingImages must be an array' });
        }
      } catch (error) {
        return res.status(400).json({ message: 'Invalid JSON format for existingImages' });
      }
    } else {
      finalImages = [...product.images];
    }

    // Identify images to remove (images present in DB but not in finalImages)
    const imagesToRemove = product.images.filter(img => !finalImages.includes(img));
    for (const imageUrl of imagesToRemove) {
      try {
        await cloudinary.deleteFromCloudinary(imageUrl);
      } catch (error) {
        console.error('Error deleting image from Cloudinary:', error);
        // Continue even if some deletions fail
      }
    }

    // Upload any new images (sent via multipart/form-data)
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(file => cloudinary.uploadToCloudinary(file.path));
      const newImageUrls = await Promise.all(uploadPromises);
      finalImages = [...finalImages, ...newImageUrls];
    }

    updateData.images = finalImages;
    updateData.updatedAt = new Date();

    // Update the product document
    const updatedProduct = await Product.findByIdAndUpdate(productId, updateData, {
      new: true,
      runValidators: true
    });

    return res.status(200).json({
      message: 'Product updated successfully',
      product: updatedProduct
    });
  } catch (error) {
    console.error('Error updating product:', error);

    // Clean up any uploaded files in case of error
    if (req.files && req.files.length) {
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