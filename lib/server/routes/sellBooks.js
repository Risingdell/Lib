const express = require('express');
const router = express.Router();
const db = require('../db'); // or wherever your MySQL pool is
// ✅ Correct path from routes/ to middlewares/

// ADD to sellerbook.js
router.get('/api/sell-books', (req, res) => {
  db.query('SELECT * FROM used_books_marketplace WHERE status = "available"', (err, result) => {
    if (err) return res.status(500).json({ message: 'Fetch failed' });
    res.json(result);
  });
});

router.post('/sell-books/request', (req, res) => {
  if (!req.session.user) return res.status(401).json({ message: 'Unauthorized' });

  const userId = req.session.user.id;
  const { id } = req.body;

  const sql = `
    UPDATE used_books_marketplace
    SET status = 'requested', requested_by = ?, requested_at = NOW()
    WHERE id = ? AND user_id != ? AND status = 'available'
  `;

  db.query(sql, [userId, id, userId], (err, result) => {
    if (err) return res.status(500).json({ message: 'Request failed' });
    if (result.affectedRows === 0)
      return res.status(400).json({ message: 'Invalid or unavailable book, or your own listing' });
    res.json({ message: 'Book requested successfully' });
  });
});

// ✅ Confirm received — buyer accepts book
router.post('/sell-books/confirm-receive', (req, res) => {
  if (!req.session.user) return res.status(401).json({ message: 'Unauthorized' });

  const { id } = req.body;
  const userId = req.session.user.id;

  const sql = `
    UPDATE used_books_marketplace
    SET status = 'received', received_at = NOW(), buyer_id = ?
    WHERE id = ? AND requested_by = ? AND status = 'requested'
  `;

  db.query(sql, [userId, id, userId], (err, result) => {
    if (err) return res.status(500).json({ message: 'Receive failed' });
    if (result.affectedRows === 0)
      return res.status(403).json({ message: 'Not authorized or invalid request' });
    res.json({ message: 'Book marked as received' });
  });
});

// ✅ Cancel request — buyer cancels before receiving
router.post('/sell-books/cancel-request', (req, res) => {
  if (!req.session.user) return res.status(401).json({ message: 'Unauthorized' });

  const { id } = req.body;
  const userId = req.session.user.id;

  const sql = `
    UPDATE used_books_marketplace
    SET status = 'available', requested_by = NULL, requested_at = NULL
    WHERE id = ? AND requested_by = ? AND status = 'requested'
  `;

  db.query(sql, [id, userId], (err, result) => {
    if (err) return res.status(500).json({ message: 'Cancel request failed' });
    if (result.affectedRows === 0)
      return res.status(403).json({ message: 'Not authorized or already not requested' });
    res.json({ message: 'Request canceled successfully' });
  });
});

module.exports = router;
