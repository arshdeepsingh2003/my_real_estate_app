import Listing from '../models/listing.models.js';
import User from '../models/user.model.js';
import nodemailer from 'nodemailer';
import { errorHandler } from '../utils/error.js';

export const sendEnquiry = async (req, res, next) => {
  const { listingId } = req.params;
  const { name, email, phone, message } = req.body;

  // 1. Validation
  if (!name || !email || !message) {
    return next(errorHandler(400, 'Name, email, and message are required.'));
  }

  // Strict email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return next(errorHandler(400, 'Invalid email address.'));
  }

  // Prevent email header injections by sanitizing input fields used in headers or reply-to
  // E.g., strip CRLF characters (\r and \n) from name, email, and phone
  const cleanName = name.replace(/[\r\n]/g, '').trim();
  const cleanEmail = email.replace(/[\r\n]/g, '').trim();
  const cleanPhone = phone ? phone.replace(/[\r\n]/g, '').trim() : '';

  try {
    // 2. Find Listing
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return next(errorHandler(404, 'Listing not found.'));
    }

    // 3. Find Owner
    const owner = await User.findById(listing.userRef);
    if (!owner) {
      return next(errorHandler(404, 'Listing owner not found.'));
    }

    const recipientEmail = owner.email;
    if (!recipientEmail) {
      return next(errorHandler(400, 'Listing owner has no registered email.'));
    }

    // 4. Send Email using Nodemailer
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT;
    const smtpSecure = process.env.SMTP_SECURE === 'true';
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpFrom = process.env.SMTP_FROM;

    if (!smtpHost || !smtpPort || !smtpUser || !smtpPass || !smtpFrom) {
      console.error('Email configuration error: Missing required SMTP environment variables.');
      return next(errorHandler(500, 'Email service is not fully configured on the server.'));
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: Number(smtpPort),
      secure: smtpSecure,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    // Subject lines should also be clean of any injections
    const subject = `New Property Enquiry - ${listing.name}`.replace(/[\r\n]/g, '');

    const emailBody = `
      <h3>You have received a new enquiry about your property.</h3>
      <p><strong>Property Name:</strong> ${listing.name}</p>
      <p><strong>Property ID:</strong> ${listing._id}</p>
      <p><strong>Enquirer's Name:</strong> ${cleanName}</p>
      <p><strong>Enquirer's Email:</strong> ${cleanEmail}</p>
      <p><strong>Phone:</strong> ${cleanPhone || 'Not provided'}</p>
      <p><strong>Message:</strong></p>
      <blockquote style="background: #f9f9f9; border-left: 10px solid #ccc; margin: 1.5em 10px; padding: 0.5em 10px;">
        ${message.replace(/\n/g, '<br>')}
      </blockquote>
      <hr />
      <p>You can contact the interested person directly at: <a href="mailto:${cleanEmail}">${cleanEmail}</a></p>
    `;

    try {
      await transporter.sendMail({
        from: smtpFrom,
        to: recipientEmail,
        replyTo: cleanEmail,
        subject: subject,
        html: emailBody,
      });
    } catch (emailError) {
      console.error('Nodemailer sending failed:', emailError.message);
      return next(errorHandler(500, `Failed to send enquiry email: ${emailError.message}`));
    }

    return res.status(200).json({
      success: true,
      message: 'Enquiry sent successfully!',
    });
  } catch (error) {
    next(error);
  }
};
