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
  const [profileImage, setProfileImage] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:5000/api/user/profile', { withCredentials: true })
      .then(response => {
        setUser(response.data);
        // Set profile image if it exists
        if (response.data.profileImage) {
          setProfileImage(response.data.profileImage);
        }
      })
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
    }
  }, [activeTab]);
useEffect(() => {
  axios
    .get('http://localhost:5000/sell-books', { withCredentials: true })
    .then((res) => {
      setSellingBooks(res.data);
    })
    .catch((err) => {
      console.error('Failed to fetch selling books', err);
    });
}, []);




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


/*const handleCancel = (bookId) => {
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
 const handleRequest = (id) => {
  axios.post('http://localhost:5000/api/sell-books/request', { id }, { withCredentials: true })
    .then(() => reloadSellingBooks())
    .catch(() => alert('❌ Request failed'));
};

const handleConfirmReceive = (id) => {
  axios.post('http://localhost:5000/api/sell-books/confirm-receive', { id }, { withCredentials: true })
    .then(() => reloadSellingBooks())
    .catch(() => alert('❌ Confirm failed'));
};



const reloadSellingBooks = () => {
  axios.get('http://localhost:5000/api/sell-books', { withCredentials: true })
    .then(res => setSellingBooks(res.data));
};
const handleCancelSell = (id) => {
  axios.delete(`http://localhost:5000/api/sell-books/${id}`, { withCredentials: true })
    .then(() => reloadSellingBooks())
    .catch(() => alert('❌ Failed to cancel listing.'));
};

const handleBuy = (bookId) => {
  axios.post('http://localhost:5000/sell-books/buy', { id: bookId }, { withCredentials: true })
    .then(() => {
      // ❌ DO NOT remove book from UI list anymore
      reloadSellingBooks(); // ✅ Refresh the list to reflect changes
      alert('✅ You have bought the book!');
    })
    .catch(err => {
      console.error('Buy failed', err);
      alert('❌ Failed to buy the book.');
    });
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

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    const formData = new FormData();
    formData.append('profileImage', file);

    setIsUploadingImage(true);

    axios.post('http://localhost:5000/api/user/upload-profile-image', formData, {
      withCredentials: true,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
      .then(response => {
        setProfileImage(response.data.imageUrl);
        alert('Profile image updated successfully!');
      })
      .catch(err => {
        console.error('Image upload failed', err);
        alert('Failed to upload image. Please try again.');
      })
      .finally(() => {
        setIsUploadingImage(false);
      });
  };

  const handleRemoveImage = () => {
    if (!window.confirm('Are you sure you want to remove your profile picture?')) {
      return;
    }

    axios.delete('http://localhost:5000/api/user/remove-profile-image', { withCredentials: true })
      .then(() => {
        setProfileImage(null);
        alert('Profile image removed successfully!');
      })
      .catch(err => {
        console.error('Failed to remove image', err);
        alert('Failed to remove image. Please try again.');
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
                {borrowedBooks.map(book => {
                  const isPending = book.return_status === 'pending_return';
                  const isRejected = book.return_status === 'rejected';
                  const isActive = book.return_status === 'active' || !book.return_status;

                  return (
                    <div key={book.id} className={`book-card ${isPending ? 'pending-return' : ''} ${isRejected ? 'rejected-return' : ''}`}>
                      <div className="book-info">
                        <h3 className="book-title">{book.title}</h3>
                        <p className="book-author">by {book.author}</p>
                        <p className="book-remarks">Donated by: {book.donated_by}</p>
                        <div className="book-details">
                          <span className="book-acc">Acc. No: {book.acc_no}</span>
                          <span className="book-date">Borrowed on: {new Date(book.borrow_date).toLocaleDateString()}</span>
                          <span className="book-date">Expires on: {new Date(book.expiry_date).toLocaleDateString()}</span>
                        </div>

                        {/* Return Status Indicators */}
                        {isPending && (
                          <div className="return-status pending">
                            <span className="status-icon">⏳</span>
                            <span className="status-text">Return Pending Admin Approval</span>
                          </div>
                        )}

                        {isRejected && (
                          <div className="return-status rejected">
                            <span className="status-icon">❌</span>
                            <span className="status-text">Return Rejected</span>
                            {book.rejection_reason && (
                              <p className="rejection-reason">Reason: {book.rejection_reason}</p>
                            )}
                          </div>
                        )}

                        {/* Submit Button - only show if active or rejected */}
                        {(isActive || isRejected) && (
                          <button className="borrow-btn" onClick={() => handleReturn(book.id)}>
                            {isRejected ? 'Re-submit Book' : 'Submit Book'}
                          </button>
                        )}

                        {/* Disabled button for pending */}
                        {isPending && (
                          <button className="borrow-btn disabled" disabled>
                            Awaiting Approval
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
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
           <div className="view-sell-section">
      <h2 className="section-title">Marketplace Books</h2>
      {sellingBooks.length === 0 ? (
        <p>No books listed yet.</p>
      ) : (
        <div className="books-grid">
          {sellingBooks.map((item) => (
            <div key={item.id} className="book-card">
              <div className="book-info">
                <h3 className="book-title">{item.title}</h3>
                <p className="book-author">by {item.author}</p>
                <p className="book-remarks">{item.description}</p>
                <div className="book-details">
                  <span className="book-acc">Acc. No: {item.acc_no}</span>
                  <span className="book-status">Status: {item.status}</span>
                </div>
                <pre>Contact me throught whatsapp</pre>
                <a
  className="book-contact"
  href={`https://wa.me/${item.contact.replace(/\D/g, '')}`}
  target="_blank"
  rel="noopener noreferrer"
>
  📞 {item.contact}
</a>
              </div>

              <div className="action-buttons">
                {/* Show Buy button only if the book is available and user is not the seller */}

                 {/* <button onClick={() => handleBuy(item.id)}
                  >
                    💰 Buy
                  </button>*/}


                {/* Show buyer name and transaction complete message */}
                {item.status === 'received' && (
                  <>
                    <span className="status-msg">✅ Transaction Completed</span>
                    {item.buyer_name && (
                      <p className="book-buyer">🧑‍💼 Bought by: {item.buyer_name}</p>
                    )}
                  </>
                )}
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
      <div className={`sidebar-overlay ${!sidebarCollapsed ? 'active' : ''}`} onClick={() => setSidebarCollapsed(true)}></div>

      {/* Maximize button when sidebar is collapsed */}
      {sidebarCollapsed && (
        <button className="maximize-btn" onClick={() => setSidebarCollapsed(false)}>
          <span className="nav-icon">☰</span>
        </button>
      )}

      <div className={`user-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <button className="sidebar-toggle" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
          {sidebarCollapsed ? '☰' : '✕'}
        </button>

        <div className="user-profile">
          <div className="avatar-container">
            <div className="user-avatar">
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="profile-image" />
              ) : (
                <span>{user.firstName?.charAt(0).toUpperCase()}{user.lastName?.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div className="avatar-upload-buttons">
              <label htmlFor="profile-image-upload" className="upload-icon-btn" title="Upload profile picture">
                {isUploadingImage ? '⏳' : '+'}
              </label>
              <input
                id="profile-image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
                disabled={isUploadingImage}
              />
              <button
                className="remove-icon-btn"
                onClick={handleRemoveImage}
                title="Remove profile picture"
                disabled={isUploadingImage || !profileImage}
                style={{ opacity: profileImage ? 1 : 0.3, cursor: profileImage ? 'pointer' : 'not-allowed' }}
              >
                −
              </button>
            </div>
          </div>
          <h3 className="user-name">{user.firstName} {user.lastName}</h3>
          <p className="user-username">@{user.username}</p>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeTab === 'books' ? 'active' : ''}`}
            onClick={() => setActiveTab('books')}
          >
            <span className="nav-icon">🏠</span>
            <span className="nav-text">Home</span>
          </button>

          <button
            className={`nav-item ${activeTab === 'borrowed' ? 'active' : ''}`}
            onClick={() => setActiveTab('borrowed')}
          >
            <span className="nav-icon">📖</span>
            <span className="nav-text">My Books</span>
          </button>

          <button
            className={`nav-item ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <span className="nav-icon">📋</span>
            <span className="nav-text">History</span>
          </button>

          <button
            className={`nav-item ${activeTab === 'sell' ? 'active' : ''}`}
            onClick={() => setActiveTab('sell')}
          >
            <span className="nav-icon">💼</span>
            <span className="nav-text">Sell Book</span>
          </button>

          <button
            className={`nav-item ${activeTab === 'view-sell' ? 'active' : ''}`}
            onClick={() => setActiveTab('view-sell')}
          >
            <span className="nav-icon">🛒</span>
            <span className="nav-text">Marketplace</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <button
            className="nav-item logout-btn"
            onClick={() => {
              axios.post('http://localhost:5000/api/user/logout', {}, { withCredentials: true })
                .then(() => navigate('/login'))
                .catch(() => navigate('/login'));
            }}
          >
            <span className="nav-icon">🚪</span>
            <span className="nav-text">Log Out</span>
          </button>
        </div>
      </div>

      <div className="main-content">
        <header className="mobile-header">
          <button className="mobile-menu-btn" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
            ☰
          </button>
          <h1 className="page-title">
            {activeTab === 'books' && 'Available Books'}
            {activeTab === 'borrowed' && 'My Books'}
            {activeTab === 'history' && 'History'}
            {activeTab === 'sell' && 'Sell Book'}
            {activeTab === 'view-sell' && 'Marketplace'}
          </h1>
        </header>

        <div className="content-area">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default MainPage;
