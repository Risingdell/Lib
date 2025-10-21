const mysql = require("mysql2");
require("dotenv").config();

// Configuration supports both local and production environments
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "library",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 30000, // Increased for cloud databases
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
};

// Use connection pool for better reliability
const pool = mysql.createPool(dbConfig);

// Test the connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error("❌ MySQL Connection Failed:", err);
    console.error("🔍 Config used:", {
      host: dbConfig.host,
      port: dbConfig.port,
      database: dbConfig.database
    });
    process.exit(1);
  }
  console.log("✅ MySQL Connected Successfully");
  console.log(`📦 Database: ${dbConfig.database}`);
  connection.release();
});

// Handle pool errors
pool.on("error", (err) => {
  console.error("❌ Database pool error:", err);
  if (err.code === "PROTOCOL_CONNECTION_LOST") {
    console.error("⚠️ Database connection lost.");
  }
});

module.exports = pool;