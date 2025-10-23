# User Approval Workflow Migration Guide

## Problem
You're getting a **403 Forbidden** error when trying to login with the message:
```
"Your account status does not allow login. Please contact the administrator."
```

This happens because the user approval workflow migration hasn't been applied to your **production database** on Render.

---

## Solution Options

### Option 1: Apply Migration via SQL (Recommended for Production)

If you have access to your production database (e.g., via Render dashboard or phpMyAdmin):

1. **Connect to your production MySQL database**
2. **Run this SQL script**:

```sql
USE library;  -- or your database name

-- Add approval status column
ALTER TABLE users
ADD COLUMN IF NOT EXISTS approval_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending'
COMMENT 'pending=awaiting admin approval, approved=can access system, rejected=access denied'
AFTER email;

-- Add admin approval tracking columns
ALTER TABLE users
ADD COLUMN IF NOT EXISTS approved_by INT NULL
COMMENT 'Admin who approved/rejected the registration'
AFTER approval_status;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS approved_at DATETIME NULL
COMMENT 'Timestamp when registration was approved/rejected'
AFTER approved_by;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS rejection_reason TEXT NULL
COMMENT 'Reason if registration was rejected'
AFTER approved_at;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS registered_at DATETIME DEFAULT CURRENT_TIMESTAMP
COMMENT 'Timestamp when user registered'
AFTER rejection_reason;

-- Add foreign key constraint (if admins table exists)
-- ALTER TABLE users
-- ADD CONSTRAINT fk_users_approved_by
-- FOREIGN KEY (approved_by) REFERENCES admins(id)
-- ON DELETE SET NULL
-- ON UPDATE CASCADE;

-- Set all existing users to 'approved' status so they can login
UPDATE users
SET approval_status = 'approved',
    registered_at = NOW()
WHERE approval_status = 'pending' OR approval_status IS NULL;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_approval_status ON users(approval_status);
CREATE INDEX IF NOT EXISTS idx_registered_at ON users(registered_at);
```

3. **Verify the migration**:

```sql
-- Check table structure
DESCRIBE users;

-- Check user statuses
SELECT username, approval_status, registered_at FROM users;
```

---

### Option 2: Use Admin Panel (After Migration)

Once the migration is applied, you can approve users through the admin panel:

1. **Login to Admin Dashboard** at `/admin-login`
2. **Click "Registration Requests"** in the sidebar
3. **Approve or Reject** users as needed

---

### Option 3: Run Migration Script on Production

If you can SSH into your Render server or run Node.js scripts:

```bash
# SSH into your production server
cd /path/to/your/app

# Run the migration approval script
node server/approve-all-pending.js
```

---

## For Local Development

If you're testing locally, run:

```bash
cd server
node approve-all-pending.js
```

This will approve all pending users in your local database.

---

## Checking User Status

To check any user's approval status:

```sql
SELECT
    username,
    approval_status,
    registered_at,
    approved_at,
    rejection_reason
FROM users
WHERE username = 'dan';  -- replace with actual username
```

---

## How the System Works Now

### 1. **New User Registration**
- User fills registration form
- Account created with `approval_status = 'pending'`
- User sees: "Registration submitted successfully! Your account is pending admin approval."

### 2. **Login Attempt (Pending User)**
- **Pending users** see: "Your account is pending admin approval"
- **Rejected users** see: "Your registration has been rejected. Reason: [reason]"
- **Only approved users** can login successfully

### 3. **Admin Approval**
- Admin logs into `/admin-login`
- Goes to "Registration Requests" tab
- Views all pending registrations
- Approves or rejects with reason

### 4. **After Approval**
- User can immediately login
- System tracks which admin approved and when

---

## Quick Fix for Immediate Access

If you need immediate access for testing and can't apply the migration yet, temporarily comment out the approval check in `server/index.js`:

```javascript
// TEMPORARY FIX - Remove after migration
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  db.query(
    "SELECT * FROM users WHERE username = ? AND password = ?",
    [username, password],
    (err, result) => {
      if (err) {
        return res.status(500).send({ message: "Server error" });
      }

      if (result.length > 0) {
        const user = result[0];

        // COMMENT OUT THESE LINES TEMPORARILY:
        /*
        if (user.approval_status === 'pending') {
          return res.status(403).send({ message: "Pending approval" });
        }
        if (user.approval_status === 'rejected') {
          return res.status(403).send({ message: "Rejected" });
        }
        if (user.approval_status !== 'approved') {
          return res.status(403).send({ message: "Invalid status" });
        }
        */

        // Continue with login...
        req.session.user = {
          id: user.id,
          username: user.username,
          // ... rest of code
        };
        res.send({ message: "Login successful", user: req.session.user });
      } else {
        res.status(401).send({ message: "Invalid credentials" });
      }
    }
  );
});
```

**⚠️ WARNING**: This is only for testing! Don't forget to restore the approval checks after applying the migration.

---

## Troubleshooting

### Error: "Unknown column 'approval_status'"
**Solution**: The migration hasn't been applied. Run the SQL script above.

### Error: "Your account status does not allow login"
**Solution**: Your account is pending/rejected. Either:
1. Approve it via admin panel
2. Run `UPDATE users SET approval_status = 'approved' WHERE username = 'yourname'`

### All users are stuck in "pending"
**Solution**: Run this SQL to approve all existing users:
```sql
UPDATE users
SET approval_status = 'approved',
    registered_at = NOW()
WHERE approval_status = 'pending';
```

---

## Need Help?

1. **Check if migration was applied**: `DESCRIBE users;`
2. **Check user status**: `SELECT * FROM users WHERE username = 'dan';`
3. **Check database connection**: Verify you're connecting to the right database
4. **Check server logs**: Look for any database errors on Render

---

## Files Reference

- **Migration SQL**: `server/migrations/003_add_user_approval_workflow.sql`
- **Admin Routes**: `server/routes/admin.js` (lines 140-260)
- **Login Handler**: `server/index.js` (lines 718-803)
- **Admin Dashboard**: `src/Pages/AdminDashboard.jsx`
- **API Service**: `src/services/api.js`
