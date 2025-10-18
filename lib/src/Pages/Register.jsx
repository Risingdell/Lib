// src/pages/Register.jsx
import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./Register.css";

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    usn: ''
  });
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const register = () => {
    if (!acceptTerms) {
      alert("Please accept the Terms of Use & Privacy Policy.");
      return;
    }

    axios.post(`${import.meta.env.VITE_API_URL}/register`, {
      username: formData.username,
      password: formData.password,
      usn: formData.usn
    }, {
      withCredentials: true
    })
    .then((response) => {
      console.log(response);
      setSuccess(true);
      setFormData({
        username: '',
        password: '',
        usn: ''
      });
      setAcceptTerms(false);
    })
    .catch((error) => {
      console.error("Error registering:", error);
      alert("Registration failed.");
    });
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h2 className="register-title">Create Account</h2>
        <p className="register-subtitle">Join our library community today</p>

        {success ? (
          <div className="success-message">
            <p>User Registered Successfully!</p>
            <Link to="/login" className="login-link">Go to Login</Link>
          </div>
        ) : (
          <form className="register-form" onSubmit={(e) => { e.preventDefault(); register(); }}>
            <div className="input-group">
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Username"
                required
                autoComplete="off"
              />
            </div>

            <div className="input-group">
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Password"
                required
                autoComplete="off"
              />
            </div>

            <div className="input-group">
              <input
                type="text"
                name="usn"
                value={formData.usn}
                onChange={handleInputChange}
                placeholder="USN"
                required
                autoComplete="off"
              />
            </div>

            <div className="terms-group">
              <label className="terms-label">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  required
                />
                <span>I accept the Terms of Use & Privacy Policy</span>
              </label>
            </div>

            <button type="submit" className="register-button">
              Register Now
            </button>

            <div className="login-prompt">
              Already have an account? <Link to="/login" className="login-link">Sign In</Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default Register;
