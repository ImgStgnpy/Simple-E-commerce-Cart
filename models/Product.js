const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  available: {
    type: Number,
    required: true,
    default: 0
  },
  image: {
    type: String,
    required: true,
    default: 'https://https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT7BqNAqUF1EJy6QlpBu16vflZ2tMvO5ZFDAQ&s.placeholder.com/150'
  }
});

module.exports = mongoose.model('Product', ProductSchema);