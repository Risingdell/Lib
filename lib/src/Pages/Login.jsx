// src/pages/Login.jsx
import React, { useState, useContext } from "react";
import axios from "axios";
import { UserContext } from "../Context/UserContext";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";

function Login() {
  const { setUser } = useContext(UserContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loginStatus, setLoginStatus] = useState('');
  const navigate = useNavigate();

  const login = () => {
    axios.post("http://localhost:5000/login", {
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
      alert("Login failed.");
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    login();
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Login</h2>
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="login-options">
            <label className="remember-me">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Remember Me</span>
            </label>
            <Link to="/forgot-password" className="forgot-password">
              Forget Password
            </Link>
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
