const express = require('express');
const router = express.Router();
const db = require('../db'); // adjust if needed

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
      bb.status
    FROM borrowed_books bb
    JOIN books b ON bb.book_id = b.id
    JOIN users u ON bb.user_id = u.id
    WHERE bb.status = 'available'
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


module.exports = router;
