// Script to export database schema to SQL file
const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'library'
});

let sqlOutput = `-- Library Management System - Database Schema
-- Exported: ${new Date().toISOString()}
-- Database: library

CREATE DATABASE IF NOT EXISTS library;
USE library;

`;

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to database:', err);
    process.exit(1);
  }

  console.log('✅ Connected to MySQL');

  // Get all tables
  connection.query('SHOW TABLES', (err, tables) => {
    if (err) {
      console.error('Error getting tables:', err);
      connection.end();
      process.exit(1);
    }

    console.log(`Found ${tables.length} tables`);

    let processedTables = 0;

    tables.forEach((tableRow) => {
      const tableName = Object.values(tableRow)[0];
      console.log(`Processing table: ${tableName}`);

      // Get CREATE TABLE statement
      connection.query(`SHOW CREATE TABLE \`${tableName}\``, (err, result) => {
        if (err) {
          console.error(`Error getting CREATE TABLE for ${tableName}:`, err);
          return;
        }

        const createStatement = result[0]['Create Table'];
        sqlOutput += `-- Table: ${tableName}\n`;
        sqlOutput += `DROP TABLE IF EXISTS \`${tableName}\`;\n`;
        sqlOutput += createStatement + ';\n\n';

        processedTables++;

        // When all tables are processed, write to file
        if (processedTables === tables.length) {
          const outputPath = path.join(__dirname, '..', 'library_schema.sql');
          fs.writeFileSync(outputPath, sqlOutput);
          console.log(`\n✅ Schema exported to: ${outputPath}`);
          console.log(`📊 Total tables: ${tables.length}`);

          connection.end();
        }
      });
    });
  });
});
