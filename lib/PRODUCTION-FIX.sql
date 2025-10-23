-- ================================================================
-- PRODUCTION DATABASE FIX
-- Run this SQL on your Render production database
-- ================================================================

-- Use your database (replace 'library' if your database has a different name)
USE library;

-- ================================================================
-- STEP 1: Add approval workflow columns (if they don't exist)
-- ================================================================

-- Add approval status column
ALTER TABLE users
ADD COLUMN approval_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending'
COMMENT 'pending=awaiting admin approval, approved=can access system, rejected=access denied';

-- Add admin tracking columns
ALTER TABLE users
ADD COLUMN approved_by INT NULL
COMMENT 'Admin who approved/rejected the registration';

ALTER TABLE users
ADD COLUMN approved_at DATETIME NULL
COMMENT 'Timestamp when registration was approved/rejected';

ALTER TABLE users
ADD COLUMN rejection_reason TEXT NULL
COMMENT 'Reason if registration was rejected';

ALTER TABLE users
ADD COLUMN registered_at DATETIME DEFAULT CURRENT_TIMESTAMP
COMMENT 'Timestamp when user registered';

-- ================================================================
-- STEP 2: Approve ALL existing users (IMPORTANT!)
-- ================================================================

-- This sets all current users to 'approved' so they can login immediately
UPDATE users
SET approval_status = 'approved',
    registered_at = COALESCE(registered_at, NOW())
WHERE approval_status = 'pending' OR approval_status IS NULL;

-- ================================================================
-- STEP 3: Add indexes for better performance
-- ================================================================

CREATE INDEX idx_approval_status ON users(approval_status);
CREATE INDEX idx_registered_at ON users(registered_at);

-- ================================================================
-- STEP 4: Verify the migration
-- ================================================================

-- Check table structure
DESCRIBE users;

-- Check all users are approved
SELECT
    username,
    approval_status,
    registered_at
FROM users;

-- Show summary
SELECT
    approval_status,
    COUNT(*) as count
FROM users
GROUP BY approval_status;

-- ================================================================
-- RESULT: All existing users should now be able to login!
-- ================================================================
