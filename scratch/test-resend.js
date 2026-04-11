require('dotenv').config();
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

async function testEmail() {
  try {
    console.log('Sending test email via Resend...');
    const result = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: '22jr1a44b6@gmail.com', // User's requested test email
      subject: 'Hello World',
      html: '<p>Congrats on sending your <strong>first email</strong>!</p>'
    });
    
    console.log('Resend API Response:');
    console.dir(result, { depth: null });
  } catch (err) {
    console.error('Error sending email:');
    console.error(err);
  }
}

testEmail();
