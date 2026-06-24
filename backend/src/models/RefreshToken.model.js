import mongoose from "mongoose";

const refreshTokenSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    tokenHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    revoked: { type: Boolean, default: false },
    replacedBy: { type: String, default: null },
  },
  { timestamps: true }
);

refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
refreshTokenSchema.index({ tokenHash: 1 });

refreshTokenSchema.methods.isExpired = function () {
  return this.expiresAt < new Date();
};

refreshTokenSchema.methods.isValid = function () {
  return !this.revoked && !this.isExpired();
};

export const RefreshToken = mongoose.model("RefreshToken", refreshTokenSchema);
