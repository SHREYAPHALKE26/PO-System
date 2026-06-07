import express from "express";
import verifyToken from "../middleware/authMiddleware.js";
import {
  getPendingRFQs,
  approveOrRejectRFQ,
  getApprovedRFQs,
  getRFQItemsForApprover
} from "../controllers/approverController.js";

const router = express.Router();

// Approver-only routes
router.get("/pendingRFQs", verifyToken, getPendingRFQs);
router.patch("/reviewRFQ/:rfq_id", verifyToken, approveOrRejectRFQ);
router.get("/approvedRFQs", verifyToken, getApprovedRFQs);

router.get("/rfqItems/:rfq_id", verifyToken, getRFQItemsForApprover);

export default router;
