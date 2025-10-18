-- Quick Fix: Add test admin with plain text password
-- This allows you to test the admin login immediately

USE library;

-- Delete existing test admin if exists
DELETE FROM admins WHERE username = 'testadmin';

-- Create new test admin with plain text password
INSERT INTO admins (name, username, password)
VALUES ('Test Administrator', 'testadmin', 'admin123');

-- Verify the admin was created
SELECT id, name, username, password FROM admins WHERE username = 'testadmin';
