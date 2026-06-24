import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    otpHash: { type: String, required: true },
    type: {
      type: String,
      enum: ["email_verification", "password_reset", "phone_verification"],
      required: true,
    },
    expiresAt: { type: Date, required: true },
    verified: { type: Boolean, default: false },
    attempts: { type: Number, default: 0 },
  },
  { timestamps: true }
);

otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
otpSchema.index({ user: 1, type: 1 });

otpSchema.methods.isExpired = function () {
  return this.expiresAt < new Date();
};

otpSchema.methods.isValid = function () {
  return !this.verified && !this.isExpired() && this.attempts < 5;
};

export const Otp = mongoose.model("Otp", otpSchema);
