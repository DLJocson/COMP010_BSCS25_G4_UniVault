@echo off
echo ===============================================
echo  STOPPING CURRENT SERVER AND STARTING DEBUG SERVER
echo ===============================================
echo.

echo 🛑 Stopping any running Node.js processes...
taskkill /f /im node.exe >nul 2>&1
timeout /t 2 /nobreak >nul
echo.

echo 🔍 Starting debug server...
echo 📁 Directory: %cd%
echo.

node server-debug.js
