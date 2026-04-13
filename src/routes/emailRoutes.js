const express = require('express');
const router = express.Router();
const emailController = require('../controllers/emailController');
const rateLimit = require('express-rate-limit');

// Rate limiting: Prevent abuse and spam
const emailLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 emails per windowMs
  message: { success: false, error: 'Too many emails sent. Please try again later.' }
});

// Routes
router.post('/send-mail', emailLimiter, emailController.sendClientEmail);

module.exports = router;
