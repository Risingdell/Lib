import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(location.state?.admin || null);

  useEffect(() => {
    const fetchAdmin = async () => {
      if (admin?.id) return; // already have data

      try {
        const id = location.state?.admin?.id;
        if (!id) return;

        const res = await axios.get(`http://localhost:5000/admin/${id}`);
        setAdmin(res.data.admin);
      } catch (err) {
        console.error('Failed to fetch admin:', err);
      }
    };

    fetchAdmin();
  }, [location.state]);

  if (!admin) {
    return (
      <div>
        <p>No admin data found. Please log in.</p>
        <button onClick={() => navigate('/admin-login')}>Back to Login</button>
      </div>
    );
  }

  return (
  <div className="admin-dashboard">
    <div className="dashboard-content">
      <h1>Welcome, {admin.name}</h1>
      <p><strong>Username:</strong> {admin.username}</p>
      <p><strong>ID:</strong> {admin.id}</p>
      <button onClick={() => navigate('/admin-login')}>Logout</button>
    </div>
  </div>
);
};

export default AdminDashboard;
