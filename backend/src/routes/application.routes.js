import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import Joi from "joi";
import {
  apply,
  getApplication,
  getMyApplications,
  listApplications,
  updateApplicationStatus,
} from "../controllers/application.controller.js";

const router = Router();

const applySchema = Joi.object({
  coverLetter: Joi.string().max(5000).allow(""),
  proposedRate: Joi.number().min(0),
});

const statusSchema = Joi.object({
  status: Joi.string().valid("accepted", "rejected", "shortlisted", "withdrawn").required(),
  clientNotes: Joi.string().max(2000).allow(""),
});

// Worker routes
router.get("/my", authenticate, getMyApplications);
router.get("/:id", authenticate, getApplication);

// Apply (worker) + list applicants (client)
router.post("/jobs/:jobId", authenticate, validate(applySchema), apply);
router.get("/jobs/:jobId", authenticate, listApplications);

// Update status (client: accept/reject/shortlist | worker: withdraw)
router.patch("/:id/status", authenticate, validate(statusSchema), updateApplicationStatus);

export default router;
