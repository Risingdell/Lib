// Script to fix existing users approval status
// Run this once to set all existing users to 'approved' status

const db = require('./db');

console.log('🔍 Checking existing users approval status...\n');

// First, check current status
const checkSql = `
  SELECT
    id,
    username,
    firstName,
    lastName,
    approval_status,
    registered_at
  FROM users
  ORDER BY id
`;

db.query(checkSql, (err, users) => {
  if (err) {
    console.error('❌ Error checking users:', err);
    process.exit(1);
  }

  console.log(`Found ${users.length} users:\n`);

  users.forEach(user => {
    const status = user.approval_status || 'NULL';
    const icon = status === 'approved' ? '✅' : '⚠️';
    console.log(`${icon} ID: ${user.id} | ${user.username} (${user.firstName} ${user.lastName}) | Status: ${status}`);
  });

  // Count users by status
  const pendingCount = users.filter(u => u.approval_status === 'pending').length;
  const approvedCount = users.filter(u => u.approval_status === 'approved').length;
  const rejectedCount = users.filter(u => u.approval_status === 'rejected').length;
  const nullCount = users.filter(u => !u.approval_status).length;

  console.log(`\n📊 Summary:`);
  console.log(`   Approved: ${approvedCount}`);
  console.log(`   Pending: ${pendingCount}`);
  console.log(`   Rejected: ${rejectedCount}`);
  console.log(`   NULL/Not Set: ${nullCount}`);

  // If there are users that need to be approved
  const usersToFix = users.filter(u => u.approval_status !== 'approved');

  if (usersToFix.length > 0) {
    console.log(`\n🔧 Fixing ${usersToFix.length} users...\n`);

    // Update all non-approved users to approved (except newly registered pending users)
    const updateSql = `
      UPDATE users
      SET approval_status = 'approved',
          registered_at = COALESCE(registered_at, NOW())
      WHERE approval_status IS NULL
         OR approval_status = ''
         OR (approval_status = 'pending' AND registered_at < DATE_SUB(NOW(), INTERVAL 1 HOUR))
    `;

    db.query(updateSql, (err, result) => {
      if (err) {
        console.error('❌ Error updating users:', err);
        process.exit(1);
      }

      console.log(`✅ Updated ${result.affectedRows} users to 'approved' status`);
      console.log(`✅ All existing users can now login!`);

      // Show updated status
      db.query(checkSql, (err, updatedUsers) => {
        if (err) {
          console.error('Error checking updated users:', err);
          process.exit(1);
        }

        console.log(`\n📋 Updated user list:\n`);
        updatedUsers.forEach(user => {
          const status = user.approval_status || 'NULL';
          const icon = status === 'approved' ? '✅' : status === 'pending' ? '⏳' : '❌';
          console.log(`${icon} ID: ${user.id} | ${user.username} | Status: ${status}`);
        });

        console.log('\n✅ Done!\n');
        process.exit(0);
      });
    });
  } else {
    console.log(`\n✅ All users are already approved! Nothing to fix.\n`);
    process.exit(0);
  }
});
