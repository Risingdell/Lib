// server/db.js
const mysql = require("mysql");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",        // default for XAMPP
  password: "",        // blank by default
  database: "library",  // replace this
});

db.connect((err) => {
  if (err) {
    console.log("MySQL Connection Failed:", err);
    return;
  }
  console.log("✅ MySQL Connected Successfully");
});

module.exports = db;
