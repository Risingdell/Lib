import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [admin, setAdmin] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [pendingReturns, setPendingReturns] = useState([]);
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
      try {
        const res = await axios.get('http://localhost:5000/api/admin/me', { withCredentials: true });
        if (res.data && res.data.id) {
          setAdmin(res.data);
        } else {
          console.error('Admin data format unexpected:', res.data);
          setAdmin(null);
        }
      } catch (err) {
        console.error('Failed to fetch admin profile:', err.response?.data?.message || err.message);
      }
    };
    fetchAdmin();
  }, []);

  // Fetch borrowed, expired books, or pending returns based on tab
  useEffect(() => {
    const fetchBorrowedBooks = async () => {
      try {
        let res;
        if (activeTab === 'borrowed') {
          res = await axios.get('http://localhost:5000/api/admin/borrowed-books');
          if (res) setBorrowedBooks(res.data);
        } else if (activeTab === 'expired') {
          res = await axios.get('http://localhost:5000/api/admin/expired-books');
          if (res) setBorrowedBooks(res.data);
        } else if (activeTab === 'pending-returns') {
          res = await axios.get('http://localhost:5000/api/admin/pending-returns', { withCredentials: true });
          if (res) setPendingReturns(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch books:', err.response?.data?.message || err.message);
      }
    };

    if (activeTab === 'borrowed' || activeTab === 'expired' || activeTab === 'pending-returns') {
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

  const handleApproveReturn = async (borrowId) => {
    if (!window.confirm('Are you sure you want to approve this book return?')) return;

    try {
      const res = await axios.post(
        'http://localhost:5000/api/admin/approve-return',
        { borrow_id: borrowId },
        { withCredentials: true }
      );
      alert(res.data.message);
      // Refresh pending returns list
      const updatedRes = await axios.get('http://localhost:5000/api/admin/pending-returns', { withCredentials: true });
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
        'http://localhost:5000/api/admin/reject-return',
        { borrow_id: borrowId, reason: reason.trim() },
        { withCredentials: true }
      );
      alert(res.data.message);
      // Refresh pending returns list
      const updatedRes = await axios.get('http://localhost:5000/api/admin/pending-returns', { withCredentials: true });
      setPendingReturns(updatedRes.data);
    } catch (err) {
      console.error('Reject failed:', err);
      alert('Error: ' + (err.response?.data?.message || 'Failed to reject return'));
    }
  };

  if (!admin) {
    return (
      <div className="admin-dashboard">
        <p>No admin data found. Please log in.</p>
        <button onClick={handleLogout}>Back to Login</button>
      </div>
    );
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
          <button className={`nav-item${activeTab === 'profile' ? ' active' : ''}`} onClick={() => setActiveTab('profile')}>
            <span className="nav-icon">👤</span>
            <span className="nav-text">Profile</span>
          </button>
          <button className={`nav-item${activeTab === 'borrowed' ? ' active' : ''}`} onClick={() => setActiveTab('borrowed')}>
            <span className="nav-icon">📖</span>
            <span className="nav-text">Borrowed Books</span>
          </button>
          <button className={`nav-item${activeTab === 'expired' ? ' active' : ''}`} onClick={() => setActiveTab('expired')}>
            <span className="nav-icon">⏰</span>
            <span className="nav-text">Expired Books</span>
          </button>
          <button className={`nav-item${activeTab === 'pending-returns' ? ' active' : ''}`} onClick={() => setActiveTab('pending-returns')}>
            <span className="nav-icon">⏳</span>
            <span className="nav-text">Pending Returns</span>
          </button>
          <button className={`nav-item${activeTab === 'add' ? ' active' : ''}`} onClick={() => setActiveTab('add')}>
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
            {activeTab === 'borrowed' && 'Borrowed Books'}
            {activeTab === 'expired' && 'Expired Books'}
            {activeTab === 'pending-returns' && 'Pending Returns'}
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
