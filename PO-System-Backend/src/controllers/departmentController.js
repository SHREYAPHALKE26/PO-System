import pool from "../db.js";

// ✅ GET ALL DEPARTMENTS
export async function getDepartments(req, res) {
  try {
    const [departments] = await pool.query(`
      SELECT d.*, u.username AS head_name, u.email AS head_email
      FROM departments d
      LEFT JOIN users u ON d.head_user_id = u.user_id
      ORDER BY d.department_id DESC
    `);
    res.status(200).json(departments);
  } catch (err) {
    console.error("Error fetching departments:", err);
    res.status(500).json({ msg: "Internal server error" });
  }
}

// ✅ CREATE NEW DEPARTMENT
export async function createDepartment(req, res) {
  try {
    const { name, description, budget, head_user_id } = req.body;
    if (!name || !description) {
      return res.status(400).json({ msg: "Name and description are required" });
    }

    const [existing] = await pool.query("SELECT * FROM departments WHERE name = ?", [name]);
    if (existing.length > 0) {
      return res.status(409).json({ msg: "Department with same name already exists" });
    }

    await pool.query(
      "INSERT INTO departments (name, description, budget, head_user_id) VALUES (?, ?, ?, ?)",
      [name, description, budget || 0.0, head_user_id || null]
    );

    res.status(201).json({ msg: "Department created successfully" });
  } catch (err) {
    console.error("Error creating department:", err);
    res.status(500).json({ msg: "Internal server error" });
  }
}

// ✅ UPDATE DEPARTMENT
export async function updateDepartment(req, res) {
  try {
    const { department_id } = req.params;
    const { name, description, budget, head_user_id } = req.body;

    if (!department_id) return res.status(400).json({ msg: "Department ID required" });

    const [existing] = await pool.query("SELECT * FROM departments WHERE department_id = ?", [department_id]);
    if (existing.length === 0) return res.status(404).json({ msg: "Department not found" });

    await pool.query(
      "UPDATE departments SET name = ?, description = ?, budget = ?, head_user_id = ? WHERE department_id = ?",
      [name, description, budget, head_user_id, department_id]
    );

    res.status(200).json({ msg: "Department updated successfully" });
  } catch (err) {
    console.error("Error updating department:", err);
    res.status(500).json({ msg: "Internal server error" });
  }
}

// ✅ DELETE DEPARTMENT
export async function deleteDepartment(req, res) {
  try {
    const { department_id } = req.params;

    const [existing] = await pool.query("SELECT * FROM departments WHERE department_id = ?", [department_id]);
    if (existing.length === 0)
      return res.status(404).json({ msg: "Department not found" });

    await pool.query("DELETE FROM departments WHERE department_id = ?", [department_id]);

    res.status(200).json({ msg: "Department deleted successfully" });
  } catch (err) {
    console.error("Error deleting department:", err);
    res.status(500).json({ msg: "Internal server error" });
  }
}
