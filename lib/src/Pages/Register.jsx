import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./Register.css";

function Register() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    usn: '',
    password: ''
  });
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [usnError, setUsnError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Real-time USN validation
    if (name === 'usn') {
      const usnPattern = /^[1-4]SN\d{2}AD\d{3}$/;
      const upperValue = value.toUpperCase();

      setFormData(prev => ({
        ...prev,
        [name]: upperValue
      }));

      if (value && !usnPattern.test(upperValue)) {
        setUsnError('USN format: 4SN23AD000 (e.g., 1SN23AD001)');
      } else if (value && !upperValue.includes('AD')) {
        setUsnError('Only students with AD department code can register');
      } else {
        setUsnError('');
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const register = () => {
    if (!acceptTerms) {
      alert("Please accept the Terms of Use & Privacy Policy.");
      return;
    }

    // Validate USN before submitting
    const usnPattern = /^[1-4]SN\d{2}AD\d{3}$/;
    if (!usnPattern.test(formData.usn)) {
      alert("Invalid USN format. USN must follow the pattern: 4SN23AD000 (Example: 1SN23AD001, 4SN23AD999)");
      return;
    }

    if (!formData.usn.includes('AD')) {
      alert("Invalid USN. Only students with 'AD' department code can register.");
      return;
    }

    axios.post(`${import.meta.env.VITE_API_URL}/register`, {
      firstName: formData.firstName,
      lastName: formData.lastName,
      username: formData.username,
      email: formData.email,
      usn: formData.usn,
      password: formData.password
    }, {
      withCredentials: true
    })
    .then((response) => {
      console.log(response);
      setSuccess(true);
      setSuccessMessage(response.data.message || "Registration successful! Please wait approximately 2 hours for admin approval.");
      setFormData({
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        usn: '',
        password: ''
      });
      setAcceptTerms(false);
      setUsnError('');
    })
    .catch((error) => {
      console.error("Error registering:", error);
      const errorMessage = error.response?.data?.message || "Registration failed.";
      alert(errorMessage);
    });
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h2 className="register-title">Create Account</h2>


        {success ? (
          <div className="success-message">
            <div className="success-icon">✓</div>
            <h3>Registration Successful!</h3>
            <p className="success-text">{successMessage}</p>
            <div className="waiting-info">
              <p className="wait-time">⏰ Estimated Approval Time: <strong>2 hours</strong></p>
              <p className="info-text">You will receive an email notification once your account is approved. After approval, you can login with your credentials.</p>
            </div>
            <Link to="/login" className="login-link-button">Go to Login Page</Link>
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
                  autoComplete="given-name"
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
                  autoComplete="family-name"
                />
              </div>
            </div>

            <div className="input-group">
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Username"
                required
                autoComplete="username"
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
                autoComplete="email"
              />
            </div>

            <div className="input-group">
              <input
                type="text"
                name="usn"
                value={formData.usn}
                onChange={handleInputChange}
                placeholder="USN (Format: 4SN23AD000)"
                required
                autoComplete="off"
                maxLength="10"
                style={{ borderColor: usnError ? '#ef4444' : '' }}
              />
              {usnError && <span className="error-text">{usnError}</span>}
              {formData.usn && !usnError && <span className="success-text-inline">✓ Valid USN format</span>}
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


// src/pages/Register.jsx
// import React, { useState } from "react";
// import axios from "axios";
// import { Link } from "react-router-dom";
// import "./Register.css";

// function Register() {
//   const [formData, setFormData] = useState({
//     firstName: '',
//     lastName: '',
//     username: '',
//     email: '',
//     usn: '',
//     password: ''
//   });
//   const [acceptTerms, setAcceptTerms] = useState(false);
//   const [success, setSuccess] = useState(false);

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   const register = () => {
//     if (!acceptTerms) {
//       alert("Please accept the Terms of Use & Privacy Policy.");
//       return;
//     }

//     axios.post(`${import.meta.env.VITE_API_URL}/register`, {
//       firstName: formData.firstName,
//       lastName: formData.lastName,
//       username: formData.username,
//       email: formData.email,
//       usn: formData.usn,
//       password: formData.password
//     }, {
//       withCredentials: true
//     })
//     .then((response) => {
//       console.log(response);
//       setSuccess(true);
//       setFormData({
//         firstName: '',
//         lastName: '',
//         username: '',
//         email: '',
//         usn: '',
//         password: ''
//       });
//       setAcceptTerms(false);
//     })
//     .catch((error) => {
//       console.error("Error registering:", error);
//       const errorMessage = error.response?.data?.message || "Registration failed.";
//       alert(errorMessage);
//     });
//   };

//   return (
//     <div className="register-container">
//       <div className="register-card">
//         <h2 className="register-title">Create Account</h2>
//         <p className="register-subtitle">Join our library community today</p>

//         {success ? (
//           <div className="success-message">
//             <Link to="/logout/" className="login-link">Go to Login</Link>
//             <p>User Registered Successfully!</p>
//           </div>
//         ) : (
//           <form className="register-form" onSubmit={(e) => { e.preventDefault(); register(); }}>
//             <div className="input-group">
//               <input
//                 type="text"
//                 name="firstName"
//                 value={formData.firstName}
//                 onChange={handleInputChange}
//                 placeholder="First Name"
//                 required
//                 autoComplete="given-name"
//               />
//             </div>

//             <div className="input-group">
//               <input
//                 type="text"
//                 name="lastName"
//                 value={formData.lastName}
//                 onChange={handleInputChange}
//                 placeholder="Last Name"
//                 required
//                 autoComplete="family-name"
//               />
//             </div>

//             <div className="input-group">
//               <input
//                 type="text"
//                 name="username"
//                 value={formData.username}
//                 onChange={handleInputChange}
//                 placeholder="Username"
//                 required
//                 autoComplete="username"
//               />
//             </div>

//             <div className="input-group">
//               <input
//                 type="email"
//                 name="email"
//                 value={formData.email}
//                 onChange={handleInputChange}
//                 placeholder="Email"
//                 required
//                 autoComplete="email"
//               />
//             </div>

//             <div className="input-group">
//               <input
//                 type="text"
//                 name="usn"
//                 value={formData.usn}
//                 onChange={handleInputChange}
//                 placeholder="USN (University Seat Number)"
//                 required
//                 autoComplete="off"
//               />
//             </div>

//             <div className="input-group">
//               <input
//                 type="password"
//                 name="password"
//                 value={formData.password}
//                 onChange={handleInputChange}
//                 placeholder="Password"
//                 required
//                 autoComplete="new-password"
//               />
//             </div>

//             <div className="terms-group">
//               <label className="terms-label">
//                 <input
//                   type="checkbox"
//                   checked={acceptTerms}
//                   onChange={(e) => setAcceptTerms(e.target.checked)}
//                   required
//                 />
//                 <span>I accept the Terms of Use & Privacy Policy</span>
//               </label>
//             </div>

//             <button type="submit" className="register-button">
//               Register Now
//             </button>

//             <div className="login-prompt">
//               Already have an account? <Link to="/login" className="login-link">Sign In</Link>
//             </div>
//           </form>
//         )}
//       </div>
//     </div>
//   );
// }

// export default Register;
