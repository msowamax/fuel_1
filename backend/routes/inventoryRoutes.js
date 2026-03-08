const express = require('express');
const router = express.Router();
const { getInventory, updateInventory } = require('../controllers/inventoryController');
const { auth } = require('../middleware/auth');

router.get('/', auth, getInventory);
router.post('/update', auth, updateInventory);

module.exports = router;
