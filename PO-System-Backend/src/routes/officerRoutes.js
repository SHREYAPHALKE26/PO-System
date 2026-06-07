import express from "express";
import verifyToken from "../middleware/authMiddleware.js";
import {
  getApprovedRFQs,
  getQuotationsForRFQ,
  approveQuotation,
  getAllSubmittedQuotations,
  getQuotationItems,
  getRFQItems
} from "../controllers/officerController.js";


const router = express.Router();

// Officer: View approved RFQs
router.get("/approvedRFQs", verifyToken, getApprovedRFQs);

// Officer: Get quotations for one RFQ
router.get("/quotations/:rfq_id", verifyToken, getQuotationsForRFQ);

// Officer: Approve a quotation and create PO
router.post("/approveQuotation/:quote_id", verifyToken, approveQuotation);

router.get("/all-quotations", verifyToken, getAllSubmittedQuotations);
router.get("/quotationItems/:quote_id", verifyToken, getQuotationItems); // ⬅️ NEW

router.get("/rfqItems/:rfq_id", verifyToken, getRFQItems);




export default router;
