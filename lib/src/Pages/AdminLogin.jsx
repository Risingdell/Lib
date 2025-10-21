import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/api/admin/login`,
        { username, password },
        { withCredentials: true }
      );
      navigate('/admin-dashboard'); // or wherever
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <>
      <style>{`
        .admin-login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%);
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        .admin-login-card {
          background: rgba(255,255,255,0.10);
          padding: 2.5rem 2rem 2rem 2rem;
          border-radius: 18px;
          box-shadow: 0 8px 32px rgba(99,102,241,0.10), 0 1.5px 8px rgba(99,102,241,0.08);
          backdrop-filter: blur(12px);
          min-width: 320px;
          max-width: 90vw;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .admin-login-card h2 {
          font-size: 2.2rem;
          font-weight: 700;
          color: #fff;
          margin-bottom: 1.5rem;
          letter-spacing: 1px;
        }
        .login-error {
          color: #e53935;
          background: #fff3f3;
          border-radius: 6px;
          padding: 0.5rem 1rem;
          margin-bottom: 1rem;
          font-size: 1rem;
          text-align: center;
        }
        .admin-login-card form {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 1.2rem;
          align-items: center;
        }
        .admin-login-card input {
          width: 100%;
          max-width: 220px;
          padding: 12px 16px;
          border-radius: 8px;
          border: none;
          font-size: 1.1rem;
          background: #f8fafc;
          color: #333;
          box-shadow: 0 1px 4px rgba(99,102,241,0.04);
          transition: box-shadow 0.2s, border 0.2s;
          text-align: center;
          margin: 0 auto;
          display: block;
        }
        .admin-login-card input:focus {
          outline: none;
          border: 1.5px solid #6366f1;
          box-shadow: 0 0 0 2px #6366f133;
        }
        .admin-login-card input::placeholder {
          color: #b0bec5;
          text-align: center;
        }
        .admin-login-card button {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: #fff;
          padding: 12px 0;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 1.1rem;
          cursor: pointer;
          margin-top: 0.5rem;
          box-shadow: 0 2px 8px rgba(99,102,241,0.10);
          transition: background 0.2s, box-shadow 0.2s;
          width: 100%;
          max-width: 220px;
          margin-left: auto;
          margin-right: auto;
          display: block;
        }
        .admin-login-card button:hover {
          background: linear-gradient(135deg, #5855f7, #7c3aed);
          box-shadow: 0 4px 16px rgba(99,102,241,0.18);
        }
        @media (max-width: 480px) {
          .admin-login-card {
            min-width: 90vw;
            padding: 1.2rem 0.5rem 1.5rem 0.5rem;
          }
          .admin-login-card h2 {
            font-size: 1.5rem;
          }
          .admin-login-card input, .admin-login-card button {
            max-width: 95vw;
          }
        }
      `}</style>
      <div className="admin-login-page">
        <div className="admin-login-card">
          <h2>Admin Login</h2>
          {error && <p className="login-error">{error}</p>}
          <form onSubmit={handleSubmit}>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" required />
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required />
            <button type="submit">Login</button>
          </form>
        </div>
      </div>
    </>
  );
};

export default AdminLogin;
