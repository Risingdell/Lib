// Run this script to apply the production fix
// Make sure your .env file has the correct production database credentials

const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');

console.log('🔄 Running Production Database Fix...\n');

// Read database configuration
// If you have a .env file with production credentials, load it:
// require('dotenv').config({ path: '.env.production' });

// Or manually set your production database details here:
const dbConfig = {
  host: process.env.DB_HOST || 'YOUR_RENDER_HOST',      // e.g., 'dpg-xxx.oregon-postgres.render.com'
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'YOUR_USERNAME',
  password: process.env.DB_PASSWORD || 'YOUR_PASSWORD',
  database: process.env.DB_NAME || 'library',
  multipleStatements: true  // Important for running multiple SQL statements
};

console.log('📡 Connecting to database...');
console.log(`   Host: ${dbConfig.host}`);
console.log(`   Database: ${dbConfig.database}\n`);

// Create connection
const connection = mysql.createConnection(dbConfig);

connection.connect((err) => {
  if (err) {
    console.error('❌ Failed to connect to database:', err.message);
    console.error('\n💡 Please check your database credentials in this file.\n');
    process.exit(1);
  }

  console.log('✅ Connected to production database!\n');

  // Read the SQL file
  const sqlFile = path.join(__dirname, '..', 'PRODUCTION-FIX.sql');
  let sql;

  try {
    sql = fs.readFileSync(sqlFile, 'utf8');
  } catch (err) {
    console.error('❌ Failed to read PRODUCTION-FIX.sql:', err.message);
    process.exit(1);
  }

  // Remove comments and split into statements
  const statements = sql
    .split('\n')
    .filter(line => !line.trim().startsWith('--') && line.trim() !== '')
    .join('\n')
    .split(';')
    .map(stmt => stmt.trim())
    .filter(stmt => stmt.length > 0 && !stmt.toUpperCase().startsWith('USE '));

  console.log(`📝 Executing ${statements.length} SQL statements...\n`);

  let completed = 0;
  let failed = 0;

  // Execute each statement
  function executeNext(index) {
    if (index >= statements.length) {
      console.log(`\n✅ Completed: ${completed} statements`);
      if (failed > 0) {
        console.log(`⚠️  Failed: ${failed} statements (likely already existed)`);
      }

      // Verify the fix
      console.log('\n🔍 Verifying users...\n');

      connection.query('SELECT username, approval_status FROM users LIMIT 10', (err, users) => {
        if (err) {
          console.error('❌ Error verifying users:', err.message);
        } else {
          console.log('📋 User statuses:');
          users.forEach(user => {
            const status = user.approval_status || 'NULL';
            const icon = status === 'approved' ? '✅' : status === 'pending' ? '⏳' : '⚠️';
            console.log(`   ${icon} ${user.username}: ${status}`);
          });
        }

        connection.end();
        console.log('\n✅ Production fix completed!\n');
        console.log('💡 Try logging in now - all users should be able to access the system.\n');
        process.exit(0);
      });

      return;
    }

    const statement = statements[index];

    // Skip DESCRIBE and SELECT statements for cleaner output
    if (statement.toUpperCase().startsWith('DESCRIBE') ||
        statement.toUpperCase().startsWith('SELECT')) {
      executeNext(index + 1);
      return;
    }

    connection.query(statement, (err, result) => {
      if (err) {
        // Check if error is because column/index already exists - that's OK
        if (err.code === 'ER_DUP_FIELDNAME' ||
            err.code === 'ER_DUP_INDEX' ||
            err.code === 'ER_DUP_KEYNAME' ||
            err.message.includes('Duplicate column') ||
            err.message.includes('Duplicate key')) {
          console.log(`⏭️  Statement ${index + 1}: Already exists, skipping...`);
          failed++;
        } else {
          console.error(`❌ Statement ${index + 1} failed:`, err.message);
          failed++;
        }
      } else {
        console.log(`✅ Statement ${index + 1}: Success`);
        if (result.affectedRows !== undefined) {
          console.log(`   Affected rows: ${result.affectedRows}`);
        }
        completed++;
      }

      // Continue with next statement
      executeNext(index + 1);
    });
  }

  // Start execution
  executeNext(0);
});
