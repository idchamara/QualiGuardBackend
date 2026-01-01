const express = require('express');
const router = express.Router();
const { Product, Inspection } = require('../models');

router.get('/', async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [{ model: Inspection, as: 'inspection' }]
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

// API endpoints for products