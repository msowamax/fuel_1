const express = require('express');
const router = express.Router();
const controller = require('../controllers/companyController');
const middleware = require('../middleware/auth');

console.log('--- Company Routes Diagnostics ---');
console.log('Auth Middleware Type:', typeof middleware.auth);
console.log('GetCompanies Controller Type:', typeof controller.getCompanies);

router.get('/', middleware.auth, controller.getCompanies);

module.exports = router;
