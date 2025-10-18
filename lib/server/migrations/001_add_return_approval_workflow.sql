-- Migration: Add Return Approval Workflow
-- Date: 2025-10-18
-- Description: Updates database to support admin approval for book returns

USE library;

-- ==========================================
-- STEP 1: Backup Current Data (Recommended)
-- ==========================================
-- Run this before migration to backup your data:
-- CREATE TABLE borrowed_books_backup AS SELECT * FROM borrowed_books;

-- ==========================================
-- STEP 2: Update borrowed_books Table
-- ==========================================

-- Modify return_status to support new workflow states
ALTER TABLE borrowed_books
MODIFY COLUMN return_status ENUM('active', 'pending_return', 'approved', 'rejected') DEFAULT 'active'
COMMENT 'active=borrowed, pending_return=waiting approval, approved=return approved, rejected=return rejected';

-- Add admin approval tracking columns
ALTER TABLE borrowed_books
ADD COLUMN IF NOT EXISTS approved_by INT NULL
COMMENT 'Admin who approved/rejected the return'
AFTER return_status;

ALTER TABLE borrowed_books
ADD COLUMN IF NOT EXISTS approved_at DATETIME NULL
COMMENT 'Timestamp when return was approved/rejected'
AFTER approved_by;

ALTER TABLE borrowed_books
ADD COLUMN IF NOT EXISTS rejection_reason TEXT NULL
COMMENT 'Reason if return was rejected'
AFTER approved_at;

-- Add foreign key constraint for admin tracking
ALTER TABLE borrowed_books
ADD CONSTRAINT fk_borrowed_books_approved_by
FOREIGN KEY (approved_by) REFERENCES admins(id)
ON DELETE SET NULL
ON UPDATE CASCADE;

-- ==========================================
-- STEP 3: Update Existing Data
-- ==========================================

-- Set all previously returned books to 'approved' status
UPDATE borrowed_books
SET return_status = 'approved'
WHERE returned_at IS NOT NULL AND (return_status IS NULL OR return_status = '');

-- Set all currently borrowed books to 'active' status
UPDATE borrowed_books
SET return_status = 'active'
WHERE returned_at IS NULL AND (return_status IS NULL OR return_status = '');

-- ==========================================
-- STEP 4: Add Index for Performance
-- ==========================================

-- Index for faster queries on pending returns
CREATE INDEX idx_return_status ON borrowed_books(return_status);

-- Index for faster queries on user's borrowed books
CREATE INDEX idx_user_status ON borrowed_books(user_id, return_status);

-- ==========================================
-- STEP 5: Verify Migration
-- ==========================================

-- Check the updated table structure
DESCRIBE borrowed_books;

-- Verify data integrity
SELECT
    return_status,
    COUNT(*) as count,
    COUNT(CASE WHEN returned_at IS NOT NULL THEN 1 END) as with_return_date,
    COUNT(CASE WHEN returned_at IS NULL THEN 1 END) as without_return_date
FROM borrowed_books
GROUP BY return_status;

-- Show sample data
SELECT
    id,
    user_id,
    book_id,
    borrow_date,
    expiry_date,
    returned_at,
    return_status,
    approved_by,
    approved_at
FROM borrowed_books
LIMIT 10;

-- ==========================================
-- ROLLBACK SCRIPT (if needed)
-- ==========================================
/*
-- Uncomment and run this if you need to rollback the migration

-- Remove new columns
ALTER TABLE borrowed_books
DROP FOREIGN KEY fk_borrowed_books_approved_by;

ALTER TABLE borrowed_books
DROP COLUMN rejection_reason,
DROP COLUMN approved_at,
DROP COLUMN approved_by;

-- Restore original return_status enum
ALTER TABLE borrowed_books
MODIFY COLUMN return_status ENUM('returned', 'borrowed') NULL;

-- Drop indexes
DROP INDEX idx_return_status ON borrowed_books;
DROP INDEX idx_user_status ON borrowed_books;

-- Restore from backup (if you created one)
-- TRUNCATE borrowed_books;
-- INSERT INTO borrowed_books SELECT * FROM borrowed_books_backup;
*/
