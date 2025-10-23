// Script to check user "dan" status
const db = require('./db');

console.log('🔍 Checking user "dan" status...\n');

const sql = 'SELECT id, username, firstName, lastName, email, approval_status, approved_by, approved_at, rejection_reason, registered_at FROM users WHERE username = ?';

db.query(sql, ['dan'], (err, result) => {
  if (err) {
    console.error('❌ Error checking user:', err);
    process.exit(1);
  }

  if (result.length === 0) {
    console.log('❌ User "dan" not found in database!\n');
    console.log('💡 The user might have been deleted or never created.\n');
    process.exit(0);
  }

  const user = result[0];
  console.log('👤 User Details:');
  console.log(`   ID: ${user.id}`);
  console.log(`   Username: ${user.username}`);
  console.log(`   Name: ${user.firstName} ${user.lastName}`);
  console.log(`   Email: ${user.email}`);
  console.log(`   Approval Status: ${user.approval_status || 'NULL'}`);
  console.log(`   Approved By: ${user.approved_by || 'N/A'}`);
  console.log(`   Approved At: ${user.approved_at || 'N/A'}`);
  console.log(`   Rejection Reason: ${user.rejection_reason || 'N/A'}`);
  console.log(`   Registered At: ${user.registered_at || 'N/A'}`);

  console.log('\n📋 Status Analysis:');
  if (user.approval_status === 'approved') {
    console.log('   ✅ User is APPROVED - Should be able to login');
  } else if (user.approval_status === 'pending') {
    console.log('   ⏳ User is PENDING - Cannot login until approved');
    console.log('\n💡 To approve this user, run:');
    console.log('   node approve-user-dan.js');
  } else if (user.approval_status === 'rejected') {
    console.log('   ❌ User is REJECTED - Cannot login');
    console.log(`   Reason: ${user.rejection_reason}`);
  } else {
    console.log('   ⚠️  User has NULL/invalid approval status');
    console.log('\n💡 To fix this, run:');
    console.log('   node approve-user-dan.js');
  }

  console.log('');
  process.exit(0);
});
