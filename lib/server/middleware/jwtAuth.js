const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'library-jwt-secret-key-change-in-production';
const JWT_EXPIRES_IN = '24h';

/**
 * Generate JWT token for user
 */
function generateToken(user) {
  const payload = {
    id: user.id,
    username: user.username,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    usn: user.usn,
    type: 'user'
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Generate JWT token for admin
 */
function generateAdminToken(admin) {
  const payload = {
    id: admin.id,
    username: admin.username,
    name: admin.name,
    type: 'admin'
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Middleware to verify JWT token
 */
function verifyToken(req, res, next) {
  // Get token from Authorization header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: 'No token provided. Please login.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error('JWT verification failed:', err.message);

    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired. Please login again.' });
    }

    return res.status(401).json({ message: 'Invalid token. Please login again.' });
  }
}

/**
 * Middleware to verify admin JWT token
 */
function verifyAdminToken(req, res, next) {
  // Get token from Authorization header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: 'No token provided. Admin login required.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // Check if it's an admin token
    if (decoded.type !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    req.admin = decoded;
    next();
  } catch (err) {
    console.error('Admin JWT verification failed:', err.message);

    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired. Please login again.' });
    }

    return res.status(401).json({ message: 'Invalid token. Admin login required.' });
  }
}

/**
 * Dual authentication middleware - supports both session and JWT
 * This allows gradual migration from session to JWT
 */
function verifyAuth(req, res, next) {
  // Try JWT first
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      return next();
    } catch (err) {
      // JWT failed, try session fallback
      console.log('JWT verification failed, trying session fallback');
    }
  }

  // Fallback to session-based auth
  if (req.session && req.session.user) {
    req.user = req.session.user;
    return next();
  }

  return res.status(401).json({ message: 'Unauthorized. Please login.' });
}

/**
 * Dual admin authentication middleware
 */
function verifyAdminAuth(req, res, next) {
  // Try JWT first
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      if (decoded.type === 'admin') {
        req.admin = decoded;
        return next();
      }
    } catch (err) {
      console.log('Admin JWT verification failed, trying session fallback');
    }
  }

  // Fallback to session-based auth
  if (req.session && req.session.admin) {
    req.admin = req.session.admin;
    return next();
  }

  return res.status(401).json({ message: 'Unauthorized. Admin login required.' });
}

module.exports = {
  generateToken,
  generateAdminToken,
  verifyToken,
  verifyAdminToken,
  verifyAuth,
  verifyAdminAuth,
  JWT_SECRET
};
