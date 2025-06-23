@echo off
echo ========================================
echo         UNIVAULT ENVIRONMENT SETUP
echo ========================================

REM Check if .env already exists
if exist ".env" (
    echo .env file already exists.
    set /p overwrite="Do you want to overwrite it? (y/n): "
    if /i not "%overwrite%"=="y" (
        echo Setup cancelled.
        pause
        exit /b 0
    )
)

echo Creating .env file from template...
copy .env.example .env

echo.
echo ========================================
echo Please edit the .env file with your database credentials:
echo ========================================
echo.
echo 1. DB_PASSWORD=your_mysql_password_here
echo    ^(Replace with your actual MySQL root password^)
echo.
echo 2. JWT_SECRET=your_super_secure_jwt_secret_key_here  
echo    ^(Replace with a secure random string^)
echo.
echo 3. Optional: Update other settings as needed
echo.
echo ========================================

set /p edit_now="Do you want to edit the .env file now? (y/n): "
if /i "%edit_now%"=="y" (
    start notepad .env
    echo Please save and close the file when done, then press any key...
    pause
) else (
    echo Please manually edit the .env file before running the server.
)

echo.
echo Environment setup complete!
echo Next: Run 'npm install' to ensure all dependencies are installed.
echo Then: Run 'npm run dev' to start the server.
echo.
pause
