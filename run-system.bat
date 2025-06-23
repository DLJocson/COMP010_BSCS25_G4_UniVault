@echo off
echo ====================================
echo      UniVault Banking System
echo ====================================
echo.

echo [1/3] Installing dependencies...
npm install

echo.
echo [2/3] Setting up database...
echo Please ensure MySQL is running and create database manually:
echo mysql -u root -p -e "SOURCE 3_database/db_univault_schema.sql"
echo mysql -u root -p -e "SOURCE 3_database/db_univault_seed.sql"
echo.

echo [3/3] Starting the system...
echo Backend will run on: http://localhost:3000
echo Frontend accessible at: http://localhost:3000
echo.

npm start
