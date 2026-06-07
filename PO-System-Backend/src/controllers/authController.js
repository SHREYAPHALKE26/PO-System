import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import pool from "../db.js";
import dotenv from "dotenv";
dotenv.config();

const secretKey = process.env.JWT_SECRET;
// const secretKey = process.env.JWT_SECRET || "supersecretkey"; // make sure to set this in .env

export async function register(req, res) {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    // Check if user already exists
    const [existing] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    if (existing.length > 0) {
      return res.status(400).json({ msg: "Email already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const [userResult] = await pool.query(
      "INSERT INTO users (user_id, username, email, password_hash) VALUES (UUID(), ?, ?, ?)",
      [username, email, hashedPassword]
    );

    // Assign default role (Requestor)
    const [role] = await pool.query("SELECT role_id FROM roles WHERE name = 'Requestor'");
    if (role.length > 0) {
      await pool.query("INSERT INTO user_role (user_id, role_id) VALUES (?, ?)", [
        userResult.insertId ? userResult.insertId : (await pool.query("SELECT user_id FROM users WHERE email = ?", [email]))[0][0].user_id,
        role[0].role_id,
      ]);
    }

    res.json({ msg: "User registered successfully with default role: Requestor" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
}



export async function login(req, res) {
  try {
    const { email, password } = req.body;

    // 🧠 1. Validate input
    if (!email || !password) {
      return res.status(400).json({ msg: "Email and password are required" });
    }

    // 🧠 2. Check if user exists
    const [userRows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    if (userRows.length === 0) {
      return res.status(400).json({ msg: "User not found" });
    }

    const user = userRows[0];

    // 🧠 3. Compare passwords
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    // 🧠 4. Fetch roles for this user
    const [roles] = await pool.query(
      `SELECT r.name 
       FROM user_role ur
       JOIN roles r ON ur.role_id = r.role_id
       WHERE ur.user_id = ?`,
      [user.user_id]
    );
    const roleNames = roles.map(r => r.name);

    // 🧠 5. Create JWT payload
    const payload = {
      userId: user.user_id,      // UUID from your users table
      email: user.email,         // also store email for readability
      roles: roleNames           // role-based access
    };
    // console.log(payload);
    // console.log(secretKey);

    // 🧠 6. Sign JWT token
    const token = jwt.sign(payload, secretKey, { expiresIn: "7d" });
    // console.log(token);

    // 🧠 7. Send response
    res.status(200).json({
      msg: "Login successful",
      token,
      roles: roleNames,
      email: user.email
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ msg: "Server error" });
  }
}


const FRONTEND_BASE_URL = process.env.FRONTEND_BASE_URL || "http://localhost:3001";

// 👉 POST /auth/forgot-password
// body: { email }
export async function forgotPassword(req, res) {
  try {
    const { email } = req.body || {};

    if (!email) {
      return res.status(400).json({ msg: "Email is required" });
    }

    // 🔹 Your users table DOES NOT have 'active'
    // 🔹 But it DOES have 'deleted_at', so ignore soft-deleted users
    const [users] = await pool.query(
      `SELECT user_id, email 
       FROM users 
       WHERE email = ? 
         AND deleted_at IS NULL`,
      [email]
    );

    // For security: always return success-style message
    if (users.length === 0) {
      return res.status(200).json({
        msg: "If this email exists, a reset link has been sent.",
      });
    }

    const user = users[0];

    // Generate token
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Delete previous reset requests for this user
    await pool.query("DELETE FROM password_resets WHERE user_id = ?", [
      user.user_id,
    ]);

    // Insert new reset token
    await pool.query(
      `INSERT INTO password_resets (user_id, token_hash, expires_at)
       VALUES (?, ?, ?)`,
      [user.user_id, tokenHash, expiresAt]
    );

    // Frontend URL (you can change it via FRONTEND_BASE_URL env)
    const resetUrl = `${FRONTEND_BASE_URL}/reset-password?token=${rawToken}`;

    // TODO: send email here using nodemailer / Resend etc.
    console.log("🔐 Password reset link for", email, "=>", resetUrl);

    return res.status(200).json({
      msg: "If this email exists, a reset link has been sent.",
    });
  } catch (err) {
    console.error("Forgot password error:", err);
    return res.status(500).json({ msg: "Internal server error" });
  }
}
// 👉 POST /auth/reset-password
// body: { token, newPassword, confirmPassword }
export async function resetPassword(req, res) {
  const conn = await pool.getConnection();
  try {
    const { token, newPassword, confirmPassword } = req.body || {};

    if (!token || !newPassword || !confirmPassword) {
      return res
        .status(400)
        .json({ msg: "Token, new password and confirm password are required" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ msg: "Passwords do not match" });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ msg: "Password must be at least 6 characters" });
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    await conn.beginTransaction();

    // 1) Find valid reset token
    const [resets] = await conn.query(
      `SELECT * FROM password_resets 
       WHERE token_hash = ? 
         AND expires_at > NOW()
       LIMIT 1`,
      [tokenHash]
    );

    if (resets.length === 0) {
      await conn.rollback();
      return res.status(400).json({ msg: "Invalid or expired reset link" });
    }

    const resetRow = resets[0];
    const userId = resetRow.user_id;

    // 2) Hash new password
    const newHash = await bcrypt.hash(newPassword, 10);

    // 3) Update user password
    await conn.query(
      `UPDATE users 
       SET password_hash = ? 
       WHERE user_id = ?`,
      [newHash, userId]
    );

    // 4) Delete all password reset tokens for this user
    await conn.query("DELETE FROM password_resets WHERE user_id = ?", [userId]);

    await conn.commit();

    return res.status(200).json({ msg: "Password reset successful. You can now login." });
  } catch (err) {
    await conn.rollback();
    console.error("Reset password error:", err);
    return res.status(500).json({ msg: "Internal server error" });
  } finally {
    conn.release();
  }
}