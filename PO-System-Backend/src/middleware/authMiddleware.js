import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config({ path: "../.env" });

export default function verifyToken(req, res, next) {
  const secretKey = process.env.JWT_SECRET;
  const authHeader = req.headers["authorization"];

  // 🚨 Check if Authorization header exists
  if (!authHeader) {
    return res.status(401).json({ msg: "No token provided" });
  }

  // ✅ Extract token (Bearer <token>)
  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ msg: "Token missing" });
  }

  try {
    // ✅ Verify and decode JWT
    const decoded = jwt.verify(token, secretKey);

    // ✅ Backward-compatible attachment of user info
    // This ensures that req.user always has a consistent structure
    // req.user = {
    //   id: decoded.userId || decoded.id || null,   // user UUID
    //   email: decoded.email || null,               // user email
    //   roles: decoded.roles || [],                 // role array
    //   ...decoded                                 // keep old properties (compatibility)
    // };
    req.user = {
  id: decoded.userId || decoded.id || null,
  email: decoded.email || null,
  role:
    Array.isArray(decoded.roles) && decoded.roles.length > 0
      ? decoded.roles[0]
      : decoded.role || decoded.userRole || null,
  username: decoded.username || decoded.name || null,
  ...decoded, // keep old properties for safety
};


    // ✅ Continue to next middleware or controller
    next();
  } catch (err) {
    console.error("JWT verification failed:", err.message);
    return res.status(403).json({ msg: "Invalid or expired token" });
  }
}
