import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [admin, setAdmin] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [borrowedBooks, setBorrowedBooks] = useState([]);
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

  // Fetch borrowed or expired books based on tab
  useEffect(() => {
    const fetchBorrowedBooks = async () => {
      try {
        let res;
        if (activeTab === 'borrowed') {
          res = await axios.get('http://localhost:5000/api/admin/borrowed-books');
        } else if (activeTab === 'expired') {
          res = await axios.get('http://localhost:5000/api/admin/expired-books');
        }
        if (res) setBorrowedBooks(res.data);
      } catch (err) {
        console.error('Failed to fetch books:', err.response?.data?.message || err.message);
      }
    };

    if (activeTab === 'borrowed' || activeTab === 'expired') {
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
        <nav className="sidebar-nav">
          <button className={`nav-item${activeTab === 'profile' ? ' active' : ''}`} onClick={() => setActiveTab('profile')}>
            <span className="nav-icon">👤</span>
            {!sidebarCollapsed && <span className="nav-text">Profile</span>}
          </button>
          <button className={`nav-item${activeTab === 'borrowed' ? ' active' : ''}`} onClick={() => setActiveTab('borrowed')}>
            <span className="nav-icon">📖</span>
            {!sidebarCollapsed && <span className="nav-text">Borrowed Books</span>}
          </button>
          <button className={`nav-item${activeTab === 'expired' ? ' active' : ''}`} onClick={() => setActiveTab('expired')}>
            <span className="nav-icon">⏰</span>
            {!sidebarCollapsed && <span className="nav-text">Expired Books</span>}
          </button>
          <button className={`nav-item${activeTab === 'add' ? ' active' : ''}`} onClick={() => setActiveTab('add')}>
            <span className="nav-icon">➕</span>
            {!sidebarCollapsed && <span className="nav-text">Add Books</span>}
          </button>
        </nav>
        <div className="sidebar-footer">
          <button className="nav-item logout-btn" onClick={handleLogout}>
            <span className="nav-icon">🚪</span>
            {!sidebarCollapsed && <span className="nav-text">Logout</span>}
          </button>
        </div>
      </div>
      <div className="main-content">
        <div className="content-area">
          {activeTab === 'profile' && (
            <div className="dashboard-content">
              <h2 className="section-title">Admin Profile</h2>
              <div className="profile-info">
                <h3>{admin.name}</h3>
                <p><strong>Username:</strong> {admin.username}</p>
                <p><strong>ID:</strong> {admin.id}</p>
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
