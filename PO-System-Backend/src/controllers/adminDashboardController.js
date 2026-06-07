// src/controllers/adminDashboardController.js
import pool from "../db.js";

/**
 * GET /admin/dashboard
 * Only for Admin role
 * Returns:
 *  - overview stats
 *  - department-wise budget/performance
 *  - recent activity log
 */
export async function getAdminDashboard(req, res) {
  try {
    // ✅ Role check – only Admin can access
    if (!req.user?.roles || !req.user.roles.includes("Admin")) {
      return res.status(403).json({ msg: "Only Admin can view dashboard" });
    }

    // ─────────────────────────────────────────────
    // 1. OVERVIEW STATS
    // ─────────────────────────────────────────────
    const [
      [rfqStats],
      [vendorStats],
      [poStats],
      [budgetStats],
      [usedBudgetStats],
    ] = await Promise.all([
      // RFQ stats
      pool.query(`
        SELECT 
          COUNT(*) AS totalRFQs,
          SUM(status = 'Open')       AS openRFQs,
          SUM(status = 'Approved')   AS approvedRFQs,
          SUM(status = 'Closed')     AS closedRFQs,
          SUM(status = 'Cancelled')  AS cancelledRFQs
        FROM rfqs
      `).then(([rows]) => rows),

      // Vendor stats
      pool.query(`
        SELECT COUNT(*) AS totalVendors FROM vendor
      `).then(([rows]) => rows),

      // PO stats
      pool.query(`
        SELECT 
          COUNT(*) AS totalPOs,
          SUM(status = 'Pending')    AS pendingPOs,
          SUM(status = 'Approved')   AS approvedPOs,
          SUM(status = 'Completed')  AS completedPOs,
          SUM(status = 'Cancelled')  AS cancelledPOs,
          COALESCE(SUM(total_amount), 0) AS totalPOAmount
        FROM purchase_orders
      `).then(([rows]) => rows),

      // Total budget across all departments
      pool.query(`
        SELECT COALESCE(SUM(budget), 0) AS totalBudget
        FROM departments
      `).then(([rows]) => rows),

      // Budget used (from budget_usage, if you are tracking there)
      pool.query(`
        SELECT COALESCE(SUM(amount), 0) AS usedBudget
        FROM budget_usage
      `).then(([rows]) => rows),
    ]);

    const totalBudget = Number(budgetStats.totalBudget || 0);
    const usedBudget = Number(usedBudgetStats.usedBudget || 0);
    const remainingBudget = totalBudget - usedBudget;

    const overview = {
      totalRFQs: Number(rfqStats.totalRFQs || 0),
      openRFQs: Number(rfqStats.openRFQs || 0),
      approvedRFQs: Number(rfqStats.approvedRFQs || 0),
      closedRFQs: Number(rfqStats.closedRFQs || 0),
      cancelledRFQs: Number(rfqStats.cancelledRFQs || 0),

      totalVendors: Number(vendorStats.totalVendors || 0),

      totalPOs: Number(poStats.totalPOs || 0),
      pendingPOs: Number(poStats.pendingPOs || 0),
      approvedPOs: Number(poStats.approvedPOs || 0),
      completedPOs: Number(poStats.completedPOs || 0),
      cancelledPOs: Number(poStats.cancelledPOs || 0),
      totalPOAmount: Number(poStats.totalPOAmount || 0),

      totalBudget,
      usedBudget,
      remainingBudget,
    };

    // ─────────────────────────────────────────────
    // 2. DEPARTMENT PERFORMANCE
    // ─────────────────────────────────────────────
    const [deptRows] = await pool.query(`
      SELECT 
        d.department_id,
        d.name,
        d.budget,
        COALESCE(bu.used, 0) AS used,
        (d.budget - COALESCE(bu.used, 0)) AS remaining,
        COALESCE(rfqs.rfqCount, 0) AS rfqCount,
        COALESCE(pos.poCount, 0) AS poCount
      FROM departments d
      LEFT JOIN (
        SELECT department_id, SUM(amount) AS used
        FROM budget_usage
        GROUP BY department_id
      ) bu ON bu.department_id = d.department_id
      LEFT JOIN (
        SELECT department_id, COUNT(*) AS rfqCount
        FROM rfqs
        GROUP BY department_id
      ) rfqs ON rfqs.department_id = d.department_id
      LEFT JOIN (
        SELECT r.department_id, COUNT(DISTINCT po.po_id) AS poCount
        FROM purchase_orders po
        JOIN rfqs r ON po.rfq_id = r.rfq_id
        GROUP BY r.department_id
      ) pos ON pos.department_id = d.department_id
      ORDER BY d.name ASC
    `);

    const departments = deptRows.map((d) => ({
      department_id: d.department_id,
      name: d.name,
      budget: Number(d.budget || 0),
      used: Number(d.used || 0),
      remaining: Number(d.remaining || 0),
      rfqCount: Number(d.rfqCount || 0),
      poCount: Number(d.poCount || 0),
    }));

    // ─────────────────────────────────────────────
    // 3. RECENT ACTIVITY LOG (last 10 events)
    // ─────────────────────────────────────────────
    const [activityRows] = await pool.query(`
      SELECT * FROM (
        -- New RFQs
        SELECT 
          r.created_at AS event_time,
          CONCAT('RFQ #', r.rfq_id, ' created by ', u.username) AS message
        FROM rfqs r
        JOIN users u ON r.created_by = u.user_id

        UNION ALL

        -- Approvals
        SELECT 
          a.decided_at AS event_time,
          CONCAT('RFQ #', a.rfq_id, ' ', a.decision, ' by approver ', ua.username) AS message
        FROM rfq_approvals a
        JOIN users ua ON a.approver_id = ua.user_id

        UNION ALL

        -- Vendor quotations
        SELECT 
          q.submitted_at AS event_time,
          CONCAT('Quotation #', q.quote_id, ' submitted by vendor ', v.name, ' for RFQ #', q.rfq_id) AS message
        FROM rfq_quotes q
        JOIN vendor v ON q.vendor_id = v.vendor_id

        UNION ALL

        -- Purchase Orders
        SELECT 
          po.created_at AS event_time,
          CONCAT('PO ', po.po_number, ' created for RFQ #', po.rfq_id) AS message
        FROM purchase_orders po
      ) AS logs
      ORDER BY event_time DESC
      LIMIT 10
    `);

    const recentActivity = activityRows.map((row) => ({
      message: row.message,
      time: row.event_time,
    }));

    // ─────────────────────────────────────────────
    // 4. SEND RESPONSE
    // ─────────────────────────────────────────────
    res.status(200).json({
      overview,
      departments,
      recentActivity,
    });
  } catch (err) {
    console.error("Error in getAdminDashboard:", err);
    res.status(500).json({ msg: "Internal server error" });
  }
}
