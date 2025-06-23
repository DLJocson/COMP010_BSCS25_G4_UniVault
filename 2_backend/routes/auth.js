const express = require('express');
const { body, validationResult } = require('express-validator');
const { generateToken, hashPassword, comparePassword, authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Register new customer
router.post('/register', [
    body('customer_id').isLength({ min: 1 }).withMessage('Customer ID is required'),
    body('first_name').isLength({ min: 1 }).withMessage('First name is required'),
    body('last_name').isLength({ min: 1 }).withMessage('Last name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('date_of_birth').isDate().withMessage('Valid date of birth is required')
], async (req, res) => {
    try {
        // Check validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const {
            customer_id, first_name, last_name, middle_name, suffix,
            email, password, date_of_birth, place_of_birth, nationality, 
            gender, civil_status_code
        } = req.body;

        // Check if customer already exists
        const [existingCustomer] = await req.db.query(
            'SELECT customer_id FROM customer WHERE customer_id = ? OR email = ?', 
            [customer_id, email]
        );

        if (existingCustomer.length > 0) {
            return res.status(409).json({ error: 'Customer ID or email already exists' });
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Insert new customer
        const [result] = await req.db.query(`
            INSERT INTO customer (
                customer_id, first_name, last_name, middle_name, suffix,
                email, password_hash, date_of_birth, place_of_birth, 
                nationality, gender, civil_status_code, registration_date, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), 'PENDING')
        `, [
            customer_id, first_name, last_name, middle_name, suffix,
            email, hashedPassword, date_of_birth, place_of_birth,
            nationality, gender, civil_status_code
        ]);

        // Generate token
        const token = generateToken(customer_id, 'customer');

        res.status(201).json({
            message: 'Registration successful',
            token,
            customer: {
                customer_id,
                first_name,
                last_name,
                email,
                status: 'PENDING'
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// Login
router.post('/login', [
    body('identifier').isLength({ min: 1 }).withMessage('Customer ID or email is required'),
    body('password').isLength({ min: 1 }).withMessage('Password is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { identifier, password, userType = 'customer' } = req.body;

        let query, params;
        if (userType === 'admin') {
            // Admin login logic (you can extend this based on your admin table)
            query = 'SELECT * FROM admin WHERE username = ? OR email = ?';
            params = [identifier, identifier];
        } else {
            // Customer login
            query = 'SELECT * FROM customer WHERE customer_id = ? OR email = ?';
            params = [identifier, identifier];
        }

        const [users] = await req.db.query(query, params);

        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = users[0];

        // Verify password
        const isValidPassword = await comparePassword(password, user.password_hash);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate token
        const userId = userType === 'admin' ? user.admin_id : user.customer_id;
        const token = generateToken(userId, userType);

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: userId,
                name: userType === 'admin' ? user.username : `${user.first_name} ${user.last_name}`,
                email: user.email,
                userType,
                status: user.status
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Logout (client-side token removal, but we can log it)
router.post('/logout', authenticateToken, (req, res) => {
    // In a production app, you might want to blacklist the token
    res.json({ message: 'Logout successful' });
});

// Get current user profile
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const userType = req.user.userType;

        let query;
        if (userType === 'admin') {
            query = 'SELECT admin_id, username, email, created_at FROM admin WHERE admin_id = ?';
        } else {
            query = `
                SELECT c.customer_id, c.first_name, c.last_name, c.middle_name, 
                       c.email, c.date_of_birth, c.nationality, c.gender, 
                       c.registration_date, c.status, cst.civil_status_description
                FROM customer c 
                LEFT JOIN civil_status_type cst ON c.civil_status_code = cst.civil_status_code
                WHERE c.customer_id = ?
            `;
        }

        const [users] = await req.db.query(query, [userId]);

        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(users[0]);

    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

// Change password
router.put('/change-password', authenticateToken, [
    body('currentPassword').isLength({ min: 1 }).withMessage('Current password is required'),
    body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { currentPassword, newPassword } = req.body;
        const userId = req.user.userId;
        const userType = req.user.userType;

        // Get current user
        const table = userType === 'admin' ? 'admin' : 'customer';
        const idField = userType === 'admin' ? 'admin_id' : 'customer_id';
        
        const [users] = await req.db.query(
            `SELECT password_hash FROM ${table} WHERE ${idField} = ?`, 
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Verify current password
        const isValidPassword = await comparePassword(currentPassword, users[0].password_hash);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Current password is incorrect' });
        }

        // Hash new password
        const hashedNewPassword = await hashPassword(newPassword);

        // Update password
        await req.db.query(
            `UPDATE ${table} SET password_hash = ? WHERE ${idField} = ?`,
            [hashedNewPassword, userId]
        );

        res.json({ message: 'Password changed successfully' });

    } catch (error) {
        console.error('Password change error:', error);
        res.status(500).json({ error: 'Failed to change password' });
    }
});

module.exports = router;
