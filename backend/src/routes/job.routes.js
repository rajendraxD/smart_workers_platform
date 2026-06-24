import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { optionalAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import Joi from "joi";
import {
  listJobs,
  getJob,
  createJob,
  updateJob,
  updateJobStatus,
  deleteJob,
} from "../controllers/job.controller.js";

const router = Router();

const createJobSchema = Joi.object({
  title: Joi.string().trim().min(5).max(200).required(),
  description: Joi.string().trim().min(20).max(10000).required(),
  category: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
  budgetType: Joi.string().valid("fixed", "hourly").required(),
  budgetMin: Joi.number().min(0).required(),
  budgetMax: Joi.number().min(0).allow(null),
  skills: Joi.array().items(Joi.string().trim()).default([]),
  experienceLevel: Joi.string().valid("entry", "intermediate", "expert").default("intermediate"),
  duration: Joi.string().valid("less_than_week", "1-4_weeks", "1-3_months", "3-6_months", "more_than_6_months"),
  location: Joi.string().trim().allow(""),
  deadline: Joi.date().min("now"),
});

const updateJobSchema = createJobSchema.fork(
  Object.keys(createJobSchema.describe().keys),
  (schema) => schema.optional()
);

const statusSchema = Joi.object({
  status: Joi.string()
    .valid("in_progress", "completed", "cancelled", "on_hold")
    .required(),
});

// Public
router.get("/", optionalAuth, listJobs);
router.get("/:id", getJob);

// Protected (client)
router.post("/", authenticate, validate(createJobSchema), createJob);
router.put("/:id", authenticate, validate(updateJobSchema), updateJob);
router.patch("/:id/status", authenticate, validate(statusSchema), updateJobStatus);
router.delete("/:id", authenticate, deleteJob);

export default router;
