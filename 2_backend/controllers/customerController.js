const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');

// Customer registration controller
// Get customer accounts
const getCustomerAccounts = async (req, res, next) => {
    try {
        const { cif_number } = req.params;
        
        const [accounts] = await pool.query(
            `SELECT 
                ad.account_number,
                pt.product_type_name as account_type,
                ad.account_status,
                ad.account_open_date,
                ad.account_close_date,
                ad.referral_type
            FROM CUSTOMER_ACCOUNT ca
            JOIN ACCOUNT_DETAILS ad ON ca.account_number = ad.account_number
            JOIN CUSTOMER_PRODUCT_TYPE pt ON ad.product_type_code = pt.product_type_code
            WHERE ca.cif_number = ?
            ORDER BY ad.account_open_date DESC`,
            [cif_number]
        );
        
        // Always return success with accounts array (empty if no accounts found)
        res.json({
            cif_number: cif_number,
            accounts: accounts,
            message: accounts.length === 0 ? 'No accounts found for this customer.' : `${accounts.length} account(s) found.`
        });
        
    } catch (err) {
        console.error('Fetch customer accounts error:', err);
        next(err);
    }
};

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
            reg_beneficial_owner, remittance_country, remittance_purpose
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
                remittance_country, remittance_purpose
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                customer_type, customer_last_name, customer_first_name,
                customer_middle_name || null, customer_suffix_name || null,
                customer_username, password_hash, birth_date, gender, civil_status_code,
                birth_country, citizenship,
                reg_political_affiliation || null, reg_fatca || null, reg_dnfbp || null,
                reg_online_gaming || null, reg_beneficial_owner || null,
                remittance_country || null, remittance_purpose || null
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
             gender, civil_status_code, birth_country, citizenship
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

// Get customers with closed accounts
const getCustomersWithClosedAccounts = async (req, res, next) => {
    try {
        const [customers] = await pool.query(
            `SELECT DISTINCT 
                c.cif_number,
                c.customer_last_name,
                c.customer_first_name,
                c.customer_middle_name,
                c.customer_suffix_name,
                c.customer_type,
                c.customer_status,
                GROUP_CONCAT(
                    CONCAT(
                        ad.account_number, '|',
                        pt.product_type_name, '|',
                        ad.account_status, '|',
                        ad.account_open_date, '|',
                        IFNULL(ad.account_close_date, '')
                    ) SEPARATOR ';'
                ) as closed_accounts
            FROM CUSTOMER c
            JOIN CUSTOMER_ACCOUNT ca ON c.cif_number = ca.cif_number
            JOIN ACCOUNT_DETAILS ad ON ca.account_number = ad.account_number
            JOIN CUSTOMER_PRODUCT_TYPE pt ON ad.product_type_code = pt.product_type_code
            WHERE ad.account_status = 'Closed'
            GROUP BY c.cif_number
            ORDER BY c.customer_last_name, c.customer_first_name`,
            []
        );
        
        // Transform the data to separate accounts
        const customersWithClosedAccounts = customers.map(customer => {
            const accounts = customer.closed_accounts.split(';').map(accountStr => {
                const [account_number, account_type, account_status, account_open_date, account_close_date] = accountStr.split('|');
                return {
                    account_number,
                    account_type,
                    account_status,
                    account_open_date,
                    account_close_date: account_close_date || null
                };
            });
            
            const { closed_accounts, ...customerInfo } = customer;
            return {
                ...customerInfo,
                closed_accounts: accounts
            };
        });
        
        res.json(customersWithClosedAccounts);
        
    } catch (err) {
        console.error('Fetch customers with closed accounts error:', err);
        next(err);
    }
};

// Get customer profile data
const getCustomerProfile = async (req, res, next) => {
    try {
        const { cif_number } = req.params;
        
        const [rows] = await pool.query(
            `SELECT cif_number, customer_type, customer_last_name, customer_first_name, 
             customer_middle_name, customer_suffix_name, birth_date, 
             gender, birth_country, citizenship, customer_status
             FROM CUSTOMER WHERE cif_number = ?`,
            [cif_number]
        );
        
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Customer not found.' });
        }
        
        res.json(rows[0]);
        
    } catch (err) {
        console.error('Fetch customer profile error:', err);
        next(err);
    }
};

// Get customer profile update request (placeholder - would need actual update request table)
const getCustomerProfileUpdateRequest = async (req, res, next) => {
    try {
        const { cif_number } = req.params;
        
        // For now, return null since we don't have profile update requests table
        // In a real implementation, you would query a PROFILE_UPDATE_REQUESTS table
        res.status(404).json({ message: 'No profile update requests found' });
        
    } catch (err) {
        console.error('Fetch profile update request error:', err);
        next(err);
    }
};

// Get customer documents
const getCustomerDocuments = async (req, res, next) => {
    try {
        const { cif_number } = req.params;
        
        const [documents] = await pool.query(
            `SELECT 
                ci.id_type_code,
                it.id_description as document_type,
                ci.id_number,
                ci.id_issue_date as issue_date,
                ci.id_expiry_date as expiry_date,
                ci.id_storage as document_path
            FROM CUSTOMER_ID ci
            JOIN ID_TYPE it ON ci.id_type_code = it.id_type_code
            WHERE ci.cif_number = ?
            ORDER BY ci.id_issue_date DESC`,
            [cif_number]
        );
        
        res.json(documents);
        
    } catch (err) {
        console.error('Fetch customer documents error:', err);
        next(err);
    }
};

// Process profile update approval/rejection
const processProfileUpdate = async (req, res, next) => {
    try {
        const { cif_number, action } = req.params;
        const { employee_id, reason, timestamp } = req.body;
        
        if (action !== 'approve' && action !== 'reject') {
            return res.status(400).json({ message: 'Invalid action. Must be approve or reject.' });
        }
        
        // For now, just log the action since we don't have profile update requests
        console.log(`Profile update ${action} for CIF ${cif_number} by employee ${employee_id}`);
        
        res.json({ 
            message: `Profile update ${action}d successfully`,
            cif_number,
            action,
            processed_by: employee_id,
            timestamp
        });
        
    } catch (err) {
        console.error('Process profile update error:', err);
        next(err);
    }
};

// Process account closure approval/rejection
const processAccountClosure = async (req, res, next) => {
    const conn = await pool.getConnection();
    
    try {
        const { cif_number, action } = req.params;
        const { account_numbers, employee_id, reason, timestamp } = req.body;
        
        if (action !== 'approve' && action !== 'reject') {
            return res.status(400).json({ message: 'Invalid action. Must be approve or reject.' });
        }
        
        if (!account_numbers || !Array.isArray(account_numbers) || account_numbers.length === 0) {
            return res.status(400).json({ message: 'Account numbers are required.' });
        }
        
        await conn.beginTransaction();
        
        if (action === 'approve') {
            // Update account status to Closed
            const placeholders = account_numbers.map(() => '?').join(',');
            const [result] = await conn.execute(
                `UPDATE ACCOUNT_DETAILS ad
                 JOIN CUSTOMER_ACCOUNT ca ON ad.account_number = ca.account_number
                 SET ad.account_status = 'Closed', ad.account_close_date = CURRENT_DATE
                 WHERE ca.cif_number = ? AND ad.account_number IN (${placeholders})`,
                [cif_number, ...account_numbers]
            );
            
            if (result.affectedRows === 0) {
                throw new Error('No accounts were found to close');
            }
            
            // Log the closure in review queue or audit table
            for (const accountNumber of account_numbers) {
                await conn.execute(
                    `INSERT INTO REVIEW_QUEUE (account_number, cif_number, request_type, request_timestamp, request_details, review_status, reviewed_by_employee_id, review_comment, review_date)
                     VALUES (?, ?, 'ACCOUNT_CLOSURE', NOW(), ?, 'APPROVED', ?, ?, CURDATE())`,
                    [accountNumber, cif_number, `Account closure approved: ${reason}`, employee_id, reason]
                );
            }
        } else {
            // Log the rejection
            for (const accountNumber of account_numbers) {
                await conn.execute(
                    `INSERT INTO REVIEW_QUEUE (account_number, cif_number, request_type, request_timestamp, request_details, review_status, reviewed_by_employee_id, review_comment, review_date)
                     VALUES (?, ?, 'ACCOUNT_CLOSURE', NOW(), ?, 'REJECTED', ?, ?, CURDATE())`,
                    [accountNumber, cif_number, `Account closure rejected: ${reason}`, employee_id, reason]
                );
            }
        }
        
        await conn.commit();
        
        res.json({ 
            message: `Account closure ${action}d successfully`,
            cif_number,
            action,
            account_numbers,
            processed_by: employee_id,
            timestamp
        });
        
    } catch (err) {
        await conn.rollback();
        console.error('Process account closure error:', err);
        next(err);
    } finally {
        conn.release();
    }
};

module.exports = {
    registerCustomer,
    getCustomer,
    getCustomerAccounts,
    getCustomersWithClosedAccounts,
    getCustomerProfile,
    getCustomerProfileUpdateRequest,
    getCustomerDocuments,
    processProfileUpdate,
    processAccountClosure
};
