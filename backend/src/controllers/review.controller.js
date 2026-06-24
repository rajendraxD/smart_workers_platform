import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { sendSuccess } from "../utils/ApiResponse.js";
import { Review } from "../models/Review.model.js";
import { Job } from "../models/Job.model.js";
import { User } from "../models/User.model.js";

// POST /api/reviews — create a review after job completion
export const createReview = asyncHandler(async (req, res) => {
  const { jobId, revieweeId, rating, comment } = req.body;

  const job = await Job.findById(jobId);
  if (!job) throw ApiError.notFound("Job not found");
  if (job.status !== "completed") throw ApiError.badRequest("Can only review completed jobs");

  // Verify the reviewer was part of this job
  const isClient = job.client.equals(req.user._id);
  const isWorker = job.hiredWorker?.equals(req.user._id);

  if (!isClient && !isWorker) {
    throw ApiError.forbidden("You were not part of this job");
  }

  // Verify the reviewee is the other party
  const expectedReviewee = isClient ? job.hiredWorker : job.client;
  if (!expectedReviewee || !expectedReviewee.equals(revieweeId)) {
    throw ApiError.badRequest("Invalid reviewee for this job");
  }

  const type = isClient ? "client_to_worker" : "worker_to_client";

  const existingReview = await Review.findOne({ job: jobId, reviewer: req.user._id });
  if (existingReview) throw ApiError.conflict("You have already reviewed this job");

  const review = await Review.create({
    reviewer: req.user._id,
    reviewee: revieweeId,
    job: jobId,
    rating,
    comment,
    type,
  });

  // Update reviewee's average rating
  const stats = await Review.aggregate([
    { $match: { reviewee: revieweeId } },
    { $group: { _id: null, avgRating: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);

  if (stats.length > 0) {
    await User.findByIdAndUpdate(revieweeId, {
      averageRating: Math.round(stats[0].avgRating * 10) / 10,
      totalReviews: stats[0].count,
    });
  }

  sendSuccess(res, { statusCode: 201, message: "Review submitted", data: { review } });
});

// GET /api/reviews/user/:userId — get reviews for a user
export const getUserReviews = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const [reviews, total] = await Promise.all([
    Review.find({ reviewee: req.params.userId })
      .populate("reviewer", "firstName lastName avatar")
      .populate("job", "title")
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 }),
    Review.countDocuments({ reviewee: req.params.userId }),
  ]);

  sendSuccess(res, {
    data: { reviews },
    meta: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) },
  });
});
