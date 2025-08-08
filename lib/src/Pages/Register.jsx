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


        {success ? (
          <div className="success-message">
            <p>User Registered Successfully!</p>
            <Link to="/login" className="login-link">Go to Login</Link>
          </div>
        ) : (
          <form className="register-form" onSubmit={(e) => { e.preventDefault(); register(); }}>
            <Link to="/login" className="login-link">Go to Login</Link>
            <div className="name-row">
              <div className="input-group">
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="First Name"
                  required
                  autoComplete="off"
                  autoFill="off"
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
                  autoComplete="off"
                  autoFill="off"
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
                autoComplete="off"
                autoFill="off"
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
                autoComplete="off"
                autoFill="off"
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
                autoComplete="off"
                autoFill="off"
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
                autoComplete="new-password"
                autoFill="off"
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
                autoComplete="new-password"
                autoFill="off"
              />
            </div>



            <button type="submit" className="register-button">
              Register Now
            </button>


          </form>
        )}
      </div>
    </div>
  );
}

export default Register;
