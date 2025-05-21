const express = require('express');
const router = express.Router();
const Coupon = require('../models/Coupon');

// Get all active coupons
router.get('/', async (req, res) => {
  try {
    const coupons = await Coupon.find({ isActive: true });
    res.json(coupons);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Validate coupon
router.post('/validate', async (req, res) => {
  try {
    const { code } = req.body;
    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
      isActive: true,
      validUntil: { $gt: new Date() }
    });

    if (!coupon) {
      return res.status(404).json({ message: 'Invalid or expired coupon' });
    }

    res.json({ 
      valid: true, 
      discount: coupon.discount 
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Add sample coupons (for testing)
router.post('/init', async (req, res) => {
  try {
    const sampleCoupons = [
      {
        code: 'WELCOME10',
        discount: 10,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        isActive: true
      },
      {
        code: 'SAVE20',
        discount: 20,
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        isActive: true
      }
    ];

    await Coupon.insertMany(sampleCoupons);
    res.status(201).json({ message: 'Sample coupons added' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;