@echo off
echo ========================================
echo        SETTING UP UNIVAULT DATABASE
echo ========================================

REM Change to database directory
cd 3_database

echo Setting up database schema...
mysql -u root -p"kV:a7ij?,8GbSKG" < db_univault_schema.sql

echo Setting up reference data...
mysql -u root -p"kV:a7ij?,8GbSKG" < db_univault_seed.sql

echo Setting up admin users...
mysql -u root -p"kV:a7ij?,8GbSKG" < admin_seed.sql

echo ========================================
echo     DATABASE SETUP COMPLETE!
echo ========================================
echo.
echo Default Admin Login:
echo Username: admin
echo Password: Admin@123
echo.
echo Default Manager Login:
echo Username: manager
echo Password: Manager@123
echo.
pause
