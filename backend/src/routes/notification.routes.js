import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { sendSuccess } from "../utils/ApiResponse.js";

const router = Router();

// NOTE: Full notification implementation planned for Week 5-6 (Chat & Notifications)
// These are stubs to prevent 404s during early development

// GET /api/notifications — list user's notifications
router.get("/", authenticate, async (req, res) => {
  sendSuccess(res, { data: { notifications: [] } });
});

// PATCH /api/notifications/:id/read — mark notification as read
router.patch("/:id/read", authenticate, async (req, res) => {
  sendSuccess(res, { message: "Notification marked as read" });
});

// PATCH /api/notifications/read-all — mark all as read
router.patch("/read-all", authenticate, async (req, res) => {
  sendSuccess(res, { message: "All notifications marked as read" });
});

export default router;
