const express = require('express');
const router = express.Router();
const db = require('../db'); // adjust if needed

// ==========================================
// ADMIN AUTHENTICATION ENDPOINTS
// ==========================================

// Admin login
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  const sql = 'SELECT * FROM admins WHERE username = ? AND password = ?';

  db.query(sql, [username, password], (err, results) => {
    if (err) {
      console.error('Database error during admin login:', err);
      return res.status(500).json({ message: 'Database error' });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Set admin session
    req.session.admin = {
      id: results[0].id,
      username: results[0].username,
      name: results[0].name
    };

    res.json({
      message: 'Login successful',
      admin: req.session.admin
    });
  });
});

// Get logged-in admin
router.get('/me', (req, res) => {
  if (!req.session.admin) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  res.json(req.session.admin);
});

// Admin logout
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Logout failed' });
    }
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out successfully' });
  });
});

// ==========================================
// ADMIN BOOK MANAGEMENT ENDPOINTS
// ==========================================

router.get('/borrowed-books', (req, res) => {
  const sql = `
    SELECT
      bb.id AS borrow_id,
      b.title AS book_title,
      b.author AS author,
      CONCAT(u.firstName, ' ', u.lastName) AS borrower_name,
      u.username AS username,
      bb.borrow_date,
      bb.expiry_date,
      bb.return_status AS status
    FROM borrowed_books bb
    JOIN books b ON bb.book_id = b.id
    JOIN users u ON bb.user_id = u.id
    WHERE bb.return_status = 'active'
    ORDER BY bb.expiry_date ASC;
  `;

  // ✅ DO NOT destructure the result
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching borrowed books:', err);
      return res.status(500).json({ message: 'Internal Server Error' });
    }

    res.json(results); // ✅ Send full array of results
  });
});

router.get('/expired-books', (req, res) => {
  const sql = `
  SELECT
  b.title AS book_title,
  b.author AS book_author,
  u.username AS borrower_username,
  bb.expiry_date
FROM borrowed_books bb
JOIN books b ON bb.book_id = b.id
JOIN users u ON bb.user_id = u.id
WHERE bb.returned_at IS NULL
  AND bb.expiry_date < NOW()
ORDER BY bb.expiry_date ASC;

`;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching expired books:', err);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
    res.json(results);
  });
});

router.post('/add-book', (req, res) => {
  const { acc_no, author, date, donated_by, sl_no, status, title } = req.body;
  const sql = `
    INSERT INTO books (acc_no, author, date, donated_by, sl_no, status, title)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  db.query(sql, [acc_no, author, date || null, donated_by || null, sl_no, status || null, title], (err, result) => {
    if (err) {
      console.error('Error inserting book:', err);
      return res.status(500).json({ message: 'Database error' });
    }
    res.json({ message: 'Book added successfully' });
  });
});

// ==========================================
// USER APPROVAL ENDPOINTS
// ==========================================

// Get all pending user registrations
router.get('/pending-users', (req, res) => {
  if (!req.session || !req.session.admin) {
    return res.status(401).json({ message: 'Unauthorized. Admin login required.' });
  }

  const sql = `
    SELECT
      id,
      username,
      usn,
      firstName,
      lastName,
      email,
      approval_status,
      registered_at
    FROM users
    WHERE approval_status = 'pending'
    ORDER BY registered_at ASC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching pending users:', err);
      return res.status(500).json({ message: 'Failed to fetch pending users' });
    }
    res.json(results);
  });
});

// Approve a user registration
router.post('/approve-user', (req, res) => {
  const { user_id } = req.body;

  if (!req.session || !req.session.admin) {
    return res.status(401).json({ message: 'Unauthorized. Admin login required.' });
  }

  if (!user_id) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  const admin_id = req.session.admin.id;

  // Check if user exists and is pending
  const checkSql = 'SELECT id, username FROM users WHERE id = ? AND approval_status = "pending"';

  db.query(checkSql, [user_id], (err, result) => {
    if (err) {
      console.error('Error checking user:', err);
      return res.status(500).json({ message: 'Database error' });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: 'Pending user not found' });
    }

    // Update user to approved status
    const updateSql = `
      UPDATE users
      SET approval_status = 'approved',
          approved_by = ?,
          approved_at = NOW()
      WHERE id = ?
    `;

    db.query(updateSql, [admin_id, user_id], (err) => {
      if (err) {
        console.error('Error approving user:', err);
        return res.status(500).json({ message: 'Failed to approve user' });
      }

      res.json({ message: `User "${result[0].username}" approved successfully. They can now login.` });
    });
  });
});

// Reject a user registration
router.post('/reject-user', (req, res) => {
  const { user_id, reason } = req.body;

  if (!req.session || !req.session.admin) {
    return res.status(401).json({ message: 'Unauthorized. Admin login required.' });
  }

  if (!user_id) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  if (!reason || reason.trim() === '') {
    return res.status(400).json({ message: 'Rejection reason is required' });
  }

  const admin_id = req.session.admin.id;

  // Check if user exists and is pending
  const checkSql = 'SELECT id, username FROM users WHERE id = ? AND approval_status = "pending"';

  db.query(checkSql, [user_id], (err, result) => {
    if (err) {
      console.error('Error checking user:', err);
      return res.status(500).json({ message: 'Database error' });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: 'Pending user not found' });
    }

    // Update user to rejected status
    const updateSql = `
      UPDATE users
      SET approval_status = 'rejected',
          approved_by = ?,
          approved_at = NOW(),
          rejection_reason = ?
      WHERE id = ?
    `;

    db.query(updateSql, [admin_id, reason, user_id], (err) => {
      if (err) {
        console.error('Error rejecting user:', err);
        return res.status(500).json({ message: 'Failed to reject user' });
      }

      res.json({ message: `User "${result[0].username}" registration rejected.` });
    });
  });
});

// Get all members (approved users)
router.get('/members', (req, res) => {
  if (!req.session || !req.session.admin) {
    return res.status(401).json({ message: 'Unauthorized. Admin login required.' });
  }

  const sql = `
    SELECT
      id,
      username,
      usn,
      firstName,
      lastName,
      email,
      approval_status,
      registered_at,
      approved_at,
      approved_by
    FROM users
    WHERE approval_status = 'approved'
    ORDER BY registered_at DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching members:', err);
      return res.status(500).json({ message: 'Failed to fetch members' });
    }
    res.json(results);
  });
});

// ==========================================
// BORROWING HISTORY ENDPOINT
// ==========================================

// Get complete borrowing history (all records)
router.get('/borrowing-history', (req, res) => {
  const sql = `
    SELECT
      bb.id AS borrow_id,
      b.title AS book_title,
      b.author AS author,
      b.acc_no,
      CONCAT(u.firstName, ' ', u.lastName) AS borrower_name,
      u.username AS username,
      bb.borrow_date,
      bb.expiry_date,
      bb.returned_at,
      bb.return_status,
      bb.approved_at,
      CASE
        WHEN bb.return_status = 'approved' THEN 'Returned'
        WHEN bb.return_status = 'rejected' THEN 'Return Rejected'
        WHEN bb.return_status = 'pending_return' THEN 'Pending Return'
        WHEN bb.return_status = 'active' THEN 'Borrowed'
        ELSE bb.return_status
      END AS status_display
    FROM borrowed_books bb
    JOIN books b ON bb.book_id = b.id
    JOIN users u ON bb.user_id = u.id
    ORDER BY bb.borrow_date DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching borrowing history:', err);
      return res.status(500).json({ message: 'Failed to fetch borrowing history' });
    }
    res.json(results);
  });
});

// ==========================================
// BOOK RETURN APPROVAL ENDPOINTS
// ==========================================

// Get all pending return requests
router.get('/pending-returns', (req, res) => {
  const sql = `
    SELECT
      bb.id AS borrow_id,
      bb.book_id,
      bb.user_id,
      b.title AS book_title,
      b.author AS book_author,
      b.acc_no,
      u.username AS borrower_username,
      CONCAT(u.firstName, ' ', u.lastName) AS borrower_name,
      bb.borrow_date,
      bb.expiry_date,
      bb.returned_at,
      bb.return_status
    FROM borrowed_books bb
    JOIN books b ON bb.book_id = b.id
    JOIN users u ON bb.user_id = u.id
    WHERE bb.return_status = 'pending_return'
    ORDER BY bb.returned_at ASC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching pending returns:', err);
      return res.status(500).json({ message: 'Failed to fetch pending returns' });
    }
    res.json(results);
  });
});

// Approve a book return
router.post('/approve-return', (req, res) => {
  const { borrow_id } = req.body;

  if (!req.session || !req.session.admin) {
    return res.status(401).json({ message: 'Unauthorized. Admin login required.' });
  }

  const admin_id = req.session.admin.id;

  // First, get the book_id from borrowed_books
  const getBookSql = 'SELECT book_id FROM borrowed_books WHERE id = ? AND return_status = "pending_return"';

  db.query(getBookSql, [borrow_id], (err, result) => {
    if (err) {
      console.error('Error fetching borrow record:', err);
      return res.status(500).json({ message: 'Database error' });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: 'Pending return request not found' });
    }

    const book_id = result[0].book_id;

    // Update borrowed_books to approved status
    const updateBorrowSql = `
      UPDATE borrowed_books
      SET return_status = 'approved',
          approved_by = ?,
          approved_at = NOW()
      WHERE id = ?
    `;

    // Update books table to make book available again
    const updateBookSql = `
      UPDATE books
      SET status = 'available'
      WHERE id = ?
    `;

    db.query(updateBorrowSql, [admin_id, borrow_id], (err) => {
      if (err) {
        console.error('Error approving return:', err);
        return res.status(500).json({ message: 'Failed to approve return' });
      }

      db.query(updateBookSql, [book_id], (err) => {
        if (err) {
          console.error('Error updating book status:', err);
          return res.status(500).json({ message: 'Approved but book status update failed' });
        }

        res.json({ message: 'Book return approved successfully. Book is now available.' });
      });
    });
  });
});

// Reject a book return
router.post('/reject-return', (req, res) => {
  const { borrow_id, reason } = req.body;

  if (!req.session || !req.session.admin) {
    return res.status(401).json({ message: 'Unauthorized. Admin login required.' });
  }

  const admin_id = req.session.admin.id;

  if (!reason || reason.trim() === '') {
    return res.status(400).json({ message: 'Rejection reason is required' });
  }

  // First, get the book_id
  const getBookSql = 'SELECT book_id FROM borrowed_books WHERE id = ? AND return_status = "pending_return"';

  db.query(getBookSql, [borrow_id], (err, result) => {
    if (err) {
      console.error('Error fetching borrow record:', err);
      return res.status(500).json({ message: 'Database error' });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: 'Pending return request not found' });
    }

    const book_id = result[0].book_id;

    // Update borrowed_books to rejected status
    const updateBorrowSql = `
      UPDATE borrowed_books
      SET return_status = 'rejected',
          approved_by = ?,
          approved_at = NOW(),
          rejection_reason = ?,
          returned_at = NULL
      WHERE id = ?
    `;

    // Update books table back to borrowed status
    const updateBookSql = `
      UPDATE books
      SET status = 'borrowed'
      WHERE id = ?
    `;

    db.query(updateBorrowSql, [admin_id, reason, borrow_id], (err) => {
      if (err) {
        console.error('Error rejecting return:', err);
        return res.status(500).json({ message: 'Failed to reject return' });
      }

      db.query(updateBookSql, [book_id], (err) => {
        if (err) {
          console.error('Error updating book status:', err);
          return res.status(500).json({ message: 'Rejected but book status update failed' });
        }

        res.json({ message: 'Book return rejected. User has been notified.' });
      });
    });
  });
});


module.exports = router;
