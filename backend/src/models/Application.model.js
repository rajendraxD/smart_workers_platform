import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true, index: true },
    worker: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    coverLetter: { type: String, maxlength: 5000 },
    proposedRate: { type: Number, min: 0 },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "withdrawn", "shortlisted"],
      default: "pending",
    },
    clientNotes: { type: String, maxlength: 2000 },
  },
  { timestamps: true }
);

applicationSchema.index({ job: 1, worker: 1 }, { unique: true });
applicationSchema.index({ worker: 1, status: 1 });
applicationSchema.index({ job: 1, status: 1 });

export const Application = mongoose.model("Application", applicationSchema);
