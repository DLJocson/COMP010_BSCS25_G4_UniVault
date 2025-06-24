const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');

// Customer login controller
const customerLogin = async (req, res, next) => {
    try {
        const { customer_username, customer_password } = req.body;
        
        const [rows] = await pool.query(
            'SELECT cif_number, customer_password FROM customer WHERE customer_username = ?',
            [customer_username]
        );
        
        if (rows.length === 0) {
            return res.status(401).json({ message: 'Invalid username or password.' });
        }
        
        const user = rows[0];
        const passwordMatch = await bcrypt.compare(customer_password, user.customer_password);
        
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid username or password.' });
        }
        
        res.json({ 
            message: 'Login successful', 
            redirect: `/Dashboard-Customer/account1.html`, 
            cif_number: user.cif_number 
        });
    } catch (err) {
        console.error('Login error:', err.message);
        next(err);
    }
};

// Admin login controller
const adminLogin = async (req, res, next) => {
    try {
        const { employee_username, employee_password } = req.body;
        
        const [rows] = await pool.query(
            'SELECT employee_id, employee_password, employee_position, employee_first_name, employee_last_name FROM BANK_EMPLOYEE WHERE employee_username = ?',
            [employee_username]
        );
        
        if (rows.length === 0) {
            return res.status(401).json({ message: 'Invalid username or password.' });
        }
        
        const employee = rows[0];
        const passwordMatch = await bcrypt.compare(employee_password, employee.employee_password);
        
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid username or password.' });
        }
        
        res.json({ 
            message: 'Login successful', 
            employee_id: employee.employee_id,
            employee_position: employee.employee_position,
            employee_name: `${employee.employee_first_name} ${employee.employee_last_name}`
        });
    } catch (err) {
        console.error('Admin login error:', err.message);
        next(err);
    }
};

module.exports = {
    customerLogin,
    adminLogin
};
