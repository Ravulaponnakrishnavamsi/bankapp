require('dotenv').config();
const express    = require('express');
const nodemailer = require('nodemailer');
const path       = require('path');
const crypto     = require('crypto');
const helmet     = require('helmet');
const compression = require('compression');
const cors       = require('cors');
const morgan     = require('morgan');
const rateLimit  = require('express-rate-limit');

const { db } = require('./config/firebase');
const otpStore = new Map();

const app  = express();
const PORT = process.env.PORT || 5000;

/* ──────────────────────────────────────────────
   Middleware & Security
   ────────────────────────────────────────────── */
app.use(helmet({
  contentSecurityPolicy: false, // Disable for easier vanilla JS integration
}));
app.use(compression());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Rate limiting: Prevent brute force on OTP endpoints
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 OTP requests per window
  message: { success: false, error: 'Too many requests. Please try again later.' }
});

const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100
});
app.use('/api/', generalLimiter);

/* ──────────────────────────────────────────────
   Helper: Generate OTP
   ────────────────────────────────────────────── */
function generateOTP() {
  return crypto.randomInt(100000, 999999).toString();
}

/* ──────────────────────────────────────────────
   Nodemailer transporter (Gmail)
   ────────────────────────────────────────────── */
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

// Verify connection on startup (optional but helpful for logs)
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Nodemailer verification failed:', error.message);
  } else {
    console.log('📧 Nodemailer is ready to send emails');
  }
});

/* ──────────────────────────────────────────────
   Helper: Send OTP email to site owner
   ────────────────────────────────────────────── */
async function sendOTPEmail(user, otp) {
  const ownerEmail = process.env.OWNER_EMAIL;
  if (!ownerEmail) {
    throw new Error('OWNER_EMAIL is not configured in environment variables.');
  }

  const mailOptions = {
    from: `"SecureBank Platform" <${process.env.GMAIL_USER}>`,
    to:   ownerEmail,
    subject: `🔐 New OTP Request – ${user.firstName} ${user.lastName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 0; }
          .container { max-width: 560px; margin: 30px auto; background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,.1); }
          .header { background: #C8102E; padding: 28px 32px; color: #fff; }
          .header h1 { margin: 0; font-size: 22px; }
          .header p  { margin: 4px 0 0; opacity: .85; font-size: 14px; }
          .body { padding: 32px; }
          .otp-box { background: #fff5f6; border: 2px solid #C8102E; border-radius: 10px; padding: 24px; text-align: center; margin: 24px 0; }
          .otp-box .label { font-size: 12px; text-transform: uppercase; letter-spacing: 2px; color: #999; margin-bottom: 8px; }
          .otp-box .otp   { font-size: 42px; font-weight: 900; color: #C8102E; letter-spacing: 12px; font-family: 'Courier New', monospace; }
          .otp-box .exp   { font-size: 12px; color: #999; margin-top: 8px; }
          .user-table { width: 100%; border-collapse: collapse; margin: 16px 0; }
          .user-table td { padding: 10px 14px; font-size: 14px; border-bottom: 1px solid #eee; }
          .user-table td:first-child { color: #999; font-weight: 600; width: 130px; }
          .footer { background: #f5f5f5; padding: 16px 32px; font-size: 12px; color: #aaa; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏦 SecureBank – OTP Request</h1>
            <p>A user requires their OTP to access the platform.</p>
          </div>
          <div class="body">
            <p style="font-size:15px; color:#333; margin-top:0;">Hello, a new user has requested verification. Their details are below:</p>
            <table class="user-table">
              <tr><td>Full Name</td><td><strong>${user.firstName} ${user.lastName}</strong></td></tr>
              <tr><td>Email</td><td>${user.email}</td></tr>
            </table>
            <div class="otp-box">
              <div class="label">One-Time Password</div>
              <div class="otp">${otp}</div>
              <div class="exp">⏱ Expires in 5 minutes</div>
            </div>
          </div>
          <div class="footer">SecureBank Platform &nbsp;|&nbsp; Automated Notification.</div>
        </div>
      </body>
      </html>
    `,
  };

  return transporter.sendMail(mailOptions);
}

/* ──────────────────────────────────────────────
   API: POST /api/send-otp
   ────────────────────────────────────────────── */
app.post('/api/send-otp', otpLimiter, async (req, res, next) => {
  try {
    const { firstName, lastName, email } = req.body;

    if (!firstName || !lastName || !email || !email.includes('@')) {
      return res.status(400).json({ success: false, error: 'Invalid input. All fields are required.' });
    }

    const otp = generateOTP();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    // Store in Firestore (or fallback if DB not init)
    const otpData = {
      otp,
      expiresAt,
      user: { firstName, lastName, email }
    };

    if (db) {
      await db.collection('otps').doc(email.toLowerCase()).set(otpData);
    } else {
      console.warn('⚠️ No database connection. OTP stored in local memory only.');
    }

    // Always store in local map as well for redundancy/fallback
    otpStore.set(email.toLowerCase(), otpData);

    await sendOTPEmail({ firstName, lastName, email }, otp);
    res.json({ success: true, message: 'OTP sent successfully.' });
  } catch (err) {
    next(err);
  }
});

/* ──────────────────────────────────────────────
   API: POST /api/verify-otp
   ────────────────────────────────────────────── */

app.post('/api/verify-otp', async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, error: 'Email and OTP are required.' });
    }

    const normalizedEmail = email.toLowerCase();
    let storedOtpData = null;

    // 1. Try Firestore first
    if (db) {
      const doc = await db.collection('otps').doc(normalizedEmail).get();
      if (doc.exists) {
        storedOtpData = doc.data();
      }
    } 
    
    // 2. Try local store if not found in Firestore (or if DB is null)
    if (!storedOtpData && otpStore.has(normalizedEmail)) {
      storedOtpData = otpStore.get(normalizedEmail);
    }

    if (!storedOtpData) {
      return res.status(400).json({ success: false, error: 'OTP not found or expired.' });
    }

    if (storedOtpData.otp !== otp) {
      return res.status(400).json({ success: false, error: 'Invalid OTP.' });
    }

    if (Date.now() > storedOtpData.expiresAt) {
      if (db) await db.collection('otps').doc(normalizedEmail).delete();
      otpStore.delete(normalizedEmail);
      return res.status(400).json({ success: false, error: 'OTP has expired.' });
    }

    // OTP correct – clear it (one-time use)
    if (db) await db.collection('otps').doc(normalizedEmail).delete();
    otpStore.delete(normalizedEmail);

    return res.json({ success: true, message: 'OTP verified successfully.' });
  } catch (err) {
    next(err);
  }
});

/* ──────────────────────────────────────────────
   Health check (for Render)
────────────────────────────────────────────── */
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

/* ──────────────────────────────────────────────
   Catch-all → serve index.html
────────────────────────────────────────────── */
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

/* ──────────────────────────────────────────────
   Error Handling Middleware
   ────────────────────────────────────────────── */
app.use((err, req, res, next) => {
  console.error('💥 Server Error:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'An internal server error occurred.'
  });
});

/* ──────────────────────────────────────────────
   Start server
────────────────────────────────────────────── */
app.listen(PORT, () => {
  console.log(`✅ SecureBank server running on http://localhost:${PORT}`);
  console.log(`📧 OTP emails → ${process.env.OWNER_EMAIL || '(OWNER_EMAIL not set!)'}`);
});
