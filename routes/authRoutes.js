const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const verifyToken = require('../middleware/authMiddleware');

// Existing routes
router.post('/register', authController.register);
router.post('/login', authController.login);

router.get('/me', verifyToken, authController.getMe);


module.exports = router;
