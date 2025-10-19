# 🚀 Quick Deployment Reference

## TL;DR - Fastest Free Deployment

### Budget: ₹0/month | Time: 4-6 hours

```
Frontend: Vercel (Free)
Backend: Render (Free)
Database: Clever Cloud MySQL (Free)
Files: Cloudinary (Free)
```

---

## 📋 5-Step Quick Setup

### 1️⃣ Database (30 min)
```bash
# Sign up: https://clever-cloud.com
# Create MySQL addon (DEV plan)
# Get credentials, import schema
# Run migrations
```

### 2️⃣ File Storage (15 min)
```bash
# Sign up: https://cloudinary.com
# Get API credentials
# Update server/index.js for Cloudinary
npm install cloudinary multer-storage-cloudinary
```

### 3️⃣ Backend (1 hour)
```bash
# Sign up: https://render.com
# Connect GitHub repo
# Root: server/
# Add environment variables (see below)
# Deploy
```

### 4️⃣ Frontend (30 min)
```bash
# Sign up: https://vercel.com
# Connect GitHub repo
# Framework: Vite
# Add VITE_API_URL env var
# Deploy
```

### 5️⃣ Connect & Test (1 hour)
```bash
# Update backend FRONTEND_URL
# Test all features
# Done! 🎉
```

---

## 🔑 Environment Variables

### Backend (Render.com)
```bash
NODE_ENV=production
PORT=10000
DB_HOST=[from-clever-cloud]
DB_PORT=3306
DB_USER=[from-clever-cloud]
DB_PASSWORD=[from-clever-cloud]
DB_NAME=[from-clever-cloud]
SESSION_SECRET=[random-32-char-string]
FRONTEND_URL=https://your-app.vercel.app
CLOUDINARY_CLOUD_NAME=[from-cloudinary]
CLOUDINARY_API_KEY=[from-cloudinary]
CLOUDINARY_API_SECRET=[from-cloudinary]
```

### Frontend (Vercel)
```bash
VITE_API_URL=https://your-app.onrender.com
```

---

## 🔧 Required Code Changes

### 1. `server/db.js` (Line 1-15)
```javascript
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "library",
  // ... rest of config
});
```

### 2. `server/index.js` - CORS (Line ~547)
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
```

### 3. `server/index.js` - Cloudinary (Replace Multer config)
```javascript
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'library/profile-images',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }]
  }
});
```

### 4. `src/services/api.js` (Line ~2)
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
```

### 5. Create `.env.production` in root
```bash
VITE_API_URL=https://your-backend.onrender.com
```

---

## ⚠️ Common Pitfalls

| Issue | Solution |
|-------|----------|
| CORS errors | Set `FRONTEND_URL` in backend, redeploy |
| Sessions lost | Add Redis or accept limitation |
| Files not uploading | Check Cloudinary credentials |
| DB connection fails | Whitelist Render IPs (usually not needed) |
| Cold starts (Render) | Use UptimeRobot to ping every 5 min |

---

## 📊 Free Tier Limits

| Service | Limit | Enough For |
|---------|-------|------------|
| **Render** | 750 hrs/month, sleeps after 15 min | ✅ Yes |
| **Vercel** | 100 GB bandwidth | ✅ Yes |
| **Clever Cloud** | 256 MB storage | ✅ ~10k records |
| **Cloudinary** | 25 GB storage | ✅ 5k+ images |

**Total Cost: ₹0** 🎉

---

## 🧪 Testing Checklist

After deployment, test:
- [ ] User registration
- [ ] User login
- [ ] Profile image upload
- [ ] Browse books
- [ ] Borrow book
- [ ] Return book
- [ ] Marketplace listing
- [ ] Request to buy
- [ ] Admin login
- [ ] Approve return

---

## 📱 Access URLs

After deployment, you'll have:

```
Frontend: https://your-project.vercel.app
Backend: https://your-project.onrender.com
Database: [clever-cloud-host]:3306
```

Save these URLs in a safe place!

---

## 🆘 Quick Help

**Backend not responding?**
- Check Render logs
- Verify env vars set correctly
- Test with `curl https://your-app.onrender.com/health`

**Frontend can't connect?**
- Check `VITE_API_URL` is set
- Check browser console for CORS errors
- Verify backend `FRONTEND_URL` matches

**Database errors?**
- Test connection with MySQL Workbench
- Verify credentials are correct
- Check if migrations ran successfully

**File uploads fail?**
- Check Cloudinary dashboard
- Verify credentials in backend env vars
- Check file size < 5MB

---

## 💰 Cost Comparison

| Setup | Cost/month | Best For |
|-------|-----------|----------|
| **All Free** | ₹0 | College projects ⭐ |
| **Railway** | ₹400-500 | Production |
| **Mix** | ₹250-300 | Budget production |

---

## 🔗 Quick Links

- [Full Deployment Guide](./DEPLOYMENT_GUIDE.md)
- [Render Dashboard](https://dashboard.render.com)
- [Vercel Dashboard](https://vercel.com/dashboard)
- [Clever Cloud Console](https://console.clever-cloud.com)
- [Cloudinary Console](https://cloudinary.com/console)

---

**Ready to deploy? Start with Step 1! 🚀**

Estimated total time: **4-6 hours**
