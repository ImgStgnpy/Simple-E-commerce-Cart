const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const couponRoutes = require('./routes/couponRoutes');
const Product = require('./models/Product');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/shopping_cart', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log('MongoDB connected');
  
  // Reset collections
  try {
    await mongoose.connection.dropDatabase();
    console.log('Database reset successful');
    
    // Initialize coupons after database reset
    await fetch('http://localhost:3000/api/coupons/init', {
      method: 'POST'
    });
    console.log('Coupons initialized');
  } catch (err) {
    console.error('Error resetting database:', err);
  }
})
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/coupons', couponRoutes);

// Serve static files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/cart', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'cart.html'));
});

app.post('/add', async (req, res) => {
  try {
    const products = req.body;
    if (Array.isArray(products)) {
      await Product.insertMany(products);
    } else {
      const product = new Product(products);
      await product.save();
    }
    res.status(201).json({ message: 'Product(s) added successfully' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});