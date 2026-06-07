import pool from "../db.js";
import { notifyUsers } from "../utils/notificationService.js";
import { logAuditFromReq } from "../utils/auditLogger.js";


// export async function assignVendors(req, res) {
//   const { rfq_id } = req.params;
//   const { vendor_ids } = req.body; // [1,2,3]

//   if (!rfq_id || !Array.isArray(vendor_ids)) {
//     return res.status(400).json({ msg: "rfq_id and vendor_ids[] are required" });
//   }

//   const conn = await pool.getConnection();
//   try {
//     await conn.beginTransaction();

//     // Remove previous assignments
//     await conn.query(
//       `DELETE FROM rfq_vendors WHERE rfq_id = ?`,
//       [rfq_id]
//     );

//     if (vendor_ids.length > 0) {
//       const rows = vendor_ids.map((vId) => [rfq_id, vId, "Assigned"]);
//       await conn.query(
//         `INSERT INTO rfq_vendors (rfq_id, vendor_id, status) VALUES ?`,
//         [rows]
//       );
//     }

//       await pool.query("UPDATE rfqs SET status = 'Open' WHERE rfq_id = ?", [rfq_id]);


//     await conn.commit();
//     res.json({ msg: "Vendors assigned successfully" });
//   } catch (err) {
//     await conn.rollback();
//     console.error("Error assigning vendors:", err);
//     res.status(500).json({ msg: "Internal server error" });
//   } finally {
//     conn.release();
//   }
// }


export async function assignVendors(req, res) {
  const { rfq_id } = req.params;
  const { vendor_ids } = req.body; // [1,2,3]

  if (!rfq_id || !Array.isArray(vendor_ids)) {
    return res.status(400).json({ msg: "rfq_id and vendor_ids[] are required" });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // ❌ Remove *all* previous assignments for this RFQ
    await conn.query(
      `DELETE FROM rfq_vendors WHERE rfq_id = ?`,
      [rfq_id]
    );

    // ✅ Re-insert fresh assignment list
    if (vendor_ids.length > 0) {
      const rows = vendor_ids.map((vId) => [rfq_id, vId, "Assigned"]);
      await conn.query(
        `INSERT INTO rfq_vendors (rfq_id, vendor_id, status) VALUES ?`,
        [rows]
      );
    }

    // ⛔ IMPORTANT: No change to rfqs.status here.
    // await pool.query("UPDATE rfqs SET status = 'Open' WHERE rfq_id = ?", [rfq_id]);

    await conn.commit();

    await logAuditFromReq(req, {
      action: "VENDORS_ASSIGNED",
      entityType: "RFQ",
      entityId: rfq_id,
      details: { vendor_ids }
    });

    // await notifyUsers(vendor_ids, {
    //   title: "You Received a New RFQ",
    //   message: `You have been invited to submit a quotation for RFQ #${rfq_id}.`,
    //   type: "info",
    //   link: `/vendor/rfq/${rfq_id}`
    // });

    res.json({ msg: "Vendors assigned successfully" });
  } catch (err) {
    await conn.rollback();
    console.error("Error assigning vendors:", err);
    res.status(500).json({ msg: "Internal server error" });
  } finally {
    conn.release();
  }
}

export async function getAssignedVendors(req, res) {
  try {
    const { rfq_id } = req.params;
    const [vendors] = await pool.query(
      `SELECT rv.id, rv.status, v.vendor_id, v.name, v.email
       FROM rfq_vendors rv
       JOIN vendor v ON rv.vendor_id = v.vendor_id
       WHERE rv.rfq_id = ?`,
      [rfq_id]
    );
    res.status(200).json(vendors);
  } catch (err) {
    console.error("Error fetching assigned vendors:", err);
    res.status(500).json({ msg: "Internal server error" });
  }
}

export async function getAllAssignments(req, res) {
  try {
    const [rows] = await pool.query(`
      SELECT 
        rv.id,
        rv.rfq_id,
        r.title AS rfq_title,
        rv.vendor_id,
        v.name AS vendor_name,
        v.email,
        rv.status,
        rv.created_at
      FROM rfq_vendors rv
      JOIN vendor v ON rv.vendor_id = v.vendor_id
      JOIN rfqs r ON rv.rfq_id = r.rfq_id
      ORDER BY rv.created_at DESC
    `);

    res.status(200).json(rows);
  } catch (err) {
    console.error("Error fetching all assignments:", err);
    res.status(500).json({ msg: "Internal server error" });
  }
}


// Get all vendors assigned to a specific RFQ
// export async function getAssignedVendors(req, res) {
//   try {
//     const { rfq_id } = req.params;
//     const [vendors] = await pool.query(
//       `SELECT rv.id, rv.status, v.vendor_id, v.name, v.email
//        FROM rfq_vendors rv
//        JOIN vendor v ON rv.vendor_id = v.vendor_id
//        WHERE rv.rfq_id = ?`,
//       [rfq_id]
//     );
//     res.status(200).json(vendors);
//   } catch (err) {
//     console.error("Error fetching assigned vendors:", err);
//     res.status(500).json({ msg: "Internal server error" });
//   }
// }
