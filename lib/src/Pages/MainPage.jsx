// ✅ Cleaned and fixed version of MainPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './MainPage.css';
import axios from 'axios';

const MainPage = () => {
  const [sellStatusMessage, setSellStatusMessage] = useState('');
  const [availableBooks, setAvailableBooks] = useState([]);
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [historyBooks, setHistoryBooks] = useState([]);
  const [sellingBooks, setSellingBooks] = useState([]);

  const [user, setUser] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('books');
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:5000/api/user/profile', { withCredentials: true })
      .then(response => setUser(response.data))
      .catch(() => navigate('/login'));
  }, [navigate]);

  useEffect(() => {
    if (activeTab === 'books') {
      axios.get('http://localhost:5000/books')
        .then(res => setAvailableBooks(res.data))
        .catch(err => console.error('Error fetching books:', err));
    } else if (activeTab === 'borrowed') {
      axios.get('http://localhost:5000/borrowed-books', { withCredentials: true })
        .then(res => setBorrowedBooks(res.data))
        .catch(err => console.error('Failed to fetch borrowed books', err));
    } else if (activeTab === 'history') {
      axios.get('http://localhost:5000/borrow-history', { withCredentials: true })
        .then(res => setHistoryBooks(res.data))
        .catch(err => console.error('Failed to fetch history', err));
    } else if (activeTab === 'view-sell') {
      axios.get('http://localhost:5000/sell-books')
        .then((res) => setSellingBooks(res.data))
        .catch((err) => console.error("Failed to fetch selling books", err));
    }
  }, [activeTab]);


  useEffect(() => {
  if (activeTab === 'view-sell') {
    axios.get('http://localhost:5000/api/sell-books', { withCredentials: true })
      .then(res => setSellingBooks(res.data))
      .catch(err => console.error('Failed to fetch selling books', err));
  }
}, [activeTab]);

useEffect(() => {
  if (activeTab === 'view-sell') {
    axios.get('http://localhost:5000/api/sell-books', { withCredentials: true })
      .then(res => setSellingBooks(res.data))
      .catch(err => console.error('Failed to fetch selling books', err));
  }
}, [activeTab]);





  const handleBorrow = (bookId) => {
    axios.post('http://localhost:5000/borrow', { book_id: bookId }, { withCredentials: true })
      .then(res => {
        alert(res.data.message);
        if (activeTab === 'books') {
          axios.get('http://localhost:5000/books')
            .then(res => setAvailableBooks(res.data));
        }
      })
      .catch(err => {
        console.error('Borrow failed', err);
        alert('Failed to borrow book');
      });
  };
  /*const handleBuy = (bookId) => {
  axios.post('http://localhost:5000/sell-books/buy', { id: bookId }, { withCredentials: true })
    .then(() => {
      setSellingBooks(prev => prev.filter(item => item.id !== bookId));
      alert('✅ Book marked as sold.');
    })
    .catch(err => {
      console.error('Buy failed', err);
      alert('❌ Failed to mark book as sold.');
    });
};

const handleCancel = (bookId) => {
  axios.delete(`http://localhost:5000/sell-books/${bookId}`, { withCredentials: true })
    .then(() => {
      setSellingBooks(prev => prev.filter(item => item.id !== bookId));
      alert('❌ Listing cancelled.');
    })
    .catch(err => {
      console.error('Cancel failed', err);
      alert('❌ Failed to cancel listing.');
    });
};*/
const handleBuy = (id) => {
  axios.post('http://localhost:5000/api/sell-books/buy', { id }, { withCredentials: true })
    .then(() => {
      setSellingBooks(prev => prev.map(book =>
        book.id === id ? { ...book, status: 'sold' } : book
      ));
    })
    .catch(() => alert('❌ Failed to mark as sold'));
};

const handleCancel = (id) => {
  axios.delete(`http://localhost:5000/api/sell-books/${id}`, { withCredentials: true })
    .then(() => {
      setSellingBooks(prev => prev.filter(book => book.id !== id));
    })
    .catch(() => alert('❌ Failed to cancel listing'));
};



  const handleReturn = (bookId) => {
    axios.post('http://localhost:5000/return-book', { book_id: bookId }, { withCredentials: true })
      .then(res => {
        alert(res.data.message);
        if (activeTab === 'borrowed') {
          axios.get('http://localhost:5000/borrowed-books', { withCredentials: true })
            .then(res => setBorrowedBooks(res.data));
        }
        axios.get('http://localhost:5000/books')
          .then(res => setAvailableBooks(res.data));
      })
      .catch(err => {
        console.error('Return failed', err);
        alert('Book not submitted');
      });
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'books':
        return (
          <div className="books-section">
            <h2 className="section-title">All Available Books</h2>
            <div className="books-grid">
              {availableBooks.map(book => (
                <div key={book.id} className="book-card">
                  <div className="book-info">
                    <h3 className="book-title">{book.title}</h3>
                    <p className="book-author">by {book.author}</p>
                    <div className="book-details">
                      <span className="book-acc">Acc. No: {book.acc_no}</span>
                      <span className="book-date">{book.date ? new Date(book.date).toLocaleDateString() : 'N/A'}</span>
                    </div>
                    {book.donated_by && <p className="book-remarks">Donated by: {book.donated_by}</p>}
                  </div>
                  <button className="borrow-btn" onClick={() => handleBorrow(book.id)}>Borrow Book</button>
                </div>
              ))}
            </div>
          </div>
        );

      case 'borrowed':
        return (
          <div className="borrowed-section">
            <h2 className="section-title">Currently Borrowed Books</h2>
            {borrowedBooks.length === 0 ? (
              <div className="empty-state"><p>No books currently borrowed</p></div>
            ) : (
              <div className="books-grid">
                {borrowedBooks.map(book => (
                  <div key={book.id} className="book-card">
                    <div className="book-info">
                      <h3 className="book-title">{book.title}</h3>
                      <p className="book-author">by {book.author}</p>
                      <p className="book-remarks">Donated by: {book.donated_by}</p>
                      <div className="book-details">
                        <span className="book-acc">Acc. No: {book.acc_no}</span>
                        <span className="book-date">Borrowed on: {new Date(book.borrow_date).toLocaleDateString()}</span>
                        <span className="book-date">Expires on: {new Date(book.expiry_date).toLocaleDateString()}</span>
                      </div>
                      <button className="borrow-btn" onClick={() => handleReturn(book.id)}>Submit Book</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'history':
        return (
          <div className="history-section">
            <h2 className="section-title">Borrow History</h2>
            {historyBooks.length === 0 ? (
              <div className="empty-state"><p>No borrow history available</p></div>
            ) : (
              <div className="books-grid">
                {historyBooks.map((book, idx) => (
                  <div key={idx} className="book-card">
                    <div className="book-info">
                      <h3 className="book-title">{book.title}</h3>
                      <p className="book-author">by {book.author}</p>
                      <div className="book-details">
                        <span className="book-acc">Acc. No: {book.acc_no}</span>
                        <span className="book-date">Borrowed on: {new Date(book.borrow_date).toLocaleDateString()}</span>
                        <span className="book-date">Submitted on: {new Date(book.returned_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'sell':
        return (
          <div className="sell-section">
            <h2 className="section-title">Sell a Book or Material</h2>
            <form className="sell-form" onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const data = {
                type: formData.get('type'),
                title: formData.get('title'),
                author: formData.get('author'),
                description: formData.get('description'),
                acc_no: formData.get('acc_no'),
                contact: formData.get('contact'),
                status: 'available'
              };
              axios.post('http://localhost:5000/sell-book', data, { withCredentials: true })
                .then(() => {
                  setSellStatusMessage('✅ Book is Available for selling.');
                  e.target.reset();
                })
                .catch(() => setSellStatusMessage('❌ Failed to submit. Try again.'));
            }}>
              <div className="form-group">
                <label htmlFor="type">Type of Material</label>
                <select id="type" name="type" required>
                  <option value="">-- Select Type --</option>
                  <option value="Notes">Notes</option>
                  <option value="Xerox">Xerox</option>
                  <option value="Textbook">Textbook</option>
                  <option value="question-Paper">Question Peppers</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="title">Title</label>
                <input type="text" id="title" name="title" placeholder="e.g., Engineering Math Notes" required />
              </div>

              <div className="form-group">
                <label htmlFor="author">Author (if applicable)</label>
                <input type="text" id="author" name="author" placeholder="e.g., B.S. Grewal" />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea id="description" name="description" rows="9" cols="60" placeholder="Provide details like modules,schema, condition, subject coverage, etc." required></textarea>
              </div>

              <div className="form-group">
                <label htmlFor="acc_no">Accession Number / Identifier</label>
                <input type="text" id="acc_no" name="acc_no" placeholder="Optional unique code or ID" />
              </div>

              <div className="form-group">
                <label htmlFor="contact">Contact Number</label>
                <input type="tel" id="contact" name="contact" pattern="[0-9]{10}" maxLength="10" required placeholder="Enter your 10-digit mobile number" />
              </div>

              <button type="submit" className="submit-btn">Submit for Selling</button>
              {sellStatusMessage && <p className="status-message">{sellStatusMessage}</p>}
            </form>
          </div>
        );

      case 'view-sell':
        return (
           <div className="sell-view-section">
    <h2 className="section-title">Books & Materials Available for Sale</h2>
    {sellingBooks.length === 0 ? (
      <p>No materials currently listed for sale.</p>
    ) : (
      <div className="books-grid">
        {sellingBooks.map((item) => (
          <div key={item.id} className="book-card">
            <h3>{item.title}</h3>
            <p><strong>Type:</strong> {item.type}</p>
            <p><strong>Description:</strong> {item.description}</p>
            <p><strong>Contact:</strong> {item.contact}</p>
            <p><strong>Status:</strong> {item.status}</p>
            <div className="action-buttons">
              <button onClick={() => handleBuy(item.id)} className="borrow-btn">✅ Mark as Sold</button>
              <button onClick={() => handleCancel(item.id)} className="borrow-btn cancel">❌ Cancel</button>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
        );

      default:
        return null;
    }
  };

  if (!user) return null;

  return (
    <div className="main-page">
      <div className={`user-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <button className="sidebar-toggle" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
          {sidebarCollapsed ? '→' : '←'}
        </button>
        <div className="user-profile">
          <div className="user-avatar">
            <span>{user.username?.charAt(0).toUpperCase()}</span>
          </div>
          <h3 className="user-name">{user.firstName} {user.lastName}</h3>
          <p className="user-username">Username: {user.username}</p>
          <p className="user-email">Email: {user.email}</p>
          <p className="user-usn">USN: {user.usn}</p>
          <p className="user-id">ID: {user.id}</p>
        </div>
      </div>

      <div className="main-content">
        <nav className="top-navbar">
          <div className="nav-tabs">
            <button className={`nav-tab ${activeTab === 'books' ? 'active' : ''}`} onClick={() => setActiveTab('books')}>📚 Available Books</button>
            <button className={`nav-tab ${activeTab === 'borrowed' ? 'active' : ''}`} onClick={() => setActiveTab('borrowed')}>📖 Currently Borrowed</button>
            <button className={`nav-tab ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>📋 Borrow History</button>
            <button className={`nav-tab ${activeTab === 'sell' ? 'active' : ''}`} onClick={() => setActiveTab('sell')}>➕ Sell Book</button>
            <button className={`nav-tab ${activeTab === 'view-sell' ? 'active' : ''}`} onClick={() => setActiveTab('view-sell')}>🛒 View Selling Books</button>
          </div>
        </nav>

        <div className="content-area">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default MainPage;
