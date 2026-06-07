// src/routes/vendorRoutes.js
import express from "express";
import {
  registerVendor,
  vendorLogin,
  getAllVendors,
  updateVendor,
  deleteVendor,
  getAssignedRFQs,
  submitQuotation,
  getVendorQuotations,
  getVendorProfile,
  updateVendorProfile,
  changeVendorPassword,
} from "../controllers/vendorController.js";

import verifyToken from "../middleware/authMiddleware.js"; // Admin
import verifyVendorToken from "../middleware/vendorAuth.js"; // Vendor
import {downloadVendorPO}from "../controllers/poPdfController.js"

const router = express.Router();

// Public / admin
router.post("/register", registerVendor);
router.post("/login", vendorLogin);
router.get("/getAllVendors", getAllVendors); // you can protect with adminAuth if needed
router.put("/:vendor_id", updateVendor);     // admin update
router.delete("/:vendor_id", deleteVendor);  // admin delete

// Vendor auth required
router.get("/assignedRFQs", verifyVendorToken, getAssignedRFQs);
router.post("/submitQuotation", verifyVendorToken, submitQuotation);
router.get("/submittedQuotations", verifyVendorToken, getVendorQuotations);

// 🆕 Vendor self-profile
router.get("/me", verifyVendorToken, getVendorProfile);
router.put("/me", verifyVendorToken, updateVendorProfile);
router.post("/change-password", verifyVendorToken, changeVendorPassword);

// 🆕 PO PDF (you already added earlier)
router.get("/po/:po_id/pdf", verifyVendorToken, downloadVendorPO);

export default router;
