import express from "express";
import verifyToken from "../middleware/authMiddleware.js";
import {
  getAllUsersWithRoles,
  revokeRole,
  updateUserRole,
} from "../controllers/userRoleController.js";

const router = express.Router();

// Admin-only routes
router.get("/getAllUsersWithRoles", verifyToken, getAllUsersWithRoles);
router.patch("/updateUserRole/:user_id", verifyToken, updateUserRole);
router.delete("/revokeRole/:user_id", verifyToken, revokeRole);


export default router;
