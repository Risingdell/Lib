# Quick Start: JWT Authentication for iOS Fix

This is a quick reference guide to implement JWT authentication and fix iPhone compatibility issues.

---

## 🚀 Quick Setup (5 Steps)

### Step 1: Install JWT Package

```bash
cd server
npm install jsonwebtoken
```

### Step 2: Add JWT Routes to Backend

**In `server/index.js`, add near line 680:**

```javascript
// Add JWT authentication routes
const authJwtRoutes = require('./routes/auth-jwt');
app.use('/api/auth', authJwtRoutes);
```

### Step 3: Setup Axios Interceptors

**In `src/main.jsx`, add before createRoot:**

```javascript
import { setupAxiosInterceptors } from './utils/axiosConfig';

// Setup JWT interceptors
setupAxiosInterceptors();

createRoot(document.getElementById('root')).render(
  // ... your existing code
);
```

### Step 4: Update Environment Variables

**Backend (Render):**
```
JWT_SECRET=9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6
```

Generate a secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Frontend (Vercel):**
```
VITE_API_URL=https://your-backend.onrender.com
```

### Step 5: Deploy and Test

1. Push changes to GitHub
2. Render will auto-deploy backend
3. Vercel will auto-deploy frontend
4. Test on iPhone Safari

---

## 📝 Code Examples

### Example 1: Update User Login

**Before (Session-based):**
```javascript
// src/Pages/Login.jsx
const handleLogin = async (e) => {
  e.preventDefault();
  try {
    const response = await axios.post(
      `${API_URL}/login`,
      { username, password },
      { withCredentials: true }  // Session-based
    );
    navigate('/main');
  } catch (error) {
    setError('Login failed');
  }
};
```

**After (JWT-based):**
```javascript
// src/Pages/Login.jsx
import { saveToken, saveUser } from '../utils/authToken';

const handleLogin = async (e) => {
  e.preventDefault();
  try {
    const response = await axios.post(
      `${API_URL}/api/auth/login`,  // New JWT endpoint
      { username, password }
    );

    // Save token and user data
    saveToken(response.data.token);
    saveUser(response.data.user);

    navigate('/main');
  } catch (error) {
    setError(error.response?.data?.message || 'Login failed');
  }
};
```

### Example 2: Update Admin Login

**Before:**
```javascript
// src/Pages/AdminLogin.jsx
const response = await axios.post(
  `${API_URL}/api/admin/login`,
  credentials,
  { withCredentials: true }
);
```

**After:**
```javascript
// src/Pages/AdminLogin.jsx
import { saveAdminToken, saveAdmin } from '../utils/authToken';

const response = await axios.post(
  `${API_URL}/api/auth/admin-login`,  // New endpoint
  credentials
);

saveAdminToken(response.data.token);
saveAdmin(response.data.admin);
```

### Example 3: Update Protected Route Check

**Before:**
```javascript
// src/Pages/MainPage.jsx
useEffect(() => {
  axios.get(`${API_URL}/api/user/profile`, { withCredentials: true })
    .then(res => setUser(res.data))
    .catch(() => navigate('/login'));
}, []);
```

**After:**
```javascript
// src/Pages/MainPage.jsx
import { getToken, getUser, removeToken } from '../utils/authToken';

useEffect(() => {
  const token = getToken();
  const userData = getUser();

  if (!token || !userData) {
    navigate('/login');
    return;
  }

  setUser(userData);
  setLoading(false);
}, [navigate]);
```

### Example 4: Update Logout

**Before:**
```javascript
const handleLogout = () => {
  axios.post(`${API_URL}/logout`, {}, { withCredentials: true })
    .then(() => navigate('/login'));
};
```

**After:**
```javascript
import { removeToken } from '../utils/authToken';

const handleLogout = () => {
  removeToken();
  navigate('/login');
};
```

---

## 🔑 Key Changes Summary

### What Changes:
1. ✅ Login endpoint: `/login` → `/api/auth/login`
2. ✅ Admin login: `/api/admin/login` → `/api/auth/admin-login`
3. ✅ Storage: `session cookies` → `localStorage tokens`
4. ✅ Auth header: Automatically added by interceptor
5. ✅ No more `{ withCredentials: true }` needed in requests

### What Stays the Same:
1. ✅ All your existing API endpoints work as-is
2. ✅ Database structure unchanged
3. ✅ UI/UX remains identical
4. ✅ User experience is the same

---

## ✅ Testing on iPhone

1. **Clear Safari Data:**
   - Settings > Safari > Clear History and Website Data

2. **Test Login:**
   - Open your Vercel URL in Safari
   - Login with credentials
   - Should redirect to main page

3. **Check Developer Console:**
   - Connect iPhone to Mac
   - Safari > Develop > [Your iPhone] > [Your Site]
   - Look for errors

4. **Verify Token:**
   - In Safari console: `localStorage.getItem('auth_token')`
   - Should show a long JWT string

---

## 🐛 Common Issues & Fixes

### Issue: "Cannot find module './utils/authToken'"

**Fix:** The files are already created! Just restart your dev server:
```bash
cd lib
npm run dev
```

### Issue: Login works but immediately logs out

**Fix:** Check if interceptors are setup in `main.jsx`:
```javascript
import { setupAxiosInterceptors } from './utils/axiosConfig';
setupAxiosInterceptors(); // Add this line
```

### Issue: Still getting 401 errors

**Fix:** Check network tab in browser:
- Look for `Authorization: Bearer xxx` header
- If missing, interceptor not working

### Issue: Works on desktop but not iPhone

**Fix:**
1. Clear iPhone Safari cache
2. Check console for specific errors
3. Verify token is in localStorage (not cookies)
4. Make sure you deployed the updated backend with JWT routes

---

## 📦 Files Already Created

You have these new files ready to use:

### Backend:
- ✅ `server/middleware/jwtAuth.js` - JWT utilities
- ✅ `server/routes/auth-jwt.js` - Auth endpoints

### Frontend:
- ✅ `src/utils/authToken.js` - Token management
- ✅ `src/utils/axiosConfig.js` - Axios setup

### Guides:
- ✅ `IOS_FIX_GUIDE.md` - Detailed explanation
- ✅ `JWT_MIGRATION_GUIDE.md` - Step-by-step migration
- ✅ `QUICK_START_JWT.md` - This quick reference

---

## 🎯 Next Steps

1. **Add JWT route to backend** (Step 2 above)
2. **Setup interceptors** (Step 3 above)
3. **Set environment variables** (Step 4 above)
4. **Deploy to Render and Vercel**
5. **Test on iPhone Safari**

---

## 💡 Pro Tips

1. **Gradual Migration:** The JWT middleware supports both session and JWT, so you can migrate gradually
2. **Keep Session Fallback:** Users already logged in with sessions will still work
3. **Test Locally First:** Run locally before deploying to production
4. **Monitor Logs:** Watch Render logs for any JWT errors

---

**Need help?** Check `JWT_MIGRATION_GUIDE.md` for detailed instructions!

**Last Updated:** 2025-10-24
