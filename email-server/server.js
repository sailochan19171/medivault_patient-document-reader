
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
const port = 3000;

// Middleware
app.use(cors({ origin: '*' })); // Allow all origins for testing
app.use(express.json());

// Configure Nodemailer with Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'srisailochan@gmail.com',
    pass: 'wbxs uxdc esuu fbjz', // Replace with your Gmail App Password
  },
});

// Endpoint to handle email sending
app.post('/send-email', async (req, res) => {
  const { name, email, message } = req.body;

  // Validate request body
  if (!name || !email || !message) {
    console.error('Missing required fields:', { name, email, message });
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Email with form data to user's email
  const formEmail = {
    from: '"H&M Healthcare" <srisailochan@gmail.com>',
    to: email,
    subject: `Contact Form Submission from ${name}`,
    text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
    html: `<p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p><strong>Message:</strong> ${message}</p>`,
  };

  // Confirmation email to user
  const confirmEmail = {
    from: '"H&M Healthcare" <srisailochan@gmail.com>',
    to: email,
    subject: 'Thank You for Contacting H&M Healthcare',
    text: `Dear ${name},\n\nThank you for reaching out to us! Our team will contact you within 24 hours.\n\nBest regards,\nH&M Healthcare Team`,
    html: `<p>Dear ${name},</p><p>Thank you for reaching out to us! Our team will contact you within 24 hours.</p><p>Best regards,<br>H&M Healthcare Team</p>`,
  };

  try {
    // Send both emails
    await transporter.sendMail(formEmail);
    await transporter.sendMail(confirmEmail);
    console.log('Emails sent successfully to:', email);
    res.status(200).json({ message: 'Emails sent successfully' });
  } catch (error) {
    console.error('Error sending emails:', error);
    res.status(500).json({ error: 'Failed to send emails', details: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
