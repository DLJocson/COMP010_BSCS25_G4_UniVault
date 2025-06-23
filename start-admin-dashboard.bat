@echo off
echo Starting UniVault Admin Dashboard...

echo.
echo 1. Starting Backend Server...
cd 2_backend
start "UniVault Backend" cmd /k "node server.js"

echo.
echo 2. Waiting for server to start...
timeout /t 3 /nobreak >nul

echo.
echo 3. Opening Admin Dashboard...
cd ..\1_frontend\Dashboard-Admin
start "" "http://localhost:3000/Dashboard-Admin/admin-login.html"

echo.
echo Admin Dashboard is now running!
echo.
echo Backend Server: http://localhost:3000
echo Admin Login: http://localhost:3000/Dashboard-Admin/admin-login.html
echo.
echo Press any key to close this window...
pause >nul
