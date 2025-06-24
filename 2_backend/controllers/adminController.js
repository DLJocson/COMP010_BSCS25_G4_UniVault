const { pool } = require('../config/database');

// Get dashboard statistics
const getDashboardStats = async (req, res, next) => {
    try {
        const [totalCustomers] = await pool.query('SELECT COUNT(*) as count FROM CUSTOMER WHERE is_deleted = FALSE');
        const [verifiedCustomers] = await pool.query('SELECT COUNT(*) as count FROM CUSTOMER WHERE customer_status = "Active" AND is_deleted = FALSE');
        const [pendingVerifications] = await pool.query('SELECT COUNT(*) as count FROM CUSTOMER WHERE customer_status = "Pending Verification" AND is_deleted = FALSE');
        const [newAccounts] = await pool.query('SELECT COUNT(*) as count FROM CUSTOMER WHERE DATE(created_at) = CURDATE() AND is_deleted = FALSE');
        const [rejectedApplications] = await pool.query('SELECT COUNT(*) as count FROM CUSTOMER WHERE customer_status = "Suspended" AND is_deleted = FALSE');
        const [pendingApprovals] = await pool.query('SELECT COUNT(*) as count FROM CUSTOMER WHERE customer_status = "Inactive" AND is_deleted = FALSE');
        
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
        next(err);
    }
};

// Get all customers
const getAllCustomers = async (req, res, next) => {
    try {
        const { search } = req.query;
        let query = `
            SELECT 
                c.cif_number, c.customer_type, c.customer_first_name, c.customer_last_name, 
                c.customer_middle_name, c.customer_suffix_name, c.customer_username, 
                c.customer_status, c.created_at,
                cd.contact_value as email, cd2.contact_value as phone
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
        next(err);
    }
};

// Get customer details
const getCustomerDetails = async (req, res, next) => {
    try {
        const { cif_number } = req.params;
        
        // Get main customer information
        const [customerRows] = await pool.query(`
            SELECT c.*, cst.civil_status_description, c.customer_status, c.customer_type
            FROM CUSTOMER c
            LEFT JOIN CIVIL_STATUS_TYPE cst ON c.civil_status_code = cst.civil_status_code
            WHERE c.cif_number = ? AND c.is_deleted = FALSE
        `, [cif_number]);
        
        if (customerRows.length === 0) {
            return res.status(404).json({ message: 'Customer not found' });
        }
        
        const customer = customerRows[0];
        
        // Get related data
        const [addresses] = await pool.query(`
            SELECT ca.*, at.address_type
            FROM CUSTOMER_ADDRESS ca
            LEFT JOIN ADDRESS_TYPE at ON ca.address_type_code = at.address_type_code
            WHERE ca.cif_number = ?
        `, [cif_number]);
        
        const [contacts] = await pool.query(`
            SELECT ccd.*, ct.contact_type_description
            FROM CUSTOMER_CONTACT_DETAILS ccd
            LEFT JOIN CONTACT_TYPE ct ON ccd.contact_type_code = ct.contact_type_code
            WHERE ccd.cif_number = ?
        `, [cif_number]);
        
        const [employment] = await pool.query(`
            SELECT cei.*, ep.employment_type, ep.job_title
            FROM CUSTOMER_EMPLOYMENT_INFORMATION cei
            LEFT JOIN EMPLOYMENT_POSITION ep ON cei.position_code = ep.position_code
            WHERE cei.cif_number = ?
        `, [cif_number]);
        
        const [ids] = await pool.query(`
            SELECT ci.*, it.id_description
            FROM CUSTOMER_ID ci
            LEFT JOIN ID_TYPE it ON ci.id_type_code = it.id_type_code
            WHERE ci.cif_number = ?
        `, [cif_number]);
        
        res.json({
            customer,
            addresses,
            contacts,
            employment,
            ids
        });
    } catch (err) {
        console.error('Error fetching customer details:', err);
        next(err);
    }
};

// Verify customer
const verifyCustomer = async (req, res, next) => {
    try {
        const { cif_number } = req.params;
        const { action } = req.body;
        
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
        next(err);
    }
};

// Close customer account
const closeCustomerAccount = async (req, res, next) => {
    try {
        const { cif_number } = req.params;
        const { employee_id } = req.body;
        
        await pool.query(
            'UPDATE CUSTOMER SET is_deleted = TRUE, deleted_at = CURRENT_TIMESTAMP, deleted_by = ? WHERE cif_number = ?',
            [employee_id, cif_number]
        );
        
        res.json({ message: 'Account closed successfully' });
    } catch (err) {
        console.error('Error closing account:', err);
        next(err);
    }
};

module.exports = {
    getDashboardStats,
    getAllCustomers,
    getCustomerDetails,
    verifyCustomer,
    closeCustomerAccount
};
