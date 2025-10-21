# FREE TIER DEPLOYMENT CHECKLIST

Your codebase is now ready for deployment! Follow these steps:

## STEP 1: DATABASE - Clever Cloud MySQL (5-10 min)

1. **Sign up**: https://clever-cloud.com/
2. **Create MySQL addon**:
   - Click "Create" → "An add-on"
   - Select "MySQL"
   - Choose "DEV" plan (FREE)
   - Name: `library-db`

3. **Get credentials** from dashboard:
   - Database Host
   - Database Port (3306)
   - Database User
   - Database Password
   - Database Name

4. **Import your database**:
   - Export local DB: `mysqldump -u root library > library_backup.sql`
   - Use MySQL Workbench or CLI to import to Clever Cloud
   - Or use their CLI: `mysql -h [host] -u [user] -p [database] < library_backup.sql`

5. **Save credentials** - you'll need them for Render setup

---

## STEP 2: FILE STORAGE - Cloudinary (5 min)

1. **Sign up**: https://cloudinary.com/
2. **Get credentials** from Dashboard:
   - Cloud Name
   - API Key
   - API Secret
3. **Save credentials** - you'll need them for Render setup

---

## STEP 3: BACKEND - Render.com (10-15 min)

### 3.1 Create Web Service

1. **Sign up**: https://render.com/
2. **Create Web Service**:
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Root Directory: `server`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Plan: **Free**

### 3.2 Set Environment Variables

In Render dashboard, add these environment variables:

```
NODE_ENV=production
PORT=10000

# Database (from Clever Cloud)
DB_HOST=[your-clever-cloud-host]
DB_PORT=3306
DB_USER=[your-clever-cloud-user]
DB_PASSWORD=[your-clever-cloud-password]
DB_NAME=[your-clever-cloud-database]

# Session Secret (generate random string)
SESSION_SECRET=[paste-a-long-random-string-here]

# Cloudinary (from Cloudinary dashboard)
CLOUDINARY_CLOUD_NAME=[your-cloud-name]
CLOUDINARY_API_KEY=[your-api-key]
CLOUDINARY_API_SECRET=[your-api-secret]

# Frontend URL (add after Vercel deployment)
FRONTEND_URL=https://your-app.vercel.app
```

**Generate SESSION_SECRET**: Visit https://randomkeygen.com/ and copy a "CodeIgniter Encryption Key"

3. **Deploy** - Render will auto-deploy
4. **Get your backend URL**: `https://your-app-name.onrender.com`
5. **Test**: Visit `https://your-app-name.onrender.com/health`

---

## STEP 4: REDIS SESSION STORE - Render Redis (5 min) [OPTIONAL BUT RECOMMENDED]

1. **In Render dashboard**:
   - Click "New +" → "Redis"
   - Select **Free** plan (25 MB)
   - Name: `library-sessions`

2. **Get Redis URL** from dashboard

3. **Add to backend environment variables**:
   ```
   REDIS_URL=[your-redis-url-from-render]
   ```

4. **Redeploy backend** (click "Manual Deploy" → "Deploy latest commit")

---

## STEP 5: FRONTEND - Vercel (5-10 min)

### 5.1 Deploy to Vercel

1. **Sign up**: https://vercel.com/
2. **Import your project**:
   - Click "Add New Project"
   - Import your GitHub repository
   - Root Directory: `./` (leave as is)
   - Framework Preset: **Vite**

### 5.2 Configure Environment Variables

Add in Vercel dashboard:

```
VITE_API_URL=https://your-backend.onrender.com
```

3. **Deploy** - Vercel will build and deploy
4. **Get your frontend URL**: `https://your-app.vercel.app`

---

## STEP 6: CONNECT FRONTEND & BACKEND (2 min)

1. **Update backend FRONTEND_URL**:
   - Go to Render dashboard
   - Edit environment variable: `FRONTEND_URL=https://your-app.vercel.app`
   - Click "Save"
   - Backend will auto-redeploy

2. **Wait for deployment** (~2-3 minutes)

---

## STEP 7: TEST YOUR APPLICATION

Visit your Vercel URL and test:

- [ ] Register a new user
- [ ] Login
- [ ] View books
- [ ] Borrow a book
- [ ] Upload profile image (should go to Cloudinary)
- [ ] Return a book
- [ ] Create marketplace listing
- [ ] Admin login
- [ ] Admin approve return

---

## TROUBLESHOOTING

### Backend won't start
- Check Render logs for errors
- Verify all environment variables are set
- Test database connection from Render logs

### CORS errors
- Ensure `FRONTEND_URL` matches your Vercel URL exactly (no trailing slash)
- Check browser console for exact error

### Session issues
- Ensure Redis is connected (check Render logs for "Redis connected")
- If no Redis, sessions will be lost when backend restarts (every ~15 min on free tier)

### File uploads failing
- Check Cloudinary credentials
- Verify file size < 5MB
- Check Cloudinary dashboard for uploads

### Database connection timeout
- Verify Clever Cloud credentials
- Check Clever Cloud MySQL is running
- Ensure IP whitelist is disabled or includes Render IPs

---

## DEPLOYMENT URLS

After deployment, save these URLs:

```
Frontend (Vercel):  https://your-app.vercel.app
Backend (Render):   https://your-backend.onrender.com
Database (Clever):  [your-host].clever-cloud.com
Files (Cloudinary): https://cloudinary.com/console
Redis (Render):     [internal-url]
```

---

## COST: ₹0/month

All services are on free tier!

**Limitations to expect:**
- Backend sleeps after 15 min inactivity (~30s wake time)
- Database limited to 256 MB storage
- 25 GB file storage on Cloudinary
- 25 MB Redis storage

**Good for:**
- College projects
- Demonstrations
- Low traffic applications
- MVP/Proof of concept

---

## MONITORING (Optional)

Use **UptimeRobot** (free) to keep backend awake:
1. Sign up: https://uptimerobot.com/
2. Add monitor:
   - Type: HTTP(s)
   - URL: `https://your-backend.onrender.com/health`
   - Interval: Every 5 minutes

This prevents cold starts!

---

## NEED HELP?

Common issues:
1. **Backend logs**: Render dashboard → Logs tab
2. **Frontend logs**: Vercel dashboard → Deployments → View Function Logs
3. **Database**: Check Clever Cloud console
4. **Files**: Check Cloudinary Media Library

---

**Deployment Time: ~30-45 minutes total**

Good luck! 🚀
