-- ================================================================
-- CLEVER CLOUD DATABASE FIX
-- Run this SQL in your Clever Cloud phpMyAdmin/Adminer console
-- Make sure you're already connected to your database first
-- ================================================================

-- Step 1: Add approval workflow columns to users table
ALTER TABLE users
ADD COLUMN approval_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
ADD COLUMN approved_by INT NULL,
ADD COLUMN approved_at DATETIME NULL,
ADD COLUMN rejection_reason TEXT NULL,
ADD COLUMN registered_at DATETIME DEFAULT CURRENT_TIMESTAMP;

-- Step 2: Approve all existing users so they can login immediately
UPDATE users
SET approval_status = 'approved',
    registered_at = COALESCE(registered_at, NOW())
WHERE approval_status = 'pending' OR approval_status IS NULL;

-- Step 3: Add performance indexes
CREATE INDEX idx_approval_status ON users(approval_status);
CREATE INDEX idx_registered_at ON users(registered_at);

-- Step 4: Verify the migration (these are SELECT statements to check results)
DESCRIBE users;

SELECT username, approval_status, registered_at FROM users;

SELECT approval_status, COUNT(*) as count FROM users GROUP BY approval_status;
