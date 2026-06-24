import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    reviewee: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, maxlength: 2000 },
    type: { type: String, enum: ["client_to_worker", "worker_to_client"], required: true },
  },
  { timestamps: true }
);

reviewSchema.index({ job: 1, reviewer: 1 }, { unique: true });
reviewSchema.index({ reviewee: 1, rating: -1 });

export const Review = mongoose.model("Review", reviewSchema);
