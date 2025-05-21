const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const mongoose = require('mongoose');

// Get all cart items
router.get('/', async (req, res) => {
  try {
    const cartItems = await Cart.find();
    res.json(cartItems);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add item to cart
router.post('/add/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    const quantity = parseInt(req.body.quantity) || 1;
    
    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Check if product already in cart
    let cartItem = await Cart.findOne({ productId });
    
    // Calculate total available quantity
    const totalAvailable = product.available + (cartItem ? cartItem.quantity : 0);
    
    // Check if enough quantity is available
    if (quantity > totalAvailable) {
      return res.status(400).json({ 
        message: 'Not enough products available',
        requested: quantity,
        available: totalAvailable
      });
    }
    
    if (cartItem) {
      // Update quantity if already in cart
      cartItem.quantity += quantity;
      await cartItem.save();
    } else {
      // Create new cart item if not in cart
      cartItem = new Cart({
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity: quantity
      });
      await cartItem.save();
    }
    
    // Update product available quantity
    product.available = totalAvailable - cartItem.quantity;
    await product.save();
    
    res.status(201).json(cartItem);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Buy item from cart
router.post('/buy/:id', async (req, res) => {
  try {
    const cartItemId = req.params.id;
    const { discount = 0 } = req.body;
    
    // Find cart item
    const cartItem = await Cart.findById(cartItemId);
    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found' });
    }
    
    // Find product
    const product = await Product.findById(cartItem.productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Calculate total available quantity (product available + cart quantity)
    const totalAvailable = product.available + cartItem.quantity;

    // Verify if enough quantity is available
    if (cartItem.quantity > totalAvailable) {
      return res.status(400).json({ 
        message: 'Not enough products available',
        requested: cartItem.quantity,
        available: totalAvailable
      });
    }
    
    // Calculate prices with discount
    const originalPrice = cartItem.price * cartItem.quantity;
    const discountAmount = originalPrice * (discount / 100);
    const finalPrice = originalPrice - discountAmount;
    
    // Process the purchase
    // 1. Update product quantity
    product.available = totalAvailable - cartItem.quantity;
    await product.save();
    
    // 2. Remove item from cart
    await Cart.findByIdAndDelete(cartItemId);
    
    res.json({ 
      message: 'Purchase successful',
      purchaseDetails: {
        product: cartItem.name,
        quantity: cartItem.quantity,
        originalPrice: originalPrice,
        discount: discount,
        discountAmount: discountAmount,
        finalPrice: finalPrice,
        remainingStock: product.available
      }
    });
    
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Remove item from cart
router.delete('/remove/:id', async (req, res) => {
  try {
    const cartItemId = req.params.id;
    
    // Find cart item
    const cartItem = await Cart.findById(cartItemId);
    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found' });
    }
    
    // Update product available count
    const product = await Product.findById(cartItem.productId);
    if (product) {
      product.available += cartItem.quantity;
      await product.save();
    }
    
    // Remove item from cart
    await Cart.findByIdAndDelete(cartItemId);
    return res.json({ message: 'Item removed from cart' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
