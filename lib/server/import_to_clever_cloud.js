// Script to import database schema to Clever Cloud MySQL
const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');

// Clever Cloud credentials
const cleverCloudConfig = {
  host: 'bfjxqdkabitgzq9zhbfo-mysql.services.clever-cloud.com',
  port: 3306,
  user: 'uyj5f9tam7xflp46',
  password: '5AjTm0cxV1SDn6ctQGsx',
  database: 'bfjxqdkabitgzq9zhbfo',
  multipleStatements: true,
  connectTimeout: 60000
};

console.log('🔌 Connecting to Clever Cloud MySQL...');
console.log(`📍 Host: ${cleverCloudConfig.host}`);
console.log(`📦 Database: ${cleverCloudConfig.database}`);

const connection = mysql.createConnection(cleverCloudConfig);

connection.connect((err) => {
  if (err) {
    console.error('❌ Error connecting to Clever Cloud:', err);
    process.exit(1);
  }

  console.log('✅ Connected to Clever Cloud MySQL!');

  // Read the schema file
  const schemaPath = path.join(__dirname, '..', 'library_schema.sql');
  console.log(`📄 Reading schema from: ${schemaPath}`);

  let schema = fs.readFileSync(schemaPath, 'utf8');

  // Remove CREATE DATABASE and USE commands (Clever Cloud already has the database)
  schema = schema.replace(/CREATE DATABASE IF NOT EXISTS library;/g, '');
  schema = schema.replace(/USE library;/g, '');

  console.log('📤 Importing schema to Clever Cloud...');
  console.log('⏳ This may take a minute...');

  // Disable foreign key checks temporarily
  const setupQueries = 'SET FOREIGN_KEY_CHECKS = 0;' + schema + 'SET FOREIGN_KEY_CHECKS = 1;';

  connection.query(setupQueries, (err, results) => {
    if (err) {
      console.error('❌ Error importing schema:', err);
      connection.end();
      process.exit(1);
    }

    console.log('✅ Schema imported successfully!');

    // Verify tables were created
    connection.query('SHOW TABLES', (err, tables) => {
      if (err) {
        console.error('❌ Error verifying tables:', err);
        connection.end();
        process.exit(1);
      }

      console.log(`\n📊 Database tables created: ${tables.length}`);
      tables.forEach((table) => {
        const tableName = Object.values(table)[0];
        console.log(`   ✓ ${tableName}`);
      });

      // Add test admin
      console.log('\n👤 Creating test admin account...');
      const adminSql = `
        DELETE FROM admins WHERE username = 'admin';
        INSERT INTO admins (name, username, password)
        VALUES ('Admin', 'admin', 'admin123');
      `;

      connection.query(adminSql, (err) => {
        if (err) {
          console.error('❌ Error creating admin:', err);
        } else {
          console.log('✅ Test admin created (username: admin, password: admin123)');
        }

        // Add some sample books
        console.log('\n📚 Adding sample books...');
        const booksSql = `
          INSERT INTO books (sl_no, acc_no, title, author, donated_by, date, status)
          VALUES
          (1, 1001, 'Introduction to Algorithms', 'Thomas H. Cormen', 'College Library', '2024-01-01', 'available'),
          (2, 1002, 'Clean Code', 'Robert C. Martin', 'College Library', '2024-01-01', 'available'),
          (3, 1003, 'Design Patterns', 'Gang of Four', 'College Library', '2024-01-01', 'available');
        `;

        connection.query(booksSql, (err) => {
          if (err) {
            console.error('❌ Error adding books:', err);
          } else {
            console.log('✅ Sample books added');
          }

          console.log('\n🎉 Database setup complete!');
          console.log('\n📝 Connection details:');
          console.log(`   Host: ${cleverCloudConfig.host}`);
          console.log(`   Database: ${cleverCloudConfig.database}`);
          console.log(`   User: ${cleverCloudConfig.user}`);
          console.log('\n🔐 Test admin credentials:');
          console.log('   Username: admin');
          console.log('   Password: admin123');

          connection.end();
        });
      });
    });
  });
});
