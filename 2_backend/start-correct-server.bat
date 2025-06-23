@echo off
echo ===============================================
echo  STOPPING CURRENT SERVER AND STARTING CORRECT ONE
echo ===============================================
echo.

echo 🛑 Attempting to stop any running Node.js processes...
taskkill /f /im node.exe 2>nul
echo.

echo 🔄 Starting the correct server (server.js)...
echo 📁 Current directory: %cd%
echo 🚀 Starting server with admin endpoints...
echo.

node server.js
