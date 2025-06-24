const { pool } = require('../config/database');

// Function to create default admin user
async function createDefaultAdmin() {
    try {
        // Check if admin user exists
        const [existingAdmin] = await pool.query(
            'SELECT employee_id FROM BANK_EMPLOYEE WHERE employee_username = ?',
            ['admin']
        );
        
        if (existingAdmin.length > 0) {
            console.log('✅ Default admin user already exists - Username: admin');
            return;
        }
        
        // Create admin user with a pre-hashed password
        // Password: Admin123! (has uppercase, number, special character, 8+ chars)
        const hashedPassword = '$2b$12$IEatmdijhyebJJqO7tpD/.flonO/u/J.abV8aXbt.xcR7PSXbf9lS';
        
        const [result] = await pool.query(
            `INSERT INTO BANK_EMPLOYEE (
                employee_position, 
                employee_last_name, 
                employee_first_name, 
                employee_username, 
                employee_password
            ) VALUES (?, ?, ?, ?, ?)`,
            [
                'System Administrator',
                'Administrator', 
                'System',
                'admin',
                hashedPassword
            ]
        );
        
        console.log('✅ Default admin user created successfully!');
        console.log('👤 Username: admin');
        console.log('🔑 Password: Admin123!');
        console.log(`📋 Employee ID: ${result.insertId}`);
        
    } catch (error) {
        console.error('⚠️  Could not create default admin user:', error.message);
        console.log('💡 You may need to create an admin user manually in the database');
    }
}

module.exports = { createDefaultAdmin };
