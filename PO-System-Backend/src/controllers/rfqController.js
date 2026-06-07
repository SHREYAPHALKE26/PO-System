// src/controllers/rfqController.js
import pool from "../db.js";
import { notifyUsers } from "../utils/notificationService.js";
import { logAuditFromReq } from "../utils/auditLogger.js";
import { sendNewReqEmail } from "./emailSender.js";

/**
 * 🔍 Helper: get all Approver user_ids for a department
 * - Adjust table/column names if your roles table differs
 */
async function getDepartmentApproverIds(department_id) {
  // This assumes:
  //  - user_role(user_id, role_id)
  //  - roles(role_id, role_name) with "Approver"
  //  - users has department_id + deleted_at
  const [rows] = await pool.query(
    `
    SELECT ur.user_id
    FROM user_role ur
    JOIN roles r ON ur.role_id = r.role_id
    JOIN users u ON ur.user_id = u.user_id
    WHERE r.name = 'Approver'
      AND u.deleted_at IS NULL
      AND (
        u.department_id = ?        -- approver for this department
        OR u.department_id IS NULL -- or global approver
      )
    `,
    [department_id]
  );

  return rows.map((r) => r.user_id);
}

// ✅ Create RFQ + items
export async function createRFQ(req, res) {
  const conn = await pool.getConnection();
  try {
    const { title, description, department_id, items } = req.body;
    const created_by = req.user.id; // JWT decoded user_id

    if (!title || !department_id || !items || items.length === 0) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    await conn.beginTransaction();

    const [rfqResult] = await conn.query(
      `INSERT INTO rfqs (title, description, department_id, created_by)
       VALUES (?, ?, ?, ?)` ,
      [title, description, department_id, created_by]
    );

    const rfq_id = rfqResult.insertId;

    const itemValues = items.map((i) => [
      rfq_id,
      i.item_name,
      i.quantity,
      i.est_unit_price || null,
    ]);
    await conn.query(
      `INSERT INTO rfq_items (rfq_id, item_name, quantity, est_unit_price)
       VALUES ?`,
      [itemValues]
    );

    await conn.commit();

    // 🧾 1) Audit log
    await logAuditFromReq(req, {
      action: "RFQ_CREATED",
      entityType: "RFQ",
      entityId: rfq_id,
      details: { title, department_id },
    });

    // 👨‍⚖️ 2) Find all approvers for this department
    const approverIds = await getDepartmentApproverIds(department_id);

    if (approverIds.length > 0) {
      // 🔔 3) In-app notifications (notifications table)
      await notifyUsers(approverIds, {
        title: "New RFQ Awaiting Approval",
        message: `RFQ "${title}" is pending your approval.`,
        type: "info",
        link: `/approver/rfqs/${rfq_id}`, // your frontend route for approver view
      });

      // 📧 4) Email notifications to same approvers
      //    Send email for each approver
      for (const approverId of approverIds) {
        try {
          await sendNewReqEmail(rfq_id, approverId);
        } catch (emailErr) {
          console.error(`Failed to send email to approver ${approverId}:`, emailErr);
          // Continue with other approvers even if one fails
        }
      }
    }

    res.status(201).json({ msg: "RFQ created successfully", rfq_id });
  } catch (err) {
    await conn.rollback();
    console.error("Error creating RFQ:", err);
    res.status(500).json({ msg: "Internal server error" });
  } finally {
    conn.release();
  }
}

// ✅ Get all RFQs (Admin/Officer or own RFQs)
export async function getAllRFQs(req, res) {
  try {
    const userId = req.user.id;     // from JWT
    const userRole = req.user.role; // from JWT

    let query = `
      SELECT r.*, d.name AS department_name, u.username AS created_by_name
      FROM rfqs r
      JOIN departments d ON r.department_id = d.department_id
      JOIN users u ON r.created_by = u.user_id
    `;

    const params = [];

    // 🔐 Restrict non-admins & non-officers to their own RFQs
    if (userRole !== "Admin" && userRole !== "Officer") {
      query += ` WHERE r.created_by = ? `;
      params.push(userId);
    }

    query += ` ORDER BY r.created_at DESC `;

    const [rows] = await pool.query(query, params);
    res.status(200).json(rows);
  } catch (err) {
    console.error("Error fetching RFQs:", err);
    res.status(500).json({ msg: "Internal server error" });
  }
}

// ✅ Get single RFQ + its items
export async function getRFQById(req, res) {
  try {
    const { rfq_id } = req.params;
    const [[rfq]] = await pool.query(
      `SELECT * FROM rfqs WHERE rfq_id = ?`,
      [rfq_id]
    );
    if (!rfq) return res.status(404).json({ msg: "RFQ not found" });

    const [items] = await pool.query(
      `SELECT * FROM rfq_items WHERE rfq_id = ?`,
      [rfq_id]
    );
    rfq.items = items;

    res.status(200).json(rfq);
  } catch (err) {
    console.error("Error fetching RFQ:", err);
    res.status(500).json({ msg: "Internal server error" });
  }
}

// ✏️ Update RFQ (only when status = Open)
export async function updateRFQ(req, res) {
  try {
    const { rfq_id } = req.params;
    const { title, description, status, items } = req.body;

    const [existing] = await pool.query(
      "SELECT * FROM rfqs WHERE rfq_id = ?",
      [rfq_id]
    );
    if (existing.length === 0) {
      return res.status(404).json({ msg: `RFQ with ID ${rfq_id} not found` });
    }

    const rfq = existing[0];

    // Only Open RFQs can be edited
    if (rfq.status !== "Open") {
      return res.status(400).json({
        msg: `RFQ with ID ${rfq_id} is ${rfq.status} and cannot be modified.`,
      });
    }

    await pool.query(
      "UPDATE rfqs SET title = ?, description = ?, status = ? WHERE rfq_id = ?",
      [title || rfq.title, description || rfq.description, status || rfq.status, rfq_id]
    );

    if (items && Array.isArray(items)) {
      await pool.query("DELETE FROM rfq_items WHERE rfq_id = ?", [rfq_id]);

      const formattedItems = items.map((i) => [
        rfq_id,
        i.item_name,
        i.quantity,
        i.est_unit_price || 0.0,
      ]);

      if (formattedItems.length > 0) {
        await pool.query(
          "INSERT INTO rfq_items (rfq_id, item_name, quantity, est_unit_price) VALUES ?",
          [formattedItems]
        );
      }
    }

    res.status(200).json({ msg: `RFQ with ID ${rfq_id} updated successfully` });
  } catch (err) {
    console.error("Error updating RFQ:", err);
    res.status(500).json({ msg: "Internal server error" });
  }
}

// 🗑️ Delete RFQ (only when status = Open)
export async function deleteRFQ(req, res) {
  try {
    const { rfq_id } = req.params;

    const [existing] = await pool.query(
      "SELECT * FROM rfqs WHERE rfq_id = ?",
      [rfq_id]
    );
    if (existing.length === 0) {
      return res.status(404).json({ msg: `RFQ with ID ${rfq_id} not found` });
    }

    const rfq = existing[0];

    if (rfq.status !== "Open") {
      return res.status(400).json({
        msg: `Cannot delete RFQ ID ${rfq_id} — status is ${rfq.status}`,
      });
    }

    await pool.query("DELETE FROM rfqs WHERE rfq_id = ?", [rfq_id]);
    res.status(200).json({ msg: `RFQ ID ${rfq_id} deleted successfully` });
  } catch (err) {
    console.error("Error deleting RFQ:", err);
    res.status(500).json({ msg: "Internal server error" });
  }
}
