import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config({ path: "../.env" });

export default function vendorAuth(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ msg: "No token provided" });

  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ msg: "Token missing" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.vendor = {
      id: decoded.vendorId || decoded.id || null,
      email: decoded.email,
      name: decoded.name,
      role: "Vendor",
    };
    next();
  } catch (err) {
    console.error("Vendor JWT verification failed:", err);
    res.status(403).json({ msg: "Invalid or expired token" });
  }
}
