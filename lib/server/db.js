// // server/db.js
// const mysql = require("mysql");

// const db = mysql.createConnection({
//   host: "localhost",
//   user: "root",        // default for XAMPP
//   password: "",        // blank by default
//   database: "library",  // replace this
// });

// db.connect((err) => {
//   if (err) {
//     console.log("MySQL Connection Failed:", err);
//     return;
//   }
//   console.log("✅ MySQL Connected Successfully");
// });

// module.exports = db;
// server/db.js
const mysql = require("mysql2");

const dbConfig = process.env.NODE_ENV === 'production'
  ? {
      host: process.env.MYSQLHOST,
      port: process.env.MYSQLPORT,
      user: process.env.MYSQLUSER,
      password: process.env.MYSQLPASSWORD,
      database: process.env.MYSQLDATABASE,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      connectTimeout: 60000,
      timeout: 60000
    }
  : {
      host: "localhost",
      user: "root",
      password: "",
      database: "library"
    };

const db = mysql.createConnection(dbConfig);

db.connect((err) => {
  if (err) {
    console.error("❌ MySQL Connection Failed:", err);
    console.error("Config used:", {
      host: dbConfig.host,
      port: dbConfig.port,
      database: dbConfig.database
    });
    process.exit(1);
  }
  console.log("✅ MySQL Connected Successfully");
  console.log(`Database: ${dbConfig.database}`);
});

// Handle connection errors after initial connection
db.on('error', (err) => {
  console.error('Database error:', err);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.error('Database connection was closed. Attempting to reconnect...');
    db.connect();
  }
});

module.exports = db;