const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const db = require("./db"); // Your MySQL connection

const app = express();

// Replace line 7-8:
const PORT = process.env.PORT || 5000;

// Replace the bottom app.listen block (last 3 lines):

const session = require('express-session');

app.use(express.json());
app.use(require('cookie-parser')());

app.use(session({
  secret: 'library-secret-key', // change this to a strong secret in production
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production if using HTTPS
    httpOnly: true,
    sameSite: 'lax'
  }
}));


app.use(bodyParser.json());
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = process.env.NODE_ENV === 'production'
      ? [process.env.FRONTEND_URL || 'https://your-app.netlify.app']
      : ['http://localhost:5173', 'http://localhost:3000'];

    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));
// Register Route
app.post("/register", (req, res) => {
  const { username,email, password, firstName, lastName, usn } = req.body;

  if (!username ||!email|| !password || !firstName || !lastName || !usn) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const sql = `
    INSERT INTO users (username,email, password, firstName, lastName, usn)
    VALUES (?,?, ?, ?, ?, ?)
  `;

  db.query(sql, [username,email, password, firstName, lastName, usn], (err, result) => {
    if (err) {
      console.error("Error inserting user:", err);
      return res.status(500).json({ message: "Registration failed" });
    }
    res.status(200).json({ message: "User registered successfully!" });
  });
});


app.get("/users", (req, res) => {
  db.query("SELECT * FROM users", (err, result) => {
    if (err) return res.status(500).send(err);
    res.send(result);
  });
});
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  db.query(
    "SELECT * FROM users WHERE username = ? AND password = ?",
    [username, password],
    (err, result) => {
      if (err) {
        res.status(500).send({ message: "Server error" });
      } else if (result.length > 0) {
        // ✅ Store user in session
        const user = result[0];
        req.session.user = {
          id: user.id,
        username: user.username,
        email: user.email,
        usn: user.usn,
        firstName: user.firstName,
        lastName: user.lastName
        };
        res.status(200).send(result[0]); // Send user data
      } else {
        res.status(401).send({ message: "Invalid username or password" });
      }
    }
  );
});
/*app.get('/books', (req, res) => {
  db.query('SELECT * FROM books WHERE status = "available"', (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});*/

app.get('/books', (req, res) => {
  const sql = 'SELECT * FROM books WHERE status = "available"';
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});









app.get('/api/user/profile', (req, res) => {
  console.log("SESSION:", req.session.user);
  if (req.session.user) {
    res.json(req.session.user); // ✅ Send the logged-in user
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
});


/*app.post('/borrow', (req, res) => {
  const { book_id } = req.body;

  if (!req.session.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const user_id = req.session.user.id;
  const borrowDate = new Date();
  const expiryDate = new Date();
  expiryDate.setDate(borrowDate.getDate() + 20);

  // Insert into borrowed_books
  const insertSql = `
    INSERT INTO borrowed_books (user_id, book_id, borrow_date, expiry_date)
    VALUES (?, ?, ?, ?)
  `;

  db.query(insertSql, [user_id, book_id, borrowDate, expiryDate], (err, result) => {
    if (err) {
      console.error('Error borrowing book:', err);
      return res.status(500).json({ message: 'Failed to borrow book' });
    }

    // Optional: Remove from books (if marking as unavailable instead, add a status column)
    const deleteSql = 'DELETE FROM books WHERE id = ?';
    db.query(deleteSql, [book_id], (err) => {
      if (err) {
        console.error('Error removing book:', err);
        return res.status(500).json({ message: 'Book borrowed, but failed to update availability' });
      }

      res.status(200).json({ message: 'Book borrowed successfully' });
    });
  });
});*/

/*app.post('/borrow', (req, res) => {
  const { book_id } = req.body;

  if (!req.session.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const user_id = req.session.user.id;
  const borrowDate = new Date();
  const expiryDate = new Date();
  expiryDate.setDate(borrowDate.getDate() + 20);

  const insertSql = `
    INSERT INTO borrowed_books (user_id, book_id, borrow_date, expiry_date)
    VALUES (?, ?, ?, ?)
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
});*/

app.post('/borrow', (req, res) => {
  const { book_id } = req.body;

  if (!req.session.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const user_id = req.session.user.id;
  const borrowDate = new Date();
  const expiryDate = new Date();
  expiryDate.setDate(borrowDate.getDate() + 20);

  // First, check the current status from books
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
      INSERT INTO borrowed_books (user_id, book_id, borrow_date, expiry_date, status)
      VALUES (?, ?, ?, ?, ?)
    `;

    db.query(insertSql, [user_id, book_id, borrowDate, expiryDate, bookStatus], (err) => {
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
SELECT b.*, bb.borrow_date, bb.expiry_date, b.status FROM borrowed_books bb JOIN books b ON bb.book_id = b.id WHERE bb.user_id = ? AND ( bb.status = 'available' OR bb.returned_at IS NULL );
  `;

  db.query(sql, [req.session.user.id], (err, result) => {
    if (err) {
      console.error("❌ Error fetching borrowed books:", err); // Log exact SQL error
      return res.status(500).json({ message: "Failed to fetch borrowed books" });
    }

    res.status(200).json(result);
  });
});

/* borrow hidtory update
app.post('/return-book', (req, res) => {
  const { book_id } = req.body;

  if (!req.session.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const user_id = req.session.user.id;

  const deleteSql = 'DELETE FROM borrowed_books WHERE user_id = ? AND book_id = ?';
  const updateSql = 'UPDATE books SET status = "available" WHERE id = ?';

  db.query(deleteSql, [user_id, book_id], (err, result) => {
    if (err) {
      console.error("Error removing from borrowed_books:", err);
      return res.status(500).json({ message: "Failed to return book" });
    }

    db.query(updateSql, [book_id], (err2) => {
      if (err2) {
        console.error("Error updating book status:", err2);
        return res.status(500).json({ message: "Book removed, but status not updated" });
      }

      return res.status(200).json({ message: "Book submitted successfully!" });
    });
  });
});*/
app.post('/return-book', (req, res) => {
  const { book_id } = req.body;

  if (!req.session.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const user_id = req.session.user.id;

  // Logging for debugging
  console.log(`[RETURN] User ${user_id} is returning book ${book_id}`);

  // Check if the book is currently borrowed and not yet returned
  const checkBorrowSql = `
    SELECT * FROM borrowed_books
    WHERE user_id = ? AND book_id = ? AND returned_at IS NULL
  `;

  db.query(checkBorrowSql, [user_id, book_id], (checkErr, checkResult) => {
    if (checkErr) {
      console.error("Error checking borrowed_books:", checkErr);
      return res.status(500).json({ message: "Error checking borrow status" });
    }

    if (checkResult.length === 0) {
      return res.status(400).json({ message: "Book already returned or not borrowed" });
    }

    // ✅ Proceed to update `returned_at`
    const updateBorrowedSql = `
  UPDATE borrowed_books
  SET returned_at = NOW(), status = 'returned'
  WHERE user_id = ? AND book_id = ? AND returned_at IS NULL
`;


    const updateBookStatusSql = `
      UPDATE books
      SET status = 'available'
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

        console.log(`[RETURN] Book ${book_id} returned by user ${user_id}`);
        return res.status(200).json({ message: "Book submitted successfully!" });
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

app.post('/sell-book', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { type, title, author, description, acc_no, contact, status } = req.body;
  const sql = `
    INSERT INTO used_books_marketplace
    (seller_id, type, title, author, description, acc_no, contact, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  db.query(sql, [req.session.user.id, type, title, author, description, acc_no, contact, status], (err, result) => {
    if (err) {
      console.error("Error inserting book:", err);
      return res.status(500).json({ message: "Failed to sell book" });
    }
    res.status(201).json({ message: "Book listed successfully" });
  });
});




// Mount the router
// In your main server file (e.g., app.js or server.js)
const sellBooksRoutes = require('./routes/sellBooks'); // ✅ correct path
app.use('/', sellBooksRoutes); // ✅ must use '/api'



// Admin login route
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  const sql = 'SELECT * FROM admins WHERE username = ? AND password = ?';
  db.query(sql, [username, password], (err, results) => {
    if (err) return res.status(500).json({ message: 'DB error' });
    if (results.length === 0) return res.status(401).json({ message: 'Invalid credentials' });

    req.session.admin = {
      id: results[0].id,
      username: results[0].username,
      name: results[0].name
    };
    res.json({ message: 'Login successful', admin: req.session.admin });
  });
});

// Get logged-in admin
app.get('/api/admin/me', (req, res) => {
  if (!req.session.admin) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  res.json(req.session.admin);
});

// Admin logout
app.post('/api/admin/logout', (req, res) => {
  req.session.destroy();
  res.json({ message: 'Logged out' });
});


const adminRoutes = require('./routes/admin');
app.use('/api/admin', adminRoutes);




app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
