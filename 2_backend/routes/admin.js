const express = require('express');
const router = express.Router();
const { 
    getDashboardStats, 
    getAllCustomers, 
    getCustomerDetails, 
    verifyCustomer, 
    closeCustomerAccount 
} = require('../controllers/adminController');

// Dashboard statistics
router.get('/dashboard-stats', getDashboardStats);

// Customer management
router.get('/customers', getAllCustomers);
router.get('/customer/:cif_number/details', getCustomerDetails);
router.post('/customer/:cif_number/verify', verifyCustomer);
router.post('/customer/:cif_number/close', closeCustomerAccount);

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

module.exports = router;
