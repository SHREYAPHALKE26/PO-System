// src/routes/poRoutes.js
import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  getDepartmentPOs,
  getPODetailForUser,
} from "../controllers/poDepartmentController.js";

const router = express.Router();

// List POs visible to this user (Admin / Requestor / Approver)
router.get("/departmentPOs", authMiddleware, getDepartmentPOs);

// Get detail of a single PO (with items)
router.get("/:po_id/detail", authMiddleware, getPODetailForUser);

export default router;
