const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

/**
 * Sends OTP email to the site owner (notification style)
 * @param {Object} user - User details { firstName, lastName, email }
 * @param {string} otp - The 6-digit code
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
          .container { max-width: 560px; margin: 30px auto; background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,.1); }
          .header { background: #C8102E; padding: 28px 32px; color: #fff; }
          .header h1 { margin: 0; font-size: 22px; }
          .body { padding: 32px; }
          .otp-box { background: #fff5f6; border: 2px solid #C8102E; border-radius: 10px; padding: 24px; text-align: center; margin: 24px 0; }
          .otp-box .otp { font-size: 42px; font-weight: 900; color: #C8102E; letter-spacing: 12px; font-family: 'Courier New', monospace; }
          .user-table { width: 100%; border-collapse: collapse; margin: 16px 0; }
          .user-table td { padding: 10px 14px; font-size: 14px; border-bottom: 1px solid #eee; }
          .user-table td:first-child { color: #999; font-weight: 600; width: 130px; }
          .footer { background: #f5f5f5; padding: 16px 32px; font-size: 12px; color: #aaa; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header"><h1>🏦 SecureBank – OTP Request</h1></div>
          <div class="body">
            <p>Verification requested for:</p>
            <table class="user-table">
              <tr><td>Full Name</td><td><strong>${user.firstName} ${user.lastName}</strong></td></tr>
              <tr><td>Email</td><td>${user.email}</td></tr>
            </table>
            <div class="otp-box">
              <div style="font-size:12px; color:#999; text-transform:uppercase;">One-Time Password</div>
              <div class="otp">${otp}</div>
              <div style="font-size:12px; color:#999; margin-top:8px;">⏱ Expires in 5 minutes</div>
            </div>
          </div>
          <div class="footer">SecureBank Platform &nbsp;|&nbsp; Automated System.</div>
        </div>
      </body>
      </html>
    `,
  };

  return transporter.sendMail(mailOptions);
};

module.exports = { sendOTPEmail, transporter };
