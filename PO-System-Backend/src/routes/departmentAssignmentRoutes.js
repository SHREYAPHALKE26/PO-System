// src/routes/departmentAssignmentRoutes.js
import express from "express";
import verifyToken from "../middleware/authMiddleware.js";
import {
  getAllDepartments,
  getRequestorsAndApprovers,
  assignDepartmentToUser,
} from "../controllers/departmentAssignmentController.js";

const router = express.Router();

/**
 * NOTE: These are ADMIN-only routes logically.
 * We use verifyToken and assume only Admin calls this from frontend.
 * (If you want, you can also check req.user.roles.includes("Admin") inside each handler.)
 */

// Get all departments (for admin dropdown)
router.get("/departments", verifyToken, getAllDepartments);

// Get all users with their department info
router.get("/users", verifyToken, getRequestorsAndApprovers);

// Assign / update department for a user
router.patch("/assign/:user_id", verifyToken, assignDepartmentToUser);

export default router;
