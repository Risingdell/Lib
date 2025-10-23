-- Migration: Add User Registration Approval Workflow
-- Date: 2025-10-23
-- Description: Updates database to support admin approval for new user registrations

USE library;

-- ==========================================
-- STEP 1: Backup Current Data (Recommended)
-- ==========================================
-- Run this before migration to backup your data:
-- CREATE TABLE users_backup AS SELECT * FROM users;

-- ==========================================
-- STEP 2: Update users Table
-- ==========================================

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

-- Add foreign key constraint for admin tracking
ALTER TABLE users
ADD CONSTRAINT fk_users_approved_by
FOREIGN KEY (approved_by) REFERENCES admins(id)
ON DELETE SET NULL
ON UPDATE CASCADE;

-- ==========================================
-- STEP 3: Update Existing Data
-- ==========================================

-- Set all existing users to 'approved' status (they were registered before approval system)
UPDATE users
SET approval_status = 'approved',
    registered_at = COALESCE(created_at, NOW())
WHERE approval_status IS NULL OR approval_status = 'pending';

-- ==========================================
-- STEP 4: Add Indexes for Performance
-- ==========================================

-- Index for faster queries on pending registrations
CREATE INDEX idx_approval_status ON users(approval_status);

-- Index for faster queries on registration date
CREATE INDEX idx_registered_at ON users(registered_at);

-- ==========================================
-- STEP 5: Verify Migration
-- ==========================================

-- Check the updated table structure
DESCRIBE users;

-- Verify data integrity
SELECT
    approval_status,
    COUNT(*) as count
FROM users
GROUP BY approval_status;

-- Show sample data
SELECT
    id,
    username,
    firstName,
    lastName,
    email,
    approval_status,
    approved_by,
    approved_at,
    registered_at
FROM users
LIMIT 10;

-- ==========================================
-- ROLLBACK SCRIPT (if needed)
-- ==========================================
/*
-- Uncomment and run this if you need to rollback the migration

-- Remove foreign key constraint
ALTER TABLE users
DROP FOREIGN KEY fk_users_approved_by;

-- Remove new columns
ALTER TABLE users
DROP COLUMN registered_at,
DROP COLUMN rejection_reason,
DROP COLUMN approved_at,
DROP COLUMN approved_by,
DROP COLUMN approval_status;

-- Drop indexes
DROP INDEX idx_approval_status ON users;
DROP INDEX idx_registered_at ON users;

-- Restore from backup (if you created one)
-- TRUNCATE users;
-- INSERT INTO users SELECT * FROM users_backup;
*/
