const express = require('express');
const router = express.Router();
const { getPrices, updatePrice } = require('../controllers/priceController');
const { auth, adminAuth } = require('../middleware/auth');

router.get('/', auth, getPrices);
router.post('/update', auth, updatePrice);

module.exports = router;
