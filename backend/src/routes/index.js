import { Router } from "express";
import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import jobRoutes from "./job.routes.js";
import applicationRoutes from "./application.routes.js";
import reviewRoutes from "./review.routes.js";
import categoryRoutes from "./category.routes.js";
import notificationRoutes from "./notification.routes.js";
import { apiLimiter } from "../middleware/rateLimiter.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/jobs", jobRoutes);
router.use("/applications", applicationRoutes);
router.use("/reviews", reviewRoutes);
router.use("/categories", categoryRoutes);
router.use("/notifications", notificationRoutes);

// Health check
router.get("/health", (_req, res) => {
  res.json({ success: true, message: "API is healthy", timestamp: new Date().toISOString() });
});

export default router;
