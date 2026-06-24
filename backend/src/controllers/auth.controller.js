import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { sendSuccess } from "../utils/ApiResponse.js";
import { User } from "../models/User.model.js";
import { RefreshToken } from "../models/RefreshToken.model.js";
import { Otp } from "../models/Otp.model.js";
import { AuditLog } from "../models/AuditLog.model.js";
import {
  signAccessToken,
  generateRefreshToken,
  hashToken,
  generateOtp,
  hashOtp,
  verifyAccessToken,
} from "../utils/token.js";
import { AUDIT_ACTIONS } from "../utils/constants.js";

// Helper to set cookies and return tokens
function generateTokens(res, user) {
  const accessToken = signAccessToken({ id: user._id, role: user.role });
  const { raw, hash, expiresAt } = generateRefreshToken();

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 15 * 60 * 1000, // 15 min
  });

  res.cookie("refreshToken", raw, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/api/auth",
    maxAge: expiresAt.getTime() - Date.now(),
  });

  return { accessToken, refreshTokenHash: hash, refreshExpiresAt: expiresAt };
}

// POST /api/auth/register
export const register = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password, role } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    throw ApiError.conflict("Email already registered");
  }

  const user = await User.create({ firstName, lastName, email, password, role });

  const { accessToken, refreshTokenHash, refreshExpiresAt } = generateTokens(res, user);

  await RefreshToken.create({
    user: user._id,
    tokenHash: refreshTokenHash,
    expiresAt: refreshExpiresAt,
  });

  await AuditLog.create({
    user: user._id,
    action: AUDIT_ACTIONS.USER_REGISTER,
    ip: req.context?.ip,
    userAgent: req.context?.userAgent,
    browser: req.context?.browser,
    os: req.context?.os,
  });

  sendSuccess(res, {
    statusCode: 201,
    message: "Registration successful",
    data: { user, accessToken },
  });
});

// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  if (user.status !== "Active") {
    throw ApiError.forbidden("Account is suspended or inactive");
  }

  const { accessToken, refreshTokenHash, refreshExpiresAt } = generateTokens(res, user);

  await RefreshToken.create({
    user: user._id,
    tokenHash: refreshTokenHash,
    expiresAt: refreshExpiresAt,
  });

  await AuditLog.create({
    user: user._id,
    action: AUDIT_ACTIONS.LOGIN,
    ip: req.context?.ip,
    userAgent: req.context?.userAgent,
    browser: req.context?.browser,
    os: req.context?.os,
  });

  sendSuccess(res, {
    message: "Login successful",
    data: { user: user.toJSON(), accessToken },
  });
});

// POST /api/auth/logout
export const logout = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;

  if (refreshToken) {
    const hash = hashToken(refreshToken);
    await RefreshToken.findOneAndUpdate(
      { tokenHash: hash, revoked: false },
      { revoked: true }
    );
  }

  res.clearCookie("accessToken");
  res.clearCookie("refreshToken", { path: "/api/auth" });

  await AuditLog.create({
    user: req.user?._id,
    action: AUDIT_ACTIONS.LOGOUT,
    ip: req.context?.ip,
    userAgent: req.context?.userAgent,
  });

  sendSuccess(res, { message: "Logged out successfully" });
});

// POST /api/auth/refresh
export const refresh = asyncHandler(async (req, res) => {
  const rawToken = req.cookies?.refreshToken;
  if (!rawToken) {
    throw ApiError.unauthorized("Refresh token required");
  }

  const hash = hashToken(rawToken);
  const storedToken = await RefreshToken.findOne({ tokenHash: hash, revoked: false });

  if (!storedToken || !storedToken.isValid()) {
    throw ApiError.unauthorized("Invalid or expired refresh token");
  }

  // Rotate: revoke old, issue new
  await RefreshToken.findByIdAndUpdate(storedToken._id, { revoked: true });

  const user = await User.findById(storedToken.user);
  if (!user || user.status !== "Active") {
    throw ApiError.forbidden("Account not available");
  }

  const { accessToken, refreshTokenHash, refreshExpiresAt } = generateTokens(res, user);

  await RefreshToken.create({
    user: user._id,
    tokenHash: refreshTokenHash,
    expiresAt: refreshExpiresAt,
  });

  sendSuccess(res, {
    message: "Token refreshed",
    data: { user: user.toJSON(), accessToken },
  });
});

// POST /api/auth/forgot-password
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  // Always return success to prevent email enumeration
  if (!user) {
    return sendSuccess(res, {
      message: "If the email exists, a reset code has been sent",
    });
  }

  const { code, hash, expiresAt } = generateOtp();

  await Otp.create({
    user: user._id,
    otpHash: hash,
    type: "password_reset",
    expiresAt,
  });

  // TODO: Send email with code via SMTP
  console.log(`[DEV] Password reset OTP for ${email}: ${code}`);

  sendSuccess(res, {
    message: "If the email exists, a reset code has been sent",
  });
});

// POST /api/auth/reset-password
export const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    throw ApiError.badRequest("Invalid reset request");
  }

  const otpRecord = await Otp.findOne({
    user: user._id,
    type: "password_reset",
    verified: false,
  }).sort({ createdAt: -1 });

  if (!otpRecord || !otpRecord.isValid()) {
    throw ApiError.badRequest("OTP expired or invalid");
  }

  if (otpRecord.otpHash !== hashOtp(otp)) {
    otpRecord.attempts += 1;
    await otpRecord.save();
    throw ApiError.badRequest("Invalid OTP");
  }

  user.password = password;
  await user.save();

  otpRecord.verified = true;
  await otpRecord.save();

  // Revoke all refresh tokens
  await RefreshToken.updateMany({ user: user._id, revoked: false }, { revoked: true });

  await AuditLog.create({
    user: user._id,
    action: AUDIT_ACTIONS.PASSWORD_RESET,
    ip: req.context?.ip,
    userAgent: req.context?.userAgent,
  });

  sendSuccess(res, { message: "Password reset successful" });
});

// POST /api/auth/verify-email
export const verifyEmail = asyncHandler(async (req, res) => {
  const { otp } = req.body;
  const user = req.user;

  const otpRecord = await Otp.findOne({
    user: user._id,
    type: "email_verification",
    verified: false,
  }).sort({ createdAt: -1 });

  if (!otpRecord || !otpRecord.isValid()) {
    throw ApiError.badRequest("OTP expired or invalid");
  }

  if (otpRecord.otpHash !== hashOtp(otp)) {
    otpRecord.attempts += 1;
    await otpRecord.save();
    throw ApiError.badRequest("Invalid OTP");
  }

  user.emailVerified = true;
  await user.save();

  otpRecord.verified = true;
  await otpRecord.save();

  sendSuccess(res, { message: "Email verified successfully" });
});

// POST /api/auth/send-verification-email
export const sendVerificationEmail = asyncHandler(async (req, res) => {
  const user = req.user;

  if (user.emailVerified) {
    return sendSuccess(res, { message: "Email already verified" });
  }

  const { code, hash, expiresAt } = generateOtp();

  await Otp.create({
    user: user._id,
    otpHash: hash,
    type: "email_verification",
    expiresAt,
  });

  // TODO: Send email with code via SMTP
  console.log(`[DEV] Email verification OTP for ${user.email}: ${code}`);

  sendSuccess(res, { message: "Verification code sent" });
});

// GET /api/auth/me
export const getMe = asyncHandler(async (req, res) => {
  sendSuccess(res, { data: { user: req.user } });
});
