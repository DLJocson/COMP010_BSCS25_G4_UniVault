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
const multer = require('multer');
const fs = require('fs');

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

// Test database connection and create default admin
(async () => {
    try {
        const connection = await pool.getConnection();
        console.log('Connected to MySQL database!');
        
        // Create default admin user if it doesn't exist
        await createDefaultAdmin();
        
        connection.release();
    } catch (err) {
        console.error('Database connection failed:', err.message);
    }
})();

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
        
        // Create admin user with a password that meets the regex constraint
        // Password: Admin123! (has uppercase, number, special character, 8+ chars)
        const adminPassword = 'Admin123!';
        const hashedPassword = '$2b$12$IEatmdijhyebJJqO7tpD/.flonO/u/J.abV8aXbt.xcR7PSXbf9lS';
        
        // Note: We need to bypass the password constraint since bcrypted passwords don't match the original regex
        // Let's temporarily disable constraint checking for this insert
        await pool.query('SET foreign_key_checks = 0');
        await pool.query('SET sql_mode = ""');
        
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
        
        // Re-enable constraints
        await pool.query('SET foreign_key_checks = 1');
        await pool.query('SET sql_mode = "STRICT_TRANS_TABLES,NO_ZERO_DATE,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO"');
        
        console.log('✅ Default admin user created successfully!');
        console.log('👤 Username: admin');
        console.log('🔑 Password: Admin123!');
        console.log(`📋 Employee ID: ${result.insertId}`);
        
    } catch (error) {
        console.error('⚠️  Could not create default admin user:', error.message);
        console.log('💡 You may need to create an admin user manually in the database');
    }
}

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// Admin Login POST route
app.post('/admin/login', async (req, res) => {
    const { employee_username, employee_password } = req.body;
    if (!employee_username || !employee_password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }
    try {
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
        res.status(500).json({ message: 'Server error during login.' });
    }
});

// Customer Login POST route
app.post('/login', async (req, res) => {
    const { customer_username, customer_password } = req.body;
    if (!customer_username || !customer_password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }
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
        res.json({ message: 'Login successful', redirect: `/Dashboard-Customer/account1.html`, cif_number: user.cif_number });
    } catch (err) {
        console.error('Login error:', err.message);
        res.status(500).json({ message: 'Server error during login.' });
    }
});

// Registration POST route (returns cif_number)
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

// Admin Dashboard Stats - Enhanced with more detailed statistics
app.get('/admin/dashboard-stats', async (req, res) => {
    try {
        // Get basic counts
        const [totalCustomers] = await pool.query('SELECT COUNT(*) as count FROM CUSTOMER WHERE is_deleted = FALSE');
        const [verifiedCustomers] = await pool.query('SELECT COUNT(*) as count FROM CUSTOMER WHERE customer_status = "Active" AND is_deleted = FALSE');
        const [pendingVerifications] = await pool.query('SELECT COUNT(*) as count FROM CUSTOMER WHERE customer_status = "Pending Verification" AND is_deleted = FALSE');
        const [newAccounts] = await pool.query('SELECT COUNT(*) as count FROM CUSTOMER WHERE DATE(created_at) = CURDATE() AND is_deleted = FALSE');
        const [rejectedApplications] = await pool.query('SELECT COUNT(*) as count FROM CUSTOMER WHERE customer_status = "Suspended" AND is_deleted = FALSE');
        const [pendingApprovals] = await pool.query('SELECT COUNT(*) as count FROM CUSTOMER WHERE customer_status = "Inactive" AND is_deleted = FALSE');
        
        // Get monthly statistics for chart
        const [monthlyStats] = await pool.query(`
            SELECT 
                MONTH(created_at) as month,
                COUNT(*) as registrations
            FROM CUSTOMER 
            WHERE YEAR(created_at) = YEAR(CURDATE()) AND is_deleted = FALSE
            GROUP BY MONTH(created_at)
            ORDER BY MONTH(created_at)
        `);
        
        res.json({
            totalCustomers: totalCustomers[0].count,
            verifiedCustomers: verifiedCustomers[0].count,
            pendingVerifications: pendingVerifications[0].count,
            newAccounts: newAccounts[0].count,
            rejectedApplications: rejectedApplications[0].count,
            pendingApprovals: pendingApprovals[0].count,
            monthlyStats: monthlyStats
        });
    } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Admin Get All Customers - Enhanced with more details
app.get('/admin/customers', async (req, res) => {
    try {
        const { search } = req.query;
        let query = `
            SELECT 
                c.cif_number, 
                c.customer_type,
                c.customer_first_name, 
                c.customer_last_name, 
                c.customer_middle_name,
                c.customer_suffix_name,
                c.customer_username, 
                c.customer_status, 
                c.created_at,
                cd.contact_value as email,
                cd2.contact_value as phone
            FROM CUSTOMER c
            LEFT JOIN CUSTOMER_CONTACT_DETAILS cd ON c.cif_number = cd.cif_number AND cd.contact_type_code = 'CT01'
            LEFT JOIN CUSTOMER_CONTACT_DETAILS cd2 ON c.cif_number = cd2.cif_number AND cd2.contact_type_code = 'CT02'
            WHERE c.is_deleted = FALSE
        `;
        let params = [];
        
        if (search) {
            query += ` AND (c.customer_first_name LIKE ? OR c.customer_last_name LIKE ? OR c.cif_number LIKE ? OR c.customer_username LIKE ?)`;
            const searchParam = `%${search}%`;
            params = [searchParam, searchParam, searchParam, searchParam];
        }
        
        query += ` ORDER BY c.created_at DESC LIMIT 100`;
        
        const [customers] = await pool.query(query, params);
        res.json(customers);
    } catch (err) {
        console.error('Error fetching customers:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Admin Get All Accounts
app.get('/admin/accounts', async (req, res) => {
    try {
        const [accounts] = await pool.query(`
            SELECT 
                ad.account_number,
                ad.account_status,
                ad.account_open_date,
                CONCAT(c.customer_first_name, ' ', c.customer_last_name) as customer_name,
                cpt.product_type_name
            FROM ACCOUNT_DETAILS ad
            JOIN CUSTOMER_ACCOUNT ca ON ad.account_number = ca.account_number
            JOIN CUSTOMER c ON ca.cif_number = c.cif_number
            JOIN CUSTOMER_PRODUCT_TYPE cpt ON ad.product_type_code = cpt.product_type_code
            WHERE c.is_deleted = FALSE
            ORDER BY ad.account_open_date DESC
            LIMIT 100
        `);
        res.json(accounts);
    } catch (err) {
        console.error('Error fetching accounts:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Admin Get Review Queue
app.get('/admin/review-queue', async (req, res) => {
    try {
        const [reviews] = await pool.query(`
            SELECT 
                rq.review_id,
                rq.request_type,
                rq.request_timestamp,
                rq.review_status,
                CONCAT(c.customer_first_name, ' ', c.customer_last_name) as customer_name
            FROM REVIEW_QUEUE rq
            LEFT JOIN CUSTOMER c ON rq.cif_number = c.cif_number
            ORDER BY rq.request_timestamp DESC
            LIMIT 100
        `);
        res.json(reviews);
    } catch (err) {
        console.error('Error fetching review queue:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Admin Approve Customer
app.post('/admin/customer/:cif_number/approve', async (req, res) => {
    try {
        const { cif_number } = req.params;
        await pool.query(
            'UPDATE CUSTOMER SET customer_status = "Active" WHERE cif_number = ?',
            [cif_number]
        );
        res.json({ message: 'Customer approved successfully' });
    } catch (err) {
        console.error('Error approving customer:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Admin Process Review
app.post('/admin/review/:review_id/approve', async (req, res) => {
    try {
        const { review_id } = req.params;
        const { comment, employee_id } = req.body;
        
        await pool.query(
            'UPDATE REVIEW_QUEUE SET review_status = "APPROVED", review_comment = ?, reviewed_by_employee_id = ?, review_date = CURDATE() WHERE review_id = ?',
            [comment, employee_id, review_id]
        );
        res.json({ message: 'Review approved successfully' });
    } catch (err) {
        console.error('Error approving review:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Admin Reject Review
app.post('/admin/review/:review_id/reject', async (req, res) => {
    try {
        const { review_id } = req.params;
        const { comment, employee_id } = req.body;
        
        await pool.query(
            'UPDATE REVIEW_QUEUE SET review_status = "REJECTED", review_comment = ?, reviewed_by_employee_id = ?, review_date = CURDATE() WHERE review_id = ?',
            [comment, employee_id, review_id]
        );
        res.json({ message: 'Review rejected successfully' });
    } catch (err) {
        console.error('Error rejecting review:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Admin Get Customer Details by CIF
app.get('/admin/customer/:cif_number/details', async (req, res) => {
    try {
        const { cif_number } = req.params;
        
        // Get main customer information
        const [customerRows] = await pool.query(`
            SELECT 
                c.*,
                cst.civil_status_description,
                c.customer_status,
                c.customer_type
            FROM CUSTOMER c
            LEFT JOIN CIVIL_STATUS_TYPE cst ON c.civil_status_code = cst.civil_status_code
            WHERE c.cif_number = ? AND c.is_deleted = FALSE
        `, [cif_number]);
        
        if (customerRows.length === 0) {
            return res.status(404).json({ message: 'Customer not found' });
        }
        
        const customer = customerRows[0];
        
        // Get addresses
        const [addresses] = await pool.query(`
            SELECT 
                ca.*,
                at.address_type
            FROM CUSTOMER_ADDRESS ca
            LEFT JOIN ADDRESS_TYPE at ON ca.address_type_code = at.address_type_code
            WHERE ca.cif_number = ?
        `, [cif_number]);
        
        // Get contact details
        const [contacts] = await pool.query(`
            SELECT 
                ccd.*,
                ct.contact_type_description
            FROM CUSTOMER_CONTACT_DETAILS ccd
            LEFT JOIN CONTACT_TYPE ct ON ccd.contact_type_code = ct.contact_type_code
            WHERE ccd.cif_number = ?
        `, [cif_number]);
        
        // Get employment information
        const [employment] = await pool.query(`
            SELECT 
                cei.*,
                ep.employment_type,
                ep.job_title
            FROM CUSTOMER_EMPLOYMENT_INFORMATION cei
            LEFT JOIN EMPLOYMENT_POSITION ep ON cei.position_code = ep.position_code
            WHERE cei.cif_number = ?
        `, [cif_number]);
        
        // Get ID information
        const [ids] = await pool.query(`
            SELECT 
                ci.*,
                it.id_description
            FROM CUSTOMER_ID ci
            LEFT JOIN ID_TYPE it ON ci.id_type_code = it.id_type_code
            WHERE ci.cif_number = ?
        `, [cif_number]);
        
        // Get fund sources
        const [fundSources] = await pool.query(`
            SELECT 
                cfs.*,
                fst.fund_source
            FROM CUSTOMER_FUND_SOURCE cfs
            LEFT JOIN FUND_SOURCE_TYPE fst ON cfs.fund_source_code = fst.fund_source_code
            WHERE cfs.cif_number = ?
        `, [cif_number]);
        
        // Get work nature
        const [workNature] = await pool.query(`
            SELECT 
                cwn.*,
                wnt.nature_description
            FROM CUSTOMER_WORK_NATURE cwn
            LEFT JOIN WORK_NATURE_TYPE wnt ON cwn.work_nature_code = wnt.work_nature_code
            JOIN CUSTOMER_EMPLOYMENT_INFORMATION cei ON cwn.customer_employment_id = cei.customer_employment_id
            WHERE cei.cif_number = ?
        `, [cif_number]);
        
        // Get aliases
        const [aliases] = await pool.query(`
            SELECT ca.*
            FROM CUSTOMER_ALIAS ca
            WHERE ca.cif_number = ?
        `, [cif_number]);
        
        res.json({
            customer,
            addresses,
            contacts,
            employment,
            ids,
            fundSources,
            workNature,
            aliases
        });
    } catch (err) {
        console.error('Error fetching customer details:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Admin Get Employees
app.get('/admin/employees', async (req, res) => {
    try {
        const { search } = req.query;
        let query = `
            SELECT 
                employee_id,
                employee_username,
                employee_first_name,
                employee_last_name,
                employee_position,
                employee_email,
                employee_status,
                created_at
            FROM BANK_EMPLOYEE
            WHERE is_deleted = FALSE
        `;
        let params = [];
        
        if (search) {
            query += ` AND (employee_first_name LIKE ? OR employee_last_name LIKE ? OR employee_username LIKE ? OR employee_position LIKE ?)`;
            const searchParam = `%${search}%`;
            params = [searchParam, searchParam, searchParam, searchParam];
        }
        
        query += ` ORDER BY created_at DESC LIMIT 100`;
        
        const [employees] = await pool.query(query, params);
        res.json(employees);
    } catch (err) {
        console.error('Error fetching employees:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Admin Get Pending Verifications
app.get('/admin/pending-verifications', async (req, res) => {
    try {
        const [verifications] = await pool.query(`
            SELECT 
                c.cif_number,
                c.customer_type,
                c.customer_first_name,
                c.customer_last_name,
                c.customer_middle_name,
                c.customer_suffix_name,
                c.created_at,
                cd.contact_value as email,
                cd2.contact_value as phone,
                c.customer_status
            FROM CUSTOMER c
            LEFT JOIN CUSTOMER_CONTACT_DETAILS cd ON c.cif_number = cd.cif_number AND cd.contact_type_code = 'CT01'
            LEFT JOIN CUSTOMER_CONTACT_DETAILS cd2 ON c.cif_number = cd2.cif_number AND cd2.contact_type_code = 'CT02'
            WHERE c.customer_status = 'Pending Verification' AND c.is_deleted = FALSE
            ORDER BY c.created_at ASC
            LIMIT 100
        `);
        
        res.json(verifications);
    } catch (err) {
        console.error('Error fetching pending verifications:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Admin Get Closed Accounts
app.get('/admin/closed-accounts', async (req, res) => {
    try {
        const [closedAccounts] = await pool.query(`
            SELECT 
                c.cif_number,
                c.customer_type,
                c.customer_first_name,
                c.customer_last_name,
                c.customer_middle_name,
                c.customer_suffix_name,
                c.deleted_at as closed_date,
                c.customer_status
            FROM CUSTOMER c
            WHERE c.is_deleted = TRUE
            ORDER BY c.deleted_at DESC
            LIMIT 100
        `);
        
        res.json(closedAccounts);
    } catch (err) {
        console.error('Error fetching closed accounts:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Admin Verify Customer
app.post('/admin/customer/:cif_number/verify', async (req, res) => {
    try {
        const { cif_number } = req.params;
        const { employee_id, action } = req.body; // action: 'approve' or 'reject'
        
        if (action === 'approve') {
            await pool.query(
                'UPDATE CUSTOMER SET customer_status = "Active", updated_at = CURRENT_TIMESTAMP WHERE cif_number = ?',
                [cif_number]
            );
            res.json({ message: 'Customer verified and approved successfully' });
        } else if (action === 'reject') {
            await pool.query(
                'UPDATE CUSTOMER SET customer_status = "Suspended", updated_at = CURRENT_TIMESTAMP WHERE cif_number = ?',
                [cif_number]
            );
            res.json({ message: 'Customer verification rejected' });
        } else {
            res.status(400).json({ message: 'Invalid action. Use "approve" or "reject".' });
        }
    } catch (err) {
        console.error('Error verifying customer:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Admin Close Account
app.post('/admin/customer/:cif_number/close', async (req, res) => {
    try {
        const { cif_number } = req.params;
        const { employee_id, reason } = req.body;
        
        await pool.query(
            'UPDATE CUSTOMER SET is_deleted = TRUE, deleted_at = CURRENT_TIMESTAMP, deleted_by = ? WHERE cif_number = ?',
            [employee_id, cif_number]
        );
        
        res.json({ message: 'Account closed successfully' });
    } catch (err) {
        console.error('Error closing account:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Admin Get Close Requests (for customer close request management)
app.get('/admin/close-requests', async (req, res) => {
    try {
        const [closeRequests] = await pool.query(`
            SELECT 
                cr.close_request_id,
                cr.cif_number,
                cr.request_date,
                cr.request_reason,
                cr.request_status,
                cr.processed_by,
                cr.processed_date,
                c.customer_type,
                c.customer_first_name,
                c.customer_last_name,
                c.customer_middle_name,
                c.customer_suffix_name
            FROM CLOSE_REQUEST cr
            INNER JOIN CUSTOMER c ON cr.cif_number = c.cif_number
            WHERE c.is_deleted = FALSE
            ORDER BY cr.request_date DESC
            LIMIT 100
        `);
        
        res.json(closeRequests);
    } catch (err) {
        console.error('Error fetching close requests:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Admin Process Close Request
app.post('/admin/close-request/:cif_number/process', async (req, res) => {
    try {
        const { cif_number } = req.params;
        const { employee_id, action, reason } = req.body; // action: 'approve' or 'reject'
        
        if (action === 'approve') {
            await pool.query(
                'UPDATE CUSTOMER SET is_deleted = TRUE, deleted_at = CURRENT_TIMESTAMP, deleted_by = ?, customer_status = "Closed" WHERE cif_number = ?',
                [employee_id, cif_number]
            );
            res.json({ message: 'Close request approved and account closed' });
        } else if (action === 'reject') {
            await pool.query(
                'UPDATE CUSTOMER SET customer_status = "Active" WHERE cif_number = ?',
                [cif_number]
            );
            res.json({ message: 'Close request rejected' });
        } else {
            res.status(400).json({ message: 'Invalid action. Use "approve" or "reject".' });
        }
    } catch (err) {
        console.error('Error processing close request:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Root endpoint for browser and health check
app.get('/', (req, res) => {
    res.send('UniVault API is running. Use /register and /login endpoints.');
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});