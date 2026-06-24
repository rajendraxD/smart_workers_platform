import rateLimit from 'express-rate-limit';

const message = { success: false, message: 'Too many requests, please try again later.' };

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message,
});

// Stricter limit for auth-sensitive endpoints (login, forgot/reset password).
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message,
});
