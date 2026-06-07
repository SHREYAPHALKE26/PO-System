import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import verifyToken from "./middleware/authMiddleware.js";

// Load environment variables
dotenv.config({ path: "../.env" });

const app = express();

// ✅ Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // fixed
app.use(cookieParser());

// ✅ Enable CORS BEFORE routes
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3001", // frontend URL
    credentials: true, // allow cookies
  })
);

// ✅ Route imports
import authRoutes from "./routes/authRoutes.js";
import deptMasterRoutes from "./routes/deptMasterRoutes.js";
import roleRoutes from "./routes/roleRoutes.js";
import vendorRoutes from "./routes/vendorRoutes.js"
import userRoleRoutes from "./routes/userRoleRoutes.js";
import rfqRoutes from "./routes/rfqRoutes.js";
import rfqVendor from "./routes/rfqVendorRoutes.js"
import offericerRoutes from "./routes/officerRoutes.js"
import approverRoutes from "./routes/approver.js";
import poReportRoutes from "./routes/poReportRoutes.js";
import departmentAssignmentRoutes from "./routes/departmentAssignmentRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import adminDashboardRoutes from "./routes/adminDashboardRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import poRoutes from "./routes/poRoutes.js";





// ✅ Route declarations
app.use("/auth", authRoutes);
app.use("/dept", deptMasterRoutes);
app.use("/role", roleRoutes);
app.use("/vendor", vendorRoutes);
app.use("/userRole" ,userRoleRoutes);
app.use("/rfq", rfqRoutes);
app.use("/rfqVendor", rfqVendor);
app.use("/officer", offericerRoutes);
app.use("/approver", approverRoutes);
app.use("/adminDept", departmentAssignmentRoutes);
app.use("/poReport", poReportRoutes);
app.use("/profile", profileRoutes);
app.use("/admin", adminDashboardRoutes);
app.use("/notifications", notificationRoutes);
app.use("/po", poRoutes);





app.get("/profile", verifyToken, (req, res) => {
  res.json({ msg: "Welcome to profile", user: req.user });
});

// ✅ Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
