const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const router = express.Router();

// Get transaction history for customer's accounts
router.get('/', authenticateToken, async (req, res) => {
    try {
        const customerId = req.user.userId;
        const { account_id, limit = 50, offset = 0, start_date, end_date } = req.query;

        let query = `
            SELECT t.*, a.account_number, tt.transaction_type_description,
                   ts.transaction_status_description
            FROM transaction t
            LEFT JOIN account a ON t.account_id = a.account_id
            LEFT JOIN transaction_type tt ON t.transaction_type_code = tt.transaction_type_code
            LEFT JOIN transaction_status_type ts ON t.transaction_status_code = ts.transaction_status_code
            WHERE a.customer_id = ?
        `;

        const queryParams = [customerId];

        // Filter by specific account
        if (account_id) {
            query += ' AND t.account_id = ?';
            queryParams.push(account_id);
        }

        // Filter by date range
        if (start_date) {
            query += ' AND DATE(t.transaction_date) >= ?';
            queryParams.push(start_date);
        }

        if (end_date) {
            query += ' AND DATE(t.transaction_date) <= ?';
            queryParams.push(end_date);
        }

        query += ' ORDER BY t.transaction_date DESC LIMIT ? OFFSET ?';
        queryParams.push(parseInt(limit), parseInt(offset));

        const [transactions] = await req.db.query(query, queryParams);

        // Get total count for pagination
        let countQuery = `
            SELECT COUNT(*) as total
            FROM transaction t
            LEFT JOIN account a ON t.account_id = a.account_id
            WHERE a.customer_id = ?
        `;

        const countParams = [customerId];

        if (account_id) {
            countQuery += ' AND t.account_id = ?';
            countParams.push(account_id);
        }

        if (start_date) {
            countQuery += ' AND DATE(t.transaction_date) >= ?';
            countParams.push(start_date);
        }

        if (end_date) {
            countQuery += ' AND DATE(t.transaction_date) <= ?';
            countParams.push(end_date);
        }

        const [countResult] = await req.db.query(countQuery, countParams);

        res.json({
            transactions,
            pagination: {
                total: countResult[0].total,
                limit: parseInt(limit),
                offset: parseInt(offset),
                hasMore: parseInt(offset) + parseInt(limit) < countResult[0].total
            }
        });

    } catch (error) {
        console.error('Get transactions error:', error);
        res.status(500).json({ error: 'Failed to fetch transactions' });
    }
});

// Get specific transaction details
router.get('/:transactionId', authenticateToken, async (req, res) => {
    try {
        const { transactionId } = req.params;
        const customerId = req.user.userId;

        const [transactions] = await req.db.query(`
            SELECT t.*, a.account_number, a.customer_id, 
                   tt.transaction_type_description, ts.transaction_status_description,
                   c.first_name, c.last_name
            FROM transaction t
            LEFT JOIN account a ON t.account_id = a.account_id
            LEFT JOIN transaction_type tt ON t.transaction_type_code = tt.transaction_type_code
            LEFT JOIN transaction_status_type ts ON t.transaction_status_code = ts.transaction_status_code
            LEFT JOIN customer c ON a.customer_id = c.customer_id
            WHERE t.transaction_id = ? AND a.customer_id = ?
        `, [transactionId, customerId]);

        if (transactions.length === 0) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        res.json(transactions[0]);

    } catch (error) {
        console.error('Get transaction error:', error);
        res.status(500).json({ error: 'Failed to fetch transaction' });
    }
});

// Create new transaction (deposit/withdrawal)
router.post('/', authenticateToken, [
    body('account_id').isLength({ min: 1 }).withMessage('Account ID is required'),
    body('transaction_type_code').isIn(['DEPOSIT', 'WITHDRAWAL', 'TRANSFER']).withMessage('Invalid transaction type'),
    body('amount').isFloat({ gt: 0 }).withMessage('Amount must be greater than 0'),
    body('description').optional().isLength({ max: 255 }).withMessage('Description too long')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const customerId = req.user.userId;
        const {
            account_id,
            transaction_type_code,
            amount,
            description,
            recipient_account_id, // For transfers
            recipient_name // For transfers
        } = req.body;

        // Verify account ownership
        const [accounts] = await req.db.query(
            'SELECT account_status_code, current_balance FROM account WHERE account_id = ? AND customer_id = ?',
            [account_id, customerId]
        );

        if (accounts.length === 0) {
            return res.status(404).json({ error: 'Account not found' });
        }

        if (accounts[0].account_status_code !== 'ACTIVE') {
            return res.status(400).json({ error: 'Account must be active to perform transactions' });
        }

        const currentBalance = parseFloat(accounts[0].current_balance);
        const transactionAmount = parseFloat(amount);

        // Check sufficient funds for withdrawals
        if (transaction_type_code === 'WITHDRAWAL' && currentBalance < transactionAmount) {
            return res.status(400).json({ error: 'Insufficient funds' });
        }

        // For transfers, verify recipient account exists
        if (transaction_type_code === 'TRANSFER') {
            if (!recipient_account_id) {
                return res.status(400).json({ error: 'Recipient account ID required for transfers' });
            }

            const [recipientAccounts] = await req.db.query(
                'SELECT account_status_code FROM account WHERE account_id = ?',
                [recipient_account_id]
            );

            if (recipientAccounts.length === 0) {
                return res.status(404).json({ error: 'Recipient account not found' });
            }

            if (recipientAccounts[0].account_status_code !== 'ACTIVE') {
                return res.status(400).json({ error: 'Recipient account must be active' });
            }

            if (currentBalance < transactionAmount) {
                return res.status(400).json({ error: 'Insufficient funds for transfer' });
            }
        }

        // Generate transaction ID
        const transactionId = `TXN${Date.now()}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

        // Start transaction
        await req.db.query('START TRANSACTION');

        try {
            // Insert transaction record
            await req.db.query(`
                INSERT INTO transaction (
                    transaction_id, account_id, transaction_type_code, amount,
                    description, recipient_account_id, recipient_name,
                    transaction_date, transaction_status_code, reference_number
                ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), 'COMPLETED', ?)
            `, [
                transactionId, account_id, transaction_type_code, transactionAmount,
                description || `${transaction_type_code} transaction`,
                recipient_account_id, recipient_name, transactionId
            ]);

            // Update account balance
            let newBalance;
            if (transaction_type_code === 'DEPOSIT') {
                newBalance = currentBalance + transactionAmount;
            } else if (transaction_type_code === 'WITHDRAWAL' || transaction_type_code === 'TRANSFER') {
                newBalance = currentBalance - transactionAmount;
            }

            await req.db.query(
                'UPDATE account SET current_balance = ?, last_modified = NOW() WHERE account_id = ?',
                [newBalance, account_id]
            );

            // For transfers, update recipient account
            if (transaction_type_code === 'TRANSFER') {
                const recipientTransactionId = `TXN${Date.now()}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
                
                // Insert recipient transaction
                await req.db.query(`
                    INSERT INTO transaction (
                        transaction_id, account_id, transaction_type_code, amount,
                        description, sender_account_id, sender_name,
                        transaction_date, transaction_status_code, reference_number
                    ) VALUES (?, ?, 'DEPOSIT', ?, ?, ?, ?, NOW(), 'COMPLETED', ?)
                `, [
                    recipientTransactionId, recipient_account_id, transactionAmount,
                    description || 'Transfer received', account_id,
                    `${customerId}`, transactionId
                ]);

                // Update recipient balance
                await req.db.query(`
                    UPDATE account 
                    SET current_balance = current_balance + ?, last_modified = NOW() 
                    WHERE account_id = ?
                `, [transactionAmount, recipient_account_id]);
            }

            await req.db.query('COMMIT');

            res.status(201).json({
                message: 'Transaction completed successfully',
                transaction_id: transactionId,
                new_balance: newBalance,
                amount: transactionAmount,
                type: transaction_type_code
            });

        } catch (error) {
            await req.db.query('ROLLBACK');
            throw error;
        }

    } catch (error) {
        console.error('Transaction error:', error);
        res.status(500).json({ error: 'Transaction failed' });
    }
});

// Get account balance
router.get('/accounts/:accountId/balance', authenticateToken, async (req, res) => {
    try {
        const { accountId } = req.params;
        const customerId = req.user.userId;

        const [accounts] = await req.db.query(`
            SELECT current_balance, account_number, account_status_code
            FROM account 
            WHERE account_id = ? AND customer_id = ?
        `, [accountId, customerId]);

        if (accounts.length === 0) {
            return res.status(404).json({ error: 'Account not found' });
        }

        res.json({
            account_id: accountId,
            balance: parseFloat(accounts[0].current_balance),
            account_number: accounts[0].account_number,
            status: accounts[0].account_status_code
        });

    } catch (error) {
        console.error('Get balance error:', error);
        res.status(500).json({ error: 'Failed to fetch balance' });
    }
});

// Get transaction summary/statistics
router.get('/summary/:accountId', authenticateToken, async (req, res) => {
    try {
        const { accountId } = req.params;
        const customerId = req.user.userId;
        const { period = '30' } = req.query; // days

        // Verify account ownership
        const [accounts] = await req.db.query(
            'SELECT account_id FROM account WHERE account_id = ? AND customer_id = ?',
            [accountId, customerId]
        );

        if (accounts.length === 0) {
            return res.status(404).json({ error: 'Account not found' });
        }

        // Get transaction summary
        const [summary] = await req.db.query(`
            SELECT 
                COUNT(*) as total_transactions,
                SUM(CASE WHEN transaction_type_code = 'DEPOSIT' THEN amount ELSE 0 END) as total_deposits,
                SUM(CASE WHEN transaction_type_code = 'WITHDRAWAL' THEN amount ELSE 0 END) as total_withdrawals,
                SUM(CASE WHEN transaction_type_code = 'TRANSFER' THEN amount ELSE 0 END) as total_transfers,
                AVG(amount) as average_transaction
            FROM transaction 
            WHERE account_id = ? 
                AND transaction_date >= DATE_SUB(NOW(), INTERVAL ? DAY)
                AND transaction_status_code = 'COMPLETED'
        `, [accountId, parseInt(period)]);

        res.json({
            account_id: accountId,
            period_days: parseInt(period),
            summary: {
                total_transactions: summary[0].total_transactions || 0,
                total_deposits: parseFloat(summary[0].total_deposits || 0),
                total_withdrawals: parseFloat(summary[0].total_withdrawals || 0),
                total_transfers: parseFloat(summary[0].total_transfers || 0),
                average_transaction: parseFloat(summary[0].average_transaction || 0)
            }
        });

    } catch (error) {
        console.error('Get transaction summary error:', error);
        res.status(500).json({ error: 'Failed to fetch transaction summary' });
    }
});

// Admin routes for transaction management
router.get('/admin/all', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { limit = 100, offset = 0, status, type, start_date, end_date } = req.query;

        let query = `
            SELECT t.*, a.account_number, a.customer_id,
                   c.first_name, c.last_name, c.email,
                   tt.transaction_type_description, ts.transaction_status_description
            FROM transaction t
            LEFT JOIN account a ON t.account_id = a.account_id
            LEFT JOIN customer c ON a.customer_id = c.customer_id
            LEFT JOIN transaction_type tt ON t.transaction_type_code = tt.transaction_type_code
            LEFT JOIN transaction_status_type ts ON t.transaction_status_code = ts.transaction_status_code
            WHERE 1=1
        `;

        const queryParams = [];

        if (status) {
            query += ' AND t.transaction_status_code = ?';
            queryParams.push(status);
        }

        if (type) {
            query += ' AND t.transaction_type_code = ?';
            queryParams.push(type);
        }

        if (start_date) {
            query += ' AND DATE(t.transaction_date) >= ?';
            queryParams.push(start_date);
        }

        if (end_date) {
            query += ' AND DATE(t.transaction_date) <= ?';
            queryParams.push(end_date);
        }

        query += ' ORDER BY t.transaction_date DESC LIMIT ? OFFSET ?';
        queryParams.push(parseInt(limit), parseInt(offset));

        const [transactions] = await req.db.query(query, queryParams);

        res.json({
            transactions,
            pagination: {
                limit: parseInt(limit),
                offset: parseInt(offset)
            }
        });

    } catch (error) {
        console.error('Admin get transactions error:', error);
        res.status(500).json({ error: 'Failed to fetch transactions' });
    }
});

module.exports = router;
