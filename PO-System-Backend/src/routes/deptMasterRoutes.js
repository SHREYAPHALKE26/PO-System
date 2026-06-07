import express from "express";
import verifyToken from "../middleware/authMiddleware.js";
import {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from "../controllers/departmentController.js";

const router = express.Router();

// ✅ CRUD Routes
router.get("/getAllDepartments", verifyToken, getDepartments);
router.post("/createDepartment", verifyToken, createDepartment);
router.patch("/updateDepartment/:department_id", verifyToken, updateDepartment);
router.delete("/deleteDepartment/:department_id", verifyToken, deleteDepartment);

export default router;
