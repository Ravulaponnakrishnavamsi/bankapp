const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const rateLimit = require('express-rate-limit');

// Rate limiting: Prevent brute force/spam
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per window
  message: { success: false, error: 'Too many attempts. Please try again later.' }
});

// Routes
router.post('/send-otp', authLimiter, authController.sendOtp);
router.post('/verify-otp', authController.verifyOtp);

module.exports = router;
