import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { sendSuccess } from "../utils/ApiResponse.js";
import { Application } from "../models/Application.model.js";
import { Job } from "../models/Job.model.js";
import { Notification } from "../models/Notification.model.js";

// POST /api/jobs/:jobId/applications — apply for a job
export const apply = asyncHandler(async (req, res) => {
  if (req.user.role !== "worker") {
    throw ApiError.forbidden("Only workers can apply to jobs");
  }

  const job = await Job.findById(req.params.jobId);
  if (!job) throw ApiError.notFound("Job not found");
  if (job.status !== "open") throw ApiError.badRequest("Job is not accepting applications");
  if (job.client.equals(req.user._id)) throw ApiError.badRequest("Cannot apply to your own job");

  const existing = await Application.findOne({ job: job._id, worker: req.user._id });
  if (existing) throw ApiError.conflict("Already applied to this job");

  const application = await Application.create({
    job: job._id,
    worker: req.user._id,
    coverLetter: req.body.coverLetter,
    proposedRate: req.body.proposedRate,
  });

  job.applicationsCount += 1;
  await job.save();

  sendSuccess(res, {
    statusCode: 201,
    message: "Application submitted",
    data: { application },
  });
});

// GET /api/applications/:id — get single application (worker only)
export const getApplication = asyncHandler(async (req, res) => {
  const application = await Application.findOne({
    _id: req.params.id,
    worker: req.user._id,
  })
    .populate("job", "title description budgetType budgetMin budgetMax status")
    .populate("job.client", "firstName lastName avatar averageRating");

  if (!application) throw ApiError.notFound("Application not found");

  sendSuccess(res, { data: { application } });
});

// GET /api/applications/my — worker's applications
export const getMyApplications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  const query = { worker: req.user._id };

  if (status) query.status = status;

  const skip = (Number(page) - 1) * Number(limit);

  const [applications, total] = await Promise.all([
    Application.find(query)
      .populate("job", "title budgetType budgetMin budgetMax status")
      .populate("job.client", "firstName lastName avatar")
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 }),
    Application.countDocuments(query),
  ]);

  sendSuccess(res, {
    data: { applications },
    meta: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) },
  });
});

// GET /api/jobs/:jobId/applications — list applicants (client only)
export const listApplications = asyncHandler(async (req, res) => {
  const job = await Job.findOne({ _id: req.params.jobId, client: req.user._id });
  if (!job) throw ApiError.notFound("Job not found or not authorized");

  const applications = await Application.find({ job: job._id })
    .populate("worker", "firstName lastName avatar skills hourlyRate averageRating bio")
    .sort({ createdAt: -1 });

  sendSuccess(res, { data: { applications } });
});

// PATCH /api/applications/:id/status — update application status
export const updateApplicationStatus = asyncHandler(async (req, res) => {
  const { status, clientNotes } = req.body;
  const validStatuses = ["accepted", "rejected", "shortlisted", "withdrawn"];

  if (!validStatuses.includes(status)) {
    throw ApiError.badRequest(`Invalid status. Must be one of: ${validStatuses.join(", ")}`);
  }

  const application = await Application.findById(req.params.id).populate("job");
  if (!application) throw ApiError.notFound("Application not found");

  const job = application.job;

  // Workers can only withdraw their own applications
  if (status === "withdrawn") {
    if (!application.worker.equals(req.user._id)) {
      throw ApiError.forbidden("You can only withdraw your own applications");
    }
    if (application.status !== "pending") {
      throw ApiError.badRequest("Can only withdraw pending applications");
    }
  } else {
    // Client actions: accept, reject, shortlist
    if (!job.client.equals(req.user._id)) {
      throw ApiError.forbidden("Not authorized to manage this application");
    }
    if (status === "accepted") {
      // Accept: update job status and hired worker
      job.status = "in_progress";
      job.hiredWorker = application.worker;
      await job.save();
    }
  }

  application.status = status;
  if (clientNotes) application.clientNotes = clientNotes;
  await application.save();

  sendSuccess(res, { message: `Application ${status}`, data: { application } });
});
