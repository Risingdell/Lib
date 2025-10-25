// src/pages/Login.jsx
import React, { useState, useContext } from "react";
import axios from "axios";
import { UserContext } from "../Context/UserContext";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";
import { useSnackbar } from "../Context/SnackbarContext";
import sitLogo from '../assets/sit2.jpg';
import deepRightImg from '../assets/branch.png';

function Login() {
  const { setUser } = useContext(UserContext);
  const { showSnackbar } = useSnackbar();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginStatus, setLoginStatus] = useState('');
  const navigate = useNavigate();

  const login = () => {
  axios.post(`${import.meta.env.VITE_API_URL}/login`, {

    username,
      password
    }, {
      withCredentials: true
    })
    .then((response) => {
      if (response.data.username) {
        setUser({ username: response.data.username });
        setLoginStatus(`Welcome, ${response.data.username}!`);
        navigate('/main');
      } else if (response.data.message) {
        setLoginStatus(response.data.message);
      }
      setUsername('');
      setPassword('');
    })
    .catch((error) => {
      console.error("Error logging in:", error);
      showSnackbar('error', 'Login failed. Please check your credentials.');
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    login();
  };

  return (
    <div className="login-container">

      <div className="login-card">
        <h2 className="login-title">Welcome Back</h2>
        <p className="login-subtitle">Sign in to access your library</p>
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="off"
            />
          </div>
          <div className="input-group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>

          <button type="submit" className="login-button">
            Log in
          </button>
        </form>

        <div className="register-prompt">
          Don't have an account? <Link to="/register" className="register-link">Register</Link>
        </div>

        {loginStatus && (
          <div className="login-status">
            {loginStatus}
          </div>
        )}
      </div>
    </div>
  );
}

export default Login;
