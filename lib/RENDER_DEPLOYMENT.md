# RENDER.COM DEPLOYMENT GUIDE

Your database is ready! Now let's deploy your backend to Render.com.

---

## ✅ WHAT YOU'VE COMPLETED

- ✅ Clever Cloud MySQL database created and imported
- ✅ 7 tables created successfully
- ✅ Test admin account ready (username: `admin`, password: `admin123`)
- ✅ 3 sample books added

---

## 🚀 STEP-BY-STEP: DEPLOY TO RENDER

### STEP 1: Create Render Account (2 min)

1. **Go to**: https://dashboard.render.com/register
2. **Sign up** with GitHub (recommended) or Email
3. If using GitHub:
   - Authorize Render to access your repositories
   - Grant access to your library project repo

---

### STEP 2: Create Web Service (3 min)

1. Click **"New +"** button (top right)
2. Select **"Web Service"**
3. **Connect Repository**:
   - If GitHub: Select your repository from the list
   - If not connected: Connect GitHub first
4. Click on your library repository

---

### STEP 3: Configure Web Service (5 min)

Fill in these settings:

| Setting | Value |
|---------|-------|
| **Name** | `library-backend` (or your preferred name) |
| **Region** | Choose closest to you (e.g., Oregon, Frankfurt) |
| **Branch** | `deploy-version` or `main` |
| **Root Directory** | `server` |
| **Environment** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Instance Type** | **Free** |

---

### STEP 4: Add Environment Variables (5 min) ⚠️ IMPORTANT

Click **"Advanced"** button, then add these environment variables:

#### Copy-Paste Ready Environment Variables:

```bash
# === Node Configuration ===
NODE_ENV=production
PORT=10000

# === Database Configuration (Your Clever Cloud MySQL) ===
DB_HOST=biuezvkp1ir5odbq6wju-mysql.services.clever-cloud.com
DB_PORT=3306
DB_USER=u9vwnxvk2ljksy3a
DB_PASSWORD=le7A7dr4Rzx6AcOpycjo
DB_NAME=biuezvkp1ir5odbq6wju

# === Session Secret (CHANGE THIS!) ===
SESSION_SECRET=your-super-long-random-secret-key-change-this-NOW

# === Frontend URL (Update after Vercel deployment) ===
FRONTEND_URL=http://localhost:5173

# === Cloudinary Configuration (Add after you create Cloudinary account) ===
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
```

**How to add each variable:**
1. Click **"Add Environment Variable"**
2. Enter **Key** (e.g., `NODE_ENV`)
3. Enter **Value** (e.g., `production`)
4. Repeat for all variables above

**⚠️ IMPORTANT - Generate SESSION_SECRET:**
1. Visit: https://randomkeygen.com/
2. Scroll to **"CodeIgniter Encryption Keys"**
3. Copy one of the long random strings
4. Replace `your-super-long-random-secret-key-change-this-NOW` with it

---

### STEP 5: Deploy! (2 min)

1. Scroll down and click **"Create Web Service"**
2. Render will start:
   - ✅ Pulling your code from GitHub
   - ✅ Running `npm install`
   - ✅ Running `npm start`
   - ✅ Starting your server

3. **Wait ~2-3 minutes** for deployment to complete
4. You'll see: **"Your service is live 🎉"** at the top

---

### STEP 6: Get Your Backend URL

After deployment completes:

1. Look at the top of the page
2. You'll see your URL: `https://library-backend-XXXX.onrender.com`
3. **Copy this URL** - you'll need it for:
   - Testing the backend
   - Vercel frontend deployment

**Example URL**: `https://library-backend-abc123.onrender.com`

---

### STEP 7: Test Your Backend (1 min)

1. **Open your backend URL** in browser
2. Add `/health` to the end
3. Visit: `https://your-backend-url.onrender.com/health`

**Expected response:**
```json
{
  "status": "ok",
  "timestamp": "2025-10-21T12:34:56.789Z",
  "environment": "production"
}
```

**If you see this, your backend is working!** ✅

**If you get an error:**
- Check Render logs: Click "Logs" tab in Render dashboard
- Look for database connection errors
- Verify environment variables are correct

---

## 🔧 OPTIONAL: SET UP REDIS (5 min)

Redis prevents session loss when free tier server restarts (~every 15 min of inactivity).

### Step 1: Create Redis Instance

1. In Render dashboard, click **"New +"**
2. Select **"Redis"**
3. Configure:
   - **Name**: `library-sessions`
   - **Region**: **Same as your web service** (important!)
   - **Plan**: **Free** (25 MB)
4. Click **"Create Redis"**
5. Wait ~30 seconds for creation

### Step 2: Get Redis Connection URL

1. Click on your Redis instance
2. Find **"Internal Redis URL"** or **"Redis URL"**
3. Copy it (format: `redis://red-xxxxx:6379`)

### Step 3: Add Redis to Backend

1. Go to your **Web Service** (`library-backend`)
2. Click **"Environment"** tab on the left
3. Click **"Add Environment Variable"**
4. Add:
   - **Key**: `REDIS_URL`
   - **Value**: [paste your Redis URL]
5. Click **"Save Changes"**

**Backend will auto-redeploy** (~1 minute)

**Redis setup complete!** ✅

---

## 📊 DEPLOYMENT CHECKLIST

After completing the steps above, verify:

- [ ] Render account created
- [ ] Web service created and deployed
- [ ] All environment variables added
- [ ] SESSION_SECRET is a random string (not the default)
- [ ] Deployment shows "Live" status
- [ ] Health check returns `{"status":"ok"}`
- [ ] Backend URL copied for later use
- [ ] (Optional) Redis created and connected

---

## 🎯 YOUR CORRECT DATABASE CREDENTIALS

These are already in the environment variables above:

```
Host: biuezvkp1ir5odbq6wju-mysql.services.clever-cloud.com
Database: biuezvkp1ir5odbq6wju
User: u9vwnxvk2ljksy3a
Password: le7A7dr4Rzx6AcOpycjo
Port: 3306
```

✅ Already imported with 7 tables and test data!

---

## 🔍 TROUBLESHOOTING

### Issue: Build fails with "Cannot find module"
**Solution**:
- Check that Root Directory is set to `server`
- Verify `package.json` exists in the `server` folder

### Issue: "Service unavailable" or 503 error
**Solution**:
- Check Render logs (Logs tab)
- Look for database connection errors
- Verify DB credentials are correct
- Make sure Clever Cloud MySQL is running

### Issue: Health check returns nothing
**Solution**:
- Wait 2-3 minutes for deployment to complete
- Check if service is "Live" in Render dashboard
- Try accessing just the base URL first

### Issue: CORS errors (later, when connecting frontend)
**Solution**:
- Update `FRONTEND_URL` environment variable
- Set it to your Vercel URL (after frontend deployment)
- Redeploy backend

---

## 📝 WHAT TO DO NEXT

After your backend is deployed successfully:

### 1. Create Cloudinary Account (5 min)
- Go to: https://cloudinary.com/users/register_free
- Sign up (free tier)
- Get: Cloud Name, API Key, API Secret
- **Update Render environment variables** with Cloudinary credentials
- Redeploy backend

### 2. Deploy Frontend to Vercel (10 min)
- Create Vercel account
- Import your repository
- Add backend URL as environment variable
- Deploy

### 3. Connect Frontend & Backend (2 min)
- Update Render `FRONTEND_URL` with your Vercel URL
- Redeploy backend
- Test complete application

---

## 🎉 DEPLOYMENT PROGRESS

```
✅ 1. Prepare Codebase
✅ 2. Import Database to Clever Cloud
⏳ 3. Deploy Backend to Render ←━━ YOU ARE HERE
⏳ 4. Set up Cloudinary
⏳ 5. Deploy Frontend to Vercel
⏳ 6. Connect & Test
```

**Progress**: 50% complete! 🚀

---

## 🆘 NEED HELP?

**Render Documentation**: https://render.com/docs
**Render Community**: https://community.render.com/

**Common Render URLs**:
- Dashboard: https://dashboard.render.com/
- Services: https://dashboard.render.com/services
- Logs: Click your service → "Logs" tab

---

**Time to complete**: ~15-20 minutes
**Cost**: ₹0 (100% Free tier)

Good luck! Let me know your backend URL once it's deployed! 🎉
