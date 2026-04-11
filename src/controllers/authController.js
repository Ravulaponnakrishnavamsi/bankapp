const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { sendOTPEmail } = require('../utils/mailer');
const { saveOTP, getOTP, deleteOTP } = require('../utils/otpStore');

// Helper: Generate 6-digit OTP
const generateOTP = () => crypto.randomInt(100000, 999999).toString();

/**
 * Controller: Send OTP
 */
exports.sendOtp = async (req, res, next) => {
  try {
    const { firstName, lastName, email } = req.body;

    if (!firstName || !lastName || !email || !email.includes('@')) {
      return res.status(400).json({ success: false, error: 'Valid Name and Email are required.' });
    }

    const otp = generateOTP();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minute expiry

    const otpData = {
      otp,
      expiresAt,
      user: { firstName, lastName, email }
    };

    // Save to memory
    saveOTP(email, otpData);
    console.log(`✅ [AUTH] OTP created locally for: ${email}`);

    // Send the email
    await sendOTPEmail({ firstName, lastName, email }, otp);

    res.status(200).json({ 
      success: true, 
      message: 'OTP sent successfully to site owner.' 
    });
  } catch (error) {
    console.error('❌ [AUTH] Send OTP Error:', error.message);
    next(error);
  }
};

/**
 * Controller: Verify OTP
 */
exports.verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, error: 'Email and OTP are required.' });
    }

    const storedData = getOTP(email);

    if (!storedData) {
      return res.status(400).json({ success: false, error: 'OTP expired or not found.' });
    }

    // Check condition properly (as requested by user)
    if (storedData.otp !== otp) {
      return res.status(400).json({ success: false, error: 'Invalid OTP code.' });
    }

    if (Date.now() > storedData.expiresAt) {
      deleteOTP(email);
      return res.status(400).json({ success: false, error: 'OTP has expired.' });
    }

    // SUCCESS - Clear OTP
    deleteOTP(email);
    console.log(`✅ [AUTH] User verified: ${email}`);

    // Generate JWT (No DB used, but providing a secure session as requested)
    const token = jwt.sign(
      { email, name: `${storedData.user.firstName} ${storedData.user.lastName}` },
      process.env.JWT_SECRET || 'fallback_secret_123',
      { expiresIn: '1h' }
    );

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully.',
      token,
      user: storedData.user
    });
  } catch (error) {
    console.error('❌ [AUTH] Verify OTP Error:', error.message);
    next(error);
  }
};
