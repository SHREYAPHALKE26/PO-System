// src/routes/profileRoutes.js
import express from "express";
import verifyToken from "../middleware/authMiddleware.js";
import {
  getMyProfile,
  updateMyProfile,
  changeMyPassword,
} from "../controllers/profileController.js";

const router = express.Router();

// Get current logged-in user profile
router.get("/me", verifyToken, getMyProfile);

// Update profile (username, email)
router.patch("/update", verifyToken, updateMyProfile);

// Change password
router.patch("/change-password", verifyToken, changeMyPassword);

export default router;
