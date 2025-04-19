const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const verifyFirebaseToken = require('../middleware/verifyFirebaseToken');

// Get cart items for a user
router.get('/:userId', verifyFirebaseToken, async (req, res) => {
  try {
    const { userId } = req.params;

    // Verify that the user is accessing their own cart
    if (req.user.uid !== userId) {
      return res.status(403).json({ message: 'Unauthorized access to cart' });
    }

    // Find cart items for the user and populate product details
    const cartItems = await Cart.find({ userId })
      .populate({
        path: 'productId',
        select: 'name images description'
      });

    // Transform data into a single array response with the price from Cart schema
    const formattedCartItems = cartItems
      .filter(item => item.productId !== null)
      .map(item => {
        const product = item.productId;
        
        return {
          id: item._id,
          userId: item.userId,
          name: product.name,
          images: product.images,
          description: product.description,
          price: item.price,
          tenure: item.tenure,
          quantity: item.quantity
        };
      });

    return res.status(200).json(formattedCartItems);
  } catch (error) {
    console.error('Error fetching cart:', error);
    return res.status(500).json({ message: 'Server error while fetching cart' });
  }
});

// Add item to cart
router.post('/add', verifyFirebaseToken, async (req, res) => {
  try {
    const { userId, productId, tenure, price, quantity } = req.body;
    
    // Verify user is adding to their own cart
    if (req.user.uid !== userId) {
      return res.status(403).json({ message: 'Unauthorized cart operation' });
    }
    
    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Check if the item is already in the cart with the same tenure
    let cartItem = await Cart.findOne({ userId, productId, tenure });
    
    if (cartItem) {
      // Update existing cart item
      cartItem.quantity = quantity || cartItem.quantity + 1;
      cartItem.price = price || product.price;
      await cartItem.save();
    } else {
      // Create new cart item
      cartItem = new Cart({
        userId,
        productId,
        tenure,
        price: price || product.price,
        quantity: quantity || 1
      });
      await cartItem.save();
    }
    
    // Populate product details
    await cartItem.populate('productId', 'name images price description');
    
    return res.status(200).json({
      message: 'Product added to cart successfully',
      cartItem
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    return res.status(500).json({ message: 'Server error while adding to cart' });
  }
});

// Remove item from cart
router.delete('/remove/:id', verifyFirebaseToken, async (req, res) => {
  try {
    const cartItemId = req.params.id;
    
    // Find the cart item
    const cartItem = await Cart.findById(cartItemId);
    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found' });
    }
    
    
    // Remove the item
    await Cart.findByIdAndDelete(cartItemId);
    
    return res.status(200).json({ message: 'Item removed from cart successfully' });
  } catch (error) {
    console.error('Error removing from cart:', error);
    return res.status(500).json({ message: 'Server error while removing from cart' ,error: error.message });
  }
});

// Update item quantity
router.put('/update/:id', verifyFirebaseToken, async (req, res) => {
  try {
    const cartItemId = req.params.id;
    const { quantity } = req.body;
    
    // Find the cart item
    const cartItem = await Cart.findById(cartItemId);
    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found' });
    }
    
    // Verify user is updating their own cart
    if (req.user.uid !== cartItem.userId) {
      return res.status(403).json({ message: 'Unauthorized cart operation' });
    }
    
    // Update quantity
    cartItem.quantity = quantity;
    await cartItem.save();
    
    return res.status(200).json({
      message: 'Cart item updated successfully',
      cartItem
    });
  } catch (error) {
    console.error('Error updating cart:', error);
    return res.status(500).json({ message: 'Server error while updating cart' });
  }
});

// Clear entire cart
router.delete('/clear/:userId', verifyFirebaseToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Verify user is clearing their own cart
    if (req.user.uid !== userId) {
      return res.status(403).json({ message: 'Unauthorized cart operation' });
    }
    
    // Remove all cart items for the user
    await Cart.deleteMany({ userId });
    
    return res.status(200).json({ message: 'Cart cleared successfully' });
  } catch (error) {
    console.error('Error clearing cart:', error);
    return res.status(500).json({ message: 'Server error while clearing cart' });
  }
});

module.exports = router;