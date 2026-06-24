import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, required: true, maxlength: 10000 },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    client: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    budgetType: { type: String, enum: ["fixed", "hourly"], required: true },
    budgetMin: { type: Number, required: true, min: 0 },
    budgetMax: { type: Number, min: 0 },
    skills: [{ type: String, trim: true }],
    experienceLevel: {
      type: String,
      enum: ["entry", "intermediate", "expert"],
      default: "intermediate",
    },
    duration: {
      type: String,
      enum: ["less_than_week", "1-4_weeks", "1-3_months", "3-6_months", "more_than_6_months"],
    },
    location: { type: String, trim: true },
    status: {
      type: String,
      enum: ["open", "in_progress", "completed", "cancelled", "on_hold"],
      default: "open",
    },
    applicationsCount: { type: Number, default: 0 },
    hiredWorker: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    deadline: { type: Date },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

jobSchema.index({ status: 1, createdAt: -1 });
jobSchema.index({ client: 1, status: 1 });
jobSchema.index({ skills: 1 });
jobSchema.index({ category: 1 });
jobSchema.index(
  { title: "text", description: "text" },
  { weights: { title: 10, description: 5 } }
);

export const Job = mongoose.model("Job", jobSchema);
