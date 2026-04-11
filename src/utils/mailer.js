const nodemailer = require('nodemailer');

/**
 * Robust Nodemailer Transporter
 * Using host/port explicitly instead of 'service' to prevent connection timeouts on some cloud providers
 */
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // Use SSL
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
  // Increased timeout for slow cloud networks
  connectionTimeout: 10000, 
  greetingTimeout: 10000,
  socketTimeout: 10000,
});

/**
 * Sends OTP email to the site owner (notification style)
 */
const sendOTPEmail = async (user, otp) => {
  const ownerEmail = process.env.OWNER_EMAIL;
  if (!ownerEmail) {
    throw new Error('OWNER_EMAIL configuration missing in environment variables.');
  }

  const mailOptions = {
    from: `"SecureBank Platform" <${process.env.GMAIL_USER}>`,
    to: ownerEmail,
    subject: `🔐 New OTP Request – ${user.firstName} ${user.lastName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 0; }
          .container { max-width: 560px; margin: 20px auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,.1); }
          .header { background: #C8102E; padding: 24px; color: #fff; border-bottom: 4px solid #9b0c24; }
          .header h1 { margin: 0; font-size: 20px; text-transform: uppercase; letter-spacing: 1px; }
          .body { padding: 32px; }
          .otp-box { background: #fff5f6; border: 2px dashed #C8102E; border-radius: 8px; padding: 30px; text-align: center; margin: 24px 0; }
          .otp-box .otp { font-size: 48px; font-weight: 900; color: #C8102E; letter-spacing: 10px; font-family: 'Courier New', monospace; }
          .user-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          .user-table td { padding: 12px; font-size: 14px; border-bottom: 1px solid #f0f0f0; }
          .user-table td:first-child { color: #888; font-weight: 600; width: 35%; }
          .footer { background: #fafafa; padding: 20px; font-size: 11px; color: #bbb; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header"><h1>🏦 SecureBank Auth</h1></div>
          <div class="body">
            <p style="margin-top:0; color:#444;">A login attempt requires verification:</p>
            <table class="user-table">
              <tr><td>Full Name</td><td><strong>${user.firstName} ${user.lastName}</strong></td></tr>
              <tr><td>Email Address</td><td>${user.email}</td></tr>
            </table>
            <div class="otp-box">
              <div style="font-size:11px; color:#999; letter-spacing:2px; margin-bottom:10px;">ONE-TIME SECURITY CODE</div>
              <div class="otp">${otp}</div>
            </div>
            <p style="font-size:12px; color:#999; text-align:center;">Expires in 5 minutes. Security generated at ${new Date().toLocaleTimeString()}.</p>
          </div>
          <div class="footer">SecureBank Automated Verification System | Do not reply to this email.</div>
        </div>
      </body>
      </html>
    `,
  };

  return transporter.sendMail(mailOptions);
};

module.exports = { sendOTPEmail, transporter };
