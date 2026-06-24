import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/ApiResponse.js";
import { Category } from "../models/Category.model.js";

// GET /api/categories — list active categories
export const listCategories = asyncHandler(async (_req, res) => {
  const categories = await Category.find({ isActive: true })
    .sort({ order: 1, name: 1 })
    .select("name slug description icon");

  sendSuccess(res, { data: { categories } });
});

// POST /api/categories — create category (admin)
export const createCategory = asyncHandler(async (req, res) => {
  const { name, description, icon, order } = req.body;
  const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  const category = await Category.create({ name, slug, description, icon, order });
  sendSuccess(res, { statusCode: 201, message: "Category created", data: { category } });
});

// PUT /api/categories/:id — update category (admin)
export const updateCategory = asyncHandler(async (req, res) => {
  const updates = {};
  const allowedFields = ["name", "description", "icon", "isActive", "order"];

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  }

  if (updates.name) {
    updates.slug = updates.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  }

  const category = await Category.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });

  sendSuccess(res, { message: "Category updated", data: { category } });
});

// DELETE /api/categories/:id — delete category (admin)
export const deleteCategory = asyncHandler(async (req, res) => {
  await Category.findByIdAndDelete(req.params.id);
  sendSuccess(res, { message: "Category deleted" });
});
