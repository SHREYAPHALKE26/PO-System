import express from "express";
import verifyToken from "../middleware/authMiddleware.js";
import { assignVendors, getAssignedVendors,getAllAssignments} from "../controllers/rfqVendorController.js";

const router = express.Router();

router.post("/assignVendors/:rfq_id", verifyToken, assignVendors);
router.get("/getAssignedVendors/:rfq_id", verifyToken, getAssignedVendors);
router.get("/allAssignments", verifyToken, getAllAssignments);


export default router;
