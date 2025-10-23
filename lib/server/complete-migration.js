// Script to complete the migration - approve all existing users
const db = require('./db');

console.log('🔄 Completing migration - approving existing users...\n');

// First check the current state
const checkSql = 'SELECT id, username, approval_status FROM users';

db.query(checkSql, (err, users) => {
  if (err) {
    console.error('❌ Error checking users:', err);
    process.exit(1);
  }

  console.log(`📊 Found ${users.length} users:`);
  users.forEach(user => {
    const status = user.approval_status || 'NULL';
    const icon = status === 'approved' ? '✅' : status === 'pending' ? '⏳' : '⚠️';
    console.log(`   ${icon} ${user.username}: ${status}`);
  });

  // Update all users without approval status to 'approved'
  const updateSql = `
    UPDATE users
    SET approval_status = 'approved',
        registered_at = NOW()
    WHERE approval_status IS NULL OR approval_status = ''
  `;

  console.log('\n🔧 Setting all existing users to approved status...\n');

  db.query(updateSql, (err, result) => {
    if (err) {
      console.error('❌ Error updating users:', err);
      process.exit(1);
    }

    console.log(`✅ Updated ${result.affectedRows} users to 'approved' status`);

    // Verify the update
    db.query(checkSql, (err, updatedUsers) => {
      if (err) {
        console.error('❌ Error verifying update:', err);
        process.exit(1);
      }

      console.log('\n📋 Updated user list:');
      updatedUsers.forEach(user => {
        const status = user.approval_status || 'NULL';
        const icon = status === 'approved' ? '✅' : status === 'pending' ? '⏳' : '❌';
        console.log(`   ${icon} ${user.username}: ${status}`);
      });

      // Summary
      const approved = updatedUsers.filter(u => u.approval_status === 'approved').length;
      const pending = updatedUsers.filter(u => u.approval_status === 'pending').length;
      const rejected = updatedUsers.filter(u => u.approval_status === 'rejected').length;

      console.log('\n📊 Summary:');
      console.log(`   ✅ Approved: ${approved}`);
      console.log(`   ⏳ Pending: ${pending}`);
      console.log(`   ❌ Rejected: ${rejected}`);
      console.log('\n✅ Migration completed! All existing users can now login.\n');

      process.exit(0);
    });
  });
});
