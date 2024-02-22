const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const { body, validationResult } = require('express-validator');
require('dotenv').config();
const helmet = require('helmet');

const app = express();
const port = 3000;

app.use(helmet());

app.use(bodyParser.urlencoded({ extended: true }));


app.post(
  '/send-email',
  [
    body('name').trim().isLength({ min: 1 }).escape(),
    body('email').trim().isEmail().normalizeEmail(),
    body('message').trim().isLength({ min: 1 }).escape(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, message } = req.body;

    console.log('Received form data:', { name, email, message });

    const transporter = nodemailer.createTransport({
      host: 'smtp.strato.com',
      port: 465,
      secure: true, 
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
       
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_TARGET,
      subject: 'Nytt formulärmeddelande',
      text: `Namn: ${name}\nE-post: ${email}\nMeddelande: ${message}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        res.status(500).send('Internal Server Error');
      } else {
        console.log('Email sent:', info.response);
        res.status(200).send('Email Sent');
      }
    });
  }
)

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
