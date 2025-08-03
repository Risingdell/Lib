const express = require('express');
const router = express.Router();
const db = require('../db'); // or wherever your MySQL pool is
// ✅ Correct path from routes/ to middlewares/



// ✅ Mark book as sold
router.post('/sell-books/buy', (req, res) => {
if (!req.session.user) return res.status(401).json({ message: 'Unauthorized' });


  const { id } = req.body;
  const buyerId = req.session.user.id;
  const sql = `
    UPDATE used_books_marketplace
    SET status = 'sold', buyer_id = ?
    WHERE id = ?
  `;
  db.query(sql, [buyerId, id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Failed to mark as sold' });
    res.json({ message: 'Book marked as sold' });
  });
});
// ❌ Cancel selling book
router.delete('/sell-books/:id', (req, res) => {
  if (!req.session.user) return res.status(401).json({ message: 'Unauthorized' });
  /*const id = req.params.id;
  const userId = req.user.id;*/

  const id = req.params.id;
  const userId = req.session.user.id;





  const sql = `
    DELETE FROM used_books_marketplace
    WHERE id = ? AND user_id = ?
  `;
  db.query(sql, [id, userId], (err, result) => {
    if (err) return res.status(500).json({ message: 'Failed to delete book' });
    if (result.affectedRows === 0) return res.status(403).json({ message: 'Not authorized' });
    res.json({ message: 'Book listing cancelled' });
  });
});
// 1. Get all listed items
router.get('/sell-books', (req, res) => {
  db.query('SELECT * FROM used_books_marketplace', (err, result) => {
    if (err) return res.status(500).json({ message: 'Fetch failed' });
    res.json(result);
  });
});

// 2. Request a book
router.post('/sell-books/request', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
    const { id } = req.body;
  const userId = req.session.user.id;
  const sql = `
    UPDATE used_books_marketplace
    SET status = 'requested', requested_by = ?, requested_at = NOW()
    WHERE id = ? AND status = 'available'
  `;

  db.query(sql, [userId, id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Request failed' });
    if (result.affectedRows === 0) return res.status(400).json({ message: 'Already requested or not available' });
    res.json({ message: 'Book requested successfully' });
  });
});

// 3. Confirm received
router.post('/sell-books/confirm-receive',  (req, res) => {
  if (!req.session.user) return res.status(401).json({ message: 'Unauthorized' });

  /*const { id } = req.body;
  const userId = req.user.id;*/

  const { id } = req.body;
  const userId = req.session.user.id;

  const sql = `
    UPDATE used_books_marketplace
    SET status = 'received', received_at = NOW()
    WHERE id = ? AND requested_by = ?
  `;

  db.query(sql, [id, userId], (err, result) => {
    if (err) return res.status(500).json({ message: 'Confirm failed' });
    if (result.affectedRows === 0) return res.status(403).json({ message: 'Unauthorized or invalid request' });
    res.json({ message: 'Book marked as received' });
  });
});

module.exports = router;
