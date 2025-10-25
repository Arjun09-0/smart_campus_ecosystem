# Smart Campus Portal - Quick Start 🚀

## ✅ Setup Complete!

Your Smart Campus Portal is **ready to run**. MongoDB Atlas is configured with your IP whitelisted.

---

## Running the Servers

### Easiest Way (Double-click these files):

1. **`start-backend.bat`** → Starts backend on port 5000
2. **`start-frontend.bat`** → Starts frontend on port 5173

Keep both windows open!

---

## Manual Start (PowerShell)

**Backend (Terminal 1):**
```powershell
cd backend
$env:MONGO_URI = 'mongodb+srv://Arjun:Arjun%402006@cluster0.bx9is7t.mongodb.net/smart_campus?retryWrites=true&w=majority'
$env:SESSION_KEY = 'dev_key_secret'
$env:FRONTEND_ORIGIN = 'http://localhost:5173'
$env:GOOGLE_CLIENT_ID = '348755717024-c5q2itpunmk6m13vvpu1t6ve3eqhp831.apps.googleusercontent.com'
npm run dev
```

**Frontend (Terminal 2):**
```powershell
cd frontend
$env:VITE_GOOGLE_CLIENT_ID = '348755717024-c5q2itpunmk6m13vvpu1t6ve3eqhp831.apps.googleusercontent.com'
npx vite
```

---

## Configuration

- **MongoDB:** Atlas cluster (your IP `152.59.199.154` is whitelisted)
- **Backend:** http://localhost:5000
- **Frontend:** http://localhost:5173
- **Auth:** Google sign-in (restricted to @klh.edu.in emails)

---

## Create Admin User

After your first sign-in:
```powershell
cd backend
node scripts\make-admin.js your.email@klh.edu.in
```

---

## Diagnostics

Test MongoDB connection anytime:
```powershell
cd backend
node diagnose-atlas.js
```

---

## Troubleshooting

**Connection fails?**
- Get your IP: `(Invoke-WebRequest -Uri "https://api.ipify.org").Content`
- Add it to Atlas → Network Access
- Wait 2 minutes, restart backend

**Frontend proxy errors?**
- Make sure backend is running first
- Check backend shows "Server listening on 0.0.0.0:5000"

---

## Features

- 🔐 Google OAuth (KL University emails only)
- 📅 Campus events
- 🔍 Lost & Found items
- 🎭 Clubs directory
- 💬 Issues & Feedback
- 👥 Role-based access (Student, Faculty, Admin)

---

**Ready to go! Start both servers and open http://localhost:5173 in your browser.**
