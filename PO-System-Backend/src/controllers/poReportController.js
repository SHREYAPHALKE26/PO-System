import pool from "../db.js";

// 🔹 1. Get all POs with vendor, RFQ, quote info
export async function getAllPOs(req, res) {
  try {
    const [rows] = await pool.query(`
      SELECT 
        po.po_id,
        po.po_number,
        po.total_amount,
        po.status,
        po.created_at,
        v.vendor_id,
        v.name AS vendor_name,
        v.email AS vendor_email,
        r.rfq_id,
        r.title AS rfq_title
      FROM purchase_orders po
      JOIN vendor v ON po.vendor_id = v.vendor_id
      JOIN rfqs r ON po.rfq_id = r.rfq_id
      ORDER BY po.created_at DESC
    `);

    res.status(200).json(rows);
  } catch (err) {
    console.error("Error fetching POs:", err);
    res.status(500).json({ msg: "Internal server error" });
  }
}

// 🔹 2. Get PO details + item list
export async function getPODetails(req, res) {
  try {
    const { po_id } = req.params;

    // Basic PO details
    const [[po]] = await pool.query(`
      SELECT 
        po.*,
        v.name AS vendor_name,
        v.email AS vendor_email,
        r.title AS rfq_title
      FROM purchase_orders po
      JOIN vendor v ON po.vendor_id = v.vendor_id
      JOIN rfqs r ON po.rfq_id = r.rfq_id
      WHERE po.po_id = ?
    `, [po_id]);

    if (!po)
      return res.status(404).json({ msg: "PO not found" });

    // Item details
    const [items] = await pool.query(`
      SELECT item_name, quantity, unit_price, subtotal
      FROM po_items
      WHERE po_id = ?
    `, [po_id]);

    po.items = items;

    res.status(200).json(po);
  } catch (err) {
    console.error("Error fetching PO details:", err);
    res.status(500).json({ msg: "Internal server error" });
  }
}
