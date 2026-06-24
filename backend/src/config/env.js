import dotenv from 'dotenv';

dotenv.config();

const required = ['MONGO_URI', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'];
const missing = required.filter((k) => !process.env[k]);
if (missing.length) {
  // eslint-disable-next-line no-console
  console.warn(`[env] Missing required env vars: ${missing.join(', ')}`);
}

export const env = {
  port: Number(process.env.PORT) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  mongoUri: process.env.MONGO_URI,
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpires: process.env.JWT_ACCESS_EXPIRES || '15m',
    refreshExpiresDays: Number(process.env.JWT_REFRESH_EXPIRES_DAYS) || 7,
  },
  otpExpiresMinutes: Number(process.env.OTP_EXPIRES_MINUTES) || 10,
  seed: {
    email: process.env.SEED_SUPERADMIN_EMAIL || 'superadmin@example.com',
    password: process.env.SEED_SUPERADMIN_PASSWORD || 'SuperAdmin@123',
    firstName: process.env.SEED_SUPERADMIN_FIRSTNAME || 'Super',
    lastName: process.env.SEED_SUPERADMIN_LASTNAME || 'Admin',
  },
  smtp: {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.SMTP_FROM || 'User Management <no-reply@example.com>',
  },
  // cloudinary: {
  //   cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  //   apiKey: process.env.CLOUDINARY_API_KEY,
  //   apiSecret: process.env.CLOUDINARY_API_SECRET,
  // },
  cloudinary: {
    url: process.env.CLOUDINARY_URL,
  },
  get isProd() {
    return this.nodeEnv === 'production';
  },
};
