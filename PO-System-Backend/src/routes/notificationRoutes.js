// src/routes/notificationRoutes.js
import express from "express";
import verifyToken from "../middleware/authMiddleware.js";
import {
  getMyNotifications,
  markNotificationRead,
  markAllRead,
} from "../controllers/notificationController.js";

const router = express.Router();

router.get("/my", verifyToken, getMyNotifications);
router.patch("/:id/read", verifyToken, markNotificationRead);
router.patch("/mark-all-read", verifyToken, markAllRead);

export default router;
