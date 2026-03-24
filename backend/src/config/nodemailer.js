import nodemailer from 'nodemailer';
import { NODEMAILER_HOST, NODEMAILER_PORT, NODEMAILER_USER, NODEMAILER_PASS } from './env.js';

const transporter = nodemailer.createTransport({
  host: NODEMAILER_HOST,
  port: Number(NODEMAILER_PORT),
  secure: false,
  auth: {
    user: NODEMAILER_USER,
    pass: NODEMAILER_PASS
  }
});

export default transporter;