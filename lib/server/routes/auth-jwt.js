const express = require('express');
const router = express.Router();
const db = require('../db');
const { generateToken, generateAdminToken } = require('../middleware/jwtAuth');

/**
 * User Login with JWT
 * POST /api/auth/login
 */
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  const sql = 'SELECT * FROM users WHERE username = ? AND password = ?';

  db.query(sql, [username, password], (err, results) => {
    if (err) {
      console.error('Database error during login:', err);
      return res.status(500).json({ message: 'Database error' });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const user = results[0];

    // Check approval status
    if (user.approval_status === 'pending') {
      return res.status(403).json({
        message: 'Your registration is pending admin approval. Please wait for approval before logging in.'
      });
    }

    if (user.approval_status === 'rejected') {
      const reason = user.rejection_reason || 'Your registration was rejected.';
      return res.status(403).json({
        message: `Registration rejected: ${reason}`
      });
    }

    // Generate JWT token
    const token = generateToken(user);

    // Return token and user data (without password)
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: 'Login successful',
      token,
      user: userWithoutPassword
    });
  });
});

/**
 * Admin Login with JWT
 * POST /api/auth/admin-login
 */
router.post('/admin-login', (req, res) => {
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

    const admin = results[0];

    // Generate JWT token for admin
    const token = generateAdminToken(admin);

    res.json({
      message: 'Login successful',
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        name: admin.name
      }
    });
  });
});

/**
 * User Registration with JWT (returns token immediately for approved users)
 * POST /api/auth/register
 */
router.post('/register', (req, res) => {
  const { username, password, usn, firstName, lastName, email } = req.body;

  if (!username || !password || !usn || !firstName || !lastName || !email) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // Check if username already exists
  const checkSql = 'SELECT id FROM users WHERE username = ? OR email = ?';

  db.query(checkSql, [username, email], (err, results) => {
    if (err) {
      console.error('Database error checking existing user:', err);
      return res.status(500).json({ message: 'Database error' });
    }

    if (results.length > 0) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }

    const sql = `
      INSERT INTO users (username, password, usn, firstName, lastName, email, approval_status, registered_at)
      VALUES (?, ?, ?, ?, ?, ?, 'pending', NOW())
    `;

    db.query(sql, [username, password, usn, firstName, lastName, email], (err, result) => {
      if (err) {
        console.error('Error inserting user:', err);
        return res.status(500).json({ message: 'Registration failed' });
      }

      res.status(201).json({
        message: 'Registration successful! Your account is pending admin approval.',
        userId: result.insertId,
        requiresApproval: true
      });
    });
  });
});

/**
 * Verify Token
 * GET /api/auth/verify
 */
router.get('/verify', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ valid: false, message: 'No token provided' });
  }

  const jwt = require('jsonwebtoken');
  const { JWT_SECRET } = require('../middleware/jwtAuth');

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ valid: true, user: decoded });
  } catch (err) {
    res.status(401).json({ valid: false, message: 'Invalid or expired token' });
  }
});

module.exports = router;
