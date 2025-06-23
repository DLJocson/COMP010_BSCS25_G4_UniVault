const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const router = express.Router();

// Get all accounts for current customer
router.get('/', authenticateToken, async (req, res) => {
    try {
        const customerId = req.user.userId;
        
        const [accounts] = await req.db.query(`
            SELECT a.*, at.account_type_description, ast.account_status_description
            FROM account a
            LEFT JOIN account_type at ON a.account_type_code = at.account_type_code
            LEFT JOIN account_status_type ast ON a.account_status_code = ast.account_status_code
            WHERE a.customer_id = ?
            ORDER BY a.account_creation_date DESC
        `, [customerId]);

        res.json(accounts);
    } catch (error) {
        console.error('Get accounts error:', error);
        res.status(500).json({ error: 'Failed to fetch accounts' });
    }
});

// Get specific account details
router.get('/:accountId', authenticateToken, async (req, res) => {
    try {
        const { accountId } = req.params;
        const customerId = req.user.userId;

        const [accounts] = await req.db.query(`
            SELECT a.*, at.account_type_description, ast.account_status_description,
                   c.first_name, c.last_name
            FROM account a
            LEFT JOIN account_type at ON a.account_type_code = at.account_type_code
            LEFT JOIN account_status_type ast ON a.account_status_code = ast.account_status_code
            LEFT JOIN customer c ON a.customer_id = c.customer_id
            WHERE a.account_id = ? AND a.customer_id = ?
        `, [accountId, customerId]);

        if (accounts.length === 0) {
            return res.status(404).json({ error: 'Account not found' });
        }

        res.json(accounts[0]);
    } catch (error) {
        console.error('Get account error:', error);
        res.status(500).json({ error: 'Failed to fetch account' });
    }
});

// Apply for new account
router.post('/apply', authenticateToken, [
    body('account_type_code').isLength({ min: 1 }).withMessage('Account type is required'),
    body('initial_deposit').isFloat({ min: 0 }).withMessage('Initial deposit must be a positive number'),
    body('purpose').isLength({ min: 1 }).withMessage('Account purpose is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const customerId = req.user.userId;
        const {
            account_type_code,
            initial_deposit,
            purpose,
            preferred_branch,
            employment_information,
            fund_source_information
        } = req.body;

        // Generate account ID (you may want to implement a more sophisticated system)
        const accountId = `ACC${Date.now()}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

        // Check if customer exists and is active
        const [customer] = await req.db.query(
            'SELECT status FROM customer WHERE customer_id = ?',
            [customerId]
        );

        if (customer.length === 0) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        if (customer[0].status !== 'ACTIVE') {
            return res.status(400).json({ error: 'Customer account must be active to apply for new accounts' });
        }

        // Insert account application
        const [result] = await req.db.query(`
            INSERT INTO account (
                account_id, customer_id, account_type_code, account_status_code,
                current_balance, initial_deposit, account_creation_date,
                purpose, preferred_branch, employment_info, fund_source_info
            ) VALUES (?, ?, ?, 'PENDING', ?, ?, NOW(), ?, ?, ?, ?)
        `, [
            accountId, customerId, account_type_code, initial_deposit,
            initial_deposit, purpose, preferred_branch,
            JSON.stringify(employment_information),
            JSON.stringify(fund_source_information)
        ]);

        res.status(201).json({
            message: 'Account application submitted successfully',
            account_id: accountId,
            status: 'PENDING'
        });

    } catch (error) {
        console.error('Account application error:', error);
        res.status(500).json({ error: 'Failed to submit account application' });
    }
});

// Update account information (customer can update limited fields)
router.put('/:accountId', authenticateToken, [
    body('purpose').optional().isLength({ min: 1 }).withMessage('Purpose cannot be empty'),
    body('preferred_branch').optional().isLength({ min: 1 }).withMessage('Preferred branch cannot be empty')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { accountId } = req.params;
        const customerId = req.user.userId;
        const { purpose, preferred_branch } = req.body;

        // Check if account belongs to customer
        const [accounts] = await req.db.query(
            'SELECT account_status_code FROM account WHERE account_id = ? AND customer_id = ?',
            [accountId, customerId]
        );

        if (accounts.length === 0) {
            return res.status(404).json({ error: 'Account not found' });
        }

        // Only allow updates for pending accounts
        if (accounts[0].account_status_code !== 'PENDING') {
            return res.status(400).json({ error: 'Can only update pending account applications' });
        }

        const updateFields = [];
        const updateValues = [];

        if (purpose) {
            updateFields.push('purpose = ?');
            updateValues.push(purpose);
        }

        if (preferred_branch) {
            updateFields.push('preferred_branch = ?');
            updateValues.push(preferred_branch);
        }

        if (updateFields.length === 0) {
            return res.status(400).json({ error: 'No valid fields to update' });
        }

        updateValues.push(accountId, customerId);

        await req.db.query(`
            UPDATE account 
            SET ${updateFields.join(', ')}, last_modified = NOW()
            WHERE account_id = ? AND customer_id = ?
        `, updateValues);

        res.json({ message: 'Account updated successfully' });

    } catch (error) {
        console.error('Account update error:', error);
        res.status(500).json({ error: 'Failed to update account' });
    }
});

// Cancel account application (only for pending accounts)
router.delete('/:accountId', authenticateToken, async (req, res) => {
    try {
        const { accountId } = req.params;
        const customerId = req.user.userId;

        // Check if account belongs to customer and is pending
        const [accounts] = await req.db.query(
            'SELECT account_status_code FROM account WHERE account_id = ? AND customer_id = ?',
            [accountId, customerId]
        );

        if (accounts.length === 0) {
            return res.status(404).json({ error: 'Account not found' });
        }

        if (accounts[0].account_status_code !== 'PENDING') {
            return res.status(400).json({ error: 'Can only cancel pending account applications' });
        }

        // Update status to cancelled instead of deleting
        await req.db.query(
            'UPDATE account SET account_status_code = \'CANCELLED\', last_modified = NOW() WHERE account_id = ?',
            [accountId]
        );

        res.json({ message: 'Account application cancelled successfully' });

    } catch (error) {
        console.error('Account cancellation error:', error);
        res.status(500).json({ error: 'Failed to cancel account application' });
    }
});

// Request account closure
router.post('/:accountId/close', authenticateToken, [
    body('reason').isLength({ min: 10 }).withMessage('Reason must be at least 10 characters'),
    body('transfer_to_account').optional().isLength({ min: 1 }).withMessage('Transfer account cannot be empty')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { accountId } = req.params;
        const customerId = req.user.userId;
        const { reason, transfer_to_account } = req.body;

        // Check if account belongs to customer and is active
        const [accounts] = await req.db.query(
            'SELECT account_status_code, current_balance FROM account WHERE account_id = ? AND customer_id = ?',
            [accountId, customerId]
        );

        if (accounts.length === 0) {
            return res.status(404).json({ error: 'Account not found' });
        }

        if (accounts[0].account_status_code !== 'ACTIVE') {
            return res.status(400).json({ error: 'Can only close active accounts' });
        }

        // Create closure request
        const requestId = `CR${Date.now()}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

        await req.db.query(`
            INSERT INTO account_closure_request (
                request_id, account_id, customer_id, reason, 
                transfer_to_account, current_balance, request_date, status
            ) VALUES (?, ?, ?, ?, ?, ?, NOW(), 'PENDING')
        `, [requestId, accountId, customerId, reason, transfer_to_account, accounts[0].current_balance]);

        res.status(201).json({
            message: 'Account closure request submitted successfully',
            request_id: requestId,
            status: 'PENDING'
        });

    } catch (error) {
        console.error('Account closure request error:', error);
        res.status(500).json({ error: 'Failed to submit closure request' });
    }
});

// Admin routes - approve/reject account applications
router.put('/admin/:accountId/approve', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { accountId } = req.params;
        const { account_number, notes } = req.body;

        // Generate account number if not provided
        const finalAccountNumber = account_number || `${Date.now()}${Math.floor(Math.random() * 10000)}`;

        await req.db.query(`
            UPDATE account 
            SET account_status_code = 'ACTIVE', 
                account_number = ?,
                approval_date = NOW(),
                admin_notes = ?
            WHERE account_id = ?
        `, [finalAccountNumber, notes || 'Account approved', accountId]);

        res.json({ message: 'Account approved successfully', account_number: finalAccountNumber });

    } catch (error) {
        console.error('Account approval error:', error);
        res.status(500).json({ error: 'Failed to approve account' });
    }
});

router.put('/admin/:accountId/reject', authenticateToken, requireAdmin, [
    body('reason').isLength({ min: 10 }).withMessage('Rejection reason must be at least 10 characters')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { accountId } = req.params;
        const { reason } = req.body;

        await req.db.query(`
            UPDATE account 
            SET account_status_code = 'REJECTED',
                admin_notes = ?,
                last_modified = NOW()
            WHERE account_id = ?
        `, [reason, accountId]);

        res.json({ message: 'Account rejected successfully' });

    } catch (error) {
        console.error('Account rejection error:', error);
        res.status(500).json({ error: 'Failed to reject account' });
    }
});

module.exports = router;
