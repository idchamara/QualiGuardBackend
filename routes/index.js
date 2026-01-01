const express = require('express');
const router = express.Router();

const inspectionRoutes = require('./inspections');
const siteRoutes = require('./sites');
const productRoutes = require('./products');
const questionRoutes = require('./questions');

router.use('/inspections', inspectionRoutes);
router.use('/sites', siteRoutes);
router.use('/products', productRoutes);
router.use('/questions', questionRoutes);

module.exports = router;


// 🛣️ Main router - combines all routes