const express = require('express');
const router = express.Router();
const { getUsers, approveUser, updateRole, updateProfile, uploadLogo } = require('../controllers/userController');
const { auth, adminAuth } = require('../middleware/auth');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

router.get('/', auth, adminAuth, getUsers);
router.patch('/me', auth, updateProfile);
router.post('/upload-logo', auth, upload.single('logo'), uploadLogo);
router.patch('/:id/approve', auth, adminAuth, approveUser);
router.patch('/:id/role', auth, adminAuth, updateRole);

module.exports = router;
