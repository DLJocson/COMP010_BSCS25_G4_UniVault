-- Create Default Admin User for UniVault Admin Dashboard
-- This script creates a default admin user for testing purposes

USE univault_schema;

-- Disable constraint checking temporarily to allow hashed password
SET foreign_key_checks = 0;
SET sql_mode = "";

-- Check if admin user already exists
SELECT COUNT(*) as admin_exists FROM BANK_EMPLOYEE WHERE employee_username = 'admin';

-- Insert admin user if not exists
-- Note: The password hash corresponds to "Admin123!" 
-- This meets the original password requirements: uppercase, number, special character, 8+ chars
INSERT IGNORE INTO BANK_EMPLOYEE (
    employee_position, 
    employee_last_name, 
    employee_first_name, 
    employee_username, 
    employee_password
) VALUES (
    'System Administrator',
    'Administrator',
    'System',
    'admin',
    '$2b$12$IEatmdijhyebJJqO7tpD/.flonO/u/J.abV8aXbt.xcR7PSXbf9lS'
);

-- Re-enable constraints
SET foreign_key_checks = 1;
SET sql_mode = "STRICT_TRANS_TABLES,NO_ZERO_DATE,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO";

-- Display result
SELECT 
    employee_id,
    employee_username,
    employee_first_name,
    employee_last_name,
    employee_position
FROM BANK_EMPLOYEE 
WHERE employee_username = 'admin';

-- Admin Login Credentials:
-- Username: admin
-- Password: Admin123!
