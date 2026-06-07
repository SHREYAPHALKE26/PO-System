import express from "express";
import verifyToken from "../middleware/authMiddleware.js";
import { getAllPOs, getPODetails } from "../controllers/poReportController.js";

const router = express.Router();

router.get("/all", verifyToken, getAllPOs);
router.get("/:po_id", verifyToken, getPODetails);

export default router;
