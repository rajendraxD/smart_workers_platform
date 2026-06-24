import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { sendSuccess } from "../utils/ApiResponse.js";
import { User } from "../models/User.model.js";
import { AuditLog } from "../models/AuditLog.model.js";
import { AUDIT_ACTIONS } from "../utils/constants.js";

// GET /api/users/profile — get own profile
export const getMyProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  sendSuccess(res, { data: { user } });
});

// PUT /api/users/profile — update own profile
export const updateMyProfile = asyncHandler(async (req, res) => {
  const allowedFields = [
    "firstName", "lastName", "phone", "bio", "skills",
    "hourlyRate", "availability", "company",
  ];

  const updates = {};
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  }

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  });

  if (!user) throw ApiError.notFound("User not found");

  await AuditLog.create({
    user: user._id,
    action: AUDIT_ACTIONS.PROFILE_UPDATE,
    ip: req.context?.ip,
    userAgent: req.context?.userAgent,
  });

  sendSuccess(res, { message: "Profile updated", data: { user } });
});

// PUT /api/users/password — change password
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select("+password");
  if (!user || !(await user.comparePassword(currentPassword))) {
    throw ApiError.badRequest("Current password is incorrect");
  }

  user.password = newPassword;
  await user.save();

  await AuditLog.create({
    user: user._id,
    action: AUDIT_ACTIONS.PASSWORD_CHANGE,
    ip: req.context?.ip,
  });

  sendSuccess(res, { message: "Password changed successfully" });
});

// GET /api/users/:id — get public profile
export const getPublicProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select(
    "firstName lastName avatar bio skills hourlyRate averageRating totalReviews completedJobs company role"
  );

  if (!user || user.status !== "Active") {
    throw ApiError.notFound("User not found");
  }

  sendSuccess(res, { data: { user } });
});

// GET /api/users — list workers (public)
export const listWorkers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, skills, search } = req.query;

  const query = { role: "worker", status: "Active" };

  if (skills) {
    query.skills = { $in: skills.split(",").map((s) => new RegExp(s.trim(), "i")) };
  }

  if (search) {
    query.$or = [
      { firstName: new RegExp(search, "i") },
      { lastName: new RegExp(search, "i") },
      { bio: new RegExp(search, "i") },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [users, total] = await Promise.all([
    User.find(query)
      .select("firstName lastName avatar skills hourlyRate averageRating totalReviews bio")
      .skip(skip)
      .limit(Number(limit))
      .sort({ averageRating: -1 }),
    User.countDocuments(query),
  ]);

  sendSuccess(res, {
    data: { users },
    meta: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) },
  });
});
