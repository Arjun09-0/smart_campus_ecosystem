# Vercel Frontend Deployment Guide

## Prerequisites
✅ Backend already deployed on Render: https://smart-campus-ecosystem-ciqo.onrender.com
✅ Code pushed to GitHub: https://github.com/Arjun09-0/smart_campus_ecosystem

## Step 1: Sign Up / Sign In to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **"Sign Up"** and choose **"Continue with GitHub"**
3. Authorize Vercel to access your GitHub account

## Step 2: Import Your Project

1. Click **"Add New..."** → **"Project"**
2. Find and select your repository: **smart_campus_ecosystem**
3. Click **"Import"**

## Step 3: Configure Project Settings

### Framework Preset
- **Framework:** Vite (should auto-detect)

### Root Directory
- **IMPORTANT:** Set Root Directory to `frontend`
- Click **"Edit"** next to Root Directory
- Enter: `frontend`

### Build Settings
- **Build Command:** `npm run build` (default)
- **Output Directory:** `dist` (default)
- **Install Command:** `npm install` (default)

### Environment Variables
Add the following environment variables:

#### VITE_GOOGLE_CLIENT_ID
```
348755717024-c5q2itpunmk6m13vvpu1t6ve3eqhp831.apps.googleusercontent.com
```

#### VITE_API_URL
```
https://smart-campus-ecosystem-ciqo.onrender.com
```

**How to add:**
1. Click **"Environment Variables"** section
2. Enter Key: `VITE_GOOGLE_CLIENT_ID`
3. Enter Value: (paste the Client ID above)
4. Click **"Add"**
5. Repeat for `VITE_API_URL`

## Step 4: Deploy

1. Click **"Deploy"**
2. Wait for the build to complete (1-3 minutes)
3. Once done, you'll see: **"🎉 Congratulations! Your project has been successfully deployed."**
4. Copy your Vercel URL (e.g., `https://smart-campus-ecosystem-xyz123.vercel.app`)

## Step 5: Update Backend FRONTEND_ORIGIN

After getting your Vercel URL:

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Select **smart-campus-backend** service
3. Click **"Environment"** tab
4. Find **FRONTEND_ORIGIN** variable
5. Update value to your Vercel URL (e.g., `https://smart-campus-ecosystem-xyz123.vercel.app`)
6. Click **"Save Changes"** (this will redeploy the backend)

## Step 6: Configure Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Select your OAuth 2.0 Client ID
3. Under **"Authorized JavaScript origins"**, add:
   - `https://smart-campus-ecosystem-ciqo.onrender.com` (backend)
   - `https://your-vercel-url.vercel.app` (frontend - use YOUR actual URL)
4. Under **"Authorized redirect URIs"**, add:
   - `https://accounts.google.com/gsi/callback`
   - `https://your-vercel-url.vercel.app` (use YOUR actual URL)
5. Click **"Save"**
6. Wait 5 minutes for changes to propagate

## Step 7: Test Your Application

1. Visit your Vercel URL
2. Click **"Sign In with Google"**
3. Use an **@klh.edu.in** email address
4. Test all features:
   - ✅ Browse Events
   - ✅ Lost & Found
   - ✅ Clubs
   - ✅ Feedback

## Troubleshooting

### CORS Errors
**Symptom:** "Access to fetch at 'https://smart-campus-ecosystem...' has been blocked by CORS"

**Solution:** Make sure you updated `FRONTEND_ORIGIN` in Render backend settings

### Google Sign-In Not Working
**Symptom:** "redirect_uri_mismatch" error

**Solution:** 
1. Check Google OAuth console has correct URIs
2. Wait 5-10 minutes after making changes
3. Clear browser cache and try again

### API Calls Failing
**Symptom:** Network errors when trying to load data

**Solution:**
1. Check `VITE_API_URL` is set correctly in Vercel
2. Verify backend is running on Render
3. Check browser console for specific errors

### Build Fails on Vercel
**Symptom:** Build process fails with errors

**Solution:**
1. Check Vercel build logs for specific error
2. Make sure Root Directory is set to `frontend`
3. Verify all dependencies are in `frontend/package.json`

## Redeploying

### After Code Changes
1. Push changes to GitHub
2. Vercel automatically detects and redeploys

### Manual Redeploy
1. Go to Vercel Dashboard
2. Select your project
3. Click **"Deployments"** tab
4. Click **"..."** next to latest deployment
5. Click **"Redeploy"**

## Custom Domain (Optional)

To use your own domain:

1. In Vercel, go to **Settings** → **Domains**
2. Click **"Add"**
3. Enter your domain (e.g., `campus.yourschool.edu`)
4. Follow DNS configuration instructions
5. Update Google OAuth with new domain
6. Update backend `FRONTEND_ORIGIN` with new domain

## Environment Variables Reference

| Variable | Value | Where Used |
|----------|-------|------------|
| `VITE_GOOGLE_CLIENT_ID` | `348755717024-...` | Frontend (Vercel) |
| `VITE_API_URL` | `https://smart-campus-ecosystem-ciqo.onrender.com` | Frontend (Vercel) |
| `FRONTEND_ORIGIN` | Your Vercel URL | Backend (Render) |
| `GOOGLE_CLIENT_ID` | `348755717024-...` | Backend (Render) - already set |
| `MONGO_URI` | MongoDB Atlas connection string | Backend (Render) - already set |

## Monitoring

### Vercel Analytics
- Go to your project dashboard
- Click **"Analytics"** tab
- View page views, performance metrics

### Vercel Logs
- Go to your project dashboard
- Click **"Deployments"** tab
- Click on a deployment
- Click **"View Function Logs"**

## Next Steps

After successful deployment:

1. ✅ Test all features thoroughly
2. ✅ Share the Vercel URL with your team
3. ✅ Document any custom configurations
4. ✅ Set up monitoring/alerts (optional)
5. ✅ Consider custom domain (optional)

## Support

- **Vercel Docs:** https://vercel.com/docs
- **GitHub Repo:** https://github.com/Arjun09-0/smart_campus_ecosystem
- **Render Dashboard:** https://dashboard.render.com
