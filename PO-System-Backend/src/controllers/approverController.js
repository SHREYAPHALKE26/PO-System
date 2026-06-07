import pool from "../db.js";
import { notifyUsers } from "../utils/notificationService.js";
import { logAuditFromReq } from "../utils/auditLogger.js";

/**
 * Helper: Get user's department
 */
async function getUserDept(userId) {
  const [[user]] = await pool.query(
    `SELECT u.department_id, r.name 
     FROM users u
     JOIN user_role ur ON u.user_id = ur.user_id
     JOIN roles r ON ur.role_id = r.role_id
     WHERE u.user_id = ?`,
    [userId]
  );
  return user;
}


/**
 * FETCH PENDING RFQs
 * - Admin sees all departments
 * - Approver sees only their department
 * - We fetch RFQs with status 'Open' OR 'Pending' so pending-like RFQs are shown
 */
export async function getPendingRFQs(req, res) {
  try {
    const userId = req.user.id;
    const user = await getUserDept(userId);
    if (!user) return res.status(404).json({ msg: "User not found" });

    const isAdmin = user.name === "Admin";
    const deptId = user.department_id;

    // Budget info (only for approvers)
    let departmentInfo = null;
    if (!isAdmin) {
      const [[dept]] = await pool.query(
        `SELECT name, budget FROM departments WHERE department_id = ?`,
        [deptId]
      );
      const [[used]] = await pool.query(
        `SELECT COALESCE(SUM(amount),0) AS used FROM budget_usage WHERE department_id = ?`,
        [deptId]
      );

      departmentInfo = {
        department_name: dept.name,
        budget: dept.budget,
        used: used.used,
        remaining: dept.budget - used.used,
      };
    }

    // Build parameterized query
    const statuses = ['Open', 'Pending']; // don't change enums, only fetching both possible pending labels
    let sql = `
      SELECT 
        r.*, 
        d.name AS department_name,
        u.username AS requestor_name
      FROM rfqs r
      JOIN users u ON r.created_by = u.user_id
      JOIN departments d ON u.department_id = d.department_id
      WHERE r.status IN (?, ?)
    `;
    const params = [...statuses];

    if (!isAdmin) {
      sql += ` AND u.department_id = ?`;
      params.push(deptId);
    }

    sql += ` ORDER BY r.created_at DESC`;

    const [rfqs] = await pool.query(sql, params);

    res.json({
      isAdmin,
      departmentInfo,
      rfqs,
    });
  } catch (err) {
    console.error("Error fetching pending RFQs:", err);
    res.status(500).json({ msg: "Server error" });
  }
}

/**
 * APPROVE / REJECT RFQ
 * (kept same, but ensure parameterization for safety)
 */
export async function approveOrRejectRFQ(req, res) {
  try {
    const { rfq_id } = req.params;
    const approverId = req.user.id;
    const { decision, comments } = req.body;

    if (!["Approved", "Rejected"].includes(decision))
      return res.status(400).json({ msg: "Invalid decision" });

    // Get RFQ info
    const [[rfq]] = await pool.query(
      `SELECT rfq_id, department_id FROM rfqs WHERE rfq_id = ?`,
      [rfq_id]
    );

    if (!rfq) return res.status(404).json({ msg: "RFQ not found" });

    // Update RFQ status
    await pool.query(
      `UPDATE rfqs SET status = ? WHERE rfq_id = ?`,
      [decision, rfq_id]
    );

    // Insert approval log
    await pool.query(
      `INSERT INTO rfq_approvals (rfq_id, approver_id, decision, comments, decided_at)
       VALUES (?, ?, ?, ?, NOW())`,
      [rfq_id, approverId, decision, comments || null]
    );

    // If approved → update budget_usage (calculate from purchase_orders)
    if (decision === "Approved") {
      const [[costTotal]] = await pool.query(
        `SELECT COALESCE(SUM(total_amount),0) AS amount FROM purchase_orders WHERE rfq_id = ?`,
        [rfq_id]
      );

      await pool.query(
        `INSERT INTO budget_usage (department_id, rfq_id, amount) VALUES (?, ?, ?)`,
        [rfq.department_id, rfq_id, costTotal.amount]
      );


      await logAuditFromReq(req, {
        action: "RFQ_APPROVED",
        entityType: "RFQ",
        entityId: rfq_id,
        details: {}
      });

      // Notify requestor about approval
      await notifyUsers([rfq.created_by], {
        title: "RFQ Approved",
        message: `Your RFQ "${rfq.title}" has been approved.`,
        type: "success",
        link: `/rfq/${rfq_id}`
      });

      // Get all purchasing officers and notify them about vendor assignment
      const [purchasingOfficers] = await pool.query(
        `SELECT DISTINCT ur.user_id
         FROM user_role ur
         JOIN roles r ON ur.role_id = r.role_id
         JOIN users u ON ur.user_id = u.user_id
         WHERE r.name = 'PurchasingOfficer'
           AND u.deleted_at IS NULL`
      );

      const officerIds = purchasingOfficers.map((o) => o.user_id);
      if (officerIds.length > 0) {
        await notifyUsers(officerIds, {
          title: "Ready to Assign Vendor to RFQ",
          message: `RFQ "${rfq.title}" is approved and ready for vendor assignment.`,
          type: "info",
          link: `/officer/assignedVendor?rfq_id=${rfq_id}`
        });
      }
    }

    res.json({ msg: `RFQ ${rfq_id} ${decision} successfully.` });
  } catch (err) {
    console.error("Error approving RFQ:", err);
    res.status(500).json({ msg: "Server error" });
  }
}

/**
 * FETCH APPROVED RFQs
 * - Admin sees all departments
 * - Approver sees only their department
 * - Using parameterized query
 */
export async function getApprovedRFQs(req, res) {
  try {
    const userId = req.user.id;
    const user = await getUserDept(userId);
    if (!user) return res.status(404).json({ msg: "User not found" });

    const isAdmin = user.name === "Admin";
    const deptId = user.department_id;

    const sql = `
      SELECT 
        r.*, 
        d.name AS department_name,
        u.username AS requestor_name
      FROM rfqs r
      JOIN users u ON r.created_by = u.user_id
      JOIN departments d ON u.department_id = d.department_id
      WHERE r.status IN ('Approved', 'Closed')
      ${isAdmin ? '' : 'AND u.department_id = ?'}
      ORDER BY r.created_at DESC
    `;

    const params = isAdmin ? [] : [deptId];
    const [rows] = await pool.query(sql, params);

    res.json(rows);
  } catch (err) {
    console.error("Error fetching approved RFQs:", err);
    res.status(500).json({ msg: "Server error" });
  }
}


export async function getRFQItemsForApprover(req, res) {
  try {
    const { rfq_id } = req.params;

    if (!rfq_id) {
      return res.status(400).json({ msg: "rfq_id is required" });
    }

    const [items] = await pool.query(
      `
      SELECT 
        item_name,
        quantity,
        est_unit_price
      FROM rfq_items
      WHERE rfq_id = ?
      ORDER BY item_name ASC
      `,
      [rfq_id]
    );

    res.status(200).json(items);
  } catch (err) {
    console.error("Error fetching RFQ items for approver:", err);
    res.status(500).json({ msg: "Server error" });
  }
}
// /**
//  * --------------------------------------------
//  * 1️⃣ FETCH PENDING RFQs
//  * --------------------------------------------
//  * - Requestor RFQs should always use their department_id
//  * - Approver sees only their own department
//  * - Admin sees ALL departments
// */
// export async function getPendingRFQs(req, res) {
//   try {
//     const userId = req.user.id;
    
//     const user = await getUserDept(userId);
//     if (!user) return res.status(404).json({ msg: "User not found" });
    
//     // console.log(user);
//     const isAdmin = user.name === "Admin";
//     const deptId = user.department_id;

//     // Department filter logic
//     const deptFilter = isAdmin ? "" : `AND u.department_id = ${deptId}`;

//     // Budget: Only relevant for approver
//     let departmentInfo = null;

//     if (!isAdmin) {
//       // Get department info
//       const [[dept]] = await pool.query(
//         `SELECT name, budget FROM departments WHERE department_id = ?`,
//         [deptId]
//       );

//       // Get used budget from tracking table
//       const [[used]] = await pool.query(
//         `SELECT COALESCE(SUM(amount),0) AS used 
//          FROM budget_usage WHERE department_id = ?`,
//         [deptId]
//       );

//       departmentInfo = {
//         department_name: dept.name,
//         budget: dept.budget,
//         used: used.used,
//         remaining: dept.budget - used.used,
//       };
//     }

//     const [rfqs] = await pool.query(
//       `
//       SELECT 
//         r.*, 
//         d.name AS department_name,
//         u.username AS requestor_name
//       FROM rfqs r
//       JOIN users u ON r.created_by = u.user_id
//       JOIN departments d ON u.department_id = d.department_id
//       WHERE r.status = 'Open'
//       ${deptFilter}
//       ORDER BY r.created_at DESC
//       `
//     );

//     res.json({
//       isAdmin,
//       departmentInfo,
//       rfqs,
//     });

//   } catch (err) {
//     console.error("Error fetching pending RFQs:", err);
//     res.status(500).json({ msg: "Server error" });
//   }
// }



// /**
//  * --------------------------------------------
//  * 2️⃣ APPROVE / REJECT RFQ
//  * --------------------------------------------
//  * Approve → Insert into budget_usage
//  */
// export async function approveOrRejectRFQ(req, res) {
//   try {
//     const { rfq_id } = req.params;
//     const approverId = req.user.id;
//     const { decision, comments } = req.body;

//     if (!["Approved", "Rejected"].includes(decision))
//       return res.status(400).json({ msg: "Invalid decision" });

//     // Get RFQ info
//     const [[rfq]] = await pool.query(
//       `SELECT rfq_id, department_id FROM rfqs WHERE rfq_id = ?`,
//       [rfq_id]
//     );

//     if (!rfq) return res.status(404).json({ msg: "RFQ not found" });

//     // Update RFQ status
//     await pool.query(
//       `UPDATE rfqs SET status = ? WHERE rfq_id = ?`,
//       [decision, rfq_id]
//     );

//     // Insert approval log
//     await pool.query(
//       `
//       INSERT INTO rfq_approvals (rfq_id, approver_id, decision, comments, decided_at)
//       VALUES (?, ?, ?, ?, NOW())
//       `,
//       [rfq_id, approverId, decision, comments || null]
//     );

//     // If approved → update budget_usage
//     if (decision === "Approved") {
//   const [[costTotal]] = await pool.query(
//     `SELECT COALESCE(SUM(total_amount),0) AS amount 
//      FROM purchase_orders WHERE rfq_id = ?`,
//     [rfq_id]
//   );

//   await pool.query(
//     `INSERT INTO budget_usage (department_id, rfq_id, amount) VALUES (?, ?, ?)`,
//     [rfq.department_id, rfq_id, costTotal.amount]
//   );
// }


//     res.json({ msg: `RFQ ${rfq_id} ${decision} successfully.` });

//   } catch (err) {
//     console.error("Error approving RFQ:", err);
//     res.status(500).json({ msg: "Server error" });
//   }
// }



// /**
//  * --------------------------------------------
//  * 3️⃣ FETCH APPROVED RFQs
//  * --------------------------------------------
//  * Admin → sees all
//  * Approver → only their department
//  */
// export async function getApprovedRFQs(req, res) {
//   try {
//     const userId = req.user.id;
//     const user = await getUserDept(userId);

//     if (!user) return res.status(404).json({ msg: "User not found" });

//     const isAdmin = user.name === "Admin";
//     const deptId = user.department_id;

//     const deptFilter = isAdmin ? "" : `AND u.department_id = ${deptId}`;

//     const [rows] = await pool.query(
//       `
//       SELECT 
//         r.*, 
//         d.name AS department_name,
//         u.username AS requestor_name
//       FROM rfqs r
//       JOIN users u ON r.created_by = u.user_id
//       JOIN departments d ON u.department_id = d.department_id
//       WHERE r.status IN ('Approved', 'Closed')   -- 🔴 changed line
//       ${deptFilter}
//       ORDER BY r.created_at DESC
//       `
//     );

//     res.json(rows);

//   } catch (err) {
//     console.error("Error fetching approved RFQs:", err);
//     res.status(500).json({ msg: "Server error" });
//   }
// }






// ⬇️ NEW: Get RFQ items for a given RFQ (for approver view)


