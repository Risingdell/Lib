const express = require('express');
const router = express.Router();
const db = require('../db');

// ✅ GET all listings (for seller or buyer)
router.get('/sell-books', (req, res) => {
  const userId = req.session.user?.id;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  const sql = `
    SELECT m.*, u.username AS buyer_name
    FROM used_books_marketplace m
    LEFT JOIN users u ON m.buyer_id = u.id
    WHERE m.seller_id = ?
      OR m.status IN ('available', 'requested', 'received')
      OR m.buyer_id = ?
    ORDER BY m.id DESC
  `;

  db.query(sql, [userId, userId], (err, result) => {
    if (err) return res.status(500).json({ message: 'Fetch failed' });
    res.json(result);
  });
});


// ✅ Request to buy a listed book
router.post('/sell-books/request', (req, res) => {
  if (!req.session.user) return res.status(401).json({ message: 'Unauthorized' });

  const buyerId = req.session.user.id;
  const { id } = req.body;

  const fetchSql = `SELECT * FROM used_books_marketplace WHERE id = ? AND status = 'available'`;

  db.query(fetchSql, [id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (results.length === 0) return res.status(400).json({ message: 'Book not available' });

    const book = results[0];
    if (book.seller_id === buyerId) {
      return res.status(403).json({ message: 'You cannot request your own listing' });
    }

    const insertSql = `
      INSERT INTO selling_books (title, author, acc_no, contact, description, type, seller_id, buyer_id, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'requested')
    `;

    const insertValues = [
      book.title, book.author, book.acc_no, book.contact,
      book.description, book.type, book.seller_id, buyerId
    ];

    db.query(insertSql, insertValues, (err) => {
      if (err) return res.status(500).json({ message: 'Failed to create transaction' });

      const updateSql = `
        UPDATE used_books_marketplace
        SET status = 'requested', buyer_id = ?, requested_at = NOW()
        WHERE id = ?
      `;

      db.query(updateSql, [buyerId, id], (err) => {
        if (err) return res.status(500).json({ message: 'Failed to update book status' });

        return res.json({ message: 'Book successfully requested' });
      });
    });
  });
});

// ✅ Confirm book was received
router.post('/sell-books/confirm-receive', (req, res) => {
  if (!req.session.user) return res.status(401).json({ message: 'Unauthorized' });

  const buyerId = req.session.user.id;
  const { id } = req.body;

  const sql = `
    UPDATE used_books_marketplace
    SET status = 'received'
    WHERE id = ? AND buyer_id = ? AND status = 'requested'
  `;

  db.query(sql, [id, buyerId], (err, result) => {
    if (err) return res.status(500).json({ message: 'Receive failed' });
    if (result.affectedRows === 0)
      return res.status(403).json({ message: 'Not authorized or invalid request' });

    res.json({ message: 'Book marked as received' });
  });
});

// ✅ Cancel a request
router.post('/sell-books/cancel-request', (req, res) => {
  if (!req.session.user) return res.status(401).json({ message: 'Unauthorized' });

  const buyerId = req.session.user.id;
  const { id } = req.body;

  const deleteSql = `
    DELETE FROM selling_books
    WHERE buyer_id = ? AND title = (SELECT title FROM used_books_marketplace WHERE id = ?)
  `;

  db.query(deleteSql, [buyerId, id], (err) => {
    if (err) return res.status(500).json({ message: 'Delete failed' });

    const updateSql = `
      UPDATE used_books_marketplace
      SET status = 'available', buyer_id = NULL, requested_at = NULL
      WHERE id = ? AND buyer_id = ?
    `;

    db.query(updateSql, [id, buyerId], (err) => {
      if (err) return res.status(500).json({ message: 'Update failed' });
      res.json({ message: 'Request cancelled' });
    });
  });
});

// ✅ Delete a listing by seller
router.delete('/sell-books/:id', (req, res) => {
  if (!req.session.user) return res.status(401).json({ message: 'Unauthorized' });

  const sellerId = req.session.user.id;
  const { id } = req.params;

  const sql = `
    DELETE FROM used_books_marketplace
    WHERE id = ? AND seller_id = ? AND status = 'available'
  `;

  db.query(sql, [id, sellerId], (err, result) => {
    if (err) return res.status(500).json({ message: 'Delete failed' });
    if (result.affectedRows === 0)
      return res.status(403).json({ message: 'Not authorized or already requested' });

    res.json({ message: 'Listing deleted successfully' });
  });
});


// ✅ New: fetch books from borrowed_books (e.g., eligible for buy/resell)
router.get('/sell-books/from-borrowed', (req, res) => {
  if (!req.session.user) return res.status(401).json({ message: 'Unauthorized' });

  const userId = req.session.user.id;
  const sql = `
    SELECT b.id AS book_id, b.title, b.author, b.acc_no
    FROM borrowed_books bb
    JOIN books b ON bb.book_id = b.id
    WHERE bb.user_id = ? AND bb.returned_at IS NULL
  `;

  db.query(sql, [userId], (err, result) => {
    if (err) return res.status(500).json({ message: 'Failed to fetch borrowed books' });
    res.json(result);
  });
});


// ✅ New: create listing for borrowed book (Buy from borrowed tab)
router.post('/sell-books/buy-from-borrowed', (req, res) => {
  if (!req.session.user) return res.status(401).json({ message: 'Unauthorized' });

  const buyerId = req.session.user.id;
  const { book_id, title, author, acc_no, description, contact, type } = req.body;

  const insertSql = `
    INSERT INTO used_books_marketplace
    (title, author, acc_no, description, contact, type, seller_id, buyer_id, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'requested')
  `;

  db.query(
    insertSql,
    [title, author, acc_no, description, contact, type, buyerId, buyerId],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'Failed to list book from borrowed' });
      res.json({ message: 'Listed successfully from borrowed' });
    }
  );
});

router.post('/sell-books/buy', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const buyerId = req.session.user.id;
  const { bookId } = req.body; // frontend should send { bookId: <number> }

  const fetchSql = `
    SELECT * FROM used_books_marketplace
    WHERE id = ? AND status = 'available'
  `;

  db.query(fetchSql, [bookId], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });

    if (results.length === 0) {
      return res.status(404).json({ message: 'Book not available or already requested' });
    }

    const book = results[0];

    // Prevent buying your own listing
    if (book.seller_id === buyerId) {
      return res.status(403).json({ message: 'You cannot buy your own book' });
    }

    // Optional: insert into selling_books (if you need transaction history)
    const insertSql = `
      INSERT INTO selling_books (title, author, acc_no, contact, description, type, seller_id, buyer_id, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'requested')
    `;

    const insertValues = [
      book.title,
      book.author,
      book.acc_no,
      book.contact,
      book.description,
      book.type,
      book.seller_id,
      buyerId
    ];

    db.query(insertSql, insertValues, (insertErr) => {
      if (insertErr) {
        console.error('Insert failed:', insertErr);
        return res.status(500).json({ message: 'Failed to insert buy record' });
      }

      // Update the book status to 'requested'
      const updateSql = `
        UPDATE used_books_marketplace
        SET status = 'requested', buyer_id = ?, requested_at = NOW()
        WHERE id = ?
      `;

      db.query(updateSql, [buyerId, bookId], (updateErr) => {
        if (updateErr) {
          console.error('Update failed:', updateErr);
          return res.status(500).json({ message: 'Failed to update book status' });
        }

        res.status(200).json({ message: 'Book requested successfully' });
      });
    });
  });
});

module.exports = router;
