// Script to apply the user approval workflow migration
const db = require('./db');
const fs = require('fs');
const path = require('path');

console.log('🔄 Applying User Approval Workflow Migration...\n');

// Read the migration file
const migrationPath = path.join(__dirname, 'migrations', '003_add_user_approval_workflow.sql');
const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

// Split the SQL file into individual statements
// Remove comments and split by semicolon
const statements = migrationSQL
  .split('\n')
  .filter(line => !line.trim().startsWith('--') && line.trim() !== '')
  .join('\n')
  .split(';')
  .map(stmt => stmt.trim())
  .filter(stmt => stmt.length > 0 && !stmt.startsWith('/*') && !stmt.includes('DESCRIBE') && !stmt.includes('SELECT'));

console.log(`📄 Found ${statements.length} SQL statements to execute\n`);

// Execute statements one by one
let executedCount = 0;
let skippedCount = 0;

function executeStatement(index) {
  if (index >= statements.length) {
    console.log(`\n✅ Migration completed!`);
    console.log(`   Executed: ${executedCount} statements`);
    console.log(`   Skipped: ${skippedCount} statements`);
    console.log('\n🔍 Verifying migration...\n');

    // Verify the migration
    db.query('DESCRIBE users', (err, result) => {
      if (err) {
        console.error('❌ Error verifying migration:', err);
        process.exit(1);
      }

      console.log('✅ Users table structure:');
      const approvalColumns = result.filter(col =>
        ['approval_status', 'approved_by', 'approved_at', 'rejection_reason', 'registered_at'].includes(col.Field)
      );

      if (approvalColumns.length > 0) {
        console.log('\n   Approval workflow columns:');
        approvalColumns.forEach(col => {
          console.log(`   ✓ ${col.Field} (${col.Type})`);
        });
      }

      // Check existing users
      db.query('SELECT COUNT(*) as total, approval_status FROM users GROUP BY approval_status', (err, result) => {
        if (err) {
          console.error('❌ Error checking users:', err);
          process.exit(1);
        }

        console.log('\n📊 User approval status summary:');
        result.forEach(row => {
          const status = row.approval_status || 'NULL';
          console.log(`   ${status}: ${row.total} users`);
        });

        console.log('\n✅ All done! Migration applied successfully.\n');
        process.exit(0);
      });
    });
    return;
  }

  const statement = statements[index];

  // Skip USE library statement if present
  if (statement.trim().toUpperCase().startsWith('USE ')) {
    console.log(`⏭️  Skipping: ${statement.substring(0, 50)}...`);
    skippedCount++;
    executeStatement(index + 1);
    return;
  }

  console.log(`📝 Executing statement ${index + 1}/${statements.length}...`);

  db.query(statement, (err, result) => {
    if (err) {
      // Check if error is "column already exists" - that's OK, skip it
      if (err.code === 'ER_DUP_FIELDNAME' || err.message.includes('Duplicate column name')) {
        console.log(`   ⚠️  Column already exists, skipping...`);
        skippedCount++;
        executeStatement(index + 1);
      } else if (err.code === 'ER_CANT_DROP_FIELD_OR_KEY' && err.message.includes('check that it exists')) {
        console.log(`   ⚠️  Foreign key doesn't exist, skipping...`);
        skippedCount++;
        executeStatement(index + 1);
      } else if (err.code === 'ER_DUP_INDEX' || err.message.includes('Duplicate key name')) {
        console.log(`   ⚠️  Index already exists, skipping...`);
        skippedCount++;
        executeStatement(index + 1);
      } else if (err.errno === 1826 && err.message.includes('foreign key constraint')) {
        console.log(`   ⚠️  Foreign key constraint already exists, skipping...`);
        skippedCount++;
        executeStatement(index + 1);
      } else {
        console.error(`\n❌ Error executing statement:\n${statement}\n`);
        console.error(err);
        process.exit(1);
      }
    } else {
      console.log(`   ✅ Success`);
      executedCount++;
      executeStatement(index + 1);
    }
  });
}

// Start executing statements
executeStatement(0);
