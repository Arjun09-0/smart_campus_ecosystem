# 🚀 Render Deployment Checklist

Use this checklist to deploy your Smart Campus Portal to Render and Vercel.

---

## ✅ Pre-Deployment Checklist

- [ ] GitHub repository is pushed and up-to-date
- [ ] MongoDB Atlas cluster is created and accessible
- [ ] Google OAuth Client ID is configured
- [ ] You have a Render account (sign up at render.com)
- [ ] You have a Vercel account (sign up at vercel.com)

---

## 📦 Backend Deployment (Render)

### 1. Create Web Service
- [ ] Go to Render Dashboard → New + → Web Service
- [ ] Connect GitHub repo: `Arjun09-0/smart_campus_ecosystem`
- [ ] Configure service:
  - Name: `smart-campus-backend`
  - Region: `singapore` or `oregon`
  - Branch: `main`
  - Build: `cd backend && npm ci`
  - Start: `cd backend && npm start`
  - Plan: Free or Starter

### 2. Set Environment Variables
- [ ] `MONGO_URI` → Your MongoDB Atlas connection string
- [ ] `SESSION_KEY` → Random string (generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
- [ ] `FRONTEND_ORIGIN` → `https://your-app.vercel.app` (update after Vercel deploy)
- [ ] `GOOGLE_CLIENT_ID` → Your Google OAuth Client ID
- [ ] `NODE_ENV` → `production`
- [ ] `PORT` → `5000`

### 3. Deploy
- [ ] Click "Create Web Service"
- [ ] Wait for deployment to complete (2-5 minutes)
- [ ] Verify: Visit `https://your-backend.onrender.com/health`
- [ ] Should see: `{"ok":true,"status":"running"}`

### 4. Save Your Backend URL
- [ ] Copy your Render URL: `https://_____.onrender.com`

---

## 🎨 Frontend Deployment (Vercel)

### 1. Import Project
- [ ] Go to Vercel Dashboard → Add New → Project
- [ ] Select GitHub repo: `Arjun09-0/smart_campus_ecosystem`
- [ ] Click "Import"

### 2. Configure Project
- [ ] Framework: Vite (auto-detected)
- [ ] Root Directory: `frontend`
- [ ] Build Command: `npm run build` (auto-detected)
- [ ] Output Directory: `dist` (auto-detected)

### 3. Set Environment Variables
- [ ] `VITE_GOOGLE_CLIENT_ID` → Your Google OAuth Client ID

### 4. Deploy
- [ ] Click "Deploy"
- [ ] Wait for deployment (1-2 minutes)
- [ ] Save your Vercel URL: `https://_____.vercel.app`

---

## 🔗 Connect Frontend & Backend

### 1. Update Backend FRONTEND_ORIGIN
- [ ] Go to Render → Your Service → Environment
- [ ] Update `FRONTEND_ORIGIN` to your Vercel URL
- [ ] Save (will trigger redeploy)

### 2. Update Frontend Proxy (if needed)
Frontend automatically proxies `/api` to backend via Vite config. No changes needed if using default settings.

---

## 🔐 Update MongoDB Atlas

### Allow Render Backend IP
- [ ] Go to MongoDB Atlas → Network Access
- [ ] Option 1: Click "Allow Access from Anywhere" (0.0.0.0/0) - easiest
- [ ] Option 2: Add Render's IP ranges (check Render docs)
- [ ] Click "Confirm"

---

## 🎫 Update Google OAuth

### Add Production URLs
- [ ] Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
- [ ] Click your OAuth 2.0 Client ID
- [ ] Add Authorized JavaScript origins:
  - [ ] `https://your-frontend.vercel.app`
  - [ ] `https://your-backend.onrender.com`
- [ ] Add Authorized redirect URIs:
  - [ ] `https://accounts.google.com/gsi/callback`
- [ ] Click "SAVE"
- [ ] Wait 5 minutes for propagation

---

## ✨ Test Your Deployment

- [ ] Open your Vercel URL in browser
- [ ] Homepage loads correctly
- [ ] Click "Sign in with Google"
- [ ] Sign in with @klh.edu.in account
- [ ] Verify you're redirected back and logged in
- [ ] Test features:
  - [ ] Events page loads
  - [ ] Lost & Found works
  - [ ] Clubs page displays
  - [ ] Create a test event (if faculty/admin)

---

## 🐛 Troubleshooting

If something doesn't work:

**Backend Issues:**
- [ ] Check Render logs for errors
- [ ] Verify MongoDB connection string is correct
- [ ] Ensure MongoDB Atlas allows 0.0.0.0/0 or Render IPs
- [ ] Test `/health` endpoint returns 200

**Frontend Issues:**
- [ ] Check Vercel deployment logs
- [ ] Verify `VITE_GOOGLE_CLIENT_ID` is set
- [ ] Open browser console for errors
- [ ] Check Network tab for failed API calls

**CORS Errors:**
- [ ] Verify `FRONTEND_ORIGIN` in Render matches Vercel URL exactly
- [ ] Check Render logs for CORS-related errors
- [ ] Ensure no trailing slash in FRONTEND_ORIGIN

**Google Sign-In 404:**
- [ ] Wait 5-10 minutes after updating Google OAuth
- [ ] Clear browser cache or use incognito
- [ ] Verify authorized origins match your URLs exactly

---

## 📝 URLs to Save

Fill these in as you deploy:

```
Backend (Render):  https://___________________________.onrender.com
Frontend (Vercel): https://___________________________.vercel.app

MongoDB Atlas:     https://cloud.mongodb.com
Google Console:    https://console.cloud.google.com/apis/credentials

GitHub Repo:       https://github.com/Arjun09-0/smart_campus_ecosystem
```

---

## 🎉 Deployment Complete!

Once all checkboxes are ✅, your Smart Campus Portal is live!

**Next Steps:**
- Share your Vercel URL with users
- Create your first admin user using the make-admin script
- Monitor Render logs for any issues
- Set up custom domains (optional)

---

## 📚 Documentation Links

- **Full Guide:** See `RENDER_DEPLOYMENT.md`
- **Quick Start:** See `QUICKSTART.md`
- **Local Setup:** See `README.md`

**Need help?** Check the troubleshooting section in RENDER_DEPLOYMENT.md
