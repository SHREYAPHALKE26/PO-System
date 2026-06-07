import express from 'express';
import verifyToken from '../middleware/authMiddleware.js';
import { getRoles, createRoles, updateRoles, deleteRoles } from '../controllers/roleController.js';

const router = express.Router();
router.get("/getAllRoles", getRoles);
router.post("/createRole", verifyToken, createRoles);
router.patch("/updateRole/:role_id", verifyToken, updateRoles);
router.delete("/deleteRole/:role_id", verifyToken, deleteRoles);

export default router;