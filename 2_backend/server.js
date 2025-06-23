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
<<<<<<< HEAD
=======
const multer = require('multer');
const fs = require('fs');
>>>>>>> main

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

<<<<<<< HEAD
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
=======
// Serve static files from the '1_frontend' directory at the root URL
app.use(express.static(path.join(__dirname, '../1_frontend')));

// Serve static files from the 'uploads' directory at /uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Multer storage config
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Use timestamp + original name for uniqueness
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname.replace(/\s+/g, '_'));
    }
});
const upload = multer({ storage: storage });

// File upload endpoint
app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    // Return relative path for frontend to use
    const filePath = `/uploads/${req.file.filename}`;
    res.json({ filePath });
});

// Login POST route
app.post('/login', async (req, res) => {
    const { customer_username, customer_password } = req.body;
    if (!customer_username || !customer_password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }
>>>>>>> main
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
<<<<<<< HEAD
        // Success: send cif_number (or use a session/token in a real app)
        res.json({ message: 'Login successful', cif_number: user.cif_number });
=======
        res.json({ message: 'Login successful', redirect: `/Dashboard-Customer/account1.html`, cif_number: user.cif_number });
>>>>>>> main
    } catch (err) {
        console.error('Login error:', err.message);
        res.status(500).json({ message: 'Server error during login.' });
    }
});

// Registration POST route (returns cif_number)
<<<<<<< HEAD

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
=======
app.post('/register', async (req, res) => {
    try {
        console.log('--- Incoming /register request body ---');
        console.dir(req.body, { depth: null });
        const data = req.body;
        // Main customer fields (only those that exist in CUSTOMER table)
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
            reg_political_affiliation,
            reg_fatca,
            reg_dnfbp,
            reg_online_gaming,
            reg_beneficial_owner,
            biometric_type,
            remittance_country,
            remittance_purpose
        } = data;

        // Validate required fields (add more as needed)
        if (!customer_type || !customer_last_name || !customer_first_name || !customer_username || !customer_password || !birth_date || !gender || !civil_status_code || !birth_country || !citizenship) {
            console.error('Validation error: Missing required fields', data);
            return res.status(400).json({ message: 'All required fields must be filled.' });
        }
        // Validate required address fields
        if (!data.address_barangay || !data.address_city || !data.address_province || !data.address_country || !data.address_zip_code) {
            console.error('Validation error: Missing required address fields', data);
            return res.status(400).json({ message: 'All address fields must be filled.' });
        }

        const conn = await pool.getConnection();
        try {
            await conn.beginTransaction();
            // Hash the password before saving
            const password_hash = await bcrypt.hash(customer_password, 10);
            // Insert into CUSTOMER (only valid columns)
            const [result] = await conn.execute(
                `INSERT INTO customer (
                    customer_type, customer_last_name, customer_first_name, customer_middle_name, customer_suffix_name,
                    customer_username, customer_password, birth_date, gender, civil_status_code,
                    birth_country, citizenship,
                    reg_political_affiliation, reg_fatca, reg_dnfbp, reg_online_gaming, reg_beneficial_owner,
                    biometric_type, remittance_country, remittance_purpose
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
                    citizenship,
                    reg_political_affiliation || null,
                    reg_fatca || null,
                    reg_dnfbp || null,
                    reg_online_gaming || null,
                    reg_beneficial_owner || null,
                    biometric_type || null,
                    remittance_country || null,
                    remittance_purpose || null
                ]
            );
            const cif_number = result.insertId;

            // Insert address (home address)
            await conn.execute(
                `INSERT INTO CUSTOMER_ADDRESS (
                    cif_number, address_type_code, address_unit, address_building, address_street, address_subdivision, address_barangay, address_city, address_province, address_country, address_zip_code
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    cif_number,
                    'AD01', // Home address type code
                    data.address_unit || null,
                    data.address_building || null,
                    data.address_street || null,
                    data.address_subdivision || null,
                    data.address_barangay || null,
                    data.address_city || null,
                    data.address_province || null,
                    data.address_country || null,
                    data.address_zip_code || null
                ]
            );
            // Insert alternate address if provided
            if (data.altUnit || data.altBuilding || data.altStreet || data.altSubdivision || data.altBarangay || data.altCity || data.altProvince || data.altCountry || data.altZip) {
                await conn.execute(
                    `INSERT INTO CUSTOMER_ADDRESS (
                        cif_number, address_type_code, address_unit, address_building, address_street, address_subdivision, address_barangay, address_city, address_province, address_country, address_zip_code
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        cif_number,
                        'AD02', // Alternate address type code
                        data.altUnit || null,
                        data.altBuilding || null,
                        data.altStreet || null,
                        data.altSubdivision || null,
                        data.altBarangay || null,
                        data.altCity || null,
                        data.altProvince || null,
                        data.altCountry || null,
                        data.altZip || null
                    ]
                );
            }

            // Insert IDs (repeat for each ID)
            if (data.id1Type && data.id1Number) {
                let id1Storage = data.id1FrontImagePath;
                if (!id1Storage || id1Storage === 'null' || id1Storage === '') id1Storage = null;
                await conn.execute(
                    `INSERT INTO CUSTOMER_ID (cif_number, id_type_code, id_number, id_storage, id_issue_date, id_expiry_date)
                     VALUES (?, ?, ?, ?, ?, ?)`,
                    [
                        cif_number,
                        data.id1Type,
                        data.id1Number,
                        id1Storage,
                        `${data.id1IssueYear}-${data.id1IssueMonth.padStart(2, '0')}-${data.id1IssueDay.padStart(2, '0')}`,
                        `${data.id1ExpiryYear}-${data.id1ExpiryMonth.padStart(2, '0')}-${data.id1ExpiryDay.padStart(2, '0')}`
                    ]
                );
            }
            if (data.id2Type && data.id2Number) {
                let id2Storage = data.id2FrontImagePath;
                if (!id2Storage || id2Storage === 'null' || id2Storage === '') id2Storage = null;
                await conn.execute(
                    `INSERT INTO CUSTOMER_ID (cif_number, id_type_code, id_number, id_storage, id_issue_date, id_expiry_date)
                     VALUES (?, ?, ?, ?, ?, ?)`,
                    [
                        cif_number,
                        data.id2Type,
                        data.id2Number,
                        id2Storage,
                        `${data.id2IssueYear}-${data.id2IssueMonth.padStart(2, '0')}-${data.id2IssueDay.padStart(2, '0')}`,
                        `${data.id2ExpiryYear}-${data.id2ExpiryMonth.padStart(2, '0')}-${data.id2ExpiryDay.padStart(2, '0')}`
                    ]
                );
            }

            // Insert contact details (example, repeat for each contact type)
            if (data.contact_type_code && data.contact_value) {
                await conn.execute(
                    `INSERT INTO CUSTOMER_CONTACT_DETAILS (cif_number, contact_type_code, contact_value)
                     VALUES (?, ?, ?)`,
                    [cif_number, data.contact_type_code, data.contact_value]
                );
            }

            // Insert employment info (example)
            if (data.employer_business_name && data.position_code) {
                await conn.execute(
                    `INSERT INTO CUSTOMER_EMPLOYMENT_INFORMATION (cif_number, employer_business_name, employment_start_date, employment_end_date, employment_status, position_code, income_monthly_gross)
                     VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [
                        cif_number,
                        data.employer_business_name,
                        data.employment_start_date,
                        data.employment_end_date || null,
                        data.employment_status || 'Current',
                        data.position_code,
                        data.income_monthly_gross || 0
                    ]
                );
            }

            // Insert fund source (example)
            if (data.fund_source_code) {
                await conn.execute(
                    `INSERT INTO CUSTOMER_FUND_SOURCE (cif_number, fund_source_code)
                     VALUES (?, ?)`,
                    [cif_number, data.fund_source_code]
                );
            }

            // Insert work nature (example)
            if (data.customer_employment_id && data.work_nature_code) {
                await conn.execute(
                    `INSERT INTO CUSTOMER_WORK_NATURE (customer_employment_id, work_nature_code)
                     VALUES (?, ?)`,
                    [data.customer_employment_id, data.work_nature_code]
                );
            }

            // Insert alias (example, adjust as needed)
            if (data.alias_first_name && data.alias_last_name) {
                await conn.execute(
                    `INSERT INTO CUSTOMER_ALIAS (cif_number) VALUES (?)`,
                    [cif_number]
                );
                // You may need to get the new customer_alias_id and insert into ALIAS_DOCUMENTATION
            }

            await conn.commit();
            res.status(201).json({ message: 'Registration successful! You can now log in.', cif_number });
        } catch (error) {
            await conn.rollback();
            console.error('Registration error:', error);
            if (error && error.stack) {
                console.error('Stack trace:', error.stack);
            }
            res.status(500).json({ message: 'Server error during registration.' });
        } finally {
            conn.release();
        }
    } catch (outerError) {
        console.error('Top-level /register error:', outerError);
        if (outerError && outerError.stack) {
            console.error('Stack trace:', outerError.stack);
        }
        res.status(500).json({ message: 'Unexpected server error during registration.' });
    }
});

// GET /register and /login: Inform users these are POST-only endpoints
app.get('/register', (req, res) => {
    res.status(405).send('Use POST /register to create a new user.');
});

app.get('/login', (req, res) => {
    res.status(405).send('Use POST /login to log in.');
});

// API info endpoint
app.get('/api', (req, res) => {
    res.json({
        message: 'Welcome to the UniVault API!',
        endpoints: [
            { method: 'GET', path: '/' },
            { method: 'GET', path: '/api' },
            { method: 'POST', path: '/register', description: 'Register a new user' },
            { method: 'POST', path: '/login', description: 'Login as a user' },
            { method: 'GET', path: '/register', description: '405 Method Not Allowed (use POST)' },
            { method: 'GET', path: '/login', description: '405 Method Not Allowed (use POST)' }
        ]
    });
});

// Get customer info by cif_number (for dashboard display)
app.get('/api/customer/:cif_number', async (req, res) => {
    const { cif_number } = req.params;
    try {
        // Fetch main customer info (only fields that exist in CUSTOMER table)
        const [rows] = await pool.query(
            `SELECT cif_number, customer_type, customer_last_name, customer_first_name, customer_middle_name, customer_suffix_name, customer_username, birth_date, gender, civil_status_code, birth_country, citizenship, biometric_type
             FROM customer WHERE cif_number = ?`,
            [cif_number]
        );
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Customer not found.' });
        }
        const customer = rows[0];
        // Fetch addresses
        const [addresses] = await pool.query(
            `SELECT address_type_code, address_unit, address_building, address_street, address_subdivision, address_barangay, address_city, address_province, address_country, address_zip_code
             FROM CUSTOMER_ADDRESS WHERE cif_number = ?`,
            [cif_number]
        );
        customer.addresses = addresses;
        res.json(customer);
    } catch (err) {
        console.error('Fetch customer error:', err);
        res.status(500).json({ message: 'Server error fetching customer.' });
    }
});

// Root endpoint for browser and health check
app.get('/', (req, res) => {
    res.send('UniVault API is running. Use /register and /login endpoints.');
});

>>>>>>> main
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});