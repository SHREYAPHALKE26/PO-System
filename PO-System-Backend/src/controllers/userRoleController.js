import pool from "../db.js";

// ✅ View all users with their roles
export async function getAllUsersWithRoles(req, res) {
  try {
    const [rows] = await pool.query(`
      SELECT 
        u.user_id, u.username, u.email, 
        GROUP_CONCAT(r.name SEPARATOR ', ') AS roles
      FROM users u
      LEFT JOIN user_role ur ON u.user_id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.role_id
      GROUP BY u.user_id
      ORDER BY u.created_at DESC;
    `);
    res.status(200).json(rows);
  } catch (err) {
    console.error("Error fetching users with roles:", err);
    res.status(500).json({ msg: "Internal server error" });
  }
}




// ✅ Revoke a role from user
export async function revokeRole(req, res) {
  try {
    const { user_id } = req.params;

    if (!user_id)
      return res.status(400).json({ msg: "user_id is required" });

    await pool.query("DELETE FROM user_role WHERE user_id = ?", [user_id]);

    res.status(200).json({ msg: "Role revoked successfully" });
  } catch (err) {
    console.error("Error revoking role:", err);
    res.status(500).json({ msg: "Internal server error" });
  }
}

// ✅ Update user's role (replace with another)
export async function updateUserRole(req, res) {
  try {
    const { user_id } = req.params;
    const { role_id } = req.body;

    if (!user_id || !role_id)
      return res.status(400).json({ msg: "user_id and role_id are required" });

    // Check if user already has a role
    const [existing] = await pool.query(
      "SELECT * FROM user_role WHERE user_id = ?",
      [user_id]
    );

    if (existing.length === 0) {
      // If not found (first time), assign the role
      await pool.query(
        "INSERT INTO user_role (user_id, role_id) VALUES (?, ?)",
        [user_id, role_id]
      );
      return res.status(201).json({ msg: "Role assigned successfully" });
    }

    // If user already has a role, update it
    await pool.query(
      "UPDATE user_role SET role_id = ? WHERE user_id = ?",
      [role_id, user_id]
    );

    res.status(200).json({ msg: "User role updated successfully" });
  } catch (err) {
    console.error("Error updating user role:", err);
    res.status(500).json({ msg: "Internal server error" });
  }
}
