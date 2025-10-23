// Script to approve all pending users
// Use this if you want to approve all existing pending users at once
const db = require('./db');

console.log('🔄 Approving all pending users...\n');

// First check the current state
const checkSql = 'SELECT id, username, firstName, lastName, email, approval_status, registered_at FROM users WHERE approval_status = "pending"';

db.query(checkSql, (err, users) => {
  if (err) {
    console.error('❌ Error checking users:', err);
    process.exit(1);
  }

  if (users.length === 0) {
    console.log('✅ No pending users found!\n');
    process.exit(0);
  }

  console.log(`📊 Found ${users.length} pending users:\n`);
  users.forEach(user => {
    console.log(`   ⏳ ${user.username} (${user.firstName} ${user.lastName})`);
    console.log(`      Email: ${user.email}`);
    console.log(`      Registered: ${user.registered_at}\n`);
  });

  // Ask for confirmation (auto-confirm in script)
  console.log('🔧 Approving all pending users...\n');

  const updateSql = `
    UPDATE users
    SET approval_status = 'approved',
        approved_at = NOW()
    WHERE approval_status = 'pending'
  `;

  db.query(updateSql, (err, result) => {
    if (err) {
      console.error('❌ Error approving users:', err);
      process.exit(1);
    }

    console.log(`✅ Approved ${result.affectedRows} users!`);

    // Verify the update
    const verifySql = 'SELECT id, username, approval_status FROM users';

    db.query(verifySql, (err, allUsers) => {
      if (err) {
        console.error('❌ Error verifying update:', err);
        process.exit(1);
      }

      console.log('\n📋 All users status:');
      allUsers.forEach(user => {
        const status = user.approval_status;
        const icon = status === 'approved' ? '✅' : status === 'pending' ? '⏳' : '❌';
        console.log(`   ${icon} ${user.username}: ${status}`);
      });

      const approved = allUsers.filter(u => u.approval_status === 'approved').length;
      const pending = allUsers.filter(u => u.approval_status === 'pending').length;
      const rejected = allUsers.filter(u => u.approval_status === 'rejected').length;

      console.log('\n📊 Summary:');
      console.log(`   ✅ Approved: ${approved}`);
      console.log(`   ⏳ Pending: ${pending}`);
      console.log(`   ❌ Rejected: ${rejected}`);
      console.log('\n✅ All users can now login!\n');

      process.exit(0);
    });
  });
});
