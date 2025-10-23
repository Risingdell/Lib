import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './MainPage.css';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const MainPage = () => {
  const [sellStatusMessage, setSellStatusMessage] = useState('');
  const [availableBooks, setAvailableBooks] = useState([]);
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [historyBooks, setHistoryBooks] = useState([]);
  const [sellingBooks, setSellingBooks] = useState([]);
  const [requestedBooks, setRequestedBooks] = useState([]);
  const [user, setUser] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('books');
  const [profileImage, setProfileImage] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [borrowingBookId, setBorrowingBookId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const url = API_URL + '/api/user/profile';
    axios.get(url, { withCredentials: true })
      .then(response => {
        setUser(response.data);
        if (response.data.profileImage) {
          setProfileImage(response.data.profileImage);
        }
      })
      .catch(() => navigate('/login'));
  }, [navigate]);

  useEffect(() => {
    if (activeTab === 'books') {
      const url = API_URL + '/books';
      axios.get(url)
        .then(res => setAvailableBooks(res.data))
        .catch(err => console.error('Error fetching books:', err));
    } else if (activeTab === 'borrowed') {
      const url = API_URL + '/borrowed-books';
      axios.get(url, { withCredentials: true })
        .then(res => setBorrowedBooks(res.data))
        .catch(err => console.error('Failed to fetch borrowed books', err));
    } else if (activeTab === 'history') {
      const url = API_URL + '/borrow-history';
      axios.get(url, { withCredentials: true })
        .then(res => setHistoryBooks(res.data))
        .catch(err => console.error('Failed to fetch history', err));
    }
  }, [activeTab]);

  useEffect(() => {
    const url = API_URL + '/sell-books';
    axios
      .get(url, { withCredentials: true })
      .then((res) => {
        setSellingBooks(res.data);
      })
      .catch((err) => {
        console.error('Failed to fetch selling books', err);
      });
  }, []);

  useEffect(() => {
    if (activeTab === 'view-sell') {
      const url = API_URL + '/sell-books';
      axios.get(url, { withCredentials: true })
        .then(res => setSellingBooks(res.data))
        .catch(err => console.error('Failed to fetch selling books', err));
    } else if (activeTab === 'requested-sell') {
      const url = API_URL + '/sell-books/my-requests';
      axios.get(url, { withCredentials: true })
        .then(res => setRequestedBooks(res.data))
        .catch(err => console.error('Failed to fetch requested books', err));
    }
  }, [activeTab]);

  // Load requested books count for sidebar badge
  useEffect(() => {
    const url = API_URL + '/sell-books/my-requests';
    axios.get(url, { withCredentials: true })
      .then(res => setRequestedBooks(res.data))
      .catch(err => console.error('Failed to fetch requested books', err));
  }, []);

  const handleBorrow = (bookId) => {
    if (borrowingBookId === bookId) {
      return; // Prevent duplicate requests for the same book
    }

    setBorrowingBookId(bookId);
    const url = API_URL + '/borrow';
    axios.post(url, { book_id: bookId }, { withCredentials: true })
      .then(res => {
        alert(res.data.message);
        if (activeTab === 'books') {
          const booksUrl = API_URL + '/books';
          axios.get(booksUrl)
            .then(res => setAvailableBooks(res.data));
        }
      })
      .catch(err => {
        console.error('Borrow failed', err);
        alert('Failed to borrow book');
      })
      .finally(() => {
        setBorrowingBookId(null);
      });
  };

  const handleRequest = (id) => {
    const url = API_URL + '/sell-books/request';
    axios.post(url, { id }, { withCredentials: true })
      .then((response) => {
        alert(response.data.message);
        reloadSellingBooks();
        reloadRequestedBooks();
      })
      .catch((err) => {
        const errorMsg = err.response?.data?.message || 'Request failed';
        alert('❌ ' + errorMsg);
      });
  };

  const handleCancelRequest = (id) => {
    if (!window.confirm('Are you sure you want to cancel this request?')) return;

    const url = API_URL + '/sell-books/cancel-request';
    axios.post(url, { id }, { withCredentials: true })
      .then((response) => {
        alert(response.data.message);
        reloadSellingBooks();
        reloadRequestedBooks();
      })
      .catch((err) => {
        const errorMsg = err.response?.data?.message || 'Cancel failed';
        alert('❌ ' + errorMsg);
      });
  };

  const handleMarkSold = (id) => {
    if (!window.confirm('Mark this book as sold to the current buyer?')) return;

    const url = API_URL + '/sell-books/mark-sold';
    axios.post(url, { id }, { withCredentials: true })
      .then((response) => {
        alert(response.data.message);
        reloadSellingBooks();
      })
      .catch((err) => {
        const errorMsg = err.response?.data?.message || 'Failed to mark as sold';
        alert('❌ ' + errorMsg);
      });
  };

  const handleConfirmReceive = (id) => {
    if (!window.confirm('Confirm that you have received this book?')) return;

    const url = API_URL + '/sell-books/confirm-receive';
    axios.post(url, { id }, { withCredentials: true })
      .then((response) => {
        alert(response.data.message);
        reloadSellingBooks();
        reloadRequestedBooks();
      })
      .catch((err) => {
        const errorMsg = err.response?.data?.message || 'Confirm failed';
        alert('❌ ' + errorMsg);
      });
  };

  const reloadSellingBooks = () => {
    const url = API_URL + '/sell-books';
    axios.get(url, { withCredentials: true })
      .then(res => setSellingBooks(res.data));
  };

  const reloadRequestedBooks = () => {
    const url = API_URL + '/sell-books/my-requests';
    axios.get(url, { withCredentials: true })
      .then(res => setRequestedBooks(res.data));
  };

  const handleCancelSell = (id) => {
    if (!window.confirm('Are you sure you want to remove this listing?')) return;

    const url = API_URL + '/sell-books/' + id;
    axios.delete(url, { withCredentials: true })
      .then(() => {
        alert('Listing removed successfully');
        reloadSellingBooks();
      })
      .catch(() => alert('❌ Failed to cancel listing.'));
  };

  const handleReturn = (bookId) => {
    const url = API_URL + '/return-book';
    axios.post(url, { book_id: bookId }, { withCredentials: true })
      .then(res => {
        alert(res.data.message);
        if (activeTab === 'borrowed') {
          const borrowedUrl = API_URL + '/borrowed-books';
          axios.get(borrowedUrl, { withCredentials: true })
            .then(res => setBorrowedBooks(res.data));
        }
        const booksUrl = API_URL + '/books';
        axios.get(booksUrl)
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
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }
    const formData = new FormData();
    formData.append('profileImage', file);
    setIsUploadingImage(true);
    const url = API_URL + '/api/user/upload-profile-image';
    axios.post(url, formData, {
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
    const url = API_URL + '/api/user/remove-profile-image';
    axios.delete(url, { withCredentials: true })
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
                  <button
                    className="borrow-btn"
                    onClick={() => handleBorrow(book.id)}
                    disabled={borrowingBookId === book.id}
                  >
                    {borrowingBookId === book.id ? 'Borrowing...' : 'Borrow Book'}
                  </button>
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
                    <div key={book.id} className={'book-card ' + (isPending ? 'pending-return' : '') + ' ' + (isRejected ? 'rejected-return' : '')}>
                      <div className="book-info">
                        <h3 className="book-title">{book.title}</h3>
                        <p className="book-author">by {book.author}</p>
                        <p className="book-remarks">Donated by: {book.donated_by}</p>
                        <div className="book-details">
                          <span className="book-acc">Acc. No: {book.acc_no}</span>
                          <span className="book-date">Borrowed on: {new Date(book.borrow_date).toLocaleDateString()}</span>
                          <span className="book-date">Expires on: {new Date(book.expiry_date).toLocaleDateString()}</span>
                        </div>
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
                        {(isActive || isRejected) && (
                          <button className="borrow-btn" onClick={() => handleReturn(book.id)}>
                            {isRejected ? 'Re-submit Book' : 'Submit Book'}
                          </button>
                        )}
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
              const url = API_URL + '/sell-book';
              axios.post(url, data, { withCredentials: true })
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
                  <option value="question-Paper">Question Papers</option>
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
                <textarea id="description" name="description" rows="9" cols="60" placeholder="Provide details like modules, schema, condition, subject coverage, etc." required></textarea>
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
                {sellingBooks.map((item) => {
                  const isSeller = item.seller_id === user?.id;
                  const isActiveBuyer = item.active_requester_id === user?.id;
                  const hasRequested = item.requesters?.some(r => r.id === user?.id);
                  const requestCount = item.request_count || 0;

                  return (
                    <div key={item.id} className="book-card">
                      <div className="book-info">
                        <h3 className="book-title">{item.title}</h3>
                        <p className="book-author">by {item.author}</p>
                        <p className="book-remarks">{item.description}</p>
                        <div className="book-details">
                          <span className="book-acc">Acc. No: {item.acc_no}</span>
                          <span className={'book-status status-' + item.status}>
                            Status: {item.status}
                          </span>
                        </div>

                        {/* Show request count for sellers */}
                        {isSeller && requestCount > 0 && (
                          <div className="request-queue-info">
                            <p className="queue-count">📋 {requestCount} request(s)</p>
                            {item.requesters && item.requesters.length > 0 && (
                              <div className="requesters-list">
                                <p className="list-title">Request Queue:</p>
                                {item.requesters.map((req, idx) => (
                                  <div key={req.id} className={'requester-item ' + (req.is_priority_buyer ? 'priority' : '')}>
                                    <span className="position">{idx + 1}.</span>
                                    <span className="name">{req.username}</span>
                                    {req.is_priority_buyer && <span className="badge">🎯 Active</span>}
                                    <span className="date">
                                      {new Date(req.requested_at).toLocaleDateString()}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Contact info */}
                        <a
                          className="book-contact"
                          href={'https://wa.me/' + (item.contact ? item.contact.replace(/\D/g, '') : '')}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          📞 Contact: {item.contact}
                        </a>
                      </div>

                      <div className="action-buttons">
                        {/* Seller actions */}
                        {isSeller && item.status === 'available' && (
                          <button className="btn-delete" onClick={() => handleCancelSell(item.id)}>
                            Remove Listing
                          </button>
                        )}
                        {isSeller && item.status === 'requested' && (
                          <button className="btn-sold" onClick={() => handleMarkSold(item.id)}>
                            Mark as Sold
                          </button>
                        )}
                        {isSeller && item.status === 'sold' && (
                          <span className="status-msg">⏳ Waiting for buyer to confirm receipt</span>
                        )}

                        {/* Buyer actions */}
                        {!isSeller && item.status === 'available' && !hasRequested && (
                          <button className="btn-request" onClick={() => handleRequest(item.id)}>
                            Request to Buy
                          </button>
                        )}
                        {!isSeller && item.status === 'requested' && !hasRequested && (
                          <button className="btn-request" onClick={() => handleRequest(item.id)}>
                            Join Queue
                          </button>
                        )}
                        {!isSeller && hasRequested && item.status !== 'sold' && item.status !== 'completed' && (
                          <div className="buyer-status">
                            {isActiveBuyer ? (
                              <span className="status-msg priority">✅ You are next in line!</span>
                            ) : (
                              <span className="status-msg queued">⏳ Request queued</span>
                            )}
                            <button className="btn-cancel" onClick={() => handleCancelRequest(item.id)}>
                              Cancel Request
                            </button>
                          </div>
                        )}
                        {isActiveBuyer && item.status === 'sold' && (
                          <button className="btn-confirm" onClick={() => handleConfirmReceive(item.id)}>
                            Confirm Received
                          </button>
                        )}

                        {/* Transaction completed */}
                        {item.status === 'completed' && (
                          <div className="transaction-complete">
                            <span className="status-msg">✅ Transaction Completed</span>
                            {item.active_buyer_name && (
                              <p className="book-buyer">Buyer: {item.active_buyer_name}</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );

      case 'requested-sell':
        return (
          <div className="requested-sell-section">
            <h2 className="section-title">My Requested Books</h2>
            {requestedBooks.length === 0 ? (
              <div className="empty-state">
                <p>You haven't requested any books yet</p>
              </div>
            ) : (
              <div className="books-grid">
                {requestedBooks.map((item) => (
                  <div key={item.id} className="book-card">
                    <div className="book-info">
                      <h3 className="book-title">{item.title}</h3>
                      <p className="book-author">by {item.author}</p>
                      <p className="book-remarks">{item.description}</p>
                      <div className="book-details">
                        <span className="book-acc">Acc. No: {item.acc_no}</span>
                        <span className="seller-name">Seller: {item.seller_name}</span>
                      </div>
                      <div className="request-info">
                        <p>Requested: {new Date(item.requested_at).toLocaleDateString()}</p>
                        <p className={'queue-position ' + (item.is_priority_buyer ? 'priority' : '')}>
                          {item.is_priority_buyer ? (
                            <>🎯 You are first in line!</>
                          ) : (
                            <>Position in queue: {item.queue_position}</>
                          )}
                        </p>
                        {item.status === 'sold' && item.is_priority_buyer && (
                          <p className="status-highlight">📦 Seller has marked as sold! Confirm once received.</p>
                        )}
                      </div>
                    </div>
                    <div className="action-buttons">
                      {item.status === 'sold' && item.is_priority_buyer ? (
                        <button className="btn-confirm" onClick={() => handleConfirmReceive(item.id)}>
                          Confirm Received
                        </button>
                      ) : (
                        <button className="btn-cancel" onClick={() => handleCancelRequest(item.id)}>
                          Cancel Request
                        </button>
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
      <div className={'sidebar-overlay ' + (!sidebarCollapsed ? 'active' : '')} onClick={() => setSidebarCollapsed(true)}></div>
      {sidebarCollapsed && (
        <button className="maximize-btn" onClick={() => setSidebarCollapsed(false)}>
          <span className="nav-icon">☰</span>
        </button>
      )}
      <div className={'user-sidebar ' + (sidebarCollapsed ? 'collapsed' : '')}>
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
            className={'nav-item ' + (activeTab === 'books' ? 'active' : '')}
            onClick={() => setActiveTab('books')}
          >
            <span className="nav-icon">🏠</span>
            <span className="nav-text">Home</span>
          </button>
          <button
            className={'nav-item ' + (activeTab === 'borrowed' ? 'active' : '')}
            onClick={() => setActiveTab('borrowed')}
          >
            <span className="nav-icon">📖</span>
            <span className="nav-text">My Books</span>
          </button>
          <button
            className={'nav-item ' + (activeTab === 'history' ? 'active' : '')}
            onClick={() => setActiveTab('history')}
          >
            <span className="nav-icon">📋</span>
            <span className="nav-text">History</span>
          </button>
          <button
            className={'nav-item ' + (activeTab === 'sell' ? 'active' : '')}
            onClick={() => setActiveTab('sell')}
          >
            <span className="nav-icon">💼</span>
            <span className="nav-text">Sell Book</span>
          </button>
          <button
            className={'nav-item ' + (activeTab === 'view-sell' ? 'active' : '')}
            onClick={() => setActiveTab('view-sell')}
          >
            <span className="nav-icon">🛒</span>
            <span className="nav-text">Marketplace</span>
          </button>
          <button
            className={'nav-item ' + (activeTab === 'requested-sell' ? 'active' : '')}
            onClick={() => setActiveTab('requested-sell')}
          >
            <span className="nav-icon">📥</span>
            <span className="nav-text">
              Requested Books
              {requestedBooks.length > 0 && (
                <span className="badge">{requestedBooks.length}</span>
              )}
            </span>
          </button>
        </nav>
        <div className="sidebar-footer">
          <button
            className="nav-item logout-btn"
            onClick={() => {
              const url = API_URL + '/api/user/logout';
              axios.post(url, {}, { withCredentials: true })
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
            {activeTab === 'requested-sell' && 'Requested Books'}
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