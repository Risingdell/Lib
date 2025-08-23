const mysql = require("mysql2");
require("dotenv").config();

const isProduction = process.env.NODE_ENV === "production";

const dbConfig = isProduction
  ? {
      host: process.env.DB_HOST || process.env.MYSQLHOST,
port: process.env.DB_PORT || process.env.MYSQLPORT || 3306,
      user: process.env.DB_USER || process.env.MYSQLUSER,
      password: process.env.DB_PASSWORD || process.env.MYSQLPASSWORD,
      database: process.env.DB_NAME || process.env.MYSQLDATABASE,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      connectTimeout: 60000
    }
  : {
      host: "localhost",
      port: 3306,
      user: "root",
      password: "",
      database: "library"
    };

const db = mysql.createConnection(dbConfig);

db.connect((err) => {
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
});

// Handle disconnection gracefully
db.on("error", (err) => {
  console.error("❌ Database error:", err);
  if (err.code === "PROTOCOL_CONNECTION_LOST") {
    console.error("⚠️ Database connection lost. Attempting to reconnect...");
    db.connect();
  }
});

module.exports = db;