import transporter from '../config/nodemailer.js';
import AppError from '../utils/AppError.js';

export const sendEmail = async ({ to, subject, html }) => {
  if (!transporter) {
    console.warn('Nodemailer is not configured. Mocking email send:', { to, subject });
    return;
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"EduCore ERP" <no-reply@educore.test>',
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error('Email sending error:', error);
    throw new AppError('Failed to send email', 500);
  }
};
