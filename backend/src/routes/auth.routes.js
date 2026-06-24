import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { authLimiter } from "../middleware/rateLimiter.js";
import { validate } from "../middleware/validate.js";
import Joi from "joi";
import {
  register,
  login,
  logout,
  refresh,
  forgotPassword,
  resetPassword,
  verifyEmail,
  sendVerificationEmail,
  getMe,
} from "../controllers/auth.controller.js";

const router = Router();

const registerSchema = Joi.object({
  firstName: Joi.string().trim().min(1).max(50).required(),
  lastName: Joi.string().trim().min(1).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(128).required(),
  role: Joi.string().valid("worker", "client").default("worker"),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
});

const resetPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.string().length(6).required(),
  password: Joi.string().min(8).max(128).required(),
});

// Rate-limited auth routes
router.post("/register", authLimiter, validate(registerSchema), register);
router.post("/login", authLimiter, validate(loginSchema), login);
router.post("/forgot-password", authLimiter, validate(forgotPasswordSchema), forgotPassword);
router.post("/reset-password", authLimiter, validate(resetPasswordSchema), resetPassword);

// Protected routes
router.post("/logout", authenticate, logout);
router.post("/refresh", refresh);
router.get("/me", authenticate, getMe);
router.post("/verify-email", authenticate, verifyEmail);
router.post("/send-verification-email", authenticate, sendVerificationEmail);

export default router;
