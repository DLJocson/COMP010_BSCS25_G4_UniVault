@echo off
echo Starting UniVault Banking System...
echo.

REM Change to backend directory
cd 2_backend

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo Installing backend dependencies...
    npm install
    echo.
)

REM Start the server
echo Starting UniVault server...
node server.js

pause
