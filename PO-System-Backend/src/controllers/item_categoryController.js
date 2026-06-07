import pool from "../db.js";

// GET ALL ITEM CATEGORIES
export async function getItemCategories(req, res) {
    try {
        const [rows] = await pool.query("SELECT * FROM item_category");
        res.status(200).json(rows);
    } catch (err) {
        console.error("Error fetching item categories:", err);
        res.status(500).json({ msg: "Internal server error" });
    }
}

// CREATE NEW ITEM CATEGORY
export async function createItemCategory(req, res) {
    try {
        const { name, vendor_id, vendor_name } = req.body;

        if (!name) {
            return res.status(400).json({ msg: "Name is required" });
        }

        const [existing] = await pool.query(
            "SELECT * FROM item_category WHERE name = ?",
            [name]
        );

        if (existing.length > 0) {
            return res.status(409).json({ msg: "Category with same name already exists" });
        }

        await pool.query(
            "INSERT INTO item_category (name, vendor_id) VALUES (?, ?, ?)",
            [name, vendor_id, vendor_name]
        );

        res.status(201).json({ msg: "Item category created successfully" });
    } catch (err) {
        console.error("Error creating item category:", err);
        res.status(500).json({ msg: "Internal server error" });
    }
}

// UPDATE ITEM CATEGORY
export async function updateItemCategory(req, res) {
    try {
        const { category_id } = req.params;
        const { name, vendor_id, vendor_name } = req.body;

        if (!category_id) {
            return res.status(400).json({ msg: "Category ID is required" });
        }
        if (!name) {
            return res.status(400).json({ msg: "Name is required" });
        }

        const [existing] = await pool.query(
            "SELECT * FROM item_category WHERE cat_id = ?",
            [category_id]
        );

        if (existing.length === 0) {
            return res.status(404).json({ msg: `Category with ID ${category_id} not found` });
        }

        await pool.query(
            "UPDATE item_category SET name = ?, vendor_id = ? WHERE cat_id = ?",
            [name, vendor_id, category_id]
        );

        res.status(200).json({ msg: `Category with ID ${category_id} updated successfully` });
    } catch (err) {
        console.error("Error updating item category:", err);
        res.status(500).json({ msg: "Internal server error" });
    }
}

// DELETE ITEM CATEGORY
export async function deleteItemCategory(req, res) {
    try {
        const { category_id } = req.params;
        if (!category_id) {
            return res.status(400).json({ msg: "Category ID is required" });
        }
        const [existing] = await pool.query(
            "SELECT * FROM item_category WHERE cat_id = ?",
            [category_id]
        );
        if (existing.length === 0) {
            return res.status(404).json({ msg: `Category with ID ${category_id} not found` });
        }
        await pool.query("DELETE FROM item_category WHERE cat_id = ?", [category_id]);
        res.status(200).json({ msg: `Category ID ${category_id} deleted successfully` });
    } catch (err) {
        console.error("Error deleting item category:", err);
        res.status(500).json({ msg: "Internal server error" });
    }
}
