const { sendCustomEmail } = require('../utils/mailer');

/**
 * Controller: Send Mail to Client
 */
exports.sendClientEmail = async (req, res, next) => {
  try {
    const { recipientEmail, subject, message } = req.body;

    // Validation
    if (!recipientEmail || !recipientEmail.includes('@')) {
      return res.status(400).json({ success: false, error: 'Valid Recipient Email is required.' });
    }
    if (!subject || subject.trim() === '') {
      return res.status(400).json({ success: false, error: 'Subject is required.' });
    }
    if (!message || message.trim() === '') {
      return res.status(400).json({ success: false, error: 'Message body is required.' });
    }

    // Since we're not using a full HTML sanitizer here explicitly, we can minimally escape script tags
    // For a production app, DOMPurify or sanitize-html is recommended on the backend to prevent XSS in emails.
    const safeMessage = message.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br/>');

    // Send the email
    await sendCustomEmail(recipientEmail, subject, safeMessage);

    res.status(200).json({ 
      success: true, 
      message: 'Email sent successfully to the client.' 
    });
  } catch (error) {
    console.error('❌ [EMAIL] Send Email Error:', error.message);
    next(error);
  }
};
