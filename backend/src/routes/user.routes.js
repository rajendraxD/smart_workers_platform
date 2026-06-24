import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import Joi from "joi";
import {
  getMyProfile,
  updateMyProfile,
  changePassword,
  getPublicProfile,
  listWorkers,
} from "../controllers/user.controller.js";

const router = Router();

const updateProfileSchema = Joi.object({
  firstName: Joi.string().trim().max(50),
  lastName: Joi.string().trim().max(50),
  phone: Joi.string().trim().allow(""),
  bio: Joi.string().max(1000).allow(""),
  skills: Joi.array().items(Joi.string().trim()),
  hourlyRate: Joi.number().min(0),
  availability: Joi.string().valid("available", "busy", "unavailable"),
  company: Joi.string().trim().max(100).allow(""),
}).min(1);

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(8).max(128).required(),
});

// Protected (must come before /:id catch-all)
router.get("/profile/me", authenticate, getMyProfile);
router.put("/profile", authenticate, validate(updateProfileSchema), updateMyProfile);
router.put("/password", authenticate, validate(changePasswordSchema), changePassword);

// Public (catch-all :id route last)
router.get("/workers", listWorkers);
router.get("/:id", getPublicProfile);

export default router;
