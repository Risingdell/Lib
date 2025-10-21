// Direct import to Clever Cloud with exact credentials
const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');

// Your CORRECT Clever Cloud credentials
const credentials = {
  host: 'biuezvkp1ir5odbq6wju-mysql.services.clever-cloud.com',
  port: 3306,
  user: 'u9vwnxvk2ljksy3a',
  password: 'le7A7dr4Rzx6AcOpycjo',
  database: 'biuezvkp1ir5odbq6wju',
  multipleStatements: true,
  connectTimeout: 60000,
  ssl: {
    rejectUnauthorized: false
  }
};

console.log('🔌 Attempting connection to Clever Cloud...');
console.log('📍 Host:', credentials.host);
console.log('👤 User:', credentials.user);
console.log('📦 Database:', credentials.database);
console.log('');

const connection = mysql.createConnection(credentials);

connection.connect((err) => {
  if (err) {
    console.error('❌ Connection failed!');
    console.error('Error code:', err.code);
    console.error('Error message:', err.message);
    console.error('');
    console.error('🔍 Troubleshooting:');
    console.error('1. Verify credentials in Clever Cloud dashboard');
    console.error('2. Check if IP is whitelisted (should be open by default)');
    console.error('3. Try connecting from Clever Cloud console instead');
    process.exit(1);
  }

  console.log('✅ Connected successfully!');
  console.log('');

  // Test basic query first
  connection.query('SELECT DATABASE()', (err, result) => {
    if (err) {
      console.error('❌ Query failed:', err);
      connection.end();
      process.exit(1);
    }

    console.log('✅ Current database:', result[0]['DATABASE()']);
    console.log('');

    // Now import schema
    const schemaPath = path.join(__dirname, '..', 'library_schema.sql');
    let schema = fs.readFileSync(schemaPath, 'utf8');

    // Clean up schema
    schema = schema.replace(/CREATE DATABASE IF NOT EXISTS library;/g, '');
    schema = schema.replace(/USE library;/g, '');

    console.log('📤 Starting import...');
    console.log('');

    // Import with FK checks disabled
    const queries = `
      SET FOREIGN_KEY_CHECKS = 0;
      ${schema}
      SET FOREIGN_KEY_CHECKS = 1;
    `;

    connection.query(queries, (err) => {
      if (err) {
        console.error('❌ Import failed!');
        console.error('Error:', err.message);
        console.error('');
        console.error('💡 Try importing manually using phpMyAdmin instead');
        connection.end();
        process.exit(1);
      }

      console.log('✅ Schema imported successfully!');
      console.log('');

      // Verify tables
      connection.query('SHOW TABLES', (err, tables) => {
        if (err) {
          console.error('❌ Verification failed:', err);
          connection.end();
          process.exit(1);
        }

        console.log('📊 Tables created:', tables.length);
        tables.forEach(row => {
          console.log('  ✓', Object.values(row)[0]);
        });
        console.log('');

        // Add test data
        console.log('➕ Adding test data...');
        const testData = `
          DELETE FROM admins WHERE username = 'admin';
          INSERT INTO admins (name, username, password) VALUES ('Admin', 'admin', 'admin123');

          INSERT INTO books (sl_no, acc_no, title, author, donated_by, date, status) VALUES
          (1, 1001, 'Introduction to Algorithms', 'Thomas H. Cormen', 'College Library', '2024-01-01', 'available'),
          (2, 1002, 'Clean Code', 'Robert C. Martin', 'College Library', '2024-01-01', 'available'),
          (3, 1003, 'Design Patterns', 'Gang of Four', 'College Library', '2024-01-01', 'available');
        `;

        connection.query(testData, (err) => {
          if (err) {
            console.error('⚠️  Test data failed (not critical):', err.message);
          } else {
            console.log('✅ Test data added');
          }

          console.log('');
          console.log('🎉 DATABASE SETUP COMPLETE!');
          console.log('');
          console.log('🔐 Test credentials:');
          console.log('   Admin username: admin');
          console.log('   Admin password: admin123');
          console.log('');

          connection.end();
        });
      });
    });
  });
});
