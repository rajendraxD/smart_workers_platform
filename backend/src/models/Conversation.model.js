import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }],
    job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", default: null },
    lastMessage: {
      content: String,
      sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      sentAt: Date,
    },
  },
  { timestamps: true }
);

conversationSchema.index({ participants: 1 });
conversationSchema.index({ "lastMessage.sentAt": -1 });

export const Conversation = mongoose.model("Conversation", conversationSchema);
