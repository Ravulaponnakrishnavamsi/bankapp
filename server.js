require('dotenv').config();
const express = require('express');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const cors = require('cors');
const morgan = require('morgan');

// Import modular routes
const authRoutes = require('./src/routes/authRoutes');
const emailRoutes = require('./src/routes/emailRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

/* ──────────────────────────────────────────────
   Middleware & Security (Optimized)
   ────────────────────────────────────────────── */
app.use(helmet({
  contentSecurityPolicy: false, 
}));
app.use(compression());
app.use(cors());
app.use(morgan('dev')); 
app.use(express.json());

// Main API Routes
app.use('/api', authRoutes);
app.use('/api', emailRoutes);

// Static frontend assets
app.use(express.static(path.join(__dirname)));

/* ──────────────────────────────────────────────
   Utility Routes
   ────────────────────────────────────────────── */

// Health check (for Render deployment)
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(), 
    uptime: process.uptime() 
  });
});

// Catch-all: serve index.html for any frontend route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

/* ──────────────────────────────────────────────
   Global Error Handler
   ────────────────────────────────────────────── */
app.use((err, req, res, next) => {
  console.error('💥 [SERVER ERROR]', err);
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

/* ──────────────────────────────────────────────
   Start Server
   ────────────────────────────────────────────── */
app.listen(PORT, () => {
  console.log('──────────────────────────────────────────────────');
  console.log(`🚀 SecureBank server running on port: ${PORT}`);
  console.log(`🌍 URL: http://localhost:${PORT}`);
  console.log(`📧 Mode: ${process.env.NODE_ENV || 'development'}`);
  console.log('──────────────────────────────────────────────────');
});
