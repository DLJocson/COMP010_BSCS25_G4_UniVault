require('dotenv').config(); // This MUST be the first line

// >>>>>>>>>>>>> DEBUGGING LINES (Keep for now, can remove later) <<<<<<<<<<<<<<<<
console.log('--- .env Variables Loaded (Debugging) ---');
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD);
console.log('DB_DATABASE:', process.env.DB_DATABASE);
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('-----------------------------------------');
// >>>>>>>>>>>>> END OF DEBUGGING LINES <<<<<<<<<<<<<<<<

const express = require('express');
const mysql = require('mysql2/promise'); // Using promise-based version for async/await
const bcrypt = require('bcryptjs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// MySQL Connection Pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test database connection
(async () => {
    try {
        const connection = await pool.getConnection();
        console.log('Connected to MySQL database!');
        connection.release();
    } catch (err) {
        console.error('Database connection failed:', err.message);
    }
})();


// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the 'public' directory inside '2_backend'
app.use(express.static(path.join(__dirname, 'public')));


// Login POST route
app.post('/login', async (req, res) => {
    const { accountNumber, password } = req.body;

    if (!accountNumber || !password) {
        return res.status(400).json({ message: 'Account number and password are required.' });
    }

    try {
        const [rows] = await pool.execute(
            'SELECT id, account_number, password_hash FROM users WHERE account_number = ?',
            [accountNumber]
        );

        if (rows.length === 0) {
            return res.status(401).json({ message: 'Invalid account number or password.' });
        }

        const user = rows[0];
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);

        if (isPasswordValid) {
            console.log(`User ${user.account_number} logged in successfully.`);
            // In a real app, create a session/JWT here
            return res.status(200).json({ message: 'Login successful!', redirectUrl: '/dashboard.html' });
        } else {
            return res.status(401).json({ message: 'Invalid account number or password.' });
        }
    } catch (error) {
        console.error('Login error:', error.message);
        res.status(500).json({ message: 'Server error during login.' });
    }
});

// Registration POST route
app.post('/register', async (req, res) => {
    const {
        customer_type,
        customer_last_name,
        customer_first_name,
        customer_middle_name,
        customer_suffix_name,
        customer_username,
        customer_password,
        birth_date,
        gender,
        civil_status_code,
        birth_country,
        residency_status,
        citizenship,
        tax_identification_number,
        remittance_country,
        remittance_purpose
    } = req.body;

    // Check all required fields
    if (
        !customer_type ||
        !customer_last_name ||
        !customer_first_name ||
        !customer_username ||
        !customer_password ||
        !birth_date ||
        !gender ||
        !civil_status_code ||
        !birth_country ||
        !residency_status ||
        !citizenship ||
        !tax_identification_number
    ) {
        return res.status(400).json({ message: 'All required fields must be filled.' });
    }

    try {
        // Hash the password before saving
        const password_hash = await bcrypt.hash(customer_password, 10);

        await pool.execute(
            `INSERT INTO customer (
                customer_type, customer_last_name, customer_first_name, customer_middle_name, customer_suffix_name,
                customer_username, customer_password, birth_date, gender, civil_status_code,
                birth_country, residency_status, citizenship, tax_identification_number,
                remittance_country, remittance_purpose
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                customer_type,
                customer_last_name,
                customer_first_name,
                customer_middle_name || null,
                customer_suffix_name || null,
                customer_username,
                password_hash,
                birth_date,
                gender,
                civil_status_code,
                birth_country,
                residency_status,
                citizenship,
                tax_identification_number,
                remittance_country || null,
                remittance_purpose || null
            ]
        );

        res.status(201).json({ message: 'Registration successful! You can now log in.' });
    } catch (error) {
        console.error('Registration error:', error.message);
        res.status(500).json({ message: 'Server error during registration.' });
    }
});
// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});