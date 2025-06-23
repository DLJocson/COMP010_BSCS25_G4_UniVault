@echo off
echo ========================================
echo      UNIVAULT PRODUCTION STARTUP
echo ========================================

REM Set production environment
set NODE_ENV=production

REM Change to backend directory
cd 2_backend

echo Checking environment configuration...
if not exist ".env" (
    echo ERROR: .env file not found!
    echo Please run setup-env.bat first to configure environment variables.
    echo.
    pause
    exit /b 1
)

echo Checking Node.js installation...
node --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js 18 or higher
    pause
    exit /b 1
)

echo Checking database connection...
node -e "const mysql=require('mysql2/promise');require('dotenv').config();mysql.createConnection({host:process.env.DB_HOST,user:process.env.DB_USER,password:process.env.DB_PASSWORD,database:process.env.DB_NAME}).then(()=>console.log('✓ Database Connected')).catch(e=>{console.error('✗ Database connection failed:',e.message);process.exit(1);})"

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Please check your database configuration in .env file
    pause
    exit /b 1
)

echo Installing/updating dependencies...
npm install --production

if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo ========================================
echo     STARTING UNIVAULT IN PRODUCTION
echo ========================================
echo.
echo Server will start at: http://localhost:%PORT%
echo Health check: http://localhost:%PORT%/api/health
echo Admin Dashboard: http://localhost:%PORT%/Dashboard-Admin/admin-homepage.html
echo Customer Portal: http://localhost:%PORT%/Registration-Customer/login.html
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

REM Start the production server
npm start

echo.
echo Server stopped.
pause
