import express from "express";
import verifyToken from "../middleware/authMiddleware.js";
import { createRFQ, getAllRFQs, getRFQById, updateRFQ,
  deleteRFQ } from "../controllers/rfqController.js";

const router = express.Router();

router.post("/create", verifyToken, createRFQ);
router.get("/getAll", verifyToken, getAllRFQs);
router.get("/:rfq_id", verifyToken, getRFQById);
router.patch("/updateRFQ/:rfq_id", verifyToken, updateRFQ);
router.delete("/deleteRFQ/:rfq_id", verifyToken, deleteRFQ);

// ✅ Optional: Admin-only endpoint for dashboard
router.get("/getAllForAdmin", verifyToken, async (req, res, next) => {
  if (req.user.role !== "Admin") {
    return res.status(403).json({ msg: "Access denied. Admin only." });
  }
  next();
}, getAllRFQs);

export default router;
