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
        // Log alternate address fields for debugging
        console.log('ALT ADDRESS DEBUG:', {
            altUnit: req.body.altUnit,
            altBuilding: req.body.altBuilding,
            altStreet: req.body.altStreet,
            altSubdivision: req.body.altSubdivision,
            altBarangay: req.body.altBarangay,
            altCity: req.body.altCity,
            altProvince: req.body.altProvince,
            altCountry: req.body.altCountry,
            altZip: req.body.altZip
        });
        const data = req.body;
        // Utility to map possible frontend key variants to backend expected keys
        function getField(data, keys, fallback = null) {
            for (const key of keys) {
                if (data[key] !== undefined && data[key] !== null && data[key] !== '') {
                    return data[key];
                }
            }
            return fallback;
        }
        // Map remittance fields from all possible key variants (add 'remittance-country', 'remittance-purpose')
        const remittance_country = getField(data, ['remittance_country', 'remittance-country', 'remittanceCountry']);
        const remittance_purpose = getField(data, ['remittance_purpose', 'remittance-purpose', 'remittancePurpose']);
        // Robust mapping for all required fields (remittance, address, etc.)
        const customer_type = getField(data, ['customer_type', 'customerType']);
        const customer_last_name = getField(data, ['customer_last_name', 'customerLastName', 'last_name', 'lastName']);
        const customer_first_name = getField(data, ['customer_first_name', 'customerFirstName', 'first_name', 'firstName']);
        const customer_middle_name = getField(data, ['customer_middle_name', 'customerMiddleName', 'middle_name', 'middleName']);
        const customer_suffix_name = getField(data, ['customer_suffix_name', 'customerSuffixName', 'suffix_name', 'suffixName']);
        const customer_username = getField(data, ['customer_username', 'customerUsername', 'username']);
        const customer_password = getField(data, ['customer_password', 'customerPassword', 'password']);
        const birth_date = getField(data, ['birth_date', 'birthDate', 'dob']);
        const gender = getField(data, ['gender']);
        const civil_status_code = getField(data, ['civil_status_code', 'civilStatusCode', 'civil_status']);
        const birth_country = getField(data, ['birth_country', 'birthCountry']);
        const citizenship = getField(data, ['citizenship']);
        const reg_political_affiliation = getField(data, ['reg_political_affiliation', 'political_affiliation']);
        const reg_fatca = getField(data, ['reg_fatca', 'fatca']);
        const reg_dnfbp = getField(data, ['reg_dnfbp', 'dnfbp']);
        const reg_online_gaming = getField(data, ['reg_online_gaming', 'online_gaming']);
        const reg_beneficial_owner = getField(data, ['reg_beneficial_owner', 'beneficial_owner']);
        // Address fields (home)
        const address_unit = getField(data, ['address_unit', 'addressUnit']);
        const address_building = getField(data, ['address_building', 'addressBuilding']);
        const address_street = getField(data, ['address_street', 'addressStreet']);
        const address_subdivision = getField(data, ['address_subdivision', 'addressSubdivision']);
        const address_barangay = getField(data, ['address_barangay', 'addressBarangay']);
        const address_city = getField(data, ['address_city', 'addressCity']);
        const address_province = getField(data, ['address_province', 'addressProvince']);
        const address_country = getField(data, ['address_country', 'addressCountry']);
        const address_zip_code = getField(data, ['address_zip_code', 'addressZipCode', 'address_zip']);
        // Alternate address fields
        const altUnit = getField(data, ['altUnit', 'alt_unit']);
        const altBuilding = getField(data, ['altBuilding', 'alt_building']);
        const altStreet = getField(data, ['altStreet', 'alt_street']);
        const altSubdivision = getField(data, ['altSubdivision', 'alt_subdivision']);
        const altBarangay = getField(data, ['altBarangay', 'alt_barangay']);
        const altCity = getField(data, ['altCity', 'alt_city']);
        const altProvince = getField(data, ['altProvince', 'alt_province']);
        const altCountry = getField(data, ['altCountry', 'alt_country']);
        const altZip = getField(data, ['altZip', 'alt_zip']);
        // New fields for registration
        const account_type = getField(data, ['account_type', 'accountType']);
        const data_privacy_consent = getField(data, ['data_privacy_consent', 'dataPrivacyConsent']);
        const issuance_consent = getField(data, ['issuance_consent', 'issuanceConsent']);
        const customer_undertaking = getField(data, ['customer_undertaking', 'customerUndertaking']);
        // Validate required fields (use mapped values)
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
            // Map frontend values to allowed DB values for customer_type
            const customerTypeMap = {
                'account_owner': 'Account Owner',
                'business_owner': 'Business Owner',
                'business_owner / officer / signatory': 'Business Owner / Officer / Signatory',
                'individual': 'Individual',
                'corporate': 'Corporate'
            };
            const mappedCustomerType = customerTypeMap[(customer_type || '').toLowerCase()] || customer_type;
            // Residency status mapping
            const residency_status_raw = getField(data, ['residency_status', 'residencyStatus', 'residency-status']);
            // Map registration3 dropdown options to allowed DB values
            const residencyStatusMap = {
                'citizen': 'Resident',
                'permanent resident': 'Resident',
                'temporary resident': 'Resident',
                'foreign national': 'Non-Resident',
                'dual citizen': 'Resident',
                'refugee': 'Non-Resident',
                'student visa holder': 'Non-Resident',
                'work visa holder': 'Non-Resident',
                'undocumented': 'Non-Resident',
                'other': 'Non-Resident',
                'resident': 'Resident',
                'non-resident': 'Non-Resident',
                'non resident': 'Non-Resident',
                'nonresident': 'Non-Resident',
                'resident alien': 'Resident',
                'non-resident alien': 'Non-Resident',
                '': null,
                null: null,
                undefined: null
            };
            let residency_status = residencyStatusMap[(residency_status_raw || '').toLowerCase().trim()];
            if (residency_status === undefined) residency_status = residency_status_raw; // fallback to raw if not mapped
            // Robust mapping for TIN (tax identification number)
            const tax_identification_number = getField(data, ['tax_identification_number', 'tin', 'TIN', 'TaxIdentificationNumber']);
            // Insert into CUSTOMER (all columns in table)
            // Remove last_login from insert (not in table)
            const [result] = await conn.execute(
                `INSERT INTO customer (
                    customer_type, customer_last_name, customer_first_name, customer_middle_name, customer_suffix_name,
                    customer_username, customer_password, birth_date, gender, civil_status_code,
                    birth_country, residency_status, citizenship, tax_identification_number, customer_status,
                    remittance_country, remittance_purpose,
                    reg_political_affiliation, reg_fatca, reg_dnfbp, reg_online_gaming, reg_beneficial_owner,
                    is_alternate_address_same_as_home,
                    alt_unit, alt_building, alt_street, alt_subdivision, alt_barangay, alt_city, alt_province, alt_country, alt_zip,
                    address_unit, address_building, address_street, address_subdivision, address_barangay, address_city, address_province, address_country, address_zip_code,
                    account_type, data_privacy_consent, issuance_consent, customer_undertaking
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    mappedCustomerType,
                    customer_last_name,
                    customer_first_name,
                    customer_middle_name || null,
                    customer_suffix_name || null,
                    customer_username,
                    password_hash,
                    birth_date,
                    gender,
                    civil_status_code || null,
                    birth_country,
                    residency_status || null, // Use mapped value
                    citizenship,
                    tax_identification_number || null, // Use robustly extracted TIN
                    data.customer_status || 'Active',
                    remittance_country || null, // Use mapped value (fix)
                    remittance_purpose || null, // Use mapped value (fix)
                    reg_political_affiliation || null,
                    reg_fatca || null,
                    reg_dnfbp || null,
                    reg_online_gaming || null,
                    reg_beneficial_owner || null,
                    data.hasOwnProperty('is_alternate_address_same_as_home') ? data.is_alternate_address_same_as_home : null,
                    altUnit || null,
                    altBuilding || null,
                    altStreet || null,
                    altSubdivision || null,
                    altBarangay || null,
                    altCity || null,
                    altProvince || null,
                    altCountry || null,
                    altZip || null,
                    address_unit || null,
                    address_building || null,
                    address_street || null,
                    address_subdivision || null,
                    address_barangay || null,
                    address_city || null,
                    address_province || null,
                    address_country || null,
                    address_zip_code || null,
                    account_type || null,
                    data_privacy_consent ? 1 : 0,
                    issuance_consent ? 1 : 0,
                    customer_undertaking ? 1 : 0
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
                // Insert front image if present (support both key variants)
                const id1Front = data['id1FrontImagePath'] || data['front-id-1_path'];
                if (id1Front && id1Front !== 'null' && id1Front !== '') {
                    console.log('DEBUG id1Front:', id1Front);
                    await conn.execute(
                        `INSERT INTO CUSTOMER_ID (cif_number, id_type_code, id_number, id_storage, id_issue_date, id_expiry_date)
                         VALUES (?, ?, ?, ?, ?, ?)`,
                        [
                            cif_number,
                            data.id1Type,
                            data.id1Number,
                            id1Front,
                            `${data.id1IssueYear}-${data.id1IssueMonth.padStart(2, '0')}-${data.id1IssueDay.padStart(2, '0')}`,
                            `${data.id1ExpiryYear}-${data.id1ExpiryMonth.padStart(2, '0')}-${data.id1ExpiryDay.padStart(2, '0')}`
                        ]
                    );
                }
                // Insert back image if present (support both key variants)
                const id1Back = data['id1BackImagePath'] || data['back-id-1_path'];
                if (id1Back && id1Back !== 'null' && id1Back !== '') {
                    console.log('DEBUG id1Back:', id1Back);
                    await conn.execute(
                        `INSERT INTO CUSTOMER_ID (cif_number, id_type_code, id_number, id_storage, id_issue_date, id_expiry_date)
                         VALUES (?, ?, ?, ?, ?, ?)`,
                        [
                            cif_number,
                            data.id1Type,
                            data.id1Number,
                            id1Back,
                            `${data.id1IssueYear}-${data.id1IssueMonth.padStart(2, '0')}-${data.id1IssueDay.padStart(2, '0')}`,
                            `${data.id1ExpiryYear}-${data.id1ExpiryMonth.padStart(2, '0')}-${data.id1ExpiryDay.padStart(2, '0')}`
                        ]
                    );
                }
            }
            if (data.id2Type && data.id2Number) {
                // Insert front image if present (support both key variants)
                const id2Front = data['id2FrontImagePath'] || data['front-id-2_path'];
                if (id2Front && id2Front !== 'null' && id2Front !== '') {
                    console.log('DEBUG id2Front:', id2Front);
                    await conn.execute(
                        `INSERT INTO CUSTOMER_ID (cif_number, id_type_code, id_number, id_storage, id_issue_date, id_expiry_date)
                         VALUES (?, ?, ?, ?, ?, ?)`,
                        [
                            cif_number,
                            data.id2Type,
                            data.id2Number,
                            id2Front,
                            `${data.id2IssueYear}-${data.id2IssueMonth.padStart(2, '0')}-${data.id2IssueDay.padStart(2, '0')}`,
                            `${data.id2ExpiryYear}-${data.id2ExpiryMonth.padStart(2, '0')}-${data.id2ExpiryDay.padStart(2, '0')}`
                        ]
                    );
                }
                // Insert back image if present (support both key variants)
                const id2Back = data['id2BackImagePath'] || data['back-id-2_path'];
                if (id2Back && id2Back !== 'null' && id2Back !== '') {
                    console.log('DEBUG id2Back:', id2Back);
                    await conn.execute(
                        `INSERT INTO CUSTOMER_ID (cif_number, id_type_code, id_number, id_storage, id_issue_date, id_expiry_date)
                         VALUES (?, ?, ?, ?, ?, ?)`,
                        [
                            cif_number,
                            data.id2Type,
                            data.id2Number,
                            id2Back,
                            `${data.id2IssueYear}-${data.id2IssueMonth.padStart(2, '0')}-${data.id2IssueDay.padStart(2, '0')}`,
                            `${data.id2ExpiryYear}-${data.id2ExpiryMonth.padStart(2, '0')}-${data.id2ExpiryDay.padStart(2, '0')}`
                        ]
                    );
                }
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

            // Fund source mapping (add 'source-of-funds-multi')
            // Now supports descriptive codes (e.g., 'remittances', 'allowance', etc.)
            const fund_source_code = getField(data, [
                'fund_source_code', 'fundSourceCode', 'fund-source-code', 'fundSource', 'source-of-funds', 'source-of-funds-multi'
            ]);
            // Business nature mapping (add 'business-nature')
            const work_nature_code = getField(data, ['work_nature_code', 'workNatureCode', 'work-nature-code', 'business-nature']);

            // Log mapped remittance and fund source fields for debugging
            console.log('DEBUG remittance_country:', remittance_country);
            console.log('DEBUG remittance_purpose:', remittance_purpose);
            console.log('DEBUG fund_source_code:', fund_source_code);

            // Insert fund source (now supports descriptive codes)
            if (fund_source_code) {
                console.log('Inserting fund source:', fund_source_code);
                await conn.execute(
                    `INSERT INTO CUSTOMER_FUND_SOURCE (cif_number, fund_source_code)
                     VALUES (?, ?)`,
                    [cif_number, fund_source_code]
                );
            }

            // Insert work nature (example)
            if (data.customer_employment_id && work_nature_code) {
                await conn.execute(
                    `INSERT INTO CUSTOMER_WORK_NATURE (customer_employment_id, work_nature_code)
                     VALUES (?, ?)`,
                    [data.customer_employment_id, work_nature_code]
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
            // After successful registration, respond with a redirect to registration14.html
            res.status(201).json({ message: 'Registration successful! Please wait for processing.', redirect: '/Registration-Customer/registration14.html', cif_number });
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
            `SELECT cif_number, customer_type, customer_last_name, customer_first_name, customer_middle_name, customer_suffix_name, customer_username, birth_date, gender, civil_status_code, birth_country, citizenship
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

// GET /api/customer/all/:cif_number - Display all registration data in one table
app.get('/api/customer/all/:cif_number', async (req, res) => {
    const { cif_number } = req.params;
    try {
        // Fetch main customer info
        const [customerRows] = await pool.query(
            `SELECT * FROM customer WHERE cif_number = ?`,
            [cif_number]
        );
        if (customerRows.length === 0) {
            return res.status(404).json({ message: 'Customer not found.' });
        }
        const customer = customerRows[0];
        // Fetch all related tables
        const [addresses] = await pool.query(`SELECT * FROM CUSTOMER_ADDRESS WHERE cif_number = ?`, [cif_number]);
        const [ids] = await pool.query(`SELECT * FROM CUSTOMER_ID WHERE cif_number = ?`, [cif_number]);
        const [contacts] = await pool.query(`SELECT * FROM CUSTOMER_CONTACT_DETAILS WHERE cif_number = ?`, [cif_number]);
        const [employment] = await pool.query(`SELECT * FROM CUSTOMER_EMPLOYMENT_INFORMATION WHERE cif_number = ?`, [cif_number]);
        const [fundSources] = await pool.query(`SELECT * FROM CUSTOMER_FUND_SOURCE WHERE cif_number = ?`, [cif_number]);
        const [aliases] = await pool.query(`SELECT * FROM CUSTOMER_ALIAS WHERE cif_number = ?`, [cif_number]);
        // Work nature may require a join with employment id
        let workNatures = [];
        if (employment.length > 0) {
            const empIds = employment.map(e => e.customer_employment_id);
            const [wn] = await pool.query(`SELECT * FROM CUSTOMER_WORK_NATURE WHERE customer_employment_id IN (${empIds.map(() => '?').join(',')})`, empIds);
            workNatures = wn;
        }
        // Compose all data into one object
        const allData = {
            customer,
            addresses,
            ids,
            contacts,
            employment,
            fundSources,
            workNatures,
            aliases
        };
        res.json(allData);
    } catch (err) {
        console.error('Fetch all customer data error:', err);
        res.status(500).json({ message: 'Server error fetching all customer data.' });
    }
});

// Root endpoint for browser and health check
app.get('/', (req, res) => {
    res.send('UniVault API is running. Use /register and /login endpoints.');
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});