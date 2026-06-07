// src/controllers/poPdfController.js
import PDFDocument from "pdfkit";
import pool from "../db.js";

/**
 * Vendor downloads PO PDF
 * Route: GET /vendor/po/:po_id/pdf
 * Auth: vendorAuth (req.vendor.id)
 */
export async function downloadVendorPO(req, res) {
  const vendorId = req.vendor?.id;
  const { po_id } = req.params;

  if (!vendorId) {
    return res.status(403).json({ msg: "Vendor not authenticated" });
  }

  if (!po_id) {
    return res.status(400).json({ msg: "PO ID is required" });
  }

  try {
    // 1️⃣ Fetch PO + RFQ + Vendor + Department info
    const [[po]] = await pool.query(
      `
      SELECT 
        po.po_id,
        po.po_number,
        po.total_amount,
        po.status AS po_status,
        po.created_at,
        v.vendor_id,
        v.name AS vendor_name,
        v.email AS vendor_email,
        v.phoneno AS vendor_phone,
        r.rfq_id,
        r.title AS rfq_title,
        r.description AS rfq_description,
        d.name AS department_name
      FROM purchase_orders po
      JOIN vendor v ON po.vendor_id = v.vendor_id
      JOIN rfqs r ON po.rfq_id = r.rfq_id
      JOIN departments d ON r.department_id = d.department_id
      WHERE po.po_id = ? AND po.vendor_id = ?
      `,
      [po_id, vendorId]
    );

    if (!po) {
      return res.status(404).json({ msg: "Purchase Order not found for this vendor" });
    }

    // 2️⃣ Fetch PO items
    const [items] = await pool.query(
      `
      SELECT item_name, quantity, unit_price
      FROM po_items
      WHERE po_id = ?
      ORDER BY item_name ASC
      `,
      [po_id]
    );

    // 3️⃣ Set response headers for PDF
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="PO-${po.po_number || po.po_id}.pdf"`
    );

    // 4️⃣ Create PDF and stream to response
    const doc = new PDFDocument({ margin: 40 });
    doc.pipe(res);

    // ----- Header -----
    doc
      .fontSize(20)
      .text("PURCHASE ORDER", { align: "center" })
      .moveDown(0.5);

    doc
      .fontSize(12)
      .text(`PO Number: ${po.po_number || po.po_id}`, { align: "right" })
      .text(`PO Date: ${po.created_at ? new Date(po.created_at).toLocaleDateString() : "-"}`, {
        align: "right",
      })
      .moveDown(1);

    // ----- Buyer / Dept Info -----
    doc
      .fontSize(12)
      .text("Buyer Department:", { underline: true })
      .moveDown(0.3);
    doc.text(`Department: ${po.department_name}`);
    doc.moveDown(0.8);

    // ----- Vendor Info -----
    doc.text("Vendor:", { underline: true }).moveDown(0.3);
    doc.text(`Name: ${po.vendor_name}`);
    doc.text(`Email: ${po.vendor_email || "-"}`);
    doc.text(`Phone: ${po.vendor_phone || "-"}`);
    doc.moveDown(1);

    // ----- RFQ Info -----
    doc.text("Based on RFQ:", { underline: true }).moveDown(0.3);
    doc.text(`RFQ ID: ${po.rfq_id}`);
    doc.text(`Title: ${po.rfq_title}`);
    if (po.rfq_description) {
      doc.text(`Description: ${po.rfq_description}`, { width: 500 });
    }
    doc.moveDown(1.2);

    // ----- Items Table Header -----
    doc.fontSize(12).text("Items", { underline: true }).moveDown(0.3);

    const tableTop = doc.y;
    const colItemX = 40;
    const colQtyX = 300;
    const colPriceX = 360;
    const colTotalX = 450;

    doc
      .fontSize(11)
      .text("Item", colItemX, tableTop, { bold: true })
      .text("Qty", colQtyX, tableTop)
      .text("Unit Price", colPriceX, tableTop)
      .text("Total", colTotalX, tableTop);

    doc
      .moveTo(colItemX, tableTop + 14)
      .lineTo(560, tableTop + 14)
      .stroke();

    let y = tableTop + 20;

    let calculatedTotal = 0;

    if (items.length === 0) {
      doc.text("No items found for this PO.", colItemX, y);
      y += 20;
    } else {
      items.forEach((it) => {
        const qty = Number(it.quantity || 0);
        const unit = Number(it.unit_price || 0);
        const lineTotal = qty * unit;
        calculatedTotal += lineTotal;

        doc.text(it.item_name, colItemX, y, { width: 250 });
        doc.text(String(qty), colQtyX, y);
        doc.text(unit.toFixed(2), colPriceX, y);
        doc.text(lineTotal.toFixed(2), colTotalX, y);

        y += 18;
      });
    }

    doc.moveDown(1);

    // ----- Total Amount -----
    doc
      .fontSize(12)
      .text(
        `PO Total: ₹${Number(po.total_amount || calculatedTotal).toFixed(2)}`,
        { align: "right" }
      )
      .moveDown(1);

    // ----- Footer / Terms -----
    doc
      .fontSize(10)
      .text(
        "This Purchase Order is system-generated. Please verify details and contact the purchasing department for any discrepancies.",
        {
          align: "left",
        }
      );

    doc.end();
  } catch (err) {
    console.error("Error generating PO PDF:", err);
    if (!res.headersSent) {
      res.status(500).json({ msg: "Failed to generate PO PDF" });
    }
  }
}
