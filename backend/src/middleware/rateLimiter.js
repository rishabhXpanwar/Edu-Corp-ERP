import rateLimit from 'express-rate-limit';

const errorMessage = { success: false, message: 'Too many requests — try again later' };

export const STRICT   = rateLimit({ windowMs: 60_000, max: 5,   message: errorMessage });
export const MODERATE = rateLimit({ windowMs: 60_000, max: 30,  message: errorMessage });
export const LIGHT    = rateLimit({ windowMs: 60_000, max: 100, message: errorMessage });