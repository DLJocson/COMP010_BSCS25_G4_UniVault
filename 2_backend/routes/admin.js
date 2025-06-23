const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const router = express.Router();

// Get review queue (pending items)
router.get('/review-queue', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { type = 'all', limit = 50, offset = 0 } = req.query;

        let pendingItems = {
            customers: [],
            accounts: [],
            transactions: [],
            closures: []
        };

        // Get pending customer registrations
        if (type === 'all' || type === 'customers') {
            const [customers] = await req.db.query(`
                SELECT c.*, cst.civil_status_description
                FROM customer c
                LEFT JOIN civil_status_type cst ON c.civil_status_code = cst.civil_status_code
                WHERE c.status = 'PENDING'
                ORDER BY c.registration_date ASC
                LIMIT ? OFFSET ?
            `, [parseInt(limit), parseInt(offset)]);
            pendingItems.customers = customers;
        }

        // Get pending account applications
        if (type === 'all' || type === 'accounts') {
            const [accounts] = await req.db.query(`
                SELECT a.*, at.account_type_description, 
                       c.first_name, c.last_name, c.email
                FROM account a
                LEFT JOIN account_type at ON a.account_type_code = at.account_type_code
                LEFT JOIN customer c ON a.customer_id = c.customer_id
                WHERE a.account_status_code = 'PENDING'
                ORDER BY a.account_creation_date ASC
                LIMIT ? OFFSET ?
            `, [parseInt(limit), parseInt(offset)]);
            pendingItems.accounts = accounts;
        }

        // Get pending transactions (if any require approval)
        if (type === 'all' || type === 'transactions') {
            const [transactions] = await req.db.query(`
                SELECT t.*, a.account_number, 
                       c.first_name, c.last_name, c.email,
                       tt.transaction_type_description
                FROM transaction t
                LEFT JOIN account a ON t.account_id = a.account_id
                LEFT JOIN customer c ON a.customer_id = c.customer_id
                LEFT JOIN transaction_type tt ON t.transaction_type_code = tt.transaction_type_code
                WHERE t.transaction_status_code = 'PENDING'
                ORDER BY t.transaction_date ASC
                LIMIT ? OFFSET ?
            `, [parseInt(limit), parseInt(offset)]);
            pendingItems.transactions = transactions;
        }

        // Get pending account closure requests
        if (type === 'all' || type === 'closures') {
            const [closures] = await req.db.query(`
                SELECT acr.*, a.account_number, a.account_id,
                       c.first_name, c.last_name, c.email
                FROM account_closure_request acr
                LEFT JOIN account a ON acr.account_id = a.account_id
                LEFT JOIN customer c ON acr.customer_id = c.customer_id
                WHERE acr.status = 'PENDING'
                ORDER BY acr.request_date ASC
                LIMIT ? OFFSET ?
            `, [parseInt(limit), parseInt(offset)]);
            pendingItems.closures = closures;
        }

        // Get summary counts
        const [summaryCounts] = await req.db.query(`
            SELECT 
                (SELECT COUNT(*) FROM customer WHERE status = 'PENDING') as pending_customers,
                (SELECT COUNT(*) FROM account WHERE account_status_code = 'PENDING') as pending_accounts,
                (SELECT COUNT(*) FROM transaction WHERE transaction_status_code = 'PENDING') as pending_transactions,
                (SELECT COUNT(*) FROM account_closure_request WHERE status = 'PENDING') as pending_closures
        `);

        res.json({
            summary: summaryCounts[0],
            pending_items: pendingItems,
            pagination: {
                limit: parseInt(limit),
                offset: parseInt(offset)
            }
        });

    } catch (error) {
        console.error('Get review queue error:', error);
        res.status(500).json({ error: 'Failed to fetch review queue' });
    }
});

// Approve customer registration
router.put('/customers/:customerId/approve', authenticateToken, requireAdmin, [
    body('notes').optional().isLength({ max: 500 }).withMessage('Notes too long')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { customerId } = req.params;
        const { notes } = req.body;
        const adminId = req.user.userId;

        // Check if customer exists and is pending
        const [customers] = await req.db.query(
            'SELECT status FROM customer WHERE customer_id = ?',
            [customerId]
        );

        if (customers.length === 0) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        if (customers[0].status !== 'PENDING') {
            return res.status(400).json({ error: 'Customer is not pending approval' });
        }

        // Update customer status
        await req.db.query(`
            UPDATE customer 
            SET status = 'ACTIVE', 
                approval_date = NOW(),
                approved_by = ?,
                admin_notes = ?
            WHERE customer_id = ?
        `, [adminId, notes || 'Customer approved', customerId]);

        res.json({ message: 'Customer approved successfully' });

    } catch (error) {
        console.error('Customer approval error:', error);
        res.status(500).json({ error: 'Failed to approve customer' });
    }
});

// Reject customer registration
router.put('/customers/:customerId/reject', authenticateToken, requireAdmin, [
    body('reason').isLength({ min: 10 }).withMessage('Rejection reason must be at least 10 characters')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { customerId } = req.params;
        const { reason } = req.body;
        const adminId = req.user.userId;

        // Check if customer exists and is pending
        const [customers] = await req.db.query(
            'SELECT status FROM customer WHERE customer_id = ?',
            [customerId]
        );

        if (customers.length === 0) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        if (customers[0].status !== 'PENDING') {
            return res.status(400).json({ error: 'Customer is not pending approval' });
        }

        // Update customer status
        await req.db.query(`
            UPDATE customer 
            SET status = 'REJECTED',
                rejected_by = ?,
                admin_notes = ?,
                last_modified = NOW()
            WHERE customer_id = ?
        `, [adminId, reason, customerId]);

        res.json({ message: 'Customer rejected successfully' });

    } catch (error) {
        console.error('Customer rejection error:', error);
        res.status(500).json({ error: 'Failed to reject customer' });
    }
});

// Get customer details for review
router.get('/customers/:customerId', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { customerId } = req.params;

        // Get customer details with all related information
        const [customers] = await req.db.query(`
            SELECT c.*, cst.civil_status_description
            FROM customer c
            LEFT JOIN civil_status_type cst ON c.civil_status_code = cst.civil_status_code
            WHERE c.customer_id = ?
        `, [customerId]);

        if (customers.length === 0) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        const customer = customers[0];

        // Get customer addresses
        const [addresses] = await req.db.query(`
            SELECT ca.*, at.address_type
            FROM customer_address ca
            LEFT JOIN address_type at ON ca.address_type_code = at.address_type_code
            WHERE ca.customer_id = ?
        `, [customerId]);

        // Get customer contacts
        const [contacts] = await req.db.query(`
            SELECT cc.*, ct.contact_type_description
            FROM customer_contact cc
            LEFT JOIN contact_type ct ON cc.contact_type_code = ct.contact_type_code
            WHERE cc.customer_id = ?
        `, [customerId]);

        // Get employment information
        const [employment] = await req.db.query(`
            SELECT ce.*, ep.position_description
            FROM customer_employment ce
            LEFT JOIN employment_position ep ON ce.position_code = ep.position_code
            WHERE ce.customer_id = ?
        `, [customerId]);

        res.json({
            customer,
            addresses,
            contacts,
            employment
        });

    } catch (error) {
        console.error('Get customer details error:', error);
        res.status(500).json({ error: 'Failed to fetch customer details' });
    }
});

// Approve account closure request
router.put('/closures/:requestId/approve', authenticateToken, requireAdmin, [
    body('notes').optional().isLength({ max: 500 }).withMessage('Notes too long')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { requestId } = req.params;
        const { notes } = req.body;
        const adminId = req.user.userId;

        // Get closure request details
        const [requests] = await req.db.query(
            'SELECT * FROM account_closure_request WHERE request_id = ? AND status = \'PENDING\'',
            [requestId]
        );

        if (requests.length === 0) {
            return res.status(404).json({ error: 'Closure request not found or already processed' });
        }

        const request = requests[0];

        await req.db.query('START TRANSACTION');

        try {
            // Update closure request status
            await req.db.query(`
                UPDATE account_closure_request 
                SET status = 'APPROVED',
                    approved_by = ?,
                    approval_date = NOW(),
                    admin_notes = ?
                WHERE request_id = ?
            `, [adminId, notes || 'Account closure approved', requestId]);

            // Close the account
            await req.db.query(`
                UPDATE account 
                SET account_status_code = 'CLOSED',
                    closure_date = NOW(),
                    last_modified = NOW()
                WHERE account_id = ?
            `, [request.account_id]);

            // If there's a balance, you might want to create a final transaction
            // to transfer remaining funds (implementation depends on business rules)

            await req.db.query('COMMIT');

            res.json({ message: 'Account closure approved successfully' });

        } catch (error) {
            await req.db.query('ROLLBACK');
            throw error;
        }

    } catch (error) {
        console.error('Account closure approval error:', error);
        res.status(500).json({ error: 'Failed to approve account closure' });
    }
});

// Reject account closure request
router.put('/closures/:requestId/reject', authenticateToken, requireAdmin, [
    body('reason').isLength({ min: 10 }).withMessage('Rejection reason must be at least 10 characters')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { requestId } = req.params;
        const { reason } = req.body;
        const adminId = req.user.userId;

        // Check if request exists and is pending
        const [requests] = await req.db.query(
            'SELECT request_id FROM account_closure_request WHERE request_id = ? AND status = \'PENDING\'',
            [requestId]
        );

        if (requests.length === 0) {
            return res.status(404).json({ error: 'Closure request not found or already processed' });
        }

        // Update request status
        await req.db.query(`
            UPDATE account_closure_request 
            SET status = 'REJECTED',
                rejected_by = ?,
                rejection_date = NOW(),
                admin_notes = ?
            WHERE request_id = ?
        `, [adminId, reason, requestId]);

        res.json({ message: 'Account closure request rejected successfully' });

    } catch (error) {
        console.error('Account closure rejection error:', error);
        res.status(500).json({ error: 'Failed to reject closure request' });
    }
});

// Dashboard Statistics
router.get('/stats/customers', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const [totalResult] = await req.db.query('SELECT COUNT(*) as total FROM customer WHERE is_deleted = FALSE');
        const [activeResult] = await req.db.query('SELECT COUNT(*) as active FROM customer WHERE customer_status = "Active" AND is_deleted = FALSE');
        const [pendingResult] = await req.db.query('SELECT COUNT(*) as pending FROM customer WHERE customer_status = "Pending" AND is_deleted = FALSE');
        
        res.json({
            total: totalResult[0].total,
            active: activeResult[0].active,
            pending: pendingResult[0].pending
        });
    } catch (error) {
        console.error('Get customer stats error:', error);
        res.status(500).json({ error: 'Failed to fetch customer statistics' });
    }
});

router.get('/stats/accounts', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const [totalResult] = await req.db.query('SELECT COUNT(*) as total FROM account WHERE is_deleted = FALSE');
        const [activeResult] = await req.db.query('SELECT COUNT(*) as active FROM account WHERE account_status = "Active" AND is_deleted = FALSE');
        
        res.json({
            total: totalResult[0].total,
            active: activeResult[0].active
        });
    } catch (error) {
        // Handle case where account table might not exist yet
        res.json({ total: 0, active: 0 });
    }
});

router.get('/stats/registrations', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const [totalResult] = await req.db.query('SELECT COUNT(*) as total FROM customer_registration_progress');
        const [pendingResult] = await req.db.query('SELECT COUNT(*) as pending FROM customer_registration_progress WHERE is_completed = FALSE');
        const [completedResult] = await req.db.query('SELECT COUNT(*) as completed FROM customer_registration_progress WHERE is_completed = TRUE');
        
        res.json({
            total: totalResult[0].total,
            pending: pendingResult[0].pending,
            completed: completedResult[0].completed
        });
    } catch (error) {
        console.error('Get registration stats error:', error);
        res.status(500).json({ error: 'Failed to fetch registration statistics' });
    }
});

// Recent Activities
router.get('/activities/recent', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        
        // Get recent customer registrations
        const [registrations] = await req.db.query(`
            SELECT 
                'Registration' as type,
                CONCAT('New customer registration started') as description,
                created_at as timestamp
            FROM customer_registration_progress 
            ORDER BY created_at DESC 
            LIMIT ?
        `, [limit]);
        
        res.json(registrations);
    } catch (error) {
        console.error('Get recent activities error:', error);
        res.status(500).json({ error: 'Failed to fetch recent activities' });
    }
});

// Registration Management
router.get('/registrations/pending', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const [registrations] = await req.db.query(`
            SELECT 
                registration_id,
                session_id,
                current_step,
                total_steps,
                is_completed,
                created_at,
                updated_at,
                expires_at,
                JSON_UNQUOTE(JSON_EXTRACT(registration_data, '$.step1.customer_first_name')) as first_name,
                JSON_UNQUOTE(JSON_EXTRACT(registration_data, '$.step1.customer_last_name')) as last_name,
                CONCAT(
                    COALESCE(JSON_UNQUOTE(JSON_EXTRACT(registration_data, '$.step1.customer_first_name')), ''),
                    ' ',
                    COALESCE(JSON_UNQUOTE(JSON_EXTRACT(registration_data, '$.step1.customer_last_name')), '')
                ) as customer_name
            FROM customer_registration_progress 
            WHERE cif_number IS NULL OR is_completed = TRUE
            ORDER BY created_at DESC
        `);
        
        res.json(registrations);
    } catch (error) {
        console.error('Get pending registrations error:', error);
        res.status(500).json({ error: 'Failed to fetch pending registrations' });
    }
});

// Get admin dashboard statistics
router.get('/dashboard/stats', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const [stats] = await req.db.query(`
            SELECT 
                (SELECT COUNT(*) FROM customer WHERE status = 'ACTIVE') as active_customers,
                (SELECT COUNT(*) FROM customer WHERE status = 'PENDING') as pending_customers,
                (SELECT COUNT(*) FROM customer WHERE status = 'REJECTED') as rejected_customers,
                (SELECT COUNT(*) FROM account WHERE account_status_code = 'ACTIVE') as active_accounts,
                (SELECT COUNT(*) FROM account WHERE account_status_code = 'PENDING') as pending_accounts,
                (SELECT COUNT(*) FROM transaction WHERE transaction_status_code = 'COMPLETED' AND DATE(transaction_date) = CURDATE()) as todays_transactions,
                (SELECT COUNT(*) FROM account_closure_request WHERE status = 'PENDING') as pending_closures,
                (SELECT SUM(current_balance) FROM account WHERE account_status_code = 'ACTIVE') as total_deposits
        `);

        // Get recent activity (last 24 hours)
        const [recentActivity] = await req.db.query(`
            SELECT 'customer_registration' as type, customer_id as id, registration_date as date, first_name, last_name
            FROM customer 
            WHERE registration_date >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
            
            UNION ALL
            
            SELECT 'account_application' as type, account_id as id, account_creation_date as date, customer_id, NULL
            FROM account 
            WHERE account_creation_date >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
            
            UNION ALL
            
            SELECT 'transaction' as type, transaction_id as id, transaction_date as date, account_id, NULL
            FROM transaction 
            WHERE transaction_date >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
            
            ORDER BY date DESC
            LIMIT 10
        `);

        res.json({
            statistics: stats[0],
            recent_activity: recentActivity
        });

    } catch (error) {
        console.error('Get admin stats error:', error);
        res.status(500).json({ error: 'Failed to fetch admin statistics' });
    }
});

// Search customers (admin)
router.get('/customers/search', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { q, status, limit = 50, offset = 0 } = req.query;

        if (!q || q.length < 2) {
            return res.status(400).json({ error: 'Search query must be at least 2 characters' });
        }

        let query = `
            SELECT c.*, cst.civil_status_description
            FROM customer c
            LEFT JOIN civil_status_type cst ON c.civil_status_code = cst.civil_status_code
            WHERE (
                c.customer_id LIKE ? OR
                c.first_name LIKE ? OR
                c.last_name LIKE ? OR
                c.email LIKE ?
            )
        `;

        const searchTerm = `%${q}%`;
        const queryParams = [searchTerm, searchTerm, searchTerm, searchTerm];

        if (status) {
            query += ' AND c.status = ?';
            queryParams.push(status);
        }

        query += ' ORDER BY c.registration_date DESC LIMIT ? OFFSET ?';
        queryParams.push(parseInt(limit), parseInt(offset));

        const [customers] = await req.db.query(query, queryParams);

        res.json({
            customers,
            search_term: q,
            pagination: {
                limit: parseInt(limit),
                offset: parseInt(offset)
            }
        });

    } catch (error) {
        console.error('Customer search error:', error);
        res.status(500).json({ error: 'Failed to search customers' });
    }
});

module.exports = router;
