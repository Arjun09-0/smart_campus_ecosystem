# Deploying Smart Campus Portal to Render 🚀

This guide will walk you through deploying your backend to Render (free tier).

---

## Prerequisites

✅ GitHub repository pushed: https://github.com/Arjun09-0/smart_campus_ecosystem
✅ MongoDB Atlas cluster with your production IP whitelisted (or 0.0.0.0/0)
✅ Google OAuth Client ID configured

---

## Part 1: Deploy Backend to Render

### Step 1: Sign Up for Render

1. Go to [Render.com](https://render.com)
2. Click **"Get Started"** or **"Sign Up"**
3. Sign up with GitHub (easiest option)
4. Authorize Render to access your GitHub account

### Step 2: Create a New Web Service

1. From Render Dashboard, click **"New +"** → **"Web Service"**
2. Click **"Connect a repository"**
3. Find and select: **`Arjun09-0/smart_campus_ecosystem`**
   - If you don't see it, click "Configure account" and grant access to the repo
4. Click **"Connect"**

### Step 3: Configure the Web Service

Fill in these settings:

**Basic Settings:**
- **Name:** `smart-campus-backend` (or any name you prefer)
- **Region:** Choose closest to you (Singapore for India, Oregon for US)
- **Branch:** `main`
- **Root Directory:** Leave empty (render.yaml handles this)
- **Environment:** `Node`
- **Build Command:** `cd backend && npm ci`
- **Start Command:** `cd backend && npm start`

**Plan:**
- Select **"Free"** ($0/month - sleeps after inactivity)
- Or **"Starter"** ($7/month - always on, better for production)

Click **"Advanced"** to set more options:

**Advanced Settings:**
- **Health Check Path:** `/health`
- **Auto-Deploy:** Yes (enabled by default)

### Step 4: Set Environment Variables

Scroll down to **"Environment Variables"** and add these:

Click **"Add Environment Variable"** for each:

1. **MONGO_URI**
   - Value: `mongodb+srv://Arjun:Arjun%402006@cluster0.bx9is7t.mongodb.net/smart_campus?retryWrites=true&w=majority`
   - ⚠️ Replace with your actual MongoDB Atlas connection string

2. **SESSION_KEY**
   - Value: Generate a random key by running this in PowerShell:
     ```powershell
     node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
     ```
   - Use the output (a long random string)

3. **FRONTEND_ORIGIN**
   - Value: `https://smart-campus-frontend.vercel.app` 
   - ⚠️ Update this later with your actual Vercel URL

4. **GOOGLE_CLIENT_ID**
   - Value: `348755717024-c5q2itpunmk6m13vvpu1t6ve3eqhp831.apps.googleusercontent.com`

5. **NODE_ENV**
   - Value: `production`

6. **PORT**
   - Value: `5000`

### Step 5: Create Web Service

1. Click **"Create Web Service"** at the bottom
2. Render will start building and deploying your backend
3. Wait 2-5 minutes for the first deploy to complete

You'll see the deployment logs in real-time:
```
Installing dependencies...
Building...
Starting server...
Connecting to MongoDB...
Connected to MongoDB
Server listening on 0.0.0.0:5000
```

### Step 6: Get Your Backend URL

Once deployed, you'll get a URL like:
```
https://smart-campus-backend.onrender.com
```

**Test it:**
- Open: `https://smart-campus-backend.onrender.com/health`
- You should see: `{"ok":true,"status":"running"}`

---

## Part 2: Update MongoDB Atlas IP Whitelist

Your Render backend has a different IP than localhost.

### Option 1: Allow All IPs (Easiest for testing)
1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Navigate to **Network Access**
3. Click **"Add IP Address"**
4. Click **"Allow Access from Anywhere"** (`0.0.0.0/0`)
5. Click **"Confirm"**

### Option 2: Add Render's IP Range (More secure)
Render uses dynamic IPs, so option 1 is recommended for Render's free tier.

---

## Part 3: Deploy Frontend to Vercel

### Step 1: Sign Up for Vercel

1. Go to [Vercel.com](https://vercel.com)
2. Click **"Sign Up"**
3. Sign up with GitHub

### Step 2: Import Project

1. Click **"Add New..."** → **"Project"**
2. Find and select: **`Arjun09-0/smart_campus_ecosystem`**
3. Click **"Import"**

### Step 3: Configure Project

**Framework Preset:** Vite
**Root Directory:** Click **"Edit"** and enter: `frontend`
**Build Command:** `npm run build` (auto-detected)
**Output Directory:** `dist` (auto-detected)

### Step 4: Set Environment Variables

Click **"Environment Variables"** and add:

1. **VITE_GOOGLE_CLIENT_ID**
   - Value: `348755717024-c5q2itpunmk6m13vvpu1t6ve3eqhp831.apps.googleusercontent.com`

Click **"Deploy"**

### Step 5: Get Your Frontend URL

After deployment (1-2 minutes), you'll get a URL like:
```
https://smart-campus-ecosystem.vercel.app
```

---

## Part 4: Update Backend with Frontend URL

1. Go back to **Render Dashboard** → **smart-campus-backend**
2. Click **"Environment"** in the left sidebar
3. Find **`FRONTEND_ORIGIN`**
4. Update the value to your Vercel URL: `https://smart-campus-ecosystem.vercel.app`
5. Click **"Save Changes"**
6. Backend will automatically redeploy

---

## Part 5: Update Google OAuth Settings

Your production URLs need to be added to Google Cloud Console.

1. Go to [Google Cloud Console - Credentials](https://console.cloud.google.com/apis/credentials)
2. Click on your OAuth 2.0 Client ID
3. Add **Authorized JavaScript origins:**
   ```
   https://smart-campus-ecosystem.vercel.app
   https://smart-campus-backend.onrender.com
   ```
4. Add **Authorized redirect URIs:**
   ```
   https://accounts.google.com/gsi/callback
   ```
5. Click **"SAVE"**
6. Wait 5 minutes for changes to propagate

---

## Part 6: Test Your Deployed App

1. Open your Vercel URL: `https://smart-campus-ecosystem.vercel.app`
2. Click **"Sign in with Google"**
3. Sign in with your **@klh.edu.in** account
4. Verify features work:
   - Events page loads
   - Lost & Found items display
   - Clubs page works

---

## 🎉 Deployment Complete!

Your Smart Campus Portal is now live!

- **Frontend:** https://[your-app].vercel.app
- **Backend:** https://[your-service].onrender.com

---

## Important Notes

### Free Tier Limitations

**Render Free Tier:**
- ⏸️ Spins down after 15 minutes of inactivity
- 🐢 Cold start takes 30-60 seconds on first request
- 💾 750 hours/month (enough for hobby projects)

**Solution:** Upgrade to Starter plan ($7/month) for always-on service.

### Environment Variables Security

✅ **DO:**
- Store secrets in Render/Vercel environment variables
- Use strong random SESSION_KEY in production
- Restrict MongoDB to specific IPs when possible

❌ **DON'T:**
- Commit `.env` files with real credentials
- Use weak or default SESSION_KEY
- Leave 0.0.0.0/0 in MongoDB whitelist long-term (if avoidable)

### Monitoring & Logs

**Render Logs:**
- Dashboard → Your Service → **"Logs"** tab
- View real-time deployment and runtime logs

**Vercel Logs:**
- Project → **"Deployments"** → Click on a deployment
- View build logs and function logs

---

## Troubleshooting

### Backend shows "Application failed to respond"
- Check Render logs for errors
- Verify MongoDB connection string is correct
- Ensure MongoDB Atlas allows Render's IPs (use 0.0.0.0/0)

### Frontend can't connect to backend
- Check FRONTEND_ORIGIN in Render matches your Vercel URL exactly
- Verify backend /health endpoint returns 200 OK
- Check browser console for CORS errors

### Google Sign-In shows 404 error
- Verify authorized origins and redirect URIs in Google Cloud Console
- Wait 5-10 minutes after updating Google OAuth settings
- Clear browser cache or use incognito mode

### "Application Error" on Render
- Check if MongoDB is accessible
- Verify all environment variables are set
- Check logs for specific error messages

---

## Updating Your App

### Push updates to GitHub:
```powershell
cd "C:\Users\NANNURI ARJUN REDDY\OneDrive\Desktop\smart_campus _ecosystem"
git add .
git commit -m "Your update message"
git push
```

Both Render and Vercel will automatically redeploy on push to `main` branch.

---

## Custom Domain (Optional)

### For Vercel Frontend:
1. Vercel Dashboard → Project → **"Settings"** → **"Domains"**
2. Add your custom domain
3. Update DNS records as instructed

### For Render Backend:
1. Render Dashboard → Service → **"Settings"** → **"Custom Domains"**
2. Add your custom domain
3. Update DNS records as instructed

---

## Cost Estimate

**Free Tier (Good for MVP/Demo):**
- Render Backend: Free (with sleep)
- Vercel Frontend: Free (hobby plan)
- MongoDB Atlas: Free (512MB)
- **Total: $0/month**

**Production Setup:**
- Render Backend: $7/month (Starter - always on)
- Vercel Frontend: Free or $20/month (Pro)
- MongoDB Atlas: $9/month (Shared M2) or $57/month (Dedicated M10)
- **Total: ~$16-84/month**

---

## Support

- **Render Docs:** https://render.com/docs
- **Vercel Docs:** https://vercel.com/docs
- **MongoDB Atlas:** https://www.mongodb.com/docs/atlas/

---

**You're all set! 🚀 Your Smart Campus Portal is live on the internet!**
