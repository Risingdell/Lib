# Database Improvements for Book Return Approval Workflow

## Problem Analysis
Currently, when a user submits a book, it immediately becomes available again. We need an approval workflow where:
1. User borrows book → Book status changes to "borrowed"
2. User submits book → Creates a return request (pending approval)
3. Admin approves return → Book becomes available again

## Database Structure Issues Identified

### 1. `borrowed_books` table
**Current Issues:**
- `return_status` column exists but is not being used effectively
- Need to distinguish between "pending return approval" and "approved return"

**Recommended Changes:**
```sql
-- Modify borrowed_books table
ALTER TABLE borrowed_books
MODIFY COLUMN return_status ENUM('active', 'pending_return', 'approved', 'rejected') DEFAULT 'active';

-- Add admin approval tracking
ALTER TABLE borrowed_books
ADD COLUMN approved_by INT NULL AFTER return_status,
ADD COLUMN approved_at DATETIME NULL AFTER approved_by,
ADD COLUMN rejection_reason TEXT NULL AFTER approved_at,
ADD FOREIGN KEY (approved_by) REFERENCES admins(id) ON DELETE SET NULL;
```

### 2. `books` table
**Current Status Values:**
- Currently using: 'available', 'borrowed'

**Recommended Enhancement:**
```sql
-- Update status enum to include more states
ALTER TABLE books
MODIFY COLUMN status VARCHAR(50) DEFAULT 'available';

-- Possible status values:
-- 'available' - Book is available for borrowing
-- 'borrowed' - Book is currently borrowed
-- 'pending_return' - Book return is pending admin approval
```

## New Workflow States

### Return Status Flow:
1. **active** - Book is currently borrowed by user
2. **pending_return** - User has submitted return request, waiting for admin approval
3. **approved** - Admin approved the return, book is back in library
4. **rejected** - Admin rejected return (user claims they returned but admin didn't receive)

### Book Status Flow:
1. **available** - Book can be borrowed
2. **borrowed** - Book is with a user (return_status = 'active')
3. **pending_return** - Book return pending approval (return_status = 'pending_return')

## Implementation Steps

### Step 1: Database Migration
Run the SQL commands above to update your database structure.

### Step 2: Update Backend Logic

#### Return Book Endpoint (User Side)
```javascript
// POST /return-book
// When user clicks "Submit Book", create pending return request
// DO NOT make book available immediately
// Set return_status = 'pending_return'
```

#### Admin Approval Endpoints
```javascript
// GET /api/admin/pending-returns
// Fetch all pending return requests

// POST /api/admin/approve-return
// Approve a return request
// Update borrowed_books.return_status = 'approved'
// Update books.status = 'available'
// Set approved_by and approved_at

// POST /api/admin/reject-return
// Reject a return request
// Keep book as borrowed
// Set rejection_reason
```

### Step 3: Frontend Updates

#### User Interface
- Show "Pending Return Approval" status on borrowed books
- Disable "Submit Book" button for already submitted books
- Show rejection reason if admin rejects

#### Admin Panel
- Create "Pending Returns" section
- Show list of books waiting for return approval
- Add "Approve" and "Reject" buttons
- Add reason field for rejections

## SQL Migration Script

```sql
-- Run this script to update your database
USE library;

-- Step 1: Update borrowed_books table
ALTER TABLE borrowed_books
MODIFY COLUMN return_status ENUM('active', 'pending_return', 'approved', 'rejected') DEFAULT 'active';

-- Step 2: Add admin approval tracking columns
ALTER TABLE borrowed_books
ADD COLUMN approved_by INT NULL AFTER return_status,
ADD COLUMN approved_at DATETIME NULL AFTER approved_by,
ADD COLUMN rejection_reason TEXT NULL AFTER approved_at;

-- Step 3: Add foreign key constraint
ALTER TABLE borrowed_books
ADD CONSTRAINT fk_approved_by
FOREIGN KEY (approved_by) REFERENCES admins(id) ON DELETE SET NULL;

-- Step 4: Update existing records to have proper return_status
UPDATE borrowed_books
SET return_status = 'approved'
WHERE returned_at IS NOT NULL AND return_status IS NULL;

UPDATE borrowed_books
SET return_status = 'active'
WHERE returned_at IS NULL AND return_status IS NULL;
```

## Testing Checklist

- [ ] User can borrow a book (book disappears from available list)
- [ ] User sees book in "My Books" section
- [ ] User clicks "Submit Book" → Status changes to "Pending Return"
- [ ] Book does NOT appear in available books yet
- [ ] Admin sees the pending return request
- [ ] Admin can approve → Book becomes available again
- [ ] Admin can reject → Book stays borrowed, user sees rejection reason
- [ ] History shows correct approval timestamps

## Benefits of This Approach

1. **Accountability**: Track which admin approved which return
2. **Audit Trail**: Complete history of book movements
3. **Flexibility**: Can handle cases where user claims return but book wasn't received
4. **Data Integrity**: Books don't magically become available without admin verification
