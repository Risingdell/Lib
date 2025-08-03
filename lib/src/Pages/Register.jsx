// src/pages/Register.jsx
import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./Register.css";

function Register() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    usn: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
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

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    axios.post("http://localhost:5000/register", {
      email: formData.email,
      username: formData.username,
      password: formData.password,
      firstName: formData.firstName,
      lastName: formData.lastName,
      usn: formData.usn
    })
    .then((response) => {
      console.log(response);
      setSuccess(true);
      setFormData({
        firstName: '',
        lastName: '',
        usn: '',
        email: '',
        password: '',
        confirmPassword: ''
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
        <h2 className="register-title">Register</h2>
        <p className="register-subtitle">Create your account. It's free and only takes a minute.</p>

        {success ? (
          <div className="success-message">
            <p>User Registered Successfully!</p>
            <Link to="/login" className="login-link">Go to Login</Link>
          </div>
        ) : (
          <form className="register-form" onSubmit={(e) => { e.preventDefault(); register(); }}>
            <div className="name-row">
              <div className="input-group">
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="First Name"
                  required
                />
              </div>
              <div className="input-group">
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Last Name"
                  required
                />
              </div>
                         </div>

             <div className="input-group">
               <input
                 type="text"
                 name="usn"
                 value={formData.usn}
                 onChange={handleInputChange}
                 placeholder="USN"
                 required
               />
             </div>
             <div className="input-group">
             <input
               type="text"
               name="username"
              value={formData.username}
              onChange={handleInputChange}
              placeholder="Username"
              required
              />
             </div>


             <div className="input-group">
               <input
                 type="email"
                 name="email"
                 value={formData.email}
                 onChange={handleInputChange}
                 placeholder="Email"
                 required
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
              />
            </div>

            <div className="input-group">
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm Password"
                required
              />
            </div>

            <div className="terms-checkbox">
              <input
                type="checkbox"
                id="acceptTerms"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
              />
              <label htmlFor="acceptTerms">
                I accept the <a href="#" className="terms-link">Terms of Use</a> & <a href="#" className="terms-link">Privacy Policy</a>.
              </label>
            </div>
            <Link to="/login" className="login-link">Go to Login</Link>

            <button type="submit" className="register-button">
              Register Now
            </button>

            <div className="login-prompt">
              Already have an account? <Link to="/login" className="login-link">Sign in</Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default Register;
