const express = require('express');
const router = express.Router();
const { 
    getDashboardStats, 
    getAllCustomers, 
    getCustomerDetails, 
    verifyCustomer, 
    closeCustomerAccount,
    updateCustomerStatus,
    getCustomerAccounts,
    getCustomersWithClosedAccounts
} = require('../controllers/adminController');

// Dashboard statistics
router.get('/dashboard-stats', getDashboardStats);

// Customer management
router.get('/customers', getAllCustomers);
router.get('/customers/closed-accounts', getCustomersWithClosedAccounts);
router.get('/customer/:cif_number/details', getCustomerDetails);
router.get('/customer/:cif_number/accounts', getCustomerAccounts);
router.post('/customer/:cif_number/verify', verifyCustomer);
router.post('/customer/:cif_number/close', closeCustomerAccount);
router.put('/customer/:cif_number/status', updateCustomerStatus);

// Pending verifications
router.get('/pending-verifications', async (req, res, next) => {
    try {
        const { pool } = require('../config/database');
        const [verifications] = await pool.query(`
            SELECT 
                c.cif_number, c.customer_type, c.customer_first_name, c.customer_last_name,
                c.customer_middle_name, c.customer_suffix_name, c.created_at,
                cd.contact_value as email, cd2.contact_value as phone, c.customer_status
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
        next(err);
    }
});

// Close requests (account closure requests)
router.get('/close-requests', async (req, res, next) => {
    try {
        const { pool } = require('../config/database');
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
                c.customer_suffix_name,
                cd.contact_value as email,
                cd2.contact_value as phone
            FROM CLOSE_REQUEST cr
            INNER JOIN CUSTOMER c ON cr.cif_number = c.cif_number
            LEFT JOIN CUSTOMER_CONTACT_DETAILS cd ON c.cif_number = cd.cif_number AND cd.contact_type_code = 'CT01'
            LEFT JOIN CUSTOMER_CONTACT_DETAILS cd2 ON c.cif_number = cd2.cif_number AND cd2.contact_type_code = 'CT02'
            WHERE c.is_deleted = FALSE AND cr.request_status = 'Pending'
            ORDER BY cr.request_date DESC
            LIMIT 100
        `);
        
        res.json(closeRequests);
    } catch (err) {
        console.error('Error fetching close requests:', err);
        next(err);
    }
});

// Closed accounts
router.get('/closed-accounts', async (req, res, next) => {
    try {
        const { pool } = require('../config/database');
        const [closedAccounts] = await pool.query(`
            SELECT 
                c.cif_number, c.customer_type, c.customer_first_name, c.customer_last_name,
                c.customer_middle_name, c.customer_suffix_name, c.deleted_at as closed_date, c.customer_status
            FROM CUSTOMER c
            WHERE c.is_deleted = TRUE
            ORDER BY c.deleted_at DESC
            LIMIT 100
        `);
        
        res.json(closedAccounts);
    } catch (err) {
        console.error('Error fetching closed accounts:', err);
        next(err);
    }
});

// Employee management
router.get('/employees', async (req, res, next) => {
    try {
        const { search } = req.query;
        const { pool } = require('../config/database');
        
        let query = `
            SELECT 
                employee_id,
                employee_username,
                employee_first_name,
                employee_last_name,
                employee_middle_name,
                employee_suffix_name,
                employee_position
            FROM BANK_EMPLOYEE
        `;
        let params = [];
        
        if (search) {
            query += ` WHERE (employee_first_name LIKE ? OR employee_last_name LIKE ? OR employee_username LIKE ? OR employee_position LIKE ?)`;
            const searchParam = `%${search}%`;
            params = [searchParam, searchParam, searchParam, searchParam];
        }
        
        query += ` ORDER BY employee_id ASC LIMIT 100`;
        
        const [employees] = await pool.query(query, params);
        res.json(employees);
    } catch (err) {
        console.error('Error fetching employees:', err);
        next(err);
    }
});

// Universal search endpoint
router.get('/search', async (req, res, next) => {
    try {
        const { term, type = 'customers' } = req.query;
        const { pool } = require('../config/database');
        
        if (!term || term.length < 2) {
            return res.json([]);
        }
        
        const searchTerm = `%${term}%`;
        let query = '';
        let params = [];
        
        switch (type) {
            case 'customers':
                query = `
                    SELECT 
                        c.cif_number, c.customer_type, c.customer_first_name, c.customer_last_name,
                        c.customer_middle_name, c.customer_suffix_name, c.customer_status,
                        cd.contact_value as email, cd2.contact_value as phone
                    FROM CUSTOMER c
                    LEFT JOIN CUSTOMER_CONTACT_DETAILS cd ON c.cif_number = cd.cif_number AND cd.contact_type_code = 'CT01'
                    LEFT JOIN CUSTOMER_CONTACT_DETAILS cd2 ON c.cif_number = cd2.cif_number AND cd2.contact_type_code = 'CT02'
                    WHERE c.is_deleted = FALSE AND (
                        c.cif_number LIKE ? OR
                        c.customer_first_name LIKE ? OR
                        c.customer_last_name LIKE ? OR
                        c.customer_middle_name LIKE ? OR
                        cd.contact_value LIKE ? OR
                        cd2.contact_value LIKE ?
                    )
                    ORDER BY c.customer_last_name, c.customer_first_name
                    LIMIT 50
                `;
                params = [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm];
                break;
                
            case 'employees':
                query = `
                    SELECT 
                        employee_id, employee_username, employee_first_name, employee_last_name,
                        employee_middle_name, employee_suffix_name, employee_position
                    FROM BANK_EMPLOYEE
                    WHERE (
                        employee_id LIKE ? OR
                        employee_first_name LIKE ? OR
                        employee_last_name LIKE ? OR
                        employee_middle_name LIKE ? OR
                        employee_position LIKE ? OR
                        employee_username LIKE ?
                    )
                    ORDER BY employee_last_name, employee_first_name
                    LIMIT 50
                `;
                params = [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm];
                break;
                
            case 'pending':
                query = `
                    SELECT 
                        c.cif_number, c.customer_type, c.customer_first_name, c.customer_last_name,
                        c.customer_middle_name, c.customer_suffix_name, c.created_at,
                        cd.contact_value as email, cd2.contact_value as phone, c.customer_status
                    FROM CUSTOMER c
                    LEFT JOIN CUSTOMER_CONTACT_DETAILS cd ON c.cif_number = cd.cif_number AND cd.contact_type_code = 'CT01'
                    LEFT JOIN CUSTOMER_CONTACT_DETAILS cd2 ON c.cif_number = cd2.cif_number AND cd2.contact_type_code = 'CT02'
                    WHERE c.customer_status = 'Pending Verification' AND c.is_deleted = FALSE AND (
                        c.cif_number LIKE ? OR
                        c.customer_first_name LIKE ? OR
                        c.customer_last_name LIKE ? OR
                        c.customer_middle_name LIKE ? OR
                        cd.contact_value LIKE ? OR
                        cd2.contact_value LIKE ?
                    )
                    ORDER BY c.created_at ASC
                    LIMIT 50
                `;
                params = [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm];
                break;
                
            case 'closed':
                query = `
                    SELECT 
                        c.cif_number, c.customer_type, c.customer_first_name, c.customer_last_name,
                        c.customer_middle_name, c.customer_suffix_name, c.deleted_at as closed_date, c.customer_status
                    FROM CUSTOMER c
                    WHERE c.is_deleted = TRUE AND (
                        c.cif_number LIKE ? OR
                        c.customer_first_name LIKE ? OR
                        c.customer_last_name LIKE ? OR
                        c.customer_middle_name LIKE ?
                    )
                    ORDER BY c.deleted_at DESC
                    LIMIT 50
                `;
                params = [searchTerm, searchTerm, searchTerm, searchTerm];
                break;
                
            default:
                return res.status(400).json({ message: 'Invalid search type' });
        }
        
        const [results] = await pool.query(query, params);
        res.json(results);
    } catch (err) {
        console.error('Error performing search:', err);
        next(err);
    }
});

// Add endpoints with /admin prefix for compatibility with existing frontend code
router.get('/admin/pending-verifications', async (req, res, next) => {
    try {
        const { pool } = require('../config/database');
        const [verifications] = await pool.query(`
            SELECT 
                c.cif_number, c.customer_type, c.customer_first_name, c.customer_last_name,
                c.customer_middle_name, c.customer_suffix_name, c.created_at,
                cd.contact_value as email, cd2.contact_value as phone, c.customer_status
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
        next(err);
    }
});

router.get('/admin/close-requests', async (req, res, next) => {
    try {
        const { pool } = require('../config/database');
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
                c.customer_suffix_name,
                cd.contact_value as email,
                cd2.contact_value as phone
            FROM CLOSE_REQUEST cr
            INNER JOIN CUSTOMER c ON cr.cif_number = c.cif_number
            LEFT JOIN CUSTOMER_CONTACT_DETAILS cd ON c.cif_number = cd.cif_number AND cd.contact_type_code = 'CT01'
            LEFT JOIN CUSTOMER_CONTACT_DETAILS cd2 ON c.cif_number = cd2.cif_number AND cd2.contact_type_code = 'CT02'
            WHERE c.is_deleted = FALSE AND cr.request_status = 'Pending'
            ORDER BY cr.request_date DESC
            LIMIT 100
        `);
        
        res.json(closeRequests);
    } catch (err) {
        console.error('Error fetching close requests:', err);
        next(err);
    }
});

module.exports = router;
