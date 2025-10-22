// // const express = require("express");
// // const cors = require("cors");
// // const bodyParser = require("body-parser");
// // const db = require("./db"); // Your MySQL connection

// // const app = express();

// // // Replace line 7-8:
// // const PORT = process.env.PORT || 5000;

// // // Replace the bottom app.listen block (last 3 lines):

// // const session = require('express-session');

// // app.use(express.json());
// // app.use(require('cookie-parser')());

// // app.use(session({
// //   secret: 'library-secret-key', // change this to a strong secret in production
// //   resave: false,
// //   saveUninitialized: false,
// //   cookie: {
// //     secure: false, // Set to true in production if using HTTPS
// //     httpOnly: true,
// //     sameSite: 'lax'
// //   }
// // }));


// // app.use(bodyParser.json());
// // const corsOptions = {
// //   origin: function (origin, callback) {
// //     const allowedOrigins = process.env.NODE_ENV === 'production'
// //       ? [process.env.FRONTEND_URL || 'https://your-app.netlify.app']
// //       : ['http://localhost:5173', 'http://localhost:3000'];

// //     if (!origin || allowedOrigins.indexOf(origin) !== -1) {
// //       callback(null, true);
// //     } else {
// //       callback(new Error('Not allowed by CORS'));
// //     }
// //   },
// //   credentials: true,
// //   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
// //   allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
// // };

// // app.use(cors(corsOptions));
// // // Register Route
// // app.post("/register", (req, res) => {
// //   const { username,email, password, firstName, lastName, usn } = req.body;

// //   if (!username ||!email|| !password || !firstName || !lastName || !usn) {
// //     return res.status(400).json({ message: "All fields are required" });
// //   }

// //   const sql = `
// //     INSERT INTO users (username,email, password, firstName, lastName, usn)
// //     VALUES (?,?, ?, ?, ?, ?)
// //   `;

// //   db.query(sql, [username,email, password, firstName, lastName, usn], (err, result) => {
// //     if (err) {
// //       console.error("Error inserting user:", err);
// //       return res.status(500).json({ message: "Registration failed" });
// //     }
// //     res.status(200).json({ message: "User registered successfully!" });
// //   });
// // });


// // app.get("/users", (req, res) => {
// //   db.query("SELECT * FROM users", (err, result) => {
// //     if (err) return res.status(500).send(err);
// //     res.send(result);
// //   });
// // });
// // app.post("/login", (req, res) => {
// //   const { username, password } = req.body;
// //   db.query(
// //     "SELECT * FROM users WHERE username = ? AND password = ?",
// //     [username, password],
// //     (err, result) => {
// //       if (err) {
// //         res.status(500).send({ message: "Server error" });
// //       } else if (result.length > 0) {
// //         // ✅ Store user in session
// //         const user = result[0];
// //         req.session.user = {
// //           id: user.id,
// //         username: user.username,
// //         email: user.email,
// //         usn: user.usn,
// //         firstName: user.firstName,
// //         lastName: user.lastName
// //         };
// //         res.status(200).send(result[0]); // Send user data
// //       } else {
// //         res.status(401).send({ message: "Invalid username or password" });
// //       }
// //     }
// //   );
// // });
// // /*app.get('/books', (req, res) => {
// //   db.query('SELECT * FROM books WHERE status = "available"', (err, result) => {
// //     if (err) return res.status(500).json(err);
// //     res.json(result);
// //   });
// // });*/

// // app.get('/books', (req, res) => {
// //   const sql = 'SELECT * FROM books WHERE status = "available"';
// //   db.query(sql, (err, result) => {
// //     if (err) return res.status(500).json(err);
// //     res.json(result);
// //   });
// // });









// // app.get('/api/user/profile', (req, res) => {
// //   console.log("SESSION:", req.session.user);
// //   if (req.session.user) {
// //     res.json(req.session.user); // ✅ Send the logged-in user
// //   } else {
// //     res.status(401).json({ message: "Unauthorized" });
// //   }
// // });


// // /*app.post('/borrow', (req, res) => {
// //   const { book_id } = req.body;

// //   if (!req.session.user) {
// //     return res.status(401).json({ message: "Unauthorized" });
// //   }

// //   const user_id = req.session.user.id;
// //   const borrowDate = new Date();
// //   const expiryDate = new Date();
// //   expiryDate.setDate(borrowDate.getDate() + 20);

// //   // Insert into borrowed_books
// //   const insertSql = `
// //     INSERT INTO borrowed_books (user_id, book_id, borrow_date, expiry_date)
// //     VALUES (?, ?, ?, ?)
// //   `;

// //   db.query(insertSql, [user_id, book_id, borrowDate, expiryDate], (err, result) => {
// //     if (err) {
// //       console.error('Error borrowing book:', err);
// //       return res.status(500).json({ message: 'Failed to borrow book' });
// //     }

// //     // Optional: Remove from books (if marking as unavailable instead, add a status column)
// //     const deleteSql = 'DELETE FROM books WHERE id = ?';
// //     db.query(deleteSql, [book_id], (err) => {
// //       if (err) {
// //         console.error('Error removing book:', err);
// //         return res.status(500).json({ message: 'Book borrowed, but failed to update availability' });
// //       }

// //       res.status(200).json({ message: 'Book borrowed successfully' });
// //     });
// //   });
// // });*/

// // /*app.post('/borrow', (req, res) => {
// //   const { book_id } = req.body;

// //   if (!req.session.user) {
// //     return res.status(401).json({ message: "Unauthorized" });
// //   }

// //   const user_id = req.session.user.id;
// //   const borrowDate = new Date();
// //   const expiryDate = new Date();
// //   expiryDate.setDate(borrowDate.getDate() + 20);

// //   const insertSql = `
// //     INSERT INTO borrowed_books (user_id, book_id, borrow_date, expiry_date)
// //     VALUES (?, ?, ?, ?)
// //   `;

// //   db.query(insertSql, [user_id, book_id, borrowDate, expiryDate], (err) => {
// //     if (err) {
// //       console.error('Error borrowing book:', err);
// //       return res.status(500).json({ message: 'Failed to borrow book' });
// //     }

// //     const updateSql = 'UPDATE books SET status = ? WHERE id = ?';
// //     db.query(updateSql, ['borrowed', book_id], (err) => {
// //       if (err) {
// //         console.error('Error updating book status:', err);
// //         return res.status(500).json({ message: 'Borrowed but status update failed' });
// //       }

// //       res.status(200).json({ message: 'Book borrowed successfully' });
// //     });
// //   });
// // });*/

// // app.post('/borrow', (req, res) => {
// //   const { book_id } = req.body;

// //   if (!req.session.user) {
// //     return res.status(401).json({ message: "Unauthorized" });
// //   }

// //   const user_id = req.session.user.id;
// //   const borrowDate = new Date();
// //   const expiryDate = new Date();
// //   expiryDate.setDate(borrowDate.getDate() + 20);

// //   // First, check the current status from books
// //   const statusQuery = 'SELECT status FROM books WHERE id = ?';

// //   db.query(statusQuery, [book_id], (err, result) => {
// //     if (err || result.length === 0) {
// //       return res.status(500).json({ message: "Failed to fetch book status" });
// //     }

// //     const bookStatus = result[0].status;

// //     if (bookStatus !== 'available') {
// //       return res.status(400).json({ message: "Book is already borrowed" });
// //     }

// //     const insertSql = `
// //       INSERT INTO borrowed_books (user_id, book_id, borrow_date, expiry_date, status)
// //       VALUES (?, ?, ?, ?, ?)
// //     `;

// //     db.query(insertSql, [user_id, book_id, borrowDate, expiryDate, bookStatus], (err) => {
// //       if (err) {
// //         console.error('Error borrowing book:', err);
// //         return res.status(500).json({ message: 'Failed to borrow book' });
// //       }

// //       const updateSql = 'UPDATE books SET status = ? WHERE id = ?';
// //       db.query(updateSql, ['borrowed', book_id], (err) => {
// //         if (err) {
// //           console.error('Error updating book status:', err);
// //           return res.status(500).json({ message: 'Borrowed but status update failed' });
// //         }

// //         res.status(200).json({ message: 'Book borrowed successfully' });
// //       });
// //     });
// //   });
// // });




// // app.get('/borrowed-books', (req, res) => {
// //   if (!req.session.user) {
// //     return res.status(401).json({ message: "Unauthorized" });
// //   }

// //   const sql = `
// // SELECT b.*, bb.borrow_date, bb.expiry_date, b.status FROM borrowed_books bb JOIN books b ON bb.book_id = b.id WHERE bb.user_id = ? AND ( bb.status = 'available' OR bb.returned_at IS NULL );
// //   `;

// //   db.query(sql, [req.session.user.id], (err, result) => {
// //     if (err) {
// //       console.error("❌ Error fetching borrowed books:", err); // Log exact SQL error
// //       return res.status(500).json({ message: "Failed to fetch borrowed books" });
// //     }

// //     res.status(200).json(result);
// //   });
// // });

// // /* borrow hidtory update
// // app.post('/return-book', (req, res) => {
// //   const { book_id } = req.body;

// //   if (!req.session.user) {
// //     return res.status(401).json({ message: "Unauthorized" });
// //   }

// //   const user_id = req.session.user.id;

// //   const deleteSql = 'DELETE FROM borrowed_books WHERE user_id = ? AND book_id = ?';
// //   const updateSql = 'UPDATE books SET status = "available" WHERE id = ?';

// //   db.query(deleteSql, [user_id, book_id], (err, result) => {
// //     if (err) {
// //       console.error("Error removing from borrowed_books:", err);
// //       return res.status(500).json({ message: "Failed to return book" });
// //     }

// //     db.query(updateSql, [book_id], (err2) => {
// //       if (err2) {
// //         console.error("Error updating book status:", err2);
// //         return res.status(500).json({ message: "Book removed, but status not updated" });
// //       }

// //       return res.status(200).json({ message: "Book submitted successfully!" });
// //     });
// //   });
// // });*/
// // app.post('/return-book', (req, res) => {
// //   const { book_id } = req.body;

// //   if (!req.session.user) {
// //     return res.status(401).json({ message: "Unauthorized" });
// //   }

// //   const user_id = req.session.user.id;

// //   // Logging for debugging
// //   console.log(`[RETURN] User ${user_id} is returning book ${book_id}`);

// //   // Check if the book is currently borrowed and not yet returned
// //   const checkBorrowSql = `
// //     SELECT * FROM borrowed_books
// //     WHERE user_id = ? AND book_id = ? AND returned_at IS NULL
// //   `;

// //   db.query(checkBorrowSql, [user_id, book_id], (checkErr, checkResult) => {
// //     if (checkErr) {
// //       console.error("Error checking borrowed_books:", checkErr);
// //       return res.status(500).json({ message: "Error checking borrow status" });
// //     }

// //     if (checkResult.length === 0) {
// //       return res.status(400).json({ message: "Book already returned or not borrowed" });
// //     }

// //     // ✅ Proceed to update `returned_at`
// //     const updateBorrowedSql = `
// //   UPDATE borrowed_books
// //   SET returned_at = NOW(), status = 'returned'
// //   WHERE user_id = ? AND book_id = ? AND returned_at IS NULL
// // `;


// //     const updateBookStatusSql = `
// //       UPDATE books
// //       SET status = 'available'
// //       WHERE id = ?
// //     `;

// //     db.query(updateBorrowedSql, [user_id, book_id], (err, result) => {
// //       if (err) {
// //         console.error("Error updating borrowed_books:", err);
// //         return res.status(500).json({ message: "Failed to submit book" });
// //       }

// //       db.query(updateBookStatusSql, [book_id], (err2) => {
// //         if (err2) {
// //           console.error("Error updating book status:", err2);
// //           return res.status(500).json({ message: "Status update failed" });
// //         }

// //         console.log(`[RETURN] Book ${book_id} returned by user ${user_id}`);
// //         return res.status(200).json({ message: "Book submitted successfully!" });
// //       });
// //     });
// //   });
// // });



// // app.get('/borrow-history', (req, res) => {
// //   if (!req.session.user) {
// //     return res.status(401).json({ message: "Unauthorized" });
// //   }

// //   const sql = `
// //     SELECT b.title, b.author, b.acc_no, bb.borrow_date, bb.expiry_date, bb.returned_at
// //     FROM borrowed_books bb
// //     JOIN books b ON bb.book_id = b.id
// //     WHERE bb.user_id = ? AND bb.returned_at IS NOT NULL
// //     ORDER BY bb.returned_at DESC
// //   `;

// //   db.query(sql, [req.session.user.id], (err, result) => {
// //     if (err) {
// //       console.error("Error fetching borrow history:", err);
// //       return res.status(500).json({ message: "Failed to fetch history" });
// //     }
// //     res.status(200).json(result);
// //   });
// // });

// // app.post('/sell-book', (req, res) => {
// //   if (!req.session.user) {
// //     return res.status(401).json({ message: "Unauthorized" });
// //   }

// //   const { type, title, author, description, acc_no, contact, status } = req.body;
// //   const sql = `
// //     INSERT INTO used_books_marketplace
// //     (seller_id, type, title, author, description, acc_no, contact, status)
// //     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
// //   `;
// //   db.query(sql, [req.session.user.id, type, title, author, description, acc_no, contact, status], (err, result) => {
// //     if (err) {
// //       console.error("Error inserting book:", err);
// //       return res.status(500).json({ message: "Failed to sell book" });
// //     }
// //     res.status(201).json({ message: "Book listed successfully" });
// //   });
// // });




// // // Mount the router
// // // In your main server file (e.g., app.js or server.js)
// // const sellBooksRoutes = require('./routes/sellBooks'); // ✅ correct path
// // app.use('/', sellBooksRoutes); // ✅ must use '/api'



// // // Admin login route
// // app.post('/api/admin/login', (req, res) => {
// //   const { username, password } = req.body;
// //   const sql = 'SELECT * FROM admins WHERE username = ? AND password = ?';
// //   db.query(sql, [username, password], (err, results) => {
// //     if (err) return res.status(500).json({ message: 'DB error' });
// //     if (results.length === 0) return res.status(401).json({ message: 'Invalid credentials' });

// //     req.session.admin = {
// //       id: results[0].id,
// //       username: results[0].username,
// //       name: results[0].name
// //     };
// //     res.json({ message: 'Login successful', admin: req.session.admin });
// //   });
// // });

// // // Get logged-in admin
// // app.get('/api/admin/me', (req, res) => {
// //   if (!req.session.admin) {
// //     return res.status(401).json({ message: 'Unauthorized' });
// //   }
// //   res.json(req.session.admin);
// // });

// // // Admin logout
// // app.post('/api/admin/logout', (req, res) => {
// //   req.session.destroy();
// //   res.json({ message: 'Logged out' });
// // });


// // const adminRoutes = require('./routes/admin');
// // app.use('/api/admin', adminRoutes);




// // app.listen(PORT, '0.0.0.0', () => {
// //   console.log(`🚀 Server running on port ${PORT}`);
// //   console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
// // });
// const express = require('express');
// const session = require('express-session');
// const cors = require('cors');
// const db = require('./db'); // Ensure db.js is in the same folder
// require('dotenv').config();

// const app = express();
// const PORT = process.env.PORT || 5000;

// // Middleware
// app.use(cors({
//   origin: process.env.FRONTEND_URL || 'http://localhost:5173',
//   credentials: true
// }));
// app.use(express.json());
// app.use(session({
//   secret: process.env.SESSION_SECRET || 'library-secret-key-development',
//   resave: false,
//   saveUninitialized: false,
//   cookie: {
//     secure: process.env.NODE_ENV === 'production',
//     httpOnly: true,
//     sameSite: 'lax'
//   }
// }));

// // Routes
// const sellBooksRoutes = require('./routes/sellBooks');
// const adminRoutes = require('./routes/admin');

// app.use('/api/sell', sellBooksRoutes);      // For book selling related routes
// app.use('/api/admin', adminRoutes);         // For admin login/logout routes

// // Start server
// app.listen(PORT, '0.0.0.0', () => {
//   console.log(`🚀 Server running on port ${PORT}`);
//   console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
// });

const express = require('express');
const session = require('express-session');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('./db'); // Ensure db.js is in the same folder
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Configure Cloudinary for production or local storage for development
let upload;

if (process.env.NODE_ENV === 'production' && process.env.CLOUDINARY_CLOUD_NAME) {
  // Production: Use Cloudinary
  const cloudinary = require('cloudinary').v2;
  const { CloudinaryStorage } = require('multer-storage-cloudinary');

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });

  const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'library/profile-images',
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      transformation: [{ width: 500, height: 500, crop: 'limit' }],
      public_id: (req, file) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        return 'profile-' + req.session.user.id + '-' + uniqueSuffix;
      }
    }
  });

  upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
  });
} else {
  // Development: Use local storage
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      const uploadDir = path.join(__dirname, 'uploads', 'profile-images');
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      cb(null, 'profile-' + req.session.user.id + '-' + uniqueSuffix + ext);
    }
  });

  const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  };

  upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
  });
}

// --- Middleware ---
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://lib-6muhg89iu-risingdells-projects.vercel.app',
      'https://lib-qxujac740-risingdells-projects.vercel.app',
      'https://library-mu-sable.vercel.app',
      process.env.FRONTEND_URL
    ].filter(Boolean);

    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json());

// Configure session with Redis for production
let sessionConfig = {
  secret: process.env.SESSION_SECRET || 'library-secret-key-development',
  resave: true, // Changed to true for better session persistence
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    domain: process.env.NODE_ENV === 'production' ? undefined : undefined
  },
  name: 'sessionId' // Custom session cookie name
};

// Add Redis store in production if REDIS_URL is available
if (process.env.REDIS_URL) {
  const RedisStore = require('connect-redis').default;
  const { createClient } = require('redis');

  const redisClient = createClient({
    url: process.env.REDIS_URL
  });

  redisClient.connect().catch(err => {
    console.error('❌ Redis connection failed:', err);
  });

  redisClient.on('connect', () => {
    console.log('✅ Redis connected for session storage');
  });

  sessionConfig.store = new RedisStore({ client: redisClient });
} else {
  console.log('⚠️  Using in-memory session store (not recommended for production)');
  console.log('💡 Consider adding REDIS_URL environment variable for persistent sessions');
}

app.use(session(sessionConfig));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- Routes ---
const sellBooksRoutes = require('./routes/sellBooks');
const adminRoutes = require('./routes/admin');

app.use('/', sellBooksRoutes);              // Book selling routes (mounted at root)
app.use('/api/admin', adminRoutes);         // Admin login, borrowed books, add book, etc.

// --- User Authentication Routes ---
app.post("/register", (req, res) => {
  const { username, password, usn, firstName, lastName, email } = req.body;

  if (!username || !password || !usn || !firstName || !lastName || !email) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const sql = `
    INSERT INTO users (username, password, usn, firstName, lastName, email)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [username, password, usn, firstName, lastName, email], (err, result) => {
    if (err) {
      console.error("Error inserting user:", err);

      // Check for duplicate entry errors
      if (err.code === 'ER_DUP_ENTRY') {
        if (err.message.includes('username')) {
          return res.status(400).json({ message: "Username already exists" });
        } else if (err.message.includes('usn')) {
          return res.status(400).json({ message: "USN already registered" });
        } else if (err.message.includes('email')) {
          return res.status(400).json({ message: "Email already registered" });
        }
      }

      return res.status(500).json({ message: "Registration failed" });
    }
    res.status(200).json({ message: "User registered successfully!" });
  });
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  db.query(
    "SELECT * FROM users WHERE username = ? AND password = ?",
    [username, password],
    (err, result) => {
      if (err) {
        console.error("Login error:", err);
        return res.status(500).send({ message: "Server error" });
      }

      if (result.length > 0) {
        const user = result[0];

        // Save user to session
        req.session.user = {
          id: user.id,
          username: user.username,
          usn: user.usn,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email
        };

        // Explicitly save session before sending response
        req.session.save((err) => {
          if (err) {
            console.error("Session save error:", err);
            return res.status(500).send({ message: "Failed to save session" });
          }

          console.log("✅ User logged in:", username, "Session ID:", req.sessionID);

          // Send user data (without password)
          const { password, ...userWithoutPassword } = user;
          res.status(200).send(userWithoutPassword);
        });
      } else {
        res.status(401).send({ message: "Invalid username or password" });
      }
    }
  );
});

app.get("/users", (req, res) => {
  db.query("SELECT * FROM users", (err, result) => {
    if (err) return res.status(500).send(err);
    res.send(result);
  });
});

app.get('/books', (req, res) => {
  const sql = 'SELECT * FROM books WHERE status = "available"';
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

app.get('/api/user/profile', (req, res) => {
  if (req.session.user) {
    // Fetch user data including profile image from database
    const sql = 'SELECT id, username, usn, profile_image FROM users WHERE id = ?';
    db.query(sql, [req.session.user.id], (err, result) => {
      if (err || result.length === 0) {
        return res.status(500).json({ message: "Error fetching user profile" });
      }

      const user = result[0];
      const baseURL = process.env.BACKEND_URL || 'http://localhost:5000';
      const profileData = {
        id: user.id,
        username: user.username,
        usn: user.usn,
        profileImage: user.profile_image ? (baseURL + user.profile_image) : null
      };

      res.json(profileData);
    });
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
});

// Upload profile image endpoint
app.post('/api/user/upload-profile-image', upload.single('profileImage'), (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const userId = req.session.user.id;
  const imagePath = `/uploads/profile-images/${req.file.filename}`;

  // Get old image path to delete it
  const getOldImageSql = 'SELECT profile_image FROM users WHERE id = ?';
  db.query(getOldImageSql, [userId], (err, result) => {
    if (!err && result.length > 0 && result[0].profile_image) {
      const oldImagePath = path.join(__dirname, result[0].profile_image);
      // Delete old image file if it exists
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    // Update database with new image path
    const updateSql = 'UPDATE users SET profile_image = ? WHERE id = ?';
    db.query(updateSql, [imagePath, userId], (err, result) => {
      if (err) {
        console.error('Error updating profile image:', err);
        return res.status(500).json({ message: "Failed to update profile image" });
      }

      const baseURL = process.env.BACKEND_URL || 'http://localhost:5000';
      res.status(200).json({
        message: "Profile image uploaded successfully",
        imageUrl: baseURL + imagePath
      });
    });
  });
});

// Remove profile image endpoint
app.delete('/api/user/remove-profile-image', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const userId = req.session.user.id;

  // Get current image path to delete the file
  const getImageSql = 'SELECT profile_image FROM users WHERE id = ?';
  db.query(getImageSql, [userId], (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Error fetching profile image" });
    }

    if (result.length > 0 && result[0].profile_image) {
      const imagePath = path.join(__dirname, result[0].profile_image);

      // Delete the image file if it exists
      if (fs.existsSync(imagePath)) {
        try {
          fs.unlinkSync(imagePath);
        } catch (deleteErr) {
          console.error('Error deleting image file:', deleteErr);
        }
      }
    }

    // Update database to set profile_image to NULL
    const updateSql = 'UPDATE users SET profile_image = NULL WHERE id = ?';
    db.query(updateSql, [userId], (err, result) => {
      if (err) {
        console.error('Error removing profile image:', err);
        return res.status(500).json({ message: "Failed to remove profile image" });
      }

      res.status(200).json({ message: "Profile image removed successfully" });
    });
  });
});

// Logout endpoint
app.post('/api/user/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Logout failed" });
    }
    res.clearCookie('connect.sid');
    res.json({ message: "Logged out successfully" });
  });
});

app.post('/borrow', (req, res) => {
  const { book_id } = req.body;

  if (!req.session.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const user_id = req.session.user.id;
  const borrowDate = new Date();
  const expiryDate = new Date();
  expiryDate.setDate(borrowDate.getDate() + 20);

  const statusQuery = 'SELECT status FROM books WHERE id = ?';

  db.query(statusQuery, [book_id], (err, result) => {
    if (err || result.length === 0) {
      return res.status(500).json({ message: "Failed to fetch book status" });
    }

    const bookStatus = result[0].status;

    if (bookStatus !== 'available') {
      return res.status(400).json({ message: "Book is already borrowed" });
    }

    const insertSql = `
      INSERT INTO borrowed_books (user_id, book_id, borrow_date, expiry_date, return_status, status)
      VALUES (?, ?, ?, ?, 'active', 'borrowed')
    `;

    db.query(insertSql, [user_id, book_id, borrowDate, expiryDate], (err) => {
      if (err) {
        console.error('Error borrowing book:', err);
        return res.status(500).json({ message: 'Failed to borrow book' });
      }

      const updateSql = 'UPDATE books SET status = ? WHERE id = ?';
      db.query(updateSql, ['borrowed', book_id], (err) => {
        if (err) {
          console.error('Error updating book status:', err);
          return res.status(500).json({ message: 'Borrowed but status update failed' });
        }

        res.status(200).json({ message: 'Book borrowed successfully' });
      });
    });
  });
});

app.get('/borrowed-books', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const sql = `
    SELECT
      b.*,
      bb.borrow_date,
      bb.expiry_date,
      bb.return_status,
      bb.returned_at,
      bb.rejection_reason,
      b.status as book_status
    FROM borrowed_books bb
    JOIN books b ON bb.book_id = b.id
    WHERE bb.user_id = ?
    AND (bb.return_status IN ('active', 'pending_return', 'rejected') OR bb.returned_at IS NULL)
    ORDER BY
      CASE bb.return_status
        WHEN 'active' THEN 1
        WHEN 'rejected' THEN 2
        WHEN 'pending_return' THEN 3
      END,
      bb.borrow_date DESC
  `;

  db.query(sql, [req.session.user.id], (err, result) => {
    if (err) {
      console.error("Error fetching borrowed books:", err);
      return res.status(500).json({ message: "Failed to fetch borrowed books" });
    }

    res.status(200).json(result);
  });
});

app.post('/return-book', (req, res) => {
  const { book_id } = req.body;

  if (!req.session.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const user_id = req.session.user.id;

  // Check if book is currently borrowed and not yet submitted for return
  const checkBorrowSql = `
    SELECT * FROM borrowed_books
    WHERE user_id = ? AND book_id = ?
    AND returned_at IS NULL
    AND (return_status = 'active' OR return_status IS NULL)
  `;

  db.query(checkBorrowSql, [user_id, book_id], (checkErr, checkResult) => {
    if (checkErr) {
      console.error("Error checking borrowed_books:", checkErr);
      return res.status(500).json({ message: "Error checking borrow status" });
    }

    if (checkResult.length === 0) {
      return res.status(400).json({ message: "Book already submitted for return or not borrowed" });
    }

    // Update status to pending_return instead of immediately making it available
    const updateBorrowedSql = `
      UPDATE borrowed_books
      SET returned_at = NOW(),
          return_status = 'pending_return',
          status = 'pending_return'
      WHERE user_id = ? AND book_id = ? AND returned_at IS NULL
    `;

    // Update book status to pending_return (not available yet)
    const updateBookStatusSql = `
      UPDATE books
      SET status = 'pending_return'
      WHERE id = ?
    `;

    db.query(updateBorrowedSql, [user_id, book_id], (err, result) => {
      if (err) {
        console.error("Error updating borrowed_books:", err);
        return res.status(500).json({ message: "Failed to submit book" });
      }

      db.query(updateBookStatusSql, [book_id], (err2) => {
        if (err2) {
          console.error("Error updating book status:", err2);
          return res.status(500).json({ message: "Status update failed" });
        }

        res.status(200).json({ message: "Book return request submitted! Waiting for admin approval." });
      });
    });
  });
});

app.get('/borrow-history', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const sql = `
    SELECT b.title, b.author, b.acc_no, bb.borrow_date, bb.expiry_date, bb.returned_at
    FROM borrowed_books bb
    JOIN books b ON bb.book_id = b.id
    WHERE bb.user_id = ? AND bb.returned_at IS NOT NULL
    ORDER BY bb.returned_at DESC
  `;

  db.query(sql, [req.session.user.id], (err, result) => {
    if (err) {
      console.error("Error fetching borrow history:", err);
      return res.status(500).json({ message: "Failed to fetch history" });
    }
    res.status(200).json(result);
  });
});

// --- Health Check Endpoint ---
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// --- Start server ---
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📡 Health check: http://0.0.0.0:${PORT}/health`);
});