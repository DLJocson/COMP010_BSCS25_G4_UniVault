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
const mysql = require('mysql2/promise');
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

// Serve static files for Dashboard-Customer
app.use('/Dashboard-Customer', express.static(path.join(__dirname, '../1_frontend/Dashboard-Customer')));

// --- Add your dashboard API endpoints here ---
app.get('/api/accounts/:cif_number', async (req, res) => {
    // ...fetch accounts from DB...
});
app.get('/api/transactions/:cif_number', async (req, res) => {
    // ...fetch transactions from DB...
});

// Login POST route (unchanged)
app.post('/login', async (req, res) => {
    const { customer_username, customer_password } = req.body;
    try {
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
        // Success: send cif_number (or use a session/token in a real app)
        res.json({ message: 'Login successful', cif_number: user.cif_number });
    } catch (err) {
        console.error('Login error:', err.message);
        res.status(500).json({ message: 'Server error during login.' });
    }
});

// Registration POST route (returns cif_number)

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
        citizenship,
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
        !citizenship
    ) {
        return res.status(400).json({ message: 'All required fields must be filled.' });
    }

    try {
        // Hash the password before saving
        const password_hash = await bcrypt.hash(customer_password, 10);

        const [result] = await pool.execute(
            `INSERT INTO customer (
                customer_type, customer_last_name, customer_first_name, customer_middle_name, customer_suffix_name,
                customer_username, customer_password, birth_date, gender, civil_status_code,
                birth_country, citizenship
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
                citizenship
            ]
        );

        // Return the new cif_number (auto-incremented PK)
        res.status(201).json({ message: 'Registration successful! You can now log in.', cif_number: result.insertId });
    } catch (error) {
        console.error('Registration error:', error.message);
        res.status(500).json({ message: 'Server error during registration.' });
    }
});

// Add address route
app.post('/add-address', async (req, res) => {
    const {
        cif_number,
        address_type_code,
        address_unit,
        address_building,
        address_street,
        address_subdivision,
        address_barangay,
        address_city,
        address_province,
        address_country,
        address_zip_code
    } = req.body;

    if (!cif_number || !address_type_code) {
        return res.status(400).json({ message: 'Missing required address fields.' });
    }

    try {
        await pool.execute(
            `INSERT INTO CUSTOMER_ADDRESS (
                cif_number, address_type_code, address_unit, address_building, address_street, address_subdivision,
                address_barangay, address_city, address_province, address_country, address_zip_code
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                cif_number,
                address_type_code,
                address_unit || null,
                address_building || null,
                address_street || null,
                address_subdivision || null,
                address_barangay || null,
                address_city || null,
                address_province || null,
                address_country || null,
                address_zip_code || null
            ]
        );
        res.status(201).json({ message: 'Address added.' });
    } catch (error) {
        console.error('Add address error:', error.message);
        res.status(500).json({ message: 'Server error during address insert.' });
    }
});

// Add contact route
app.post('/add-contact', async (req, res) => {
    const {
        cif_number,
        contact_type_code,
        contact_value
    } = req.body;

    if (!cif_number || !contact_type_code || !contact_value) {
        return res.status(400).json({ message: 'Missing required contact fields.' });
    }

    try {
        await pool.execute(
            `INSERT INTO CUSTOMER_CONTACT_DETAILS (
                cif_number, contact_type_code, contact_value
            ) VALUES (?, ?, ?)`,
            [
                cif_number,
                contact_type_code,
                contact_value
            ]
        );
        res.status(201).json({ message: 'Contact added.' });
    } catch (error) {
        console.error('Add contact error:', error.message);
        res.status(500).json({ message: 'Server error during contact insert.' });
    }
});

// Add employment route
app.post('/add-employment', async (req, res) => {
    const {
        cif_number,
        position_code,
        employer_name,
        employer_address,
        employer_contact
    } = req.body;

    if (!cif_number || !position_code) {
        return res.status(400).json({ message: 'Missing required employment fields.' });
    }

    try {
        await pool.execute(
            `INSERT INTO CUSTOMER_EMPLOYMENT_INFORMATION (
                cif_number, position_code, employer_name, employer_address, employer_contact
            ) VALUES (?, ?, ?, ?, ?)`,
            [
                cif_number,
                position_code,
                employer_name || null,
                employer_address || null,
                employer_contact || null
            ]
        );
        res.status(201).json({ message: 'Employment info added.' });
    } catch (error) {
        console.error('Add employment error:', error.message);
        res.status(500).json({ message: 'Server error during employment insert.' });
    }
});

// Add ID route
app.post('/add-id', async (req, res) => {
    const {
        cif_number,
        id_type_code,
        id_number,
        id_expiry_date
    } = req.body;

    if (!cif_number || !id_type_code || !id_number) {
        return res.status(400).json({ message: 'Missing required ID fields.' });
    }

    try {
        await pool.execute(
            `INSERT INTO CUSTOMER_ID (
                cif_number, id_type_code, id_number, id_expiry_date
            ) VALUES (?, ?, ?, ?)`,
            [
                cif_number,
                id_type_code,
                id_number,
                id_expiry_date || null
            ]
        );
        res.status(201).json({ message: 'ID added.' });
    } catch (error) {
        console.error('Add ID error:', error.message);
        res.status(500).json({ message: 'Server error during ID insert.' });
    }
});
app.get('/api/test-db', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1');
    res.json({ success: true, result: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/save-checkbox-answers', async (req, res) => {
  const { cif_number, answers } = req.body;
  if (!cif_number || !answers || !Array.isArray(answers) || answers.length !== 5) {
    return res.status(400).json({ error: "Invalid data" });
  }
  try {
    await pool.query(
      'INSERT INTO CUSTOMER_COMPLIANCE_ANSWERS (cif_number, answer1, answer2, answer3, answer4, answer5) VALUES (?, ?, ?, ?, ?, ?)',
      [cif_number, ...answers]
    );
    res.sendStatus(200);
  } catch (err) {
    console.error('Checkbox answers error:', err.message);
    res.status(500).json({ error: "Database error" });
  }
});

// Get all accounts for a customer
app.get('/api/accounts/:cif_number', async (req, res) => {
    const { cif_number } = req.params;
    try {
        const [rows] = await pool.query(
            'SELECT * FROM accounts WHERE cif_number = ?',
            [cif_number]
        );
        res.json(rows);
    } catch (err) {
        console.error('Accounts fetch error:', err.message);
        res.status(500).json({ error: 'Database error' });
    }
});

// Get all transactions for a customer
app.get('/api/transactions/:cif_number', async (req, res) => {
    const { cif_number } = req.params;
    try {
        const [rows] = await pool.query(
            'SELECT * FROM transactions WHERE cif_number = ?',
            [cif_number]
        );
        res.json(rows);
    } catch (err) {
        console.error('Transactions fetch error:', err.message);
        res.status(500).json({ error: 'Database error' });
    }
});

app.get('/api/customer/:cif_number', async (req, res) => {
    const { cif_number } = req.params;
    try {
        const [rows] = await pool.query(
            'SELECT customer_first_name FROM customer WHERE cif_number = ?',
            [cif_number]
        );
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Customer not found' });
        }
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ message: 'Database error' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});