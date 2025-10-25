import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './AdminLogin.css';
import sitLogo from '../assets/sit2.jpg';
import deepRightImg from '../assets/branch.png';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await axios.post(`${API_URL}/api/admin/login`,
        { username, password },
        { withCredentials: true }
      );
      navigate('/admin-dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="admin-login-container">
      <div className="top-bar">
              <img src={sitLogo} alt="Logo Left" className="bar-image" />
              <img src={deepRightImg} alt="Logo Right" className="bar-right-img" />
            </div>
      <div className="admin-login-card">
        <h2 className="admin-login-title">Admin Login</h2>
        <p className="admin-login-subtitle">Access administrator dashboard</p>

        {error && (
          <div className="admin-error-message">
            {error}
          </div>
        )}

        <form className="admin-login-form" onSubmit={handleSubmit}>
          <div className="admin-input-group">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              required
              autoComplete="username"
            />
          </div>

          <div className="admin-input-group">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="admin-login-button">
            Login to Dashboard
          </button>
        </form>

        <div className="admin-login-footer">
          <p>Administrator Access Only</p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
