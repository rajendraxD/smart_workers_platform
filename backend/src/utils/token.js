import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export function signAccessToken(payload) {
  return jwt.sign(payload, env.jwt.accessSecret, { expiresIn: env.jwt.accessExpires });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, env.jwt.accessSecret);
}

// Refresh tokens are opaque random strings stored hashed in DB.
export function generateRefreshToken() {
  const raw = crypto.randomBytes(48).toString('hex');
  const hash = hashToken(raw);
  const expiresAt = new Date(Date.now() + env.jwt.refreshExpiresDays * 24 * 60 * 60 * 1000);
  return { raw, hash, expiresAt };
}

export function hashToken(raw) {
  return crypto.createHash('sha256').update(raw).digest('hex');
}

export function generateOtp() {
  const code = String(crypto.randomInt(0, 1_000_000)).padStart(6, '0');
  const hash = crypto.createHash('sha256').update(code).digest('hex');
  const expiresAt = new Date(Date.now() + env.otpExpiresMinutes * 60 * 1000);
  return { code, hash, expiresAt };
}

export function hashOtp(code) {
  return crypto.createHash('sha256').update(String(code)).digest('hex');
}
