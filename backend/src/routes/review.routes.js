import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import Joi from "joi";
import { createReview, getUserReviews } from "../controllers/review.controller.js";

const router = Router();

const createReviewSchema = Joi.object({
  jobId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
  revieweeId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
  rating: Joi.number().min(1).max(5).required(),
  comment: Joi.string().max(2000).allow(""),
});

// Public
router.get("/user/:userId", getUserReviews);

// Protected
router.post("/", authenticate, validate(createReviewSchema), createReview);

export default router;
