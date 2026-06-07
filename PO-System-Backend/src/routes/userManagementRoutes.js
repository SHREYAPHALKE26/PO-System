import express from "express";
import bcrypt from "bcryptjs";
import pool from "../db.js";

const router = express.Router();

/* ============================================================
   1️⃣ GET ALL USERS (with roles)
   ============================================================ */
router.get("/user", async (req, res) => {
  try {
    const [users] = await pool.query(`
      SELECT 
        u.user_id,
        u.username,
        u.email,
        u.created_at,
        r.name AS role
      FROM users u
      LEFT JOIN user_role ur ON u.user_id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.role_id
      ORDER BY u.created_at DESC
    `);
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error while fetching users" });
  }
});

/* ============================================================
   2️⃣ CREATE NEW USER + ASSIGN ROLE
   ============================================================ */
router.post("/adduser", async (req, res) => {
  try {
    const { username, email, password, role_id } = req.body;

    if (!username || !email || !password)
      return res.status(400).json({ msg: "Missing required fields" });

    // Check if email already exists
    const [existing] = await pool.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );
    if (existing.length > 0)
      return res.status(400).json({ msg: "Email already exists" });

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Insert user
    const [result] = await pool.query(
      "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)",
      [username, email, hashed]
    );

    // Fetch the new user_id
    const [newUser] = await pool.query(
      "SELECT user_id FROM users WHERE email = ?",
      [email]
    );

    const userId = newUser[0].user_id;

    // Assign role if provided
    if (role_id) {
      await pool.query("INSERT INTO user_role (user_id, role_id) VALUES (?, ?)", [
        userId,
        role_id,
      ]);
    }

    res.status(201).json({ msg: "User created successfully", user_id: userId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error while creating user" });
  }
});

/* ============================================================
   3️⃣ UPDATE USER DETAILS AND ROLE
   ============================================================ */
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, role_id } = req.body;

    // Update user info
    await pool.query(
      "UPDATE users SET username = ?, email = ?, updated_at = NOW() WHERE user_id = ?",
      [username, email, id]
    );

    // Handle role assignment/update
    const [existingRole] = await pool.query(
      "SELECT * FROM user_role WHERE user_id = ?",
      [id]
    );

    if (existingRole.length > 0) {
      // Update existing role
      await pool.query("UPDATE user_role SET role_id = ? WHERE user_id = ?", [
        role_id,
        id,
      ]);
    } else if (role_id) {
      // Assign new role
      await pool.query("INSERT INTO user_role (user_id, role_id) VALUES (?, ?)", [
        id,
        role_id,
      ]);
    }

    res.json({ msg: "User updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error while updating user" });
  }
});

/* ============================================================
   4️⃣ DELETE USER (and related role mapping)
   ============================================================ */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Remove mapping first (due to FK)
    await pool.query("DELETE FROM user_role WHERE user_id = ?", [id]);

    // Remove user
    await pool.query("DELETE FROM users WHERE user_id = ?", [id]);

    res.json({ msg: "User deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error while deleting user" });
  }
});

/* ============================================================
   5️⃣ GET SINGLE USER BY ID (OPTIONAL)
   ============================================================ */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [user] = await pool.query(
      `
      SELECT u.user_id, u.username, u.email, r.name AS role
      FROM users u
      LEFT JOIN user_role ur ON u.user_id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.role_id
      WHERE u.user_id = ?
      `,
      [id]
    );
    if (user.length === 0)
      return res.status(404).json({ msg: "User not found" });

    res.json(user[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error while fetching user" });
  }
});

export default router;
