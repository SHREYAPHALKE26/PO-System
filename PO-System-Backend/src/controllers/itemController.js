import pool from "../db.js";

// GET ALL ITEMS
export async function getItems(req, res) {
    try {
        const [items] = await pool.query("SELECT * FROM item");
        res.status(200).json(items);
    } catch (err) {
        console.error("Error fetching items:", err);
        res.status(500).json({ msg: "Internal server error" });
    }
}

// CREATE NEW ITEM
export async function createItem(req, res) {
    try {
        const { name, description, cat_id, uom, price, active } = req.body;

        if (!name) {
            return res.status(400).json({ msg: "Name is required" });
        }

        const [existing] = await pool.query(
            "SELECT * FROM item WHERE name = ?",
            [name]
        );

        if (existing.length > 0) {
            return res.status(409).json({ msg: "Item with same name already exists" });
        }

        const activeFlag = typeof active === 'undefined' ? 1 : active;

        await pool.query(
            "INSERT INTO item (name, description, cat_id, uom, price, active) VALUES (?, ?, ?, ?, ?, ?)",
            [name, description, cat_id, uom, price, activeFlag]
        );

        res.status(201).json({ msg: "Item created successfully" });
    } catch (err) {
        console.error("Error creating item:", err);
        res.status(500).json({ msg: "Internal server error" });
    }
}

// UPDATE ITEM
export async function updateItem(req, res) {
    try {
        const { item_id } = req.params;
        const { name, description, cat_id, uom, price, active } = req.body;

        if (!item_id) {
            return res.status(400).json({ msg: "Item ID is required" });
        }
        if (!name) {
            return res.status(400).json({ msg: "Name is required" });
        }

        const [existing] = await pool.query(
            "SELECT * FROM item WHERE item_id = ?",
            [item_id]
        );
        if (existing.length === 0) {
            return res.status(404).json({ msg: `Item with ID ${item_id} not found` });
        }

        const activeFlag = typeof active === 'undefined' ? existing[0].active : active;

        await pool.query(
            "UPDATE item SET name = ?, description = ?, cat_id = ?, uom = ?, price = ?, active = ? WHERE item_id = ?",
            [name, description, cat_id, uom, price, activeFlag, item_id]
        );

        res.status(200).json({ msg: `Item with ID ${item_id} updated successfully` });
    } catch (err) {
        console.error("Error updating item:", err);
        res.status(500).json({ msg: "Internal server error" });
    }
}

// DELETE ITEM
export async function deleteItem(req, res) {
    try {
        const { item_id } = req.params;
        if (!item_id) {
            return res.status(400).json({ msg: "Item ID is required" });
        }
        const [existing] = await pool.query(
            "SELECT * FROM item WHERE item_id = ?",
            [item_id]
        );
        if (existing.length === 0) {
            return res.status(404).json({ msg: `Item with ID ${item_id} not found` });
        }
        await pool.query("DELETE FROM item WHERE item_id = ?", [item_id]);
        res.status(200).json({ msg: `Item ID ${item_id} deleted successfully` });
    } catch (err) {
        console.error("Error deleting item:", err);
        res.status(500).json({ msg: "Internal server error" });
    }
}
