
const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// Get all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add sample products (for initial setup)
router.post('/init', async (req, res) => {
  try {
    // Check if products already exist
    const count = await Product.countDocuments();
    if (count === 0) {
      const sampleProducts = [
        { 
          name: 'Smartphone', 
          price: 12999, 
          available: 10,
          image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTaQ3w0zX8NXBSH_DpSr16gN5LMz0vCmMVRYA&s'
        },
        { 
          name: 'Wireless Earbuds', 
          price: 1499, 
          available: 20,
          image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSQwVRvIl17OGWoN9v28y_QW1BBAwQgPXarCg&s'
        },
        { 
          name: 'Smart Watch', 
          price: 2999, 
          available: 15,
          image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT7BqNAqUF1EJy6QlpBu16vflZ2tMvO5ZFDAQ&s'
        },
        { 
          name: 'Bluetooth Speaker', 
          price: 1999, 
          available: 12,
          image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTkzm330_QXVLpQJnT6jKW3ixSYYI9Vka9t6Q&s'
        },
        { 
          name: 'Power Bank', 
          price: 899, 
          available: 25,
          image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSC06DMEiGK_usaBIjwUMMzoJ2YHyr5tjWS2w&s'
        },
        { 
          name: 'Laptop Bag', 
          price: 799, 
          available: 30,
          image: 'https://safaribags.com/cdn/shop/files/2_31fbd079-d0d4-4e5e-a87f-2ec5446114b3_1024x.jpg?v=1688114252'
        }
      ];
      
      await Product.insertMany(sampleProducts);
      res.status(201).json({ message: 'Sample products added' });
    } else {
      res.json({ message: 'Products already exist' });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Add endpoint to update product image
router.patch('/:id/image', async (req, res) => {
  try {
    const { image } = req.body;
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    product.image = image;
    await product.save();
    
    res.json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;