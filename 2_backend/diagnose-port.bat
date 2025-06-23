@echo off
echo ===============================================
echo  DIAGNOSING WHAT'S RUNNING ON PORT 3000
echo ===============================================
echo.

echo 🔍 Checking what's running on port 3000...
netstat -ano | findstr :3000
echo.

echo 🔍 Checking Node.js processes...
tasklist | findstr node.exe
echo.

echo 🛑 Killing all Node.js processes...
taskkill /f /im node.exe >nul 2>&1
echo Done.
echo.

echo ⏳ Waiting 3 seconds...
timeout /t 3 /nobreak >nul
echo.

echo 🔍 Checking port 3000 again...
netstat -ano | findstr :3000
echo.

echo 🚀 Starting debug server on port 3000...
node server-debug.js
