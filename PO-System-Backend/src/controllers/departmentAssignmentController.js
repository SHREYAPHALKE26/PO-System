// src/controllers/departmentAssignmentController.js
import pool from "../db.js";

/**
 * 🔹 Get all departments (Admin can use this for dropdown)
 */
export async function getAllDepartments(req, res) {
  try {
    // Optional: enforce only Admin can see this
    if (!req.user?.roles?.includes("Admin")) {
      return res.status(403).json({ msg: "Only Admin can view departments" });
    }

    const [rows] = await pool.query(
      `SELECT department_id, name, budget
       FROM departments
       ORDER BY name ASC`
    );
    res.status(200).json(rows);
  } catch (err) {
    console.error("Error fetching departments:", err);
    res.status(500).json({ msg: "Internal server error" });
  }
}

/**
 * 🔹 Get only users who are Requestor or Approver
 *  - Admin assigns department ONLY to these roles
 */
export async function getRequestorsAndApprovers(req, res) {
  try {
    if (!req.user?.roles?.includes("Admin")) {
      return res.status(403).json({ msg: "Only Admin can view this list" });
    }

    const [rows] = await pool.query(
      `
      SELECT
        u.user_id,
        u.username,
        u.email,
        u.department_id,
        d.name AS department_name,
        u.created_at
      FROM users u
      LEFT JOIN departments d ON u.department_id = d.department_id
      WHERE EXISTS (
        SELECT 1
        FROM user_role ur
        JOIN roles r ON ur.role_id = r.role_id
        WHERE ur.user_id = u.user_id
          AND r.name IN ('Requestor', 'Approver')
      )
      ORDER BY u.created_at DESC
      `
    );

    res.status(200).json(rows);
  } catch (err) {
    console.error("Error fetching requestors/approvers:", err);
    res.status(500).json({ msg: "Internal server error" });
  }
}


/**
 * 🔹 Assign / update department ONLY for Requestor / Approver users
 */
export async function assignDepartmentToUser(req, res) {
  try {
    if (!req.user?.roles?.includes("Admin")) {
      return res.status(403).json({ msg: "Only Admin can assign departments" });
    }

    const { user_id } = req.params;
    const { department_id } = req.body;

    if (!department_id) {
      return res.status(400).json({ msg: "department_id is required" });
    }

    // 1️⃣ Check that department exists
    const [[dept]] = await pool.query(
      `SELECT department_id, name FROM departments WHERE department_id = ?`,
      [department_id]
    );

    if (!dept) {
      return res
        .status(400)
        .json({ msg: `Department ID ${department_id} not found` });
    }

    // 2️⃣ Check that user exists AND is Requestor/Approver
    const [[user]] = await pool.query(
      `
      SELECT u.user_id, u.username, u.email
      FROM users u
      JOIN user_role ur ON u.user_id = ur.user_id
      JOIN roles r ON ur.role_id = r.role_id
      WHERE u.user_id = ?
        AND r.name IN ('Requestor', 'Approver')
      `,
      [user_id]
    );

    if (!user) {
      return res.status(404).json({
        msg: `User ${user_id} not found as Requestor/Approver (cannot assign department)`,
      });
    }

    // 3️⃣ Update user's department
    await pool.query(
      `UPDATE users SET department_id = ? WHERE user_id = ?`,
      [department_id, user_id]
    );

    // 4️⃣ Return updated info
    res.status(200).json({
      msg: "Department assigned to user successfully",
      user: {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        department_id: dept.department_id,
        department_name: dept.name,
      },
    });
  } catch (err) {
    console.error("Error assigning department to user:", err);
    res.status(500).json({ msg: "Internal server error" });
  }
}
