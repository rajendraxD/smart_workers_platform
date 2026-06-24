import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { sendSuccess } from "../utils/ApiResponse.js";
import { Job } from "../models/Job.model.js";
import { Notification } from "../models/Notification.model.js";

// GET /api/jobs — list jobs with search & filters
export const listJobs = asyncHandler(async (req, res) => {
  const {
    page = 1, limit = 20, status = "open",
    category, skills, experienceLevel, budgetType,
    search, minBudget, maxBudget,
  } = req.query;

  const query = {};

  // Clients see their own jobs; others see only open/public jobs
  if (req.user?.role === "client" && req.query.mine === "true") {
    query.client = req.user._id;
  } else {
    query.status = status;
  }

  if (category) query.category = category;
  if (experienceLevel) query.experienceLevel = experienceLevel;
  if (budgetType) query.budgetType = budgetType;
  if (minBudget || maxBudget) {
    query.budgetMin = {};
    if (minBudget) query.budgetMin.$gte = Number(minBudget);
    if (maxBudget) query.budgetMax = { $lte: Number(maxBudget) };
  }
  if (skills) {
    query.skills = { $in: skills.split(",").map((s) => new RegExp(s.trim(), "i")) };
  }
  if (search) {
    query.$text = { $search: search };
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [jobs, total] = await Promise.all([
    Job.find(query)
      .populate("client", "firstName lastName avatar company")
      .populate("category", "name slug")
      .skip(skip)
      .limit(Number(limit))
      .sort({ isFeatured: -1, createdAt: -1 }),
    Job.countDocuments(query),
  ]);

  sendSuccess(res, {
    data: { jobs },
    meta: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) },
  });
});

// GET /api/jobs/:id — get job details
export const getJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id)
    .populate("client", "firstName lastName avatar company averageRating totalReviews")
    .populate("category", "name slug")
    .populate("hiredWorker", "firstName lastName avatar");

  if (!job) throw ApiError.notFound("Job not found");

  sendSuccess(res, { data: { job } });
});

// POST /api/jobs — create a job (client only)
export const createJob = asyncHandler(async (req, res) => {
  if (req.user.role !== "client") {
    throw ApiError.forbidden("Only clients can post jobs");
  }

  const jobData = { ...req.body, client: req.user._id };
  const job = await Job.create(jobData);

  // Notify relevant workers (async, non-blocking)
  // TODO: emit socket event for real-time notifications
  sendSuccess(res, { statusCode: 201, message: "Job posted successfully", data: { job } });
});

// PUT /api/jobs/:id — update job
export const updateJob = asyncHandler(async (req, res) => {
  const job = await Job.findOne({ _id: req.params.id, client: req.user._id });

  if (!job) throw ApiError.notFound("Job not found or not authorized");

  if (!["open", "on_hold"].includes(job.status)) {
    throw ApiError.badRequest("Cannot edit job in current status");
  }

  const allowedFields = [
    "title", "description", "category", "budgetType", "budgetMin", "budgetMax",
    "skills", "experienceLevel", "duration", "location", "deadline",
  ];

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      job[field] = req.body[field];
    }
  }

  await job.save();

  sendSuccess(res, { message: "Job updated", data: { job } });
});

// PATCH /api/jobs/:id/status — update job status
export const updateJobStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const validStatuses = ["in_progress", "completed", "cancelled", "on_hold"];

  if (!validStatuses.includes(status)) {
    throw ApiError.badRequest(`Invalid status. Must be one of: ${validStatuses.join(", ")}`);
  }

  const job = await Job.findOne({ _id: req.params.id, client: req.user._id });
  if (!job) throw ApiError.notFound("Job not found or not authorized");

  job.status = status;
  await job.save();

  sendSuccess(res, { message: `Job marked as ${status}`, data: { job } });
});

// DELETE /api/jobs/:id — delete job
export const deleteJob = asyncHandler(async (req, res) => {
  const job = await Job.findOneAndDelete({
    _id: req.params.id,
    client: req.user._id,
    status: { $in: ["open", "cancelled"] },
  });

  if (!job) throw ApiError.notFound("Job not found or cannot be deleted");

  sendSuccess(res, { message: "Job deleted" });
});
