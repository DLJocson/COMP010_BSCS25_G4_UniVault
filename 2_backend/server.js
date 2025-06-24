require('dotenv').config(); // This MUST be the first line

// >>>>>>>>>>>>> DEBUGGING LINES (Keep for now, can remove later) <<<<<<<<<<<<<<<<
// console.log('--- .env Variables Loaded (Debugging) ---');
// console.log('DB_USER:', process.env.DB_USER);
// console.log('DB_PASSWORD:', process.env.DB_PASSWORD);
// console.log('DB_DATABASE:', process.env.DB_DATABASE);
// console.log('DB_HOST:', process.env.DB_HOST);
// console.log('DB_PORT:', process.env.DB_PORT);
// console.log('-----------------------------------------');
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

        // Map all fields robustly
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
        // Employment and remittance fields (robust mapping)
        const work_contact_code = getField(data, ['work_contact_code', 'work_country_code', 'work', 'personalCode']);
        const currently_employed = getField(data, ['currently_employed', 'currentlyEmployed']);
        const remittance_country = getField(data, ['remittance_country', 'remittance-country', 'remittanceCountry']);
        const remittance_purpose = getField(data, ['remittance_purpose', 'remittance-purpose', 'remittancePurpose']);
        const source_of_funds_multi = getField(data, ['source_of_funds_multi', 'source-of-funds-multi']);
        const business_nature_multi = getField(data, ['business_nature_multi', 'business-nature-multi']);
        const work_email_address = getField(data, ['work_email_address', 'work-email', 'work-emai', 'work_emai']);
        const work_landline_number = getField(data, ['work_landline_number', 'business_number', 'businessNumber', 'landlineNumber']);
        const position_code = getField(data, ['position_code', 'position']);
        const income_monthly_gross = getField(data, ['income_monthly_gross', 'gross_income', 'gross-income']);
        const employer_business_name = getField(data, ['employer_business_name', 'primary_employer', 'primary-employer']);

        // Add debug for all mapped values
        console.log('--- Mapped Employment/Remittance Fields ---');
        console.log({
            work_contact_code, currently_employed, remittance_country, remittance_purpose, source_of_funds_multi, business_nature_multi,
            work_email_address, work_landline_number, position_code, income_monthly_gross, employer_business_name
        });

        // Validate required fields (use mapped values)
        if (!customer_type || !customer_last_name || !customer_first_name || !customer_username || !customer_password || !birth_date || !gender || !civil_status_code || !birth_country || !citizenship) {
            console.error('Validation error: Missing required fields', data);
            return res.status(400).json({ message: 'All required fields must be filled.' });
        }
        // Validate required address fields (make some optional)
        if (!address_barangay || !address_city || !address_province || !address_country || !address_zip_code) {
            console.error('Validation error: Missing required address fields', data);
            return res.status(400).json({ message: 'Barangay, City, Province, Country, and Zip Code are required for home address.' });
        }
        // Validate alternate address fields only if alternateAddressSameAsHome is not 'Yes' or true
        const altSameAsHome = data.alternateAddressSameAsHome === 'Yes' || data.alternateAddressSameAsHome === true || data.is_alternate_address_same_as_home === 'Yes' || data.is_alternate_address_same_as_home === true;
        if (!altSameAsHome) {
            if (!altBarangay || !altCity || !altProvince || !altCountry || !altZip) {
                console.error('Validation error: Missing required alternate address fields', data);
                return res.status(400).json({ message: 'All alternate address fields must be filled if alternate address is not same as home.' });
            }
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
            const insertValues = [
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
                residency_status || null,
                citizenship,
                tax_identification_number || null,
                'Active',
                remittance_country || null,
                remittance_purpose || null,
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
                customer_undertaking ? 1 : 0,
                work_contact_code || null,
                currently_employed || null,
                source_of_funds_multi || null,
                business_nature_multi || null,
                work_email_address || null,
                work_landline_number || null,
                position_code || null,
                income_monthly_gross || null,
                employer_business_name || null
            ];
            console.log('INSERT VALUES LENGTH:', insertValues.length);
            console.dir(insertValues, { depth: null });

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
                    account_type, data_privacy_consent, issuance_consent, customer_undertaking,
                    work_contact_code, currently_employed,
                    source_of_funds_multi, business_nature_multi,
                    work_email_address, work_landline_number, position_code, income_monthly_gross, employer_business_name
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                insertValues
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
            // Insert alternate address if provided
            if (altUnit || altBuilding || altStreet || altSubdivision || altBarangay || altCity || altProvince || altCountry || altZip) {
                await conn.execute(
                    `INSERT INTO CUSTOMER_ADDRESS (
                        cif_number, address_type_code, address_unit, address_building, address_street, address_subdivision, address_barangay, address_city, address_province, address_country, address_zip_code
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        cif_number,
                        'AD02', // Alternate address type code
                        altUnit || null,
                        altBuilding || null,
                        altStreet || null,
                        altSubdivision || null,
                        altBarangay || null,
                        altCity || null,
                        altProvince || null,
                        altCountry || null,
                        altZip || null
                    ]
                );
            }

            // Insert IDs (store both front and back images in one row per ID type)
            if (data.id1Type && data.id1Number) {
                const id1Front = getField(data, ['id1FrontImagePath', 'front-id-1_path']);
                const id1Back = getField(data, ['id1BackImagePath', 'back-id-1_path']); // Corrected: changed 'back-id-2_path' to 'back-id-1_path'
                await conn.execute(
                    `INSERT INTO CUSTOMER_ID (cif_number, id_type_code, id_number, id_issue_date, id_expiry_date, id_front_image, id_back_image)
                     VALUES (?, ?, ?, ?, ?, ?, ?)
                     ON DUPLICATE KEY UPDATE id_number = VALUES(id_number), id_issue_date = VALUES(id_issue_date), id_expiry_date = VALUES(id_expiry_date), id_front_image = VALUES(id_front_image), id_back_image = VALUES(id_back_image)`,
                    [
                        cif_number,
                        data.id1Type,
                        data.id1Number,
                        (data.id1IssueYear && data.id1IssueMonth && data.id1IssueDay) ? `${data.id1IssueYear}-${data.id1IssueMonth.padStart(2, '0')}-${data.id1IssueDay.padStart(2, '0')}` : null,
                        (data.id1ExpiryYear && data.id1ExpiryMonth && data.id1ExpiryDay) ? `${data.id1ExpiryYear}-${data.id1ExpiryMonth.padStart(2, '0')}-${data.id1ExpiryDay.padStart(2, '0')}` : null,
                        (id1Front && id1Front !== 'null' && id1Front !== '') ? id1Front : null,
                        (id1Back && id1Back !== 'null' && id1Back !== '') ? id1Back : null
                    ]
                );
            }
            if (data.id2Type && data.id2Number) {
                const id2Front = getField(data, ['id2FrontImagePath', 'front-id-2_path']);
                const id2Back = getField(data, ['id2BackImagePath', 'back-id-2_path']);
                await conn.execute(
                    `INSERT INTO CUSTOMER_ID (cif_number, id_type_code, id_number, id_issue_date, id_expiry_date, id_front_image, id_back_image)
                     VALUES (?, ?, ?, ?, ?, ?, ?)
                     ON DUPLICATE KEY UPDATE id_number = VALUES(id_number), id_issue_date = VALUES(id_issue_date), id_expiry_date = VALUES(id_expiry_date), id_front_image = VALUES(id_front_image), id_back_image = VALUES(id_back_image)`,
                    [
                        cif_number,
                        data.id2Type,
                        data.id2Number,
                        (data.id2IssueYear && data.id2IssueMonth && data.id2IssueDay) ? `${data.id2IssueYear}-${data.id2IssueMonth.padStart(2, '0')}-${data.id2IssueDay.padStart(2, '0')}` : null,
                        (data.id2ExpiryYear && data.id2ExpiryMonth && data.id2ExpiryDay) ? `${data.id2ExpiryYear}-${data.id2ExpiryMonth.padStart(2, '0')}-${data.id2ExpiryDay.padStart(2, '0')}` : null,
                        (id2Front && id2Front !== 'null' && id2Front !== '') ? id2Front : null,
                        (id2Back && id2Back !== 'null' && id2Back !== '') ? id2Back : null
                    ]
                );
            }

            await conn.commit();

            // --- ENSURE ACCOUNT IS CREATED BASED ON account_type IN CUSTOMER TABLE ---
            // Fetch the account_type from the customer table (in case it was set by default or by trigger)
            const [customerRows] = await pool.query('SELECT account_type FROM customer WHERE cif_number = ?', [cif_number]);
            if (customerRows.length > 0 && customerRows[0].account_type) {
                const accType = customerRows[0].account_type;
                let prefix;
                let normalizedType = accType.toLowerCase();
                if (normalizedType.includes('deposit')) prefix = 'DP';
                else if (normalizedType.includes('card')) prefix = 'CD';
                else if (normalizedType.includes('loan')) prefix = 'LN';
                else if (normalizedType.includes('wealth')) prefix = 'WM';
                else if (normalizedType.includes('insurance')) prefix = 'IN';
                else prefix = 'AC';
                // Check if account already exists for this type
                const [existing] = await pool.query('SELECT * FROM ACCOUNTS WHERE cif_number = ? AND account_type = ?', [cif_number, accType]);
                if (existing.length === 0) {
                    const randomDigits = Math.floor(1000 + Math.random() * 9000);
                    const account_number = `${prefix}${randomDigits}`;
                    await pool.execute(
                        'INSERT INTO ACCOUNTS (cif_number, account_number, account_type, account_status, date_opened) VALUES (?, ?, ?, ?, NOW())',
                        [cif_number, account_number, accType, 'Active']
                    );
                }
            }
            // --- END AUTO ACCOUNT CREATION ---

            res.json({ message: 'Registration successful', cif_number });
        } catch (err) {
            console.error('Registration error:', err.message);
            await conn.rollback();
            res.status(500).json({ message: 'Server error during registration.' });
        } finally {
            conn.release();
        }
    } catch (err) {
        console.error('Unexpected error:', err.message);
        res.status(500).json({ message: 'Unexpected server error.' });
    }
});

// Get all customer data by cif_number for dashboard
app.get('/api/customer/:cif_number', async (req, res) => {
    const cif_number = req.params.cif_number;
    try {
        const conn = await pool.getConnection();
        try {
            // Get main customer info
            const [customerRows] = await conn.query('SELECT * FROM customer WHERE cif_number = ?', [cif_number]);
            if (customerRows.length === 0) {
                return res.status(404).json({ message: 'Customer not found' });
            }
            // Get addresses
            const [addressRows] = await conn.query('SELECT * FROM CUSTOMER_ADDRESS WHERE cif_number = ?', [cif_number]);
            // Get employment info
            const [employmentRows] = await conn.query('SELECT * FROM CUSTOMER_EMPLOYMENT_INFORMATION WHERE cif_number = ?', [cif_number]);
            // Get IDs
            const [idRows] = await conn.query('SELECT * FROM CUSTOMER_ID WHERE cif_number = ?', [cif_number]);
            // Get accounts (if you have an accounts table)
            let accounts = [];
            try {
                const [accountRows] = await conn.query('SELECT * FROM ACCOUNTS WHERE cif_number = ?', [cif_number]);
                accounts = accountRows;
            } catch (e) {
                console.warn('Accounts table might not exist or error fetching accounts:', e.message);
            }
            res.json({
                customer: customerRows[0],
                addresses: addressRows,
                employment: employmentRows,
                ids: idRows,
                accounts: accounts
            });
        } finally {
            conn.release();
        }
    } catch (err) {
        console.error('Error fetching customer data:', err.message);
        res.status(500).json({ message: 'Server error fetching customer data.' });
    }
});

// Update customer profile
app.put('/api/customer/:cif_number', async (req, res) => {
    const cif_number = req.params.cif_number;
    const data = req.body;
    console.log('Received update request body:', req.body);

    function getField(obj, keys) {
        for (const k of keys) {
            if (obj[k] !== undefined && obj[k] !== '') return obj[k];
        }
        return null;
    }

    try {
        const conn = await pool.getConnection();
        try {
            // Fetch existing customer row
            const [existingRows] = await conn.query('SELECT * FROM customer WHERE cif_number = ?', [cif_number]);
            if (existingRows.length === 0) {
                return res.status(404).json({ message: 'Customer not found' });
            }
            const existing = existingRows[0];

            // Map all fields (same as before)
            const customer_first_name = getField(data, ['customer_first_name', 'first-name', 'firstName']);
            const customer_middle_name = getField(data, ['customer_middle_name', 'middle-name', 'middleName']);
            const customer_last_name = getField(data, ['customer_last_name', 'last-name', 'lastName']);
            const customer_suffix_name = getField(data, ['customer_suffix_name', 'suffix-name', 'suffixName']);
            let birth_date = getField(data, ['birth_date', 'date', 'birthDate']);
            if (birth_date) {
                try {
                    const dateObj = new Date(birth_date);
                    if (!isNaN(dateObj.getTime())) {
                        birth_date = dateObj.toISOString().split('T')[0];
                    } else {
                        birth_date = null;
                    }
                } catch (e) { birth_date = null; }
            }
            const gender = getField(data, ['gender']);
            const civil_status_code = getField(data, ['civil_status_code', 'civil-status', 'civilStatus']);
            const birth_country = getField(data, ['birth_country', 'country-of-birth', 'countryOfBirth']);
            const residency_status = getField(data, ['residency_status', 'residency', 'residencyStatus']);
            const citizenship = getField(data, ['citizenship']);
            const tax_identification_number = getField(data, ['tax_identification_number', 'tin-number', 'tin', 'TIN']);
            const remittance_country = getField(data, ['remittance_country', 'remittance-country', 'remittanceCountry']);
            const remittance_purpose = getField(data, ['remittance_purpose', 'remittance-purpose', 'remittancePurpose']);
            const reg_political_affiliation = getField(data, ['reg_political_affiliation', 'political_affiliation']);
            const reg_fatca = getField(data, ['reg_fatca', 'fatca']);
            const reg_dnfbp = getField(data, ['reg_dnfbp', 'dnfbp']);
            const reg_online_gaming = getField(data, ['reg_online_gaming', 'online_gaming']);
            const reg_beneficial_owner = getField(data, ['reg_beneficial_owner', 'beneficial_owner']);
            const is_alternate_address_same_as_home = (getField(data, ['is_alternate_address_same_as_home', 'alternateAddressSameAsHome']) === 'Yes' || getField(data, ['is_alternate_address_same_as_home', 'alternateAddressSameAsHome']) === true) ? 1 : 0;
            const alt_unit = getField(data, ['alt_unit', 'alt-unit']);
            const alt_building = getField(data, ['alt_building', 'alt-building']);
            const alt_street = getField(data, ['alt_street', 'alt-street']);
            const alt_subdivision = getField(data, ['alt_subdivision', 'alt-subdivision']);
            const alt_barangay = getField(data, ['alt_barangay', 'alt-barangay']);
            const alt_city = getField(data, ['alt_city', 'alt-city']);
            const alt_province = getField(data, ['alt_province', 'alt-province']);
            const alt_country = getField(data, ['alt_country', 'alt-country']);
            const alt_zip = getField(data, ['alt_zip', 'alt-zip-code', 'alt-zipcode', 'alt-zip']);
            const address_unit = getField(data, ['address_unit', 'unit']);
            const address_building = getField(data, ['address_building', 'building']);
            const address_street = getField(data, ['address_street', 'street']);
            const address_subdivision = getField(data, ['address_subdivision', 'subdivision']);
            const address_barangay = getField(data, ['address_barangay', 'barangay']);
            const address_city = getField(data, ['address_city', 'city']);
            const address_province = getField(data, ['address_province', 'province']);
            const address_country = getField(data, ['address_country', 'country']);
            const address_zip_code = getField(data, ['address_zip_code', 'zip-code', 'zipcode', 'zip']);
            const work_contact_code = getField(data, ['work_contact_code', 'work']);
            const currently_employed = getField(data, ['currently_employed', 'currentlyEmployed']);
            const source_of_funds_multi = getField(data, ['source_of_funds_multi', 'source-of-funds-multi', 'source-of-fund']);
            const business_nature_multi = getField(data, ['business_nature_multi', 'business-nature-multi', 'work-business-nature']);
            const work_email_address = getField(data, ['work_email_address', 'work-email-address', 'workEmailAddress']);
            const work_landline_number = getField(data, ['work_landline_number', 'work-landline-number', 'workLandlineNumber']);
            const position_code = getField(data, ['position_code', 'position']);
            const income_monthly_gross = getField(data, ['income_monthly_gross', 'monthly-income', 'gross_income', 'gross-income']);
            const employer_business_name = getField(data, ['employer_business_name', 'primary-employer', 'primaryEmployer']);

            // Build changed fields only
            const fieldsToUpdate = {};
            function changed(field, newVal, oldVal) {
                // Treat undefined, null, and empty string as null
                const nv = (newVal === undefined || newVal === '') ? null : newVal;
                const ov = (oldVal === undefined || oldVal === '') ? null : oldVal;
                return nv !== ov;
            }
            if (changed('customer_first_name', customer_first_name, existing.customer_first_name)) fieldsToUpdate.customer_first_name = customer_first_name;
            if (changed('customer_middle_name', customer_middle_name, existing.customer_middle_name)) fieldsToUpdate.customer_middle_name = customer_middle_name;
            if (changed('customer_last_name', customer_last_name, existing.customer_last_name)) fieldsToUpdate.customer_last_name = customer_last_name;
            if (changed('customer_suffix_name', customer_suffix_name, existing.customer_suffix_name)) fieldsToUpdate.customer_suffix_name = customer_suffix_name;
            if (changed('birth_date', birth_date, existing.birth_date && existing.birth_date.toISOString ? existing.birth_date.toISOString().split('T')[0] : existing.birth_date)) fieldsToUpdate.birth_date = birth_date;
            if (changed('gender', gender, existing.gender)) fieldsToUpdate.gender = gender;
            if (changed('civil_status_code', civil_status_code, existing.civil_status_code)) fieldsToUpdate.civil_status_code = civil_status_code;
            if (changed('birth_country', birth_country, existing.birth_country)) fieldsToUpdate.birth_country = birth_country;
            if (changed('residency_status', residency_status, existing.residency_status)) fieldsToUpdate.residency_status = residency_status;
            if (changed('citizenship', citizenship, existing.citizenship)) fieldsToUpdate.citizenship = citizenship;
            if (changed('tax_identification_number', tax_identification_number, existing.tax_identification_number)) fieldsToUpdate.tax_identification_number = tax_identification_number;
            if (changed('remittance_country', remittance_country, existing.remittance_country)) fieldsToUpdate.remittance_country = remittance_country;
            if (changed('remittance_purpose', remittance_purpose, existing.remittance_purpose)) fieldsToUpdate.remittance_purpose = remittance_purpose;
            if (changed('reg_political_affiliation', reg_political_affiliation, existing.reg_political_affiliation)) fieldsToUpdate.reg_political_affiliation = reg_political_affiliation;
            if (changed('reg_fatca', reg_fatca, existing.reg_fatca)) fieldsToUpdate.reg_fatca = reg_fatca;
            if (changed('reg_dnfbp', reg_dnfbp, existing.reg_dnfbp)) fieldsToUpdate.reg_dnfbp = reg_dnfbp;
            if (changed('reg_online_gaming', reg_online_gaming, existing.reg_online_gaming)) fieldsToUpdate.reg_online_gaming = reg_online_gaming;
            if (changed('reg_beneficial_owner', reg_beneficial_owner, existing.reg_beneficial_owner)) fieldsToUpdate.reg_beneficial_owner = reg_beneficial_owner;
            if (changed('is_alternate_address_same_as_home', is_alternate_address_same_as_home, existing.is_alternate_address_same_as_home)) fieldsToUpdate.is_alternate_address_same_as_home = is_alternate_address_same_as_home;
            if (changed('alt_unit', alt_unit, existing.alt_unit)) fieldsToUpdate.alt_unit = alt_unit;
            if (changed('alt_building', alt_building, existing.alt_building)) fieldsToUpdate.alt_building = alt_building;
            if (changed('alt_street', alt_street, existing.alt_street)) fieldsToUpdate.alt_street = alt_street;
            if (changed('alt_subdivision', alt_subdivision, existing.alt_subdivision)) fieldsToUpdate.alt_subdivision = alt_subdivision;
            if (changed('alt_barangay', alt_barangay, existing.alt_barangay)) fieldsToUpdate.alt_barangay = alt_barangay;
            if (changed('alt_city', alt_city, existing.alt_city)) fieldsToUpdate.alt_city = alt_city;
            if (changed('alt_province', alt_province, existing.alt_province)) fieldsToUpdate.alt_province = alt_province;
            if (changed('alt_country', alt_country, existing.alt_country)) fieldsToUpdate.alt_country = alt_country;
            if (changed('alt_zip', alt_zip, existing.alt_zip)) fieldsToUpdate.alt_zip = alt_zip;
            if (changed('address_unit', address_unit, existing.address_unit)) fieldsToUpdate.address_unit = address_unit;
            if (changed('address_building', address_building, existing.address_building)) fieldsToUpdate.address_building = address_building;
            if (changed('address_street', address_street, existing.address_street)) fieldsToUpdate.address_street = address_street;
            if (changed('address_subdivision', address_subdivision, existing.address_subdivision)) fieldsToUpdate.address_subdivision = address_subdivision;
            if (changed('address_barangay', address_barangay, existing.address_barangay)) fieldsToUpdate.address_barangay = address_barangay;
            if (changed('address_city', address_city, existing.address_city)) fieldsToUpdate.address_city = address_city;
            if (changed('address_province', address_province, existing.address_province)) fieldsToUpdate.address_province = address_province;
            if (changed('address_country', address_country, existing.address_country)) fieldsToUpdate.address_country = address_country;
            if (changed('address_zip_code', address_zip_code, existing.address_zip_code)) fieldsToUpdate.address_zip_code = address_zip_code;
            if (changed('work_contact_code', work_contact_code, existing.work_contact_code)) fieldsToUpdate.work_contact_code = work_contact_code;
            // For currently_employed, treat 1/0 and null/undefined/empty as equivalent
            const isEmployed = (currently_employed && String(currently_employed).toLowerCase() === 'yes') ? 1 : 0;
            if (changed('currently_employed', isEmployed, existing.currently_employed)) fieldsToUpdate.currently_employed = isEmployed;
            if (changed('source_of_funds_multi', source_of_funds_multi, existing.source_of_funds_multi)) fieldsToUpdate.source_of_funds_multi = source_of_funds_multi;
            if (changed('business_nature_multi', business_nature_multi, existing.business_nature_multi)) fieldsToUpdate.business_nature_multi = business_nature_multi;
            if (changed('work_email_address', work_email_address, existing.work_email_address)) fieldsToUpdate.work_email_address = work_email_address;
            if (changed('work_landline_number', work_landline_number, existing.work_landline_number)) fieldsToUpdate.work_landline_number = work_landline_number;
            if (changed('position_code', position_code, existing.position_code)) fieldsToUpdate.position_code = position_code;
            if (changed('income_monthly_gross', income_monthly_gross, existing.income_monthly_gross)) fieldsToUpdate.income_monthly_gross = income_monthly_gross;
            if (changed('employer_business_name', employer_business_name, existing.employer_business_name)) fieldsToUpdate.employer_business_name = employer_business_name;

            if (Object.keys(fieldsToUpdate).length > 0) {
                await conn.beginTransaction();
                const updateQueryParts = [];
                const updateValues = [];
                for (const field in fieldsToUpdate) {
                    updateQueryParts.push(`${field} = ?`);
                    updateValues.push(fieldsToUpdate[field]);
                }
                const finalUpdateQuery = `UPDATE customer SET ${updateQueryParts.join(', ')} WHERE cif_number = ?`;
                updateValues.push(cif_number);
                await conn.execute(finalUpdateQuery, updateValues);
                // ...existing code for address/employment/ID updates (if needed)...
                await conn.commit();
                res.json({ message: 'Customer profile updated successfully' });
            } else {
                res.json({ message: 'No changes detected for update.' });
            }
        } finally {
            conn.release();
        }
    } catch (err) {
        console.error('Database connection error:', err.message);
        res.status(500).json({ message: 'Database connection error.' });
    }
});


// Generate account for customer if not exists (by type)
app.post('/api/generate-account/:cif_number', async (req, res) => {
    const cif_number = req.params.cif_number;
    const type = (req.query.type || '').toLowerCase();
    let accountType, prefix;
    if (type.includes('deposit')) {
        accountType = 'Deposit';
        prefix = 'DP';
    } else if (type.includes('card')) {
        accountType = 'Card';
        prefix = 'CD';
    } else if (type.includes('loan')) {
        accountType = 'Loan';
        prefix = 'LN';
    } else if (type.includes('wealth')) {
        accountType = 'Wealth Management';
        prefix = 'WM';
    } else if (type.includes('insurance')) {
        accountType = 'Insurance';
        prefix = 'IN';
    } else {
        return res.status(400).json({ message: 'Unsupported account type.' });
    }
    try {
        const conn = await pool.getConnection();
        try {
            const [existing] = await conn.query('SELECT * FROM ACCOUNTS WHERE cif_number = ? AND account_type = ?', [cif_number, accountType]);
            if (existing.length > 0) {
                return res.json({ message: 'Account already exists.', account: existing[0] });
            }
            const randomDigits = Math.floor(1000 + Math.random() * 9000);
            const account_number = `${cif_number}${prefix}${randomDigits}`;
            await conn.execute(
                'INSERT INTO ACCOUNTS (cif_number, account_number, account_type, account_status, date_opened) VALUES (?, ?, ?, ?, NOW())',
                [cif_number, account_number, accountType, 'Active']
            );
            const [rows] = await conn.query('SELECT * FROM ACCOUNTS WHERE cif_number = ? AND account_type = ?', [cif_number, accountType]);
            res.json({ message: 'Account generated.', account: rows[0] });
        } finally {
            conn.release();
        }
    } catch (err) {
        res.status(500).json({ message: 'Error generating account', error: err.message });
    }
});

// Backfill accounts for all customers based on their account_type
app.post('/api/backfill-accounts', async (req, res) => {
    try {
        const conn = await pool.getConnection();
        try {
            const [customers] = await conn.query('SELECT cif_number, account_type FROM customer WHERE account_type IS NOT NULL AND account_type != ""');
            let created = 0;
            for (const customer of customers) {
                const { cif_number, account_type } = customer;
                let prefix;
                let normalizedType = (account_type || '').toLowerCase();
                if (normalizedType.includes('deposit')) prefix = 'DP';
                else if (normalizedType.includes('card')) prefix = 'CD';
                else if (normalizedType.includes('loan')) prefix = 'LN';
                else if (normalizedType.includes('wealth')) prefix = 'WM';
                else if (normalizedType.includes('insurance')) prefix = 'IN';
                else prefix = 'AC';
                const [existing] = await conn.query('SELECT * FROM ACCOUNTS WHERE cif_number = ? AND account_type = ?', [cif_number, account_type]);
                if (existing.length === 0) {
                    const randomDigits = Math.floor(1000 + Math.random() * 9000);
                    const account_number = `${prefix}${randomDigits}`;
                    await conn.execute(
                        'INSERT INTO ACCOUNTS (cif_number, account_number, account_type, account_status, date_opened) VALUES (?, ?, ?, ?, NOW())',
                        [cif_number, account_number, account_type, 'Active']
                    );
                    created++;
                }
            }
            res.json({ message: `Backfill complete. ${created} accounts created.` });
        } finally {
            conn.release();
        }
    } catch (err) {
        console.error('Error during backfill:', err);
        res.status(500).json({ message: 'Error during backfill', error: err.message });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
