// src/routes/adminDashboardRoutes.js
import express from "express";
import verifyToken from "../middleware/authMiddleware.js";
import { getAdminDashboard } from "../controllers/adminDashboardController.js";

const router = express.Router();

// GET /admin/dashboard
router.get("/dashboard", verifyToken, getAdminDashboard);

export default router;
