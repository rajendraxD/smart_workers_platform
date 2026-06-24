import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import Joi from "joi";
import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller.js";

const router = Router();

const categorySchema = Joi.object({
  name: Joi.string().trim().max(100).required(),
  description: Joi.string().max(500).allow(""),
  icon: Joi.string().allow(""),
  order: Joi.number().default(0),
});

// Public
router.get("/", listCategories);

// Admin
router.post("/", authenticate, authorize("admin"), validate(categorySchema), createCategory);
router.put("/:id", authenticate, authorize("admin"), updateCategory);
router.delete("/:id", authenticate, authorize("admin"), deleteCategory);

export default router;
