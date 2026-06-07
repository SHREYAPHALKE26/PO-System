// src/controllers/profileController.js
import pool from "../db.js";
import bcrypt from "bcryptjs";

/**
 * 🧩 Helper: Fetch roles for a user (matches your existing auth logic)
 */
async function getUserRoles(userId) {
  const [rows] = await pool.query(
    `
    SELECT r.name 
    FROM user_role ur
    JOIN roles r ON ur.role_id = r.role_id
    WHERE ur.user_id = ?
    `,
    [userId]
  );
  return rows.map((r) => r.name);
}

/**
 * 🔹 GET /profile/me
 * Returns: username, email, roles, department info
 */
export async function getMyProfile(req, res) {
  try {
    const userId = req.user.id; // from verifyToken

    const [[user]] = await pool.query(
      `
      SELECT 
        u.user_id,
        u.username,
        u.email,
        u.department_id,
        d.name AS department_name
      FROM users u
      LEFT JOIN departments d ON u.department_id = d.department_id
      WHERE u.user_id = ?
      `,
      [userId]
    );

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    const roles = await getUserRoles(userId);

    res.json({
      user_id: user.user_id,
      username: user.username,
      email: user.email,
      department_id: user.department_id,
      department_name: user.department_name || "Not Assigned",
      roles,
    });
  } catch (err) {
    console.error("Error in getMyProfile:", err);
    res.status(500).json({ msg: "Internal server error" });
  }
}

/**
 * 🔹 PATCH /profile/update
 * Allows user to update username & email
 */
export async function updateMyProfile(req, res) {
  try {
    const userId = req.user.id;
    const { username, email } = req.body;

    if (!username || !email) {
      return res.status(400).json({ msg: "Username and email are required" });
    }

    // Check if email used by someone else
    const [emailRows] = await pool.query(
      "SELECT user_id FROM users WHERE email = ? AND user_id <> ?",
      [email, userId]
    );
    if (emailRows.length > 0) {
      return res.status(400).json({ msg: "Email already in use by another user" });
    }

    await pool.query(
      "UPDATE users SET username = ?, email = ?, updated_at = NOW() WHERE user_id = ?",
      [username, email, userId]
    );

    res.json({ msg: "Profile updated successfully" });
  } catch (err) {
    console.error("Error in updateMyProfile:", err);
    res.status(500).json({ msg: "Internal server error" });
  }
}

/**
 * 🔹 PATCH /profile/change-password
 * Body: { currentPassword, newPassword }
 */
export async function changeMyPassword(req, res) {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        msg: "Current password and new password are required",
      });
    }

    // 1️⃣ Fetch current hash
    const [[user]] = await pool.query(
      "SELECT password_hash FROM users WHERE user_id = ?",
      [userId]
    );

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // 2️⃣ Compare current password
    const valid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!valid) {
      return res.status(400).json({ msg: "Current password is incorrect" });
    }

    // 3️⃣ Hash new password
    const newHash = await bcrypt.hash(newPassword, 10);

    await pool.query(
      "UPDATE users SET password_hash = ?, updated_at = NOW() WHERE user_id = ?",
      [newHash, userId]
    );

    res.json({ msg: "Password changed successfully" });
  } catch (err) {
    console.error("Error in changeMyPassword:", err);
    res.status(500).json({ msg: "Internal server error" });
  }
}
