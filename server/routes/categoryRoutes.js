const express = require('express');
const router = express.Router();
const Product = require('../models/Product'); // Ensure Product model is set up

// Get all products by category

router.get('/', async (req, res) => {
  try {
    // Find all unique categories from the products collection
    const categoriesResult = await Product.aggregate([
      { $group: { _id: "$category" } },
      { $project: { _id: 0, category: "$_id" } }
    ]);
    
    // Extract just the category names into a simple array
    const categories = categoriesResult.map(item => item.category);
    
    // Return just the array directly, not wrapped in an object
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: "Error fetching categories" });
  }
});


  const getCategoryFromSlug = (slug) => {
    const mapping = {
      'living-room': 'Living Room Furniture',
      'bed-room': 'Bed Room Furniture',
      'dining-room': 'Dining Room Furniture',
      'outdoor':'Outdoor Furniture',
      'storage': 'Storage and Organizations',
      // Add additional mappings as needed
    };
  
    // If the slug is defined in our mapping, return the mapped value.
    // Otherwise, fall back to a basic conversion (capitalizing each word).
    if (mapping[slug]) {
      return mapping[slug];
    } else {
      return slug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }
  };
  
  
  // Fetch products by category
  router.get('/:categorySlug', async (req, res) => {
    const { categorySlug } = req.params;
    const categoryName = getCategoryFromSlug(categorySlug);
  
    try {
      // Query for active products that match the category name
      const products = await Product.find({ category: categoryName, isActive: true });
      res.json({ products });
    } catch (err) {
      console.error('Error fetching products by category:', err);
      res.status(500).json({ error: 'Server error fetching products for category' });
    }
  });
  
  module.exports = router;
  
  

module.exports = router;
