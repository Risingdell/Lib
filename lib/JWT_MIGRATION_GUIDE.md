# JWT Authentication Migration Guide

This guide will help you migrate from session-based to JWT-based authentication to fix iOS/Safari compatibility issues.

---

## 📋 Files Created

### Backend:
1. ✅ `server/middleware/jwtAuth.js` - JWT middleware and utilities
2. ✅ `server/routes/auth-jwt.js` - JWT-based authentication routes

### Frontend:
1. ✅ `src/utils/authToken.js` - Token management utilities
2. ✅ `src/utils/axiosConfig.js` - Axios interceptors for JWT

---

## 🔧 Step-by-Step Migration

### Step 1: Install Dependencies

```bash
cd server
npm install jsonwebtoken
```

### Step 2: Update Backend (server/index.js)

**Add the new JWT routes:**

```javascript
// Add this near the top with other requires
const authJwtRoutes = require('./routes/auth-jwt');

// Add this with other route registrations (around line 680)
app.use('/api/auth', authJwtRoutes);  // JWT authentication routes
```

**Add environment variable:**

Create or update `.env` file:
```
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

### Step 3: Update Admin Routes to Support JWT

**Option A: Use Dual Authentication (Recommended for gradual migration)**

In `server/routes/admin.js`, update to support both session and JWT:

```javascript
// Add at the top
const { verifyAdminAuth } = require('../middleware/jwtAuth');

// Replace session checks like this:
// FROM:
if (!req.session || !req.session.admin) {
  return res.status(401).json({ message: 'Unauthorized' });
}

// TO:
// Just use verifyAdminAuth middleware in route definition
// Example:
router.get('/members', verifyAdminAuth, (req, res) => {
  // req.admin will be set by middleware
  // ... your existing code ...
});
```

**Option B: Update each route individually**

Replace session checks with the middleware throughout `admin.js`.

### Step 4: Update Frontend Main Entry Point

**In `src/main.jsx`, setup axios interceptors:**

```javascript
import { setupAxiosInterceptors } from './utils/axiosConfig';

// Add this before createRoot
setupAxiosInterceptors();

createRoot(document.getElementById('root')).render(
  // ... rest of your code
);
```

### Step 5: Update Login Component

**For User Login (`src/Pages/Login.jsx`):**

```javascript
import { saveToken, saveUser } from '../utils/authToken';

// In your login handler:
const handleLogin = async (e) => {
  e.preventDefault();

  try {
    // Use the new JWT endpoint
    const response = await axios.post(
      `${API_URL}/api/auth/login`,
      { username, password }
    );

    // Save token and user data
    saveToken(response.data.token);
    saveUser(response.data.user);

    // Redirect to main page
    navigate('/main');
  } catch (error) {
    console.error('Login failed:', error);
    setError(error.response?.data?.message || 'Login failed');
  }
};
```

**For Admin Login (`src/Pages/AdminLogin.jsx`):**

```javascript
import { saveAdminToken, saveAdmin } from '../utils/authToken';

// In your admin login handler:
const handleAdminLogin = async (e) => {
  e.preventDefault();

  try {
    const response = await axios.post(
      `${API_URL}/api/auth/admin-login`,
      { username, password }
    );

    // Save admin token and data
    saveAdminToken(response.data.token);
    saveAdmin(response.data.admin);

    // Redirect to admin dashboard
    navigate('/admin-dashboard');
  } catch (error) {
    console.error('Admin login failed:', error);
    setError(error.response?.data?.message || 'Login failed');
  }
};
```

### Step 6: Update Logout Functionality

**For User Logout:**

```javascript
import { removeToken } from '../utils/authToken';

const handleLogout = () => {
  removeToken();
  navigate('/login');
};
```

**For Admin Logout:**

```javascript
import { removeAdminToken } from '../utils/authToken';

const handleAdminLogout = () => {
  removeAdminToken();
  navigate('/admin-login');
};
```

### Step 7: Update Protected Routes

**In `src/Pages/MainPage.jsx`:**

```javascript
import { getToken, getUser, removeToken } from '../utils/authToken';

useEffect(() => {
  const token = getToken();
  const userData = getUser();

  if (!token || !userData) {
    navigate('/login');
    return;
  }

  // Verify token is still valid
  axios.get(`${API_URL}/api/auth/verify`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  .then(response => {
    setUser(userData);
    setLoading(false);
  })
  .catch(error => {
    console.error('Token verification failed:', error);
    removeToken();
    navigate('/login');
  });
}, [navigate]);
```

**In `src/Pages/AdminDashboard.jsx`:**

```javascript
import { getAdminToken, getAdmin, removeAdminToken } from '../utils/authToken';

useEffect(() => {
  const token = getAdminToken();
  const adminData = getAdmin();

  if (!token || !adminData) {
    navigate('/admin-login');
    return;
  }

  // Verify admin token
  axios.get(`${API_URL}/api/auth/verify`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  .then(response => {
    if (response.data.user.type !== 'admin') {
      removeAdminToken();
      navigate('/admin-login');
      return;
    }
    setAdmin(adminData);
    setLoading(false);
  })
  .catch(error => {
    console.error('Token verification failed:', error);
    removeAdminToken();
    navigate('/admin-login');
  });
}, [navigate]);
```

### Step 8: Update Register Component

**In `src/Pages/Register.jsx`:**

```javascript
const handleRegister = async (e) => {
  e.preventDefault();

  try {
    const response = await axios.post(
      `${API_URL}/api/auth/register`,
      formData
    );

    // Show success message
    setSuccess(response.data.message);

    // Registration successful but requires approval
    // Don't auto-login, redirect to login page
    setTimeout(() => {
      navigate('/login');
    }, 3000);
  } catch (error) {
    console.error('Registration failed:', error);
    setError(error.response?.data?.message || 'Registration failed');
  }
};
```

---

## 🚀 Deployment Steps

### 1. Deploy Backend to Render

**Set Environment Variables in Render Dashboard:**

```
NODE_ENV=production
JWT_SECRET=your-super-secret-random-string-change-this
FRONTEND_URL=https://lib-jvvif5qwl-risingdells-projects.vercel.app
SESSION_SECRET=your-session-secret-key
DATABASE_URL=your-clever-cloud-mysql-url
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-key
CLOUDINARY_API_SECRET=your-cloudinary-secret
```

**Generate secure secrets:**
```bash
# On Mac/Linux:
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Or use online generator:
# https://randomkeygen.com/
```

### 2. Deploy Frontend to Vercel

**Set Environment Variables in Vercel:**

```
VITE_API_URL=https://your-backend.onrender.com
```

### 3. Test on iPhone

After deployment:
1. Open Safari on iPhone
2. Navigate to your Vercel URL
3. Try login/register
4. Check browser console for errors
5. Verify cookies/tokens are working

---

## 🧪 Testing Checklist

- [ ] User can register
- [ ] User can login and receive JWT token
- [ ] Token is stored in localStorage
- [ ] Token is sent with API requests
- [ ] Protected routes redirect to login when token missing
- [ ] Admin can login and receive admin JWT token
- [ ] Admin routes work with JWT authentication
- [ ] Logout clears tokens and redirects
- [ ] Token expiration redirects to login
- [ ] Works on iPhone Safari
- [ ] Works on Android Chrome
- [ ] Works on Desktop browsers

---

## 🐛 Troubleshooting

### Issue: "No token provided" error

**Solution:** Make sure axios interceptors are setup:
```javascript
// In main.jsx
import { setupAxiosInterceptors } from './utils/axiosConfig';
setupAxiosInterceptors();
```

### Issue: Token not being sent with requests

**Solution:** Check Authorization header in network tab:
- Should see: `Authorization: Bearer eyJhbGc...`
- If missing, interceptor not configured

### Issue: Still getting CORS errors

**Solution:** Verify backend CORS config allows your frontend URL:
```javascript
allowedOrigins.includes(origin)
```

### Issue: Token expired constantly

**Solution:** Check system time on server and client are synchronized

### Issue: Works on Android but not iPhone

**Solution:**
1. Clear Safari cache and site data
2. Check Safari settings > Prevent Cross-Site Tracking (try disabling for testing)
3. Verify JWT token is being stored in localStorage (not cookies)
4. Check browser console for specific errors

---

## 📊 Migration Checklist

### Backend:
- [ ] Install `jsonwebtoken` package
- [ ] Create `server/middleware/jwtAuth.js`
- [ ] Create `server/routes/auth-jwt.js`
- [ ] Add `/api/auth` routes to `server/index.js`
- [ ] Update admin routes to use `verifyAdminAuth`
- [ ] Set `JWT_SECRET` environment variable
- [ ] Deploy to Render

### Frontend:
- [ ] Create `src/utils/authToken.js`
- [ ] Create `src/utils/axiosConfig.js`
- [ ] Setup interceptors in `src/main.jsx`
- [ ] Update `Login.jsx` to use JWT
- [ ] Update `AdminLogin.jsx` to use JWT
- [ ] Update `Register.jsx` to use new endpoint
- [ ] Update `MainPage.jsx` protected route check
- [ ] Update `AdminDashboard.jsx` protected route check
- [ ] Update all logout handlers
- [ ] Deploy to Vercel

### Testing:
- [ ] Test login flow (user & admin)
- [ ] Test logout flow
- [ ] Test protected routes
- [ ] Test token expiration
- [ ] Test on iPhone Safari
- [ ] Test on Android Chrome
- [ ] Test on Desktop browsers

---

## 🎯 Benefits of JWT vs Sessions

| Feature | Sessions | JWT Tokens |
|---------|----------|------------|
| **iOS/Safari Support** | ❌ Blocked | ✅ Works |
| **Cross-Origin** | ❌ Cookie issues | ✅ No issues |
| **Scalability** | Needs Redis | ✅ Stateless |
| **Mobile Apps** | ❌ Difficult | ✅ Easy |
| **Server Restart** | ❌ Loses sessions | ✅ Persistent |

---

## 📚 Additional Resources

- [JWT.io - Learn about JWT](https://jwt.io)
- [localStorage vs Cookies](https://stackoverflow.com/questions/3220660/local-storage-vs-cookies)
- [Safari ITP Explained](https://webkit.org/blog/7675/intelligent-tracking-prevention/)

---

**Last Updated:** 2025-10-24
