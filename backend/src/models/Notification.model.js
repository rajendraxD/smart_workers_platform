import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: {
      type: String,
      enum: [
        "job_posted",
        "application_received",
        "application_status",
        "message",
        "review_received",
        "job_completed",
        "payment",
        "system",
      ],
      required: true,
    },
    title: { type: String, required: true, maxlength: 200 },
    message: { type: String, maxlength: 1000 },
    relatedId: { type: mongoose.Schema.Types.ObjectId },
    relatedModel: { type: String },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });

export const Notification = mongoose.model("Notification", notificationSchema);
