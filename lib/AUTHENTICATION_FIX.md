# Authentication 401 Error Fix

## Problem
When logging into the website through Vercel, you're getting 401 (Unauthorized) errors for all authenticated API endpoints:
- `/api/user/profile` - 401
- `/sell-books` - 401
- `/sell-books/my-requests` - 401

## Root Cause
The application uses **session-based authentication** with cookies. The session cookie is being set during login but not being sent with subsequent requests due to:

1. **Cross-Origin Cookie Issues**: The frontend (Vercel) and backend (Render) are on different domains
2. **Missing Redis in Production**: Sessions are stored in memory, which doesn't persist across server restarts or multiple instances
3. **Cookie Configuration**: The session cookie settings weren't optimized for production cross-origin requests

## Solution Applied

### 1. Fixed Session Cookie Configuration (server/index.js:604-617)

**Changes:**
- Set `proxy: true` to trust Render's proxy
- Ensured `secure: true` in production (required for HTTPS)
- Set `sameSite: 'none'` in production (required for cross-origin cookies)
- Added `path: '/'` explicitly
- Changed `resave: false` (only save when modified)

```javascript
let sessionConfig = {
  secret: process.env.SESSION_SECRET || 'library-secret-key-development',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    path: '/'
  },
  name: 'connect.sid',
  proxy: process.env.NODE_ENV === 'production'
};
```

### 2. Updated Logout Endpoint (server/index.js:855-869)
Fixed cookie clearing to match production settings.

### 3. Added Debug Endpoint (server/index.js:1050-1059)
Added `/api/debug/session` to help troubleshoot session issues.

## Required Actions for Production

### On Render (Backend)

1. **Add Environment Variable: `NODE_ENV=production`**
   - Go to your Render dashboard
   - Select your backend service
   - Go to Environment section
   - Add: `NODE_ENV=production`

2. **Add Strong Session Secret**
   - Add: `SESSION_SECRET=<your-strong-random-32-char-string>`
   - Generate a strong secret: https://randomkeygen.com/

3. **Add Redis (CRITICAL for production)**
   Without Redis, sessions will be lost when the server restarts.

   **Option A: Upstash Redis (Free tier available)**
   - Sign up at https://upstash.com/
   - Create a Redis database
   - Copy the Redis URL
   - Add to Render: `REDIS_URL=redis://...`

   **Option B: Redis Labs (Free tier available)**
   - Sign up at https://redis.com/
   - Create a database
   - Copy the connection URL
   - Add to Render: `REDIS_URL=redis://...`

4. **Verify CORS Origins**
   The backend already includes your Vercel URL in CORS config (line 584):
   ```javascript
   'https://lib-6muhg89iu-risingdells-projects.vercel.app'
   ```

### On Vercel (Frontend)

1. **Verify Environment Variable**
   Make sure `VITE_API_URL` points to your Render backend:
   ```
   VITE_API_URL=https://library-backend-2-uvqp.onrender.com
   ```

2. **Check that axios requests include `withCredentials: true`**
   This is already configured in `src/services/api.js:7`:
   ```javascript
   withCredentials: true
   ```

## Testing the Fix

### 1. Test Session Debug Endpoint
After deploying, visit:
```
https://library-backend-2-uvqp.onrender.com/api/debug/session
```

Should return:
```json
{
  "hasSession": true,
  "sessionID": "...",
  "hasUser": false,
  "user": null,
  "cookies": "...",
  "origin": "https://lib-6muhg89iu-risingdells-projects.vercel.app"
}
```

### 2. Test Login Flow
1. Login through your Vercel site
2. Check browser DevTools → Network → Login request → Response Headers
3. Should see: `Set-Cookie: connect.sid=...; Secure; HttpOnly; SameSite=None`
4. Subsequent requests should include: `Cookie: connect.sid=...`

### 3. Verify Session Persistence
1. Login
2. Refresh the page
3. Should still be logged in
4. Check `/api/user/profile` - should return user data (not 401)

## Why This Happens

### Session-Based Authentication Flow
1. User logs in → Backend creates session → Sets cookie
2. Browser stores cookie
3. Browser sends cookie with every request to backend
4. Backend reads cookie → Retrieves session → Authenticates user

### Production Issues
- **Cross-origin**: Cookie must have `SameSite=None` and `Secure=true`
- **Proxy**: Render uses a reverse proxy, need `proxy: true`
- **Persistence**: Without Redis, sessions are lost on restart

## Alternative Solution: Token-Based Authentication

If session issues persist, consider switching to JWT tokens:

**Advantages:**
- No server-side session storage needed
- Works better across domains
- Easier to scale

**Implementation:**
1. On login, generate JWT token
2. Send token to frontend
3. Frontend stores in localStorage/sessionStorage
4. Frontend sends token in Authorization header
5. Backend verifies token on each request

## Files Modified

1. `server/index.js` - Session configuration (lines 604-617)
2. `server/index.js` - Logout endpoint (lines 855-869)
3. `server/index.js` - Debug endpoint (lines 1050-1059)
4. `server/.env.production.example` - Production env template (new file)

## Deployment Steps

1. **Commit and push changes**
   ```bash
   git add .
   git commit -m "Fix: Session cookie configuration for production cross-origin requests"
   git push
   ```

2. **Deploy to Render**
   - Render should auto-deploy from GitHub
   - Or manually trigger deployment

3. **Add environment variables on Render**
   - NODE_ENV=production
   - SESSION_SECRET=<strong-secret>
   - REDIS_URL=<redis-connection-url>

4. **Test on Vercel**
   - Clear browser cookies
   - Login again
   - Verify all authenticated endpoints work

## Quick Redis Setup (Upstash - Free)

1. Go to https://upstash.com/
2. Sign up/login
3. Create new database → Select "Global" for best performance
4. Copy the "Redis URL" (starts with `redis://`)
5. Add to Render environment: `REDIS_URL=<the-url-you-copied>`
6. Restart your Render service
7. Test login again

## Summary

The 401 errors are caused by session cookies not being properly shared between your Vercel frontend and Render backend. The fixes ensure:

✅ Cookies work cross-origin (SameSite=None, Secure=true)
✅ Render's proxy is trusted (proxy=true)
✅ Sessions persist (need Redis in production)
✅ Proper cookie lifecycle (login/logout)

**CRITICAL**: Add `REDIS_URL` to Render environment variables for production sessions to persist!
