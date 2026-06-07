import pool from "../db.js";

/** GET /notifications/my */
export async function getMyNotifications(req, res) {
  try {
    const userId = req.user?.id || req.vendor?.id;

    const [rows] = await pool.query(
      `SELECT * FROM notifications 
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [userId]
    );

    res.status(200).json(rows);
  } catch (err) {
    console.error("Get Notifications Error:", err);
    res.status(500).json({ msg: "Internal server error" });
  }
}

/** PATCH /notifications/mark-read/:id */
export async function markNotificationRead(req, res) {
  try {
    const { id } = req.params;

    await pool.query(
      `UPDATE notifications SET is_read = 1 WHERE id = ?`,
      [id]
    );

    res.status(200).json({ msg: "Notification marked as read" });
  } catch (err) {
    console.error("Mark Read Error:", err);
    res.status(500).json({ msg: "Internal server error" });
  }
}

/** PATCH /notifications/mark-all-read */
export async function markAllRead(req, res) {
  try {
    const userId = req.user?.id || req.vendor?.id;

    await pool.query(
      `UPDATE notifications 
       SET is_read = 1 
       WHERE user_id = ?`,
      [userId]
    );

    res.status(200).json({ msg: "All notifications marked as read" });
  } catch (err) {
    console.error("Mark All Error:", err);
    res.status(500).json({ msg: "Internal server error" });
  }
}
