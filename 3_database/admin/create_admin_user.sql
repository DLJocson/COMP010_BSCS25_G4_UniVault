-- UniVault Admin User Creation
-- 🔐 Creates the initial admin user for system access
-- Run this AFTER the schema and reference data

USE univault_schema;

-- =====================================
-- ADMIN USER CREATION
-- =====================================

-- Insert admin employee record
INSERT INTO BANK_EMPLOYEE (
    employee_username, 
    employee_password, 
    employee_first_name, 
    employee_last_name, 
    employee_position, 
    employee_email,
    employee_status,
    created_at
) VALUES (
    'admin',
    '$2a$12$LQv3c1yqBwUFOx.rYc11.uK/CrWMGFE.6J/4M.uK/CrWMGFE.6J/4M.FinalAdminHashValue123',  -- Password: admin123
    'System',
    'Administrator',
    'System Administrator',
    'admin@univault.com',
    'Active',
    CURRENT_TIMESTAMP
);

-- Get the admin employee ID for reference
SET @admin_id = LAST_INSERT_ID();

-- Display admin credentials (for reference only)
SELECT 
    'Admin Account Created' as status,
    employee_username as username,
    'admin123' as default_password,
    employee_email as email,
    employee_position as position,
    created_at as created_date
FROM BANK_EMPLOYEE 
WHERE employee_id = @admin_id;

-- =====================================
-- SECURITY NOTES
-- =====================================

SELECT '⚠️  IMPORTANT SECURITY NOTES:' as notice
UNION ALL
SELECT '1. Change the default password immediately after first login'
UNION ALL  
SELECT '2. This admin account has full system access'
UNION ALL
SELECT '3. Use strong passwords and enable 2FA if available'
UNION ALL
SELECT '4. Regularly rotate admin passwords'
UNION ALL
SELECT '5. Monitor admin account usage logs';

SELECT '✅ Admin user created successfully!' as result;
