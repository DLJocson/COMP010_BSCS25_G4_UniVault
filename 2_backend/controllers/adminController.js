const { pool } = require('../config/database');
const { validateCustomerProfileCompleteness, validateStatusTransition } = require('../utils/customerValidation');

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
        const { search, status, includeValidation } = req.query;
        let query = `
            SELECT 
                c.cif_number, c.customer_type, c.customer_first_name, c.customer_last_name, 
                c.customer_middle_name, c.customer_suffix_name, c.customer_username, 
                c.customer_status, c.created_at,
                cd.contact_value as email, cd2.contact_value as phone
            FROM CUSTOMER c
            LEFT JOIN CUSTOMER_CONTACT_DETAILS cd ON c.cif_number = cd.cif_number AND cd.contact_type_code = 'CT01'
            LEFT JOIN CUSTOMER_CONTACT_DETAILS cd2 ON c.cif_number = cd2.cif_number AND cd2.contact_type_code = 'CT02'
            WHERE c.is_deleted = FALSE AND c.customer_status != 'Pending Verification'
        `;
        let params = [];
        
        // Add status filter
        if (status && status !== 'all') {
            // If specifically requesting "Pending Verification", override the default filter
            if (status === 'Pending Verification') {
                query = query.replace("AND c.customer_status != 'Pending Verification'", "");
                query += ` AND c.customer_status = ?`;
            } else {
                query += ` AND c.customer_status = ?`;
            }
            params.push(status);
        }
        
        // Add search filter
        if (search) {
            query += ` AND (c.customer_first_name LIKE ? OR c.customer_last_name LIKE ? OR c.cif_number LIKE ? OR c.customer_username LIKE ?)`;
            const searchParam = `%${search}%`;
            params.push(searchParam, searchParam, searchParam, searchParam);
        }
        
        query += ` ORDER BY c.created_at DESC LIMIT 100`;
        
        const [customers] = await pool.query(query, params);
        
        // Add validation info if requested
        if (includeValidation === 'true') {
            const customersWithValidation = await Promise.all(
                customers.map(async (customer) => {
                    try {
                        const validation = await validateCustomerProfileCompleteness(customer.cif_number);
                        return {
                            ...customer,
                            profileValidation: {
                                isComplete: validation.isComplete,
                                completionPercentage: validation.completionPercentage,
                                missingSections: validation.missingSections,
                                warnings: validation.warnings
                            }
                        };
                    } catch (error) {
                        console.error(`Error validating customer ${customer.cif_number}:`, error);
                        return {
                            ...customer,
                            profileValidation: {
                                isComplete: false,
                                completionPercentage: 0,
                                missingSections: ['Validation error'],
                                warnings: ['Could not validate profile']
                            }
                        };
                    }
                })
            );
            return res.json(customersWithValidation);
        }
        
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
        
        // Add profile completeness validation
        const profileValidation = await validateCustomerProfileCompleteness(cif_number);
        
        res.json({
            customer,
            addresses,
            contacts,
            employment,
            ids,
            profileValidation
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

const updateCustomerStatus = async (req, res, next) => {
    try {
        const { cif_number } = req.params;
        const { status, updated_by } = req.body;
        
        // Quick validation - fail fast
        if (!status || !cif_number) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        
        // Validate status
        const validStatuses = ['Active', 'Pending Verification', 'Inactive', 'Suspended', 'Closed'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status provided' });
        }
        
        // Validate status transition based on profile completeness
        const transitionValidation = await validateStatusTransition(cif_number, status);
        
        if (!transitionValidation.canTransition) {
            return res.status(400).json({ 
                message: 'Cannot update status: Profile requirements not met',
                reasons: transitionValidation.reasons,
                warnings: transitionValidation.warnings
            });
        }
        
        // Optimized query with index hints for better performance
        const [result] = await pool.query(
            'UPDATE CUSTOMER SET customer_status = ?, updated_at = NOW() WHERE cif_number = ? AND is_deleted = FALSE LIMIT 1',
            [status, cif_number]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Customer not found or already deleted' });
        }
        
        // Get updated profile validation
        const profileValidation = await validateCustomerProfileCompleteness(cif_number);
        
        // Enhanced response with validation info
        res.json({ 
            success: true,
            message: 'Status updated successfully',
            status: status,
            profileValidation: profileValidation,
            warnings: transitionValidation.warnings
        });
        
    } catch (err) {
        console.error('Error updating customer status:', err);
        
        // Provide specific error messages for common issues
        if (err.code === 'ER_LOCK_WAIT_TIMEOUT') {
            return res.status(503).json({ message: 'Database busy, please try again' });
        }
        
        next(err);
    }
};

// Get all accounts for a specific customer
const getCustomerAccounts = async (req, res, next) => {
    try {
        const { cif_number } = req.params;
        
        if (!cif_number) {
            return res.status(400).json({ message: 'CIF number is required' });
        }
        
        // Get all accounts for the customer with account details and product type
        const [accounts] = await pool.query(`
            SELECT 
                ca.account_number,
                pt.product_type_name as account_type,
                ad.account_status,
                ad.account_open_date,
                ad.account_close_date,
                ca.relationship_type,
                ca.created_at as account_created_at
            FROM CUSTOMER_ACCOUNT ca
            JOIN ACCOUNT_DETAILS ad ON ca.account_number = ad.account_number
            JOIN CUSTOMER_PRODUCT_TYPE pt ON ad.product_type_code = pt.product_type_code
            WHERE ca.cif_number = ?
            ORDER BY ca.created_at ASC
        `, [cif_number]);
        
        if (accounts.length === 0) {
            return res.status(404).json({ message: 'No accounts found for this customer' });
        }
        
        res.json({
            cif_number: cif_number,
            total_accounts: accounts.length,
            accounts: accounts
        });
        
    } catch (err) {
        console.error('Error fetching customer accounts:', err);
        next(err);
    }
};

// Get customers with closed accounts
const getCustomersWithClosedAccounts = async (req, res, next) => {
    try {
        const [customers] = await pool.query(`
            SELECT DISTINCT
                c.cif_number,
                c.customer_type,
                c.customer_first_name,
                c.customer_last_name,
                c.customer_middle_name,
                c.customer_suffix_name,
                c.customer_status,
                c.created_at,
                cd.contact_value as email,
                cd2.contact_value as phone,
                GROUP_CONCAT(
                    CONCAT(ca.account_number, ':', pt.product_type_name, ':', ad.account_status, ':', ad.account_close_date)
                    SEPARATOR '|'
                ) as closed_accounts_info
            FROM CUSTOMER c
            JOIN CUSTOMER_ACCOUNT ca ON c.cif_number = ca.cif_number
            JOIN ACCOUNT_DETAILS ad ON ca.account_number = ad.account_number
            JOIN CUSTOMER_PRODUCT_TYPE pt ON ad.product_type_code = pt.product_type_code
            LEFT JOIN CUSTOMER_CONTACT_DETAILS cd ON c.cif_number = cd.cif_number AND cd.contact_type_code = 'CT01'
            LEFT JOIN CUSTOMER_CONTACT_DETAILS cd2 ON c.cif_number = cd2.cif_number AND cd2.contact_type_code = 'CT02'
            WHERE ad.account_status = 'Closed' AND c.is_deleted = FALSE
            GROUP BY c.cif_number
            ORDER BY MAX(ad.account_close_date) DESC
        `);
        
        // Parse the closed accounts info for each customer
        const customersWithAccounts = customers.map(customer => {
            const closedAccounts = customer.closed_accounts_info.split('|').map(accountInfo => {
                const [account_number, account_type, status, close_date] = accountInfo.split(':');
                return {
                    account_number,
                    account_type,
                    status,
                    close_date
                };
            }).filter(account => account.status === 'Closed');
            
            return {
                ...customer,
                closed_accounts: closedAccounts,
                closed_accounts_count: closedAccounts.length
            };
        });
        
        res.json(customersWithAccounts);
        
    } catch (err) {
        console.error('Error fetching customers with closed accounts:', err);
        next(err);
    }
};

module.exports = {
    getDashboardStats,
    getAllCustomers,
    getCustomerDetails,
    verifyCustomer,
    closeCustomerAccount,
    updateCustomerStatus,
    getCustomerAccounts,
    getCustomersWithClosedAccounts
};
