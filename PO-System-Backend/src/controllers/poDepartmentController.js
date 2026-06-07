// src/controllers/poDepartmentController.js
import pool from "../db.js";

/**
 * Helper: Get user role + department
 */
async function getUserRoleDept(userId) {
  const [[user]] = await pool.query(
    `SELECT 
        u.department_id, 
        r.name AS role
      FROM users u
      JOIN user_role ur ON u.user_id = ur.user_id
      JOIN roles r ON ur.role_id = r.role_id
      WHERE u.user_id = ?
      LIMIT 1`,
    [userId]
  );
  return user;
}

/**
 * -----------------------------------------------------------
 * 1️⃣ GET PURCHASE ORDERS FOR USER'S DEPARTMENT
 * -----------------------------------------------------------
 * Admin/PurchasingOfficer → ALL POs
 * Approver/Requestor      → POs for their department
 */
export async function getDepartmentPOs(req, res) {
  try {
    const userId = req.user.id;

    const user = await getUserRoleDept(userId);
    if (!user) return res.status(404).json({ msg: "User not found" });

    // 🆕 Change: Grant global access to both Admin and PurchasingOfficer
    const hasGlobalAccess = 
      user.role === "Admin" || user.role === "PurchasingOfficer";
      
    const deptId = user.department_id;

    let query = `
      SELECT 
        po.po_id,
        po.po_number,
        po.total_amount,
        po.status,
        po.created_at,
        r.rfq_id,
        r.title AS rfq_title,
        r.department_id,
        d.name AS department_name,
        v.name AS vendor_name
      FROM purchase_orders po
      JOIN rfqs r ON po.rfq_id = r.rfq_id
      JOIN departments d ON r.department_id = d.department_id
      JOIN vendor v ON po.vendor_id = v.vendor_id
    `;

    const params = [];

    if (!hasGlobalAccess) {
      // Filter by department only if the user does NOT have global access
      query += ` WHERE r.department_id = ?`;
      params.push(deptId);
    }

    query += ` ORDER BY po.created_at DESC`;

    const [rows] = await pool.query(query, params);

    res.json({
      hasGlobalAccess, // Renamed for clarity
      department_id: deptId,
      purchaseOrders: rows,
    });
  } catch (err) {
    console.error("Error fetching department POs:", err);
    res.status(500).json({ msg: "Server error" });
  }
}



/**
 * -----------------------------------------------------------
 * 2️⃣ GET DETAIL FOR A SPECIFIC PO (with items)
 * -----------------------------------------------------------
 * Admin/PurchasingOfficer → can see any PO
 * Approver/Requestor      → only POs of their department
 */
export async function getPODetailForUser(req, res) {
  try {
    const userId = req.user.id;
    const { po_id } = req.params;

    const user = await getUserRoleDept(userId);
    if (!user) return res.status(404).json({ msg: "User not found" });

    // 🆕 Change: Grant global access to both Admin and PurchasingOfficer
    const hasGlobalAccess = 
      user.role === "Admin" || user.role === "PurchasingOfficer";
      
    const deptId = user.department_id;

    // 🔹 Fetch PO header with RFQ, Department, Vendor, Requestor info
    const [[po]] = await pool.query(
      `
      SELECT 
        po.po_id,
        po.po_number,
        po.total_amount,
        po.status,
        po.created_at,
        po.rfq_id,
        r.title AS rfq_title,
        r.description AS rfq_description,
        r.department_id,
        d.name AS department_name,
        u.username AS requestor_name,
        u.email AS requestor_email,
        v.name AS vendor_name,
        v.email AS vendor_email
      FROM purchase_orders po
      JOIN rfqs r ON po.rfq_id = r.rfq_id
      JOIN departments d ON r.department_id = d.department_id
      JOIN users u ON r.created_by = u.user_id
      JOIN vendor v ON po.vendor_id = v.vendor_id
      WHERE po.po_id = ?
      `,
      [po_id]
    );

    if (!po) return res.status(404).json({ msg: "PO not found" });

    // 🔐 Access control: approver/requestor restricted to their department
    if (!hasGlobalAccess && po.department_id !== deptId) {
      return res.status(403).json({ msg: "Access denied for this PO" });
    }

    // 🔹 Fetch PO Items
    const [items] = await pool.query(
      `
      SELECT 
        po_item_id,
        item_name,
        quantity,
        unit_price,
        subtotal
      FROM po_items
      WHERE po_id = ?
      ORDER BY po_item_id ASC
      `,
      [po_id]
    );

    res.json({
      po,
      items,
    });
  } catch (err) {
    console.error("Error fetching PO detail:", err);
    res.status(500).json({ msg: "Server error" });
  }
}