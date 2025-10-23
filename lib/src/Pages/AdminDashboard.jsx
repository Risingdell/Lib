import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './AdminDashboard.css';
import BookLoader from '../Components/BookLoader';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AdminDashboard = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [pendingReturns, setPendingReturns] = useState([]);
  const [borrowingHistory, setBorrowingHistory] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const initialFormState = {
    acc_no: '',
    author: '',
    date: '',
    donated_by: '',
    sl_no: '',
    status: 'available',
    title: ''
  };
  const [form, setForm] = useState(initialFormState);

  // Fetch admin on load
  useEffect(() => {
    const fetchAdmin = async () => {
      // Minimum 5 seconds loading time for book animation
      const minLoadingTime = new Promise(resolve => setTimeout(resolve, 5000));

      try {
        const [res] = await Promise.all([
          axios.get(`${API_URL}/api/admin/me`, { withCredentials: true }),
          minLoadingTime
        ]);

        if (res.data && res.data.id) {
          setAdmin(res.data);
        } else {
          console.error('Admin data format unexpected:', res.data);
          setAdmin(null);
          // Redirect to login if no valid admin data
          window.location.href = '/admin-login';
        }
      } catch (err) {
        console.error('Failed to fetch admin profile:', err.response?.data?.message || err.message);
        // Wait for animation to complete before redirecting
        await minLoadingTime;
        window.location.href = '/admin-login';
      } finally {
        setLoading(false);
      }
    };
    fetchAdmin();
  }, []);

  // Fetch borrowed, expired books, pending returns, history, or pending users based on tab
  useEffect(() => {
    const fetchBorrowedBooks = async () => {
      try {
        let res;
        if (activeTab === 'borrowed') {
          res = await axios.get(`${API_URL}/api/admin/borrowed-books`);
          if (res) setBorrowedBooks(res.data);
        } else if (activeTab === 'expired') {
          res = await axios.get(`${API_URL}/api/admin/expired-books`);
          if (res) setBorrowedBooks(res.data);
        } else if (activeTab === 'pending-returns') {
          res = await axios.get(`${API_URL}/api/admin/pending-returns`, { withCredentials: true });
          if (res) setPendingReturns(res.data);
        } else if (activeTab === 'history') {
          res = await axios.get(`${API_URL}/api/admin/borrowing-history`, { withCredentials: true });
          if (res) setBorrowingHistory(res.data);
        } else if (activeTab === 'registration-requests') {
          res = await axios.get(`${API_URL}/api/admin/pending-users`, { withCredentials: true });
          if (res) setPendingUsers(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch data:', err.response?.data?.message || err.message);
      }
    };

    if (activeTab === 'borrowed' || activeTab === 'expired' || activeTab === 'pending-returns' || activeTab === 'history' || activeTab === 'registration-requests') {
      fetchBorrowedBooks();
    }
  }, [activeTab]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/admin/add-book', form);
      alert('Book added successfully!');
      setForm(initialFormState);
    } catch (err) {
      console.error(err);
      alert('Error adding book');
    }
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleLogout = () => {
    setAdmin(null);
    sessionStorage.removeItem('admin');
    window.location.href = '/admin-login';
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // Collapse sidebar only on mobile (screen width <= 768px)
    if (window.innerWidth <= 768) {
      setSidebarCollapsed(true);
    }
  };

  const handleApproveReturn = async (borrowId) => {
    if (!window.confirm('Are you sure you want to approve this book return?')) return;

    try {
      const res = await axios.post(
        `${API_URL}/api/admin/approve-return`,
        { borrow_id: borrowId },
        { withCredentials: true }
      );
      alert(res.data.message);
      // Refresh pending returns list
      const updatedRes = await axios.get(`${API_URL}/api/admin/pending-returns`, { withCredentials: true });
      setPendingReturns(updatedRes.data);
    } catch (err) {
      console.error('Approve failed:', err);
      alert('Error: ' + (err.response?.data?.message || 'Failed to approve return'));
    }
  };

  const handleRejectReturn = async (borrowId) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason || reason.trim() === '') {
      alert('Rejection reason is required');
      return;
    }

    try {
      const res = await axios.post(
        `${API_URL}/api/admin/reject-return`,
        { borrow_id: borrowId, reason: reason.trim() },
        { withCredentials: true }
      );
      alert(res.data.message);
      // Refresh pending returns list
      const updatedRes = await axios.get(`${API_URL}/api/admin/pending-returns`, { withCredentials: true });
      setPendingReturns(updatedRes.data);
    } catch (err) {
      console.error('Reject failed:', err);
      alert('Error: ' + (err.response?.data?.message || 'Failed to reject return'));
    }
  };

  const handleApproveUser = async (userId) => {
    if (!window.confirm('Are you sure you want to approve this user registration?')) return;

    try {
      const res = await axios.post(
        `${API_URL}/api/admin/approve-user`,
        { user_id: userId },
        { withCredentials: true }
      );
      alert(res.data.message);
      // Refresh pending users list
      const updatedRes = await axios.get(`${API_URL}/api/admin/pending-users`, { withCredentials: true });
      setPendingUsers(updatedRes.data);
    } catch (err) {
      console.error('Approve failed:', err);
      alert('Error: ' + (err.response?.data?.message || 'Failed to approve user'));
    }
  };

  const handleRejectUser = async (userId) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason || reason.trim() === '') {
      alert('Rejection reason is required');
      return;
    }

    try {
      const res = await axios.post(
        `${API_URL}/api/admin/reject-user`,
        { user_id: userId, reason: reason.trim() },
        { withCredentials: true }
      );
      alert(res.data.message);
      // Refresh pending users list
      const updatedRes = await axios.get(`${API_URL}/api/admin/pending-users`, { withCredentials: true });
      setPendingUsers(updatedRes.data);
    } catch (err) {
      console.error('Reject failed:', err);
      alert('Error: ' + (err.response?.data?.message || 'Failed to reject user'));
    }
  };

  if (loading) {
    return <BookLoader message="Loading admin dashboard..." />;
  }

  if (!admin) {
    // This should never be reached as we redirect in useEffect
    return null;
  }

  return (
    <div className="main-page">
      <div className={`sidebar-overlay ${!sidebarCollapsed ? 'active' : ''}`} onClick={toggleSidebar}></div>

      {/* Maximize button when sidebar is collapsed */}
      {sidebarCollapsed && (
        <button className="maximize-btn" onClick={toggleSidebar} aria-label="Expand sidebar">
          <span className="nav-icon">☰</span>
        </button>
      )}
      <div className={`user-sidebar${sidebarCollapsed ? ' collapsed' : ''}`}>
        <button className="sidebar-toggle" onClick={toggleSidebar} aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
          {sidebarCollapsed ? '☰' : '✕'}
        </button>

        <div className="admin-profile">
          <div className="admin-avatar">
            👤
          </div>
          <h3 className="admin-name">{admin.name || 'Admin User'}</h3>
          <p className="admin-username">@{admin.username}</p>
        </div>

        <nav className="sidebar-nav">
          <button className={`nav-item${activeTab === 'profile' ? ' active' : ''}`} onClick={() => handleTabChange('profile')}>
            <span className="nav-icon">👤</span>
            <span className="nav-text">Profile</span>
          </button>
          <button className={`nav-item${activeTab === 'registration-requests' ? ' active' : ''}`} onClick={() => handleTabChange('registration-requests')}>
            <span className="nav-icon">👥</span>
            <span className="nav-text">Registration Requests</span>
          </button>
          <button className={`nav-item${activeTab === 'borrowed' ? ' active' : ''}`} onClick={() => handleTabChange('borrowed')}>
            <span className="nav-icon">📖</span>
            <span className="nav-text">Borrowed Books</span>
          </button>
          <button className={`nav-item${activeTab === 'expired' ? ' active' : ''}`} onClick={() => handleTabChange('expired')}>
            <span className="nav-icon">⏰</span>
            <span className="nav-text">Expired Books</span>
          </button>
          <button className={`nav-item${activeTab === 'pending-returns' ? ' active' : ''}`} onClick={() => handleTabChange('pending-returns')}>
            <span className="nav-icon">⏳</span>
            <span className="nav-text">Pending Returns</span>
          </button>
          <button className={`nav-item${activeTab === 'history' ? ' active' : ''}`} onClick={() => handleTabChange('history')}>
            <span className="nav-icon">📚</span>
            <span className="nav-text">Borrowing History</span>
          </button>
          <button className={`nav-item${activeTab === 'add' ? ' active' : ''}`} onClick={() => handleTabChange('add')}>
            <span className="nav-icon">➕</span>
            <span className="nav-text">Add Books</span>
          </button>
        </nav>
        <div className="sidebar-footer">
          <button className="nav-item logout-btn" onClick={handleLogout}>
            <span className="nav-icon">🚪</span>
            <span className="nav-text">Logout</span>
          </button>
        </div>
      </div>
      <div className="main-content">
        <header className="mobile-header">
          <button className="mobile-menu-btn" onClick={toggleSidebar} aria-label="Toggle menu">
            ☰
          </button>
          <h1 className="page-title">
            {activeTab === 'profile' && 'Admin Profile'}
            {activeTab === 'registration-requests' && 'Registration Requests'}
            {activeTab === 'borrowed' && 'Borrowed Books'}
            {activeTab === 'expired' && 'Expired Books'}
            {activeTab === 'pending-returns' && 'Pending Returns'}
            {activeTab === 'history' && 'Borrowing History'}
            {activeTab === 'add' && 'Add Books'}
          </h1>
        </header>
        <div className="content-area">
          {activeTab === 'profile' && (
            <div className="dashboard-content">
              <h2 className="section-title">Admin Profile</h2>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '40px',
                background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                borderRadius: '12px',
                marginTop: '20px'
              }}>
                <div style={{
                  width: '120px',
                  height: '120px',
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '48px',
                  marginBottom: '20px',
                  boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)'
                }}>
                  👤
                </div>
                <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#2d3748', margin: '0 0 8px' }}>
                  {admin.name || 'Admin User'}
                </h3>
                <p style={{ fontSize: '16px', color: '#718096', margin: '0 0 24px' }}>
                  @{admin.username}
                </p>
                <div style={{
                  background: 'white',
                  padding: '20px 40px',
                  borderRadius: '8px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                }}>
                  <p style={{ margin: '8px 0', fontSize: '16px', color: '#4a5568' }}>
                    <strong>Admin ID:</strong> {admin.id}
                  </p>
                  <p style={{ margin: '8px 0', fontSize: '16px', color: '#4a5568' }}>
                    <strong>Role:</strong> System Administrator
                  </p>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'registration-requests' && (
            <div className="dashboard-content">
              <h2 className="section-title">Registration Requests ({pendingUsers.length})</h2>
              {pendingUsers.length === 0 ? (
                <p>No pending registration requests.</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>User ID</th>
                      <th>Name</th>
                      <th>Username</th>
                      <th>USN</th>
                      <th>Email</th>
                      <th>Registered On</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingUsers.map((user) => (
                      <tr key={user.id}>
                        <td>{user.id}</td>
                        <td>{user.firstName} {user.lastName}</td>
                        <td>{user.username}</td>
                        <td>{user.usn}</td>
                        <td>{user.email}</td>
                        <td>{new Date(user.registered_at).toLocaleDateString()}</td>
                        <td>
                          <span className="status-badge status-pending">
                            {user.approval_status}
                          </span>
                        </td>
                        <td>
                          <button
                            className="approve-btn"
                            onClick={() => handleApproveUser(user.id)}
                          >
                            ✅ Approve
                          </button>
                          <button
                            className="reject-btn"
                            onClick={() => handleRejectUser(user.id)}
                          >
                            ❌ Reject
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
          {activeTab === 'borrowed' && (
            <div className="dashboard-content">
              <h2 className="section-title">Borrowed Books</h2>
              {borrowedBooks.length === 0 ? (
                <p>No borrowed books.</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Borrow ID</th>
                      <th>Book Title</th>
                      <th>Author</th>
                      <th>Borrower Name</th>
                      <th>Username</th>
                      <th>Borrow Date</th>
                      <th>Expiry Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {borrowedBooks.map((entry) => (
                      <tr key={entry.borrow_id}>
                        <td>{entry.borrow_id}</td>
                        <td>{entry.book_title}</td>
                        <td>{entry.author}</td>
<td>{entry.borrower_name}</td>
<td>{entry.username}</td>
                        <td>{new Date(entry.borrow_date).toLocaleDateString()}</td>
                        <td>{new Date(entry.expiry_date).toLocaleDateString()}</td>
                        <td>{entry.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
          {activeTab === 'expired' && (
            <div className="dashboard-content">
              <h2 className="section-title">Expired Borrowed Books</h2>
              {borrowedBooks.length === 0 ? (
                <p>No expired borrowed books found.</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Book Title</th>
                      <th>Author</th>
                      <th>Borrower</th>
                      <th>Username</th>
                      <th>Expiry Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {borrowedBooks.map((book, index) => (
                      <tr key={index}>
                        <td>{book.book_title}</td>
                        <td>{book.book_author}</td>
<td>{book.borrower_username}</td>
<td>{book.borrower_username}</td>
                        <td>{new Date(book.expiry_date).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
          {activeTab === 'pending-returns' && (
            <div className="dashboard-content">
              <h2 className="section-title">Pending Book Returns ({pendingReturns.length})</h2>
              {pendingReturns.length === 0 ? (
                <p>No pending return requests.</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Book Title</th>
                      <th>Author</th>
                      <th>Acc No</th>
                      <th>Borrower</th>
                      <th>Username</th>
                      <th>Borrowed On</th>
                      <th>Submitted On</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingReturns.map((item) => (
                      <tr key={item.borrow_id}>
                        <td>{item.book_title}</td>
                        <td>{item.book_author}</td>
                        <td>{item.acc_no}</td>
                        <td>{item.borrower_name}</td>
                        <td>{item.borrower_username}</td>
                        <td>{new Date(item.borrow_date).toLocaleDateString()}</td>
                        <td>{new Date(item.returned_at).toLocaleDateString()}</td>
                        <td>
                          <button
                            className="approve-btn"
                            onClick={() => handleApproveReturn(item.borrow_id)}
                          >
                            ✅ Approve
                          </button>
                          <button
                            className="reject-btn"
                            onClick={() => handleRejectReturn(item.borrow_id)}
                          >
                            ❌ Reject
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
          {activeTab === 'history' && (
            <div className="dashboard-content">
              <h2 className="section-title">Complete Borrowing History ({borrowingHistory.length})</h2>
              {borrowingHistory.length === 0 ? (
                <p>No borrowing records found.</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Borrow ID</th>
                      <th>Book Title</th>
                      <th>Author</th>
                      <th>Acc No</th>
                      <th>Borrower</th>
                      <th>Username</th>
                      <th>Borrowed On</th>
                      <th>Expiry Date</th>
                      <th>Returned On</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {borrowingHistory.map((item) => (
                      <tr key={item.borrow_id}>
                        <td>{item.borrow_id}</td>
                        <td>{item.book_title}</td>
                        <td>{item.author}</td>
                        <td>{item.acc_no}</td>
                        <td>{item.borrower_name}</td>
                        <td>{item.username}</td>
                        <td>{new Date(item.borrow_date).toLocaleDateString()}</td>
                        <td>{new Date(item.expiry_date).toLocaleDateString()}</td>
                        <td>
                          {item.returned_at
                            ? new Date(item.returned_at).toLocaleDateString()
                            : '-'}
                        </td>
                        <td>
                          <span className={`status-badge status-${item.return_status}`}>
                            {item.status_display}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
          {activeTab === 'add' && (
            <div className="dashboard-content">
              <h2 className="section-title">Add New Book</h2>
              <form onSubmit={handleSubmit}>
                <label>
                  Acc No:
                  <input type="number" name="acc_no" value={form.acc_no} onChange={handleChange} required />
                </label>
                <label>
                  Author:
                  <input type="text" name="author" value={form.author} onChange={handleChange} required />
                </label>
                <label>
                  Title:
                  <input type="text" name="title" value={form.title} onChange={handleChange} required />
                </label>
                <label>
                  Serial No:
                  <input type="number" name="sl_no" value={form.sl_no} onChange={handleChange} required />
                </label>
                <label>
                  Date:
                  <input type="date" name="date" value={form.date} onChange={handleChange} />
                </label>
                <label>
                  Donated By:
                  <input type="text" name="donated_by" value={form.donated_by} onChange={handleChange} />
                </label>
                <label>
                  Status:
                  <select name="status" value={form.status} onChange={handleChange}>
                    <option value="available">Available</option>
                    <option value="borrowed">Borrowed</option>
                  </select>
                </label>
                <button type="submit">Add Book</button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
