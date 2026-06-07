import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config({ path: "L:/project/PO System/PO-System-Backend/.env" });

const pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "posystem_user",
    password: process.env.DB_PASS || "root123",
    database: process.env.DB_NAME || "posystem_db"
});

export default pool;