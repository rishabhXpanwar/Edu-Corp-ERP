import twilio from 'twilio';
import { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER } from '../config/env.js';
import AppError from '../utils/AppError.js';

let client;
if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN) {
  try {
    client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
    console.log('[Twilio] SMS client initialized.');
  } catch (err) {
    console.warn('[Twilio] Failed to initialize SMS client — running in mock mode:', err.message);
  }
}

export const sendSMS = async (to, message) => {
  if (!client) {
    console.warn('Twilio is not configured. Mocking SMS send:', { to, message });
    return;
  }

  try {
    await client.messages.create({
      body: message,
      from: TWILIO_PHONE_NUMBER,
      to,
    });
  } catch (error) {
    console.error('Twilio SMS error:', error);
    throw new AppError('Failed to send SMS', 500);
  }
};
