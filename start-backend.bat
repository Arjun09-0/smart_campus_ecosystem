@echo off
echo Starting Smart Campus Backend Server...
cd /d "%~dp0backend"
set MONGO_URI=mongodb+srv://Arjun:Arjun%%402006@cluster0.bx9is7t.mongodb.net/smart_campus?retryWrites=true^&w=majority
set SESSION_KEY=dev_key_secret_change_in_prod
set FRONTEND_ORIGIN=http://localhost:5174
set GOOGLE_CLIENT_ID=348755717024-c5q2itpunmk6m13vvpu1t6ve3eqhp831.apps.googleusercontent.com
set PORT=5000

echo.
echo Environment configured:
echo - MongoDB: Atlas cluster (SRV connection)
echo - Backend Port: 5000
echo - Frontend Origin: http://localhost:5174
echo.
echo Starting nodemon...
call npm run dev
pause
