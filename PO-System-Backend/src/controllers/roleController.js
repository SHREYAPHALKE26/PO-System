import pool from "../db.js";

// GET ALL ROLES
export async function getRoles(req, res) {
    try {
        const [roles] = await pool.query("SELECT * FROM roles");
        res.status(200).json(roles);
    } catch (err) {
        console.error("Error fetching roles:", err);
        res.status(500).json({ msg: "Internal server error" });
    }
}

// CREATE NEW ROLE
export async function createRoles(req, res) {
    try {
        const { name, desc } = req.body;
        if (!name || !desc) {
            return res.status(400).json({ msg: "All fields are required" });
        }

        const [existing] = await pool.query(
            "SELECT * FROM roles WHERE name = ?",
            [name]
        );

        if (existing.length > 0) {
            return res.status(409).json({ msg: "Role with same name already exists" });
        }

        await pool.query(
            "INSERT INTO roles (name, description) VALUES (?, ?)",
            [name, desc]
        );

        res.status(201).json({ msg: "Role created successfully" });
    } catch (err) {
        console.error("Error creating role:", err);
        res.status(500).json({ msg: "Internal server error" });
    }
}

// UPDATE ROLE
export async function updateRoles(req, res) {
    try {
        const { role_id } = req.params;
        const { name, desc } = req.body;

        if (!role_id) {
            return res.status(400).json({ msg: "Role ID is required" });
        }
        if (!name || !desc) {
            return res.status(400).json({ msg: "All fields are required" });
        }

        const [existing] = await pool.query(
            "SELECT * FROM roles WHERE role_id = ?",
            [role_id]
        );
        if (existing.length === 0) {
            return res.status(404).json({ msg: `Department with ID${role_id} not found`});
        }

        await pool.query(
            "UPDATE roles SET name = ?, description = ? WHERE role_id = ?",
            [name, desc, role_id]
        );

        res.status(200).json({ msg: `Role with ID${role_id} updated successfully` });
    } catch (err) {
        console.error("Error updating role:", err);
        res.status(500).json({ msg: "Internal server error" });
    }
}

// DELETE ROLE
export async function deleteRoles(req, res) {
    try {
        const { role_id } = req.params;
        if (!role_id) {
            return res.status(400).json({ msg: "Role ID is required" });
        }
        const [existing] = await pool.query(
            "SELECT * FROM roles WHERE role_id = ?",
            [role_id]
        );
        if (existing.length === 0) {
            return res.status(404).json({ msg: `Role with ID ${role_id} not found` });
        }
        await pool.query("DELETE FROM roles WHERE role_id = ?", [role_id]);
        res.status(200).json({ msg: `Role ID${role_id} deleted successfully` });
    } catch (err) {
        console.error("Error deleting role:", err);
        res.status(500).json({ msg: "Internal server error" });
    }
}
