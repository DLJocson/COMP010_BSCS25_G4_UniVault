const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');

// Customer registration controller
const registerCustomer = async (req, res, next) => {
    const conn = await pool.getConnection();
    
    try {
        await conn.beginTransaction();
        
        const data = req.body;
        const {
            customer_type, customer_last_name, customer_first_name, customer_middle_name,
            customer_suffix_name, customer_username, customer_password, birth_date,
            gender, civil_status_code, birth_country, citizenship,
            reg_political_affiliation, reg_fatca, reg_dnfbp, reg_online_gaming,
            reg_beneficial_owner, biometric_type, remittance_country, remittance_purpose
        } = data;

        // Hash the password
        const password_hash = await bcrypt.hash(customer_password, 10);

        // Insert into CUSTOMER
        const [result] = await conn.execute(
            `INSERT INTO customer (
                customer_type, customer_last_name, customer_first_name, customer_middle_name, customer_suffix_name,
                customer_username, customer_password, birth_date, gender, civil_status_code,
                birth_country, citizenship,
                reg_political_affiliation, reg_fatca, reg_dnfbp, reg_online_gaming, reg_beneficial_owner,
                biometric_type, remittance_country, remittance_purpose
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                customer_type, customer_last_name, customer_first_name,
                customer_middle_name || null, customer_suffix_name || null,
                customer_username, password_hash, birth_date, gender, civil_status_code,
                birth_country, citizenship,
                reg_political_affiliation || null, reg_fatca || null, reg_dnfbp || null,
                reg_online_gaming || null, reg_beneficial_owner || null,
                biometric_type || null, remittance_country || null, remittance_purpose || null
            ]
        );

        const cif_number = result.insertId;

        // Insert address (home address)
        await conn.execute(
            `INSERT INTO CUSTOMER_ADDRESS (
                cif_number, address_type_code, address_unit, address_building, address_street,
                address_subdivision, address_barangay, address_city, address_province, address_country, address_zip_code
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                cif_number, 'AD01', data.address_unit || null, data.address_building || null,
                data.address_street || null, data.address_subdivision || null, data.address_barangay || null,
                data.address_city || null, data.address_province || null, data.address_country || null,
                data.address_zip_code || null
            ]
        );

        // Insert alternate address if provided
        if (data.altUnit || data.altBuilding || data.altStreet || data.altSubdivision || 
            data.altBarangay || data.altCity || data.altProvince || data.altCountry || data.altZip) {
            await conn.execute(
                `INSERT INTO CUSTOMER_ADDRESS (
                    cif_number, address_type_code, address_unit, address_building, address_street,
                    address_subdivision, address_barangay, address_city, address_province, address_country, address_zip_code
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    cif_number, 'AD02', data.altUnit || null, data.altBuilding || null,
                    data.altStreet || null, data.altSubdivision || null, data.altBarangay || null,
                    data.altCity || null, data.altProvince || null, data.altCountry || null,
                    data.altZip || null
                ]
            );
        }

        // Insert additional data (IDs, contacts, employment, etc.)
        await insertCustomerDetails(conn, cif_number, data);

        await conn.commit();
        res.status(201).json({ 
            message: 'Registration successful! You can now log in.', 
            cif_number 
        });
        
    } catch (error) {
        await conn.rollback();
        console.error('Registration error:', error);
        next(error);
    } finally {
        conn.release();
    }
};

// Get customer information
const getCustomer = async (req, res, next) => {
    try {
        const { cif_number } = req.params;
        
        const [rows] = await pool.query(
            `SELECT cif_number, customer_type, customer_last_name, customer_first_name, 
             customer_middle_name, customer_suffix_name, customer_username, birth_date, 
             gender, civil_status_code, birth_country, citizenship, biometric_type
             FROM customer WHERE cif_number = ?`,
            [cif_number]
        );
        
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Customer not found.' });
        }
        
        const customer = rows[0];
        
        // Fetch addresses
        const [addresses] = await pool.query(
            `SELECT address_type_code, address_unit, address_building, address_street, 
             address_subdivision, address_barangay, address_city, address_province, address_country, address_zip_code
             FROM CUSTOMER_ADDRESS WHERE cif_number = ?`,
            [cif_number]
        );
        
        customer.addresses = addresses;
        res.json(customer);
        
    } catch (err) {
        console.error('Fetch customer error:', err);
        next(err);
    }
};

// Helper function to insert customer details
async function insertCustomerDetails(conn, cif_number, data) {
    // Insert IDs
    if (data.id1Type && data.id1Number) {
        let id1Storage = data.id1FrontImagePath;
        if (!id1Storage || id1Storage === 'null' || id1Storage === '') id1Storage = null;
        
        await conn.execute(
            `INSERT INTO CUSTOMER_ID (cif_number, id_type_code, id_number, id_storage, id_issue_date, id_expiry_date)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                cif_number, data.id1Type, data.id1Number, id1Storage,
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
                cif_number, data.id2Type, data.id2Number, id2Storage,
                `${data.id2IssueYear}-${data.id2IssueMonth.padStart(2, '0')}-${data.id2IssueDay.padStart(2, '0')}`,
                `${data.id2ExpiryYear}-${data.id2ExpiryMonth.padStart(2, '0')}-${data.id2ExpiryDay.padStart(2, '0')}`
            ]
        );
    }

    // Insert contact details
    if (data.contact_type_code && data.contact_value) {
        await conn.execute(
            `INSERT INTO CUSTOMER_CONTACT_DETAILS (cif_number, contact_type_code, contact_value)
             VALUES (?, ?, ?)`,
            [cif_number, data.contact_type_code, data.contact_value]
        );
    }

    // Insert employment info
    if (data.employer_business_name && data.position_code) {
        await conn.execute(
            `INSERT INTO CUSTOMER_EMPLOYMENT_INFORMATION (cif_number, employer_business_name, employment_start_date, employment_end_date, employment_status, position_code, income_monthly_gross)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                cif_number, data.employer_business_name, data.employment_start_date,
                data.employment_end_date || null, data.employment_status || 'Current',
                data.position_code, data.income_monthly_gross || 0
            ]
        );
    }

    // Insert fund source
    if (data.fund_source_code) {
        await conn.execute(
            `INSERT INTO CUSTOMER_FUND_SOURCE (cif_number, fund_source_code)
             VALUES (?, ?)`,
            [cif_number, data.fund_source_code]
        );
    }

    // Insert work nature
    if (data.customer_employment_id && data.work_nature_code) {
        await conn.execute(
            `INSERT INTO CUSTOMER_WORK_NATURE (customer_employment_id, work_nature_code)
             VALUES (?, ?)`,
            [data.customer_employment_id, data.work_nature_code]
        );
    }

    // Insert alias
    if (data.alias_first_name && data.alias_last_name) {
        await conn.execute(
            `INSERT INTO CUSTOMER_ALIAS (cif_number) VALUES (?)`,
            [cif_number]
        );
    }
}

module.exports = {
    registerCustomer,
    getCustomer
};
