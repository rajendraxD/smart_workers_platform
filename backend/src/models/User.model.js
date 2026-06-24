import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true, maxlength: 50 },
    lastName: { type: String, required: true, trim: true, maxlength: 50 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    password: { type: String, required: true, minlength: 8, select: false },
    role: {
      type: String,
      enum: ["worker", "client", "admin"],
      default: "worker",
    },
    status: {
      type: String,
      enum: ["Active", "Inactive", "Suspended", "Deleted"],
      default: "Active",
    },
    avatar: { type: String, default: "" },
    phone: { type: String, trim: true, default: "" },
    emailVerified: { type: Boolean, default: false },

    // Worker-specific fields
    skills: [{ type: String, trim: true }],
    hourlyRate: { type: Number, min: 0 },
    availability: {
      type: String,
      enum: ["available", "busy", "unavailable"],
      default: "available",
    },
    portfolio: [{ title: String, description: String, url: String }],
    bio: { type: String, maxlength: 1000 },

    // Client-specific fields
    company: { type: String, trim: true, maxlength: 100 },

    // Ratings
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },
    completedJobs: { type: Number, default: 0 },
  },
  { timestamps: true }
);

userSchema.index({ role: 1, status: 1 });
userSchema.index({ skills: 1 });

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

userSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

export const User = mongoose.model("User", userSchema);
