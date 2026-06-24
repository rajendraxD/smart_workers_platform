import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    action: {
      type: String,
      enum: [
        "LOGIN",
        "LOGOUT",
        "LOGOUT_ALL",
        "PASSWORD_CHANGE",
        "PASSWORD_RESET",
        "USER_REGISTER",
        "USER_CREATE",
        "USER_UPDATE",
        "USER_STATUS_CHANGE",
        "USER_DELETE",
        "USER_RESTORE",
        "USER_PERMANENT_DELETE",
        "ROLE_CREATE",
        "ROLE_UPDATE",
        "ROLE_DELETE",
        "PROFILE_UPDATE",
        "AVATAR_UPDATE",
      ],
      required: true,
    },
    details: { type: mongoose.Schema.Types.Mixed },
    ip: { type: String },
    userAgent: { type: String },
    browser: { type: String },
    os: { type: String },
  },
  { timestamps: true }
);

auditLogSchema.index({ user: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });

export const AuditLog = mongoose.model("AuditLog", auditLogSchema);
