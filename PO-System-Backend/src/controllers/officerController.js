import pool from "../db.js";
import { notifyUsers } from "../utils/notificationService.js";
import { logAuditFromReq } from "../utils/auditLogger.js";




// export async function getApprovedRFQs(req, res) {
//   try {
//     const [rows] = await pool.query(`
//       SELECT 
//         r.rfq_id, r.title, r.description, r.status, r.created_at,
//         d.name AS department_name,
//         u.username AS requestor_name
//       FROM rfqs r
//       JOIN departments d ON r.department_id = d.department_id
//       JOIN users u ON r.created_by = u.user_id
//       WHERE r.status = 'Approved'
//       ORDER BY r.created_at DESC
//     `);

//     res.status(200).json(rows);
//   } catch (err) {
//     console.error("Error fetching approved RFQs:", err);
//     res.status(500).json({ msg: "Internal server error" });
//   }
// }

export async function getApprovedRFQs(req, res) {
  try {
    const [rows] = await pool.query(`
      SELECT r.rfq_id, r.title, r.description, r.department_id, r.created_at
      FROM rfqs r
      WHERE r.status = 'Approved'
      AND NOT EXISTS (
        SELECT 1 FROM rfq_vendors rv
        WHERE rv.rfq_id = r.rfq_id
      )
      ORDER BY r.created_at DESC
    `);

    res.status(200).json(rows);
  } catch (err) {
    console.error("Error fetching approved RFQs:", err);
    res.status(500).json({ msg: "Internal server error" });
  }
}

//  📜 Fetch quotations submitted for a given RFQ

export async function getQuotationsForRFQ(req, res) {
  try {
    const { rfq_id } = req.params;

    const [quotes] = await pool.query(
      `
      SELECT 
        q.quote_id,
        v.name AS vendor_name,
        v.email,
        q.total_price,
        q.expected_delivery_days,
        q.status,
        q.submitted_at
      FROM rfq_quotes q
      JOIN vendor v ON q.vendor_id = v.vendor_id
      WHERE q.rfq_id = ?
      ORDER BY q.submitted_at DESC
    `,
      [rfq_id]
    );

    res.status(200).json(quotes);
  } catch (err) {
    console.error("Error fetching quotations:", err);
    res.status(500).json({ msg: "Internal server error" });
  }
}




// export async function approveQuotation(req, res) {
//   const conn = await pool.getConnection();
//   try {
//     const { quote_id } = req.params;

//     // Fetch selected quotation details
//     const [[quote]] = await conn.query(`
//       SELECT q.*, v.vendor_id, r.rfq_id
//       FROM rfq_quotes q
//       JOIN vendor v ON q.vendor_id = v.vendor_id
//       JOIN rfqs r ON q.rfq_id = r.rfq_id
//       WHERE q.quote_id = ?
//     `, [quote_id]);

//     if (!quote) {
//       return res.status(404).json({ msg: "Quotation not found" });
//     }

//     await conn.beginTransaction();

//     // 1️⃣ Mark this quotation as Accepted
//     await conn.query(
//       `UPDATE rfq_quotes SET status='Accepted' WHERE quote_id=?`,
//       [quote_id]
//     );

//     // 2️⃣ Reject other quotations for the same RFQ
//     await conn.query(
//       `UPDATE rfq_quotes SET status='Rejected' WHERE rfq_id=? AND quote_id<>?`,
//       [quote.rfq_id, quote_id]
//     );

//     // 3️⃣ Create PO entry
//     const po_number = `PO-${Date.now()}`;
//     const [poResult] = await conn.query(
//       `INSERT INTO purchase_orders (rfq_id, quote_id, vendor_id, po_number, total_amount, status)
//        VALUES (?, ?, ?, ?, ?, 'Approved')`,
//       [quote.rfq_id, quote_id, quote.vendor_id, po_number, quote.total_price]
//     );
//     const po_id = poResult.insertId;

//     // 4️⃣ Add PO items from quotation
//     const [quoteItems] = await conn.query(
//       `SELECT item_name, quantity, quoted_unit_price FROM rfq_quote_items WHERE quote_id=?`,
//       [quote_id]
//     );

//     if (quoteItems.length > 0) {
//       const poItems = quoteItems.map((i) => [
//         po_id,
//         i.item_name,
//         i.quantity,
//         i.quoted_unit_price,
//       ]);

//       await conn.query(
//         `INSERT INTO po_items (po_id, item_name, quantity, unit_price) VALUES ?`,
//         [poItems]
//       );
//     }

//     // 5️⃣ Update RFQ status to Closed
//     await conn.query(
//       `UPDATE rfqs SET status='Closed' WHERE rfq_id=?`,
//       [quote.rfq_id]
//     );

//     await conn.commit();

//     res.status(201).json({
//       msg: "Quotation approved and Purchase Order generated successfully",
//       po_number,
//     });
//   } catch (err) {
//     await conn.rollback();
//     console.error("Error approving quotation:", err);
//     res.status(500).json({ msg: "Internal server error" });
//   } finally {
//     conn.release();
//   }
// }

export async function approveQuotation(req, res) {
  const conn = await pool.getConnection();
  try {
    const { quote_id } = req.params;

    const [[quote]] = await conn.query(
      `
      SELECT q.*, r.rfq_id, q.vendor_id,r.department_id

      FROM rfq_quotes q
      JOIN rfqs r ON q.rfq_id = r.rfq_id
      WHERE q.quote_id = ?
      `,
      [quote_id]
    );

    if (!quote) {
      return res.status(404).json({ msg: "Quotation not found" });
    }

    await conn.beginTransaction();

    // 1️⃣ Mark this quotation as Accepted
    await conn.query(
      `UPDATE rfq_quotes SET status = 'Accepted' WHERE quote_id = ?`,
      [quote_id]
    );

    // 2️⃣ Reject other quotations for same RFQ
    await conn.query(
      `UPDATE rfq_quotes SET status = 'Rejected' WHERE rfq_id = ? AND quote_id <> ?`,
      [quote.rfq_id, quote_id]
    );

    // 3️⃣ Create PO
    const po_number = `PO-${Date.now()}`;
    const [poResult] = await conn.query(
      `
      INSERT INTO purchase_orders (rfq_id, quote_id, vendor_id, po_number, total_amount, status)
      VALUES (?, ?, ?, ?, ?, 'Approved')
      `,
      [quote.rfq_id, quote_id, quote.vendor_id, po_number, quote.total_price]
    );
    const po_id = poResult.insertId;

    // 4️⃣ Insert PO items
    const [quoteItems] = await conn.query(
      `
      SELECT item_name, quantity, quoted_unit_price
      FROM rfq_quote_items
      WHERE quote_id = ?
      `,
      [quote_id]
    );

    if (quoteItems.length > 0) {
      const poItems = quoteItems.map((i) => [
        po_id,
        i.item_name,
        i.quantity,
        i.quoted_unit_price,
      ]);

      await conn.query(
        `INSERT INTO po_items (po_id, item_name, quantity, unit_price) VALUES ?`,
        [poItems]
      );
    }

    // 5️⃣ Final RFQ status → Closed
    await conn.query(
      `UPDATE rfqs SET status = 'Closed' WHERE rfq_id = ?`,
      [quote.rfq_id]
    );

    const amount = Number(quote.total_price || 0);

    if (!isNaN(amount) && amount > 0) {
      await conn.query(
        `
        INSERT INTO budget_usage (department_id, rfq_id, amount)
        VALUES (?, ?, ?)
        `,
        [quote.department_id, quote.rfq_id, amount]
      );
    }

    await conn.commit();

    //notification 
    const [[rfqRow]] = await conn.query(
      `SELECT title, created_by FROM rfqs WHERE rfq_id = ?`,
      [quote.rfq_id]
    );

    await notifyUsers(
      [rfqRow.created_by],
      {
        title: "Purchase Order Generated",
        message: `Your RFQ "${rfqRow.title}" has been converted into PO ${po_number}.`,
        type: "success",
        link: `/purchase-orders`, // or `/purchase-orders/${po_id}` once you have detail page
      }
    );

   



    await logAuditFromReq(req, {
      action: "PO_GENERATED",
      entityType: "PO",
      entityId: po_id,
      details: {
        po_number,
        quote_id,
        rfq_id: quote.rfq_id,
        vendor_id: quote.vendor_id,
        total_amount: quote.total_price,
      },
    });

    res.status(201).json({
      msg: "Quotation approved and Purchase Order generated successfully",
      po_number,
      po_id,
    });
  } catch (err) {
    await conn.rollback();
    console.error("Error approving quotation:", err);
    res.status(500).json({ msg: "Internal server error" });
  } finally {
    conn.release();
  }
}




export async function getAllSubmittedQuotations(req, res) {
  try {
    const [rows] = await pool.query(`
      SELECT 
        r.rfq_id,
        r.title,
        d.name AS department_name,
        q.quote_id,
        q.vendor_id,
        v.name AS vendor_name,
        q.total_price,
        q.expected_delivery_days,
        q.status,
        q.submitted_at
      FROM rfqs r
      JOIN departments d ON r.department_id = d.department_id
      JOIN rfq_quotes q ON q.rfq_id = r.rfq_id
      JOIN vendor v ON q.vendor_id = v.vendor_id
      WHERE q.status = 'Submitted'
      ORDER BY r.rfq_id, q.submitted_at DESC
    `);

    // 🔄 Group quotations by RFQ
    const grouped = {};

    rows.forEach((row) => {
      if (!grouped[row.rfq_id]) {
        grouped[row.rfq_id] = {
          rfq_id: row.rfq_id,
          title: row.title,
          department_name: row.department_name,
          quotations: []
        };
      }

      grouped[row.rfq_id].quotations.push({
        quote_id: row.quote_id,
        vendor_id: row.vendor_id,
        vendor_name: row.vendor_name,
        total_price: row.total_price,
        expected_delivery_days: row.expected_delivery_days,
        status: row.status,
        submitted_at: row.submitted_at
      });
    });

    res.status(200).json(Object.values(grouped));
  } catch (err) {
    console.error("Error fetching grouped quotations:", err);
    res.status(500).json({ msg: "Internal server error" });
  }
}

export async function getQuotationItems(req, res) {
  try {
    const { quote_id } = req.params;

    if (!quote_id) {
      return res.status(400).json({ msg: "quote_id is required" });
    }

    const [items] = await pool.query(
      `
      SELECT 
        item_name,
        quantity,
        quoted_unit_price
      FROM rfq_quote_items
      WHERE quote_id = ?
      ORDER BY item_name ASC
      `,
      [quote_id]
    );

    res.status(200).json(items);
  } catch (err) {
    console.error("Error fetching quotation items:", err);
    res.status(500).json({ msg: "Internal server error" });
  }
}


export async function getRFQItems(req, res) {
  try {
    const { rfq_id } = req.params;

    if (!rfq_id) {
      return res.status(400).json({ msg: "RFQ ID is required" });
    }

    const [items] = await pool.query(
      `SELECT item_name, quantity, est_unit_price 
       FROM rfq_items 
       WHERE rfq_id = ? 
       ORDER BY rfq_item_id ASC`,
      [rfq_id]
    );

    res.status(200).json(items);
  } catch (err) {
    console.error("Error fetching RFQ items:", err);
    res.status(500).json({ msg: "Internal server error" });
  }
}

