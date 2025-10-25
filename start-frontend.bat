@echo off
echo Starting Smart Campus Frontend (Vite)...
cd /d "%~dp0frontend"
set VITE_GOOGLE_CLIENT_ID=348755717024-c5q2itpunmk6m13vvpu1t6ve3eqhp831.apps.googleusercontent.com

echo.
echo Environment configured:
echo - Google Client ID set
echo - Vite will start on http://localhost:5173 (or next available port)
echo - Backend proxy: http://localhost:5000
echo.
echo Starting Vite dev server...
call npx vite
pause
