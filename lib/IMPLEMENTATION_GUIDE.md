# Book Return Approval Workflow - Implementation Guide

## Overview
This implementation adds an admin approval workflow for book returns. Previously, when users submitted books, they immediately became available. Now, admin approval is required before books return to circulation.

---

## ✅ What Has Been Completed

### 1. Database Schema Updates
**Files Created:**
- `server/migrations/001_add_return_approval_workflow.sql` - Complete migration script
- `DATABASE_IMPROVEMENTS.md` - Detailed documentation of changes

**Changes Made to `borrowed_books` table:**
- ✅ Added `return_status` enum: `'active'`, `'pending_return'`, `'approved'`, `'rejected'`
- ✅ Added `approved_by` column (foreign key to admins table)
- ✅ Added `approved_at` column (timestamp)
- ✅ Added `rejection_reason` column (text)
- ✅ Added indexes for performance optimization

### 2. Backend API Updates

**File: `server/index.js`**
- ✅ Updated `/return-book` endpoint to create pending return requests instead of immediate approval
- ✅ Updated `/borrowed-books` endpoint to include return status information
- ✅ Books now get status `'pending_return'` instead of immediately becoming `'available'`

**File: `server/routes/admin.js`**
- ✅ Added `GET /api/admin/pending-returns` - Fetch all pending return requests
- ✅ Added `POST /api/admin/approve-return` - Approve a return, make book available
- ✅ Added `POST /api/admin/reject-return` - Reject a return with reason

### 3. Frontend User Interface

**File: `src/Pages/MainPage.jsx`**
- ✅ Updated "My Books" section to show return status
- ✅ Added pending status indicator with ⏳ icon
- ✅ Added rejected status indicator with ❌ icon and rejection reason
- ✅ Disabled "Submit Book" button for pending returns
- ✅ Changed button text to "Re-submit Book" for rejected returns

**File: `src/Pages/MainPage.css`**
- ✅ Added styles for return status indicators
- ✅ Added visual distinction for pending/rejected books (colored left border)
- ✅ Added disabled button styles
- ✅ Added rejection reason display styles

---

## 🔄 Workflow Diagram

```
USER BORROWS BOOK
    ↓
Book status: available → borrowed
borrowed_books.return_status: 'active'
    ↓
USER CLICKS "SUBMIT BOOK"
    ↓
Book status: borrowed → pending_return
borrowed_books.return_status: 'pending_return'
borrowed_books.returned_at: NOW()
    ↓
ADMIN REVIEWS REQUEST
    ↓
    ├─→ APPROVE
    │   ↓
    │   Book status: pending_return → available
    │   borrowed_books.return_status: 'approved'
    │   borrowed_books.approved_by: admin_id
    │   borrowed_books.approved_at: NOW()
    │
    └─→ REJECT
        ↓
        Book status: pending_return → borrowed
        borrowed_books.return_status: 'rejected'
        borrowed_books.rejection_reason: "reason text"
        borrowed_books.returned_at: NULL
        User can see rejection reason and re-submit
```

---

## 📋 Implementation Steps

### Step 1: Run Database Migration

```bash
# Option 1: Using MySQL Command Line
mysql -u root -p library < server/migrations/001_add_return_approval_workflow.sql

# Option 2: Using phpMyAdmin
# 1. Open phpMyAdmin
# 2. Select 'library' database
# 3. Go to SQL tab
# 4. Copy and paste contents of server/migrations/001_add_return_approval_workflow.sql
# 5. Click "Go"
```

**Verification:**
```sql
-- Check if columns were added
DESCRIBE borrowed_books;

-- Should see: return_status, approved_by, approved_at, rejection_reason

-- Check data migration
SELECT return_status, COUNT(*) FROM borrowed_books GROUP BY return_status;
```

### Step 2: Restart Backend Server

```bash
cd server
npm install  # In case any dependencies were added
node index.js
```

Expected output:
```
✅ MySQL Connected Successfully
📦 Database: library
🚀 Server running on port 5000
```

### Step 3: Restart Frontend

```bash
# In the project root directory
npm run dev
```

### Step 4: Test the Workflow

#### Test 1: User Submits Book Return
1. Login as a user
2. Go to "My Books" section
3. Click "Submit Book" on a borrowed book
4. ✅ Should see message: "Book return request submitted! Waiting for admin approval."
5. ✅ Book card should show "⏳ Return Pending Admin Approval"
6. ✅ Submit button should change to "Awaiting Approval" (disabled)
7. ✅ Book should NOT appear in "Available Books"

#### Test 2: Admin Approves Return
1. Login as admin (you'll need to create admin panel UI - see next section)
2. View pending returns
3. Click "Approve" on a return request
4. ✅ Book should appear in "Available Books"
5. ✅ Book should disappear from user's "My Books"
6. ✅ Entry should appear in user's "History" with return date

#### Test 3: Admin Rejects Return
1. Login as admin
2. View pending returns
3. Click "Reject" and provide a reason (e.g., "Book not received")
4. ✅ User should see "❌ Return Rejected" in "My Books"
5. ✅ Rejection reason should be displayed
6. ✅ Button should change to "Re-submit Book"
7. ✅ User can click "Re-submit Book" to try again

---

## 🚧 What Still Needs to Be Done

### 1. Admin Panel UI (NOT YET IMPLEMENTED)

You need to create an admin interface to manage pending returns. Here's what's needed:

**Option A: Create a dedicated admin page**
```javascript
// src/Pages/AdminPanel.jsx (NEW FILE)
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminPanel = () => {
  const [pendingReturns, setPendingReturns] = useState([]);

  useEffect(() => {
    fetchPendingReturns();
  }, []);

  const fetchPendingReturns = () => {
    axios.get('http://localhost:5000/api/admin/pending-returns', { withCredentials: true })
      .then(res => setPendingReturns(res.data))
      .catch(err => console.error(err));
  };

  const handleApprove = (borrowId) => {
    if (!window.confirm('Approve this book return?')) return;

    axios.post('http://localhost:5000/api/admin/approve-return',
      { borrow_id: borrowId },
      { withCredentials: true }
    )
    .then(() => {
      alert('Return approved!');
      fetchPendingReturns();
    })
    .catch(err => alert('Error: ' + err.response.data.message));
  };

  const handleReject = (borrowId) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;

    axios.post('http://localhost:5000/api/admin/reject-return',
      { borrow_id: borrowId, reason },
      { withCredentials: true }
    )
    .then(() => {
      alert('Return rejected!');
      fetchPendingReturns();
    })
    .catch(err => alert('Error: ' + err.response.data.message));
  };

  return (
    <div className="admin-panel">
      <h2>Pending Book Returns ({pendingReturns.length})</h2>

      {pendingReturns.length === 0 ? (
        <p>No pending return requests</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Book Title</th>
              <th>Author</th>
              <th>Borrower</th>
              <th>Borrowed On</th>
              <th>Returned On</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pendingReturns.map(item => (
              <tr key={item.borrow_id}>
                <td>{item.book_title}</td>
                <td>{item.book_author}</td>
                <td>{item.borrower_name}</td>
                <td>{new Date(item.borrow_date).toLocaleDateString()}</td>
                <td>{new Date(item.returned_at).toLocaleDateString()}</td>
                <td>
                  <button onClick={() => handleApprove(item.borrow_id)}>
                    ✅ Approve
                  </button>
                  <button onClick={() => handleReject(item.borrow_id)}>
                    ❌ Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminPanel;
```

### 2. Admin Login/Authentication (Check if exists)

Make sure you have admin login functionality:
```javascript
// POST /api/admin/login
// GET /api/admin/me
// POST /api/admin/logout
```

These appear to be referenced in your commented code. You may need to uncomment and activate them.

### 3. Routing for Admin Panel

Add admin routes to your application:
```javascript
// In your main App.jsx or router file
import AdminPanel from './Pages/AdminPanel';

// Add route
<Route path="/admin" element={<AdminPanel />} />
```

---

## 🔍 API Endpoints Reference

### User Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/borrow` | Borrow a book |
| POST | `/return-book` | Submit book return (creates pending request) |
| GET | `/borrowed-books` | Get user's borrowed books with return status |
| GET | `/borrow-history` | Get user's borrow history (approved returns) |

### Admin Endpoints

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| GET | `/api/admin/pending-returns` | Get all pending return requests | - |
| POST | `/api/admin/approve-return` | Approve a book return | `{ borrow_id: number }` |
| POST | `/api/admin/reject-return` | Reject a book return | `{ borrow_id: number, reason: string }` |

---

## 🧪 Testing Checklist

- [ ] Database migration runs without errors
- [ ] Backend server starts successfully
- [ ] User can borrow a book
- [ ] User can submit book return
- [ ] Book shows "pending" status in UI
- [ ] Book does NOT appear in available books
- [ ] Admin can see pending returns
- [ ] Admin can approve return
- [ ] Approved book becomes available
- [ ] Admin can reject return with reason
- [ ] User sees rejection reason
- [ ] User can re-submit rejected book
- [ ] History shows correct timestamps

---

## 🐛 Troubleshooting

### Error: "Column 'return_status' cannot be null"
**Solution:** Run the migration script to update the database schema.

### Error: "Unknown column 'return_status'"
**Solution:** Make sure you ran the migration and refreshed the database connection.

### Pending returns not showing in admin panel
**Solution:**
1. Check admin is logged in: `GET /api/admin/me`
2. Check if there are actually pending returns in database:
   ```sql
   SELECT * FROM borrowed_books WHERE return_status = 'pending_return';
   ```

### Book still appears in available books after user submission
**Solution:** Check that the `/return-book` endpoint is updating the books table status to 'pending_return'.

---

## 📊 Database Status Values

### books.status
- `'available'` - Book can be borrowed
- `'borrowed'` - Book is currently with a user
- `'pending_return'` - Book return is waiting for admin approval

### borrowed_books.return_status
- `'active'` - Book is currently borrowed
- `'pending_return'` - Return submitted, waiting for admin
- `'approved'` - Return approved by admin
- `'rejected'` - Return rejected by admin

---

## 🎯 Next Steps

1. ✅ Run the database migration
2. ✅ Test the user return workflow
3. ⏳ Create admin panel UI (see section above)
4. ⏳ Add admin authentication if not exists
5. ⏳ Test the complete workflow
6. ⏳ Add notifications (optional)
7. ⏳ Add email alerts for pending returns (optional)

---

## 📝 Notes

- All changes are backward compatible with existing data
- The migration script includes a rollback section if needed
- Existing returned books are automatically marked as 'approved'
- Active borrowed books are marked as 'active' status
