const { body, query, param } = require('express-validator');

// Common validation patterns
const patterns = {
    customerID: /^[A-Z0-9]{6,12}$/,
    accountID: /^ACC[0-9]{13,16}$/,
    transactionID: /^TXN[0-9]{13,16}$/,
    phoneNumber: /^[+]?[0-9\s\-()]{7,15}$/,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    name: /^[A-Za-z\s\-.']{1,50}$/,
    address: /^[A-Za-z0-9\s\-,.#()]{1,100}$/,
    currency: /^[0-9]+(\.[0-9]{1,2})?$/,
    dateFormat: /^\d{4}-\d{2}-\d{2}$/
};

// Customer registration validation
const validateCustomerRegistration = [
    body('customer_id')
        .matches(patterns.customerID)
        .withMessage('Customer ID must be 6-12 alphanumeric characters'),
    
    body('first_name')
        .matches(patterns.name)
        .withMessage('First name contains invalid characters')
        .trim()
        .escape(),
    
    body('last_name')
        .matches(patterns.name)
        .withMessage('Last name contains invalid characters')
        .trim()
        .escape(),
    
    body('middle_name')
        .optional()
        .matches(patterns.name)
        .withMessage('Middle name contains invalid characters')
        .trim()
        .escape(),
    
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Invalid email format'),
    
    body('password')
        .isLength({ min: 8, max: 128 })
        .withMessage('Password must be 8-128 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('Password must contain uppercase, lowercase, number, and special character'),
    
    body('date_of_birth')
        .isISO8601()
        .withMessage('Invalid date format')
        .custom((value) => {
            const age = (new Date() - new Date(value)) / (365.25 * 24 * 60 * 60 * 1000);
            if (age < 18) throw new Error('Must be at least 18 years old');
            if (age > 120) throw new Error('Invalid birth date');
            return true;
        }),
    
    body('place_of_birth')
        .matches(patterns.address)
        .withMessage('Place of birth contains invalid characters')
        .trim()
        .escape(),
    
    body('nationality')
        .matches(patterns.name)
        .withMessage('Nationality contains invalid characters')
        .trim()
        .escape(),
    
    body('gender')
        .isIn(['M', 'F', 'O'])
        .withMessage('Gender must be M, F, or O'),
    
    body('civil_status_code')
        .matches(/^CS[0-9]{2}$/)
        .withMessage('Invalid civil status code format')
];

// Customer login validation
const validateLogin = [
    body('identifier')
        .trim()
        .isLength({ min: 1 })
        .withMessage('Customer ID or email is required')
        .escape(),
    
    body('password')
        .isLength({ min: 1 })
        .withMessage('Password is required'),
    
    body('userType')
        .optional()
        .isIn(['customer', 'admin'])
        .withMessage('Invalid user type')
];

// Account application validation
const validateAccountApplication = [
    body('account_type_code')
        .matches(/^AT[0-9]{2}$/)
        .withMessage('Invalid account type code format'),
    
    body('initial_deposit')
        .isFloat({ min: 0, max: 1000000 })
        .withMessage('Initial deposit must be between 0 and 1,000,000')
        .toFloat(),
    
    body('purpose')
        .isLength({ min: 10, max: 200 })
        .withMessage('Purpose must be 10-200 characters')
        .trim()
        .escape(),
    
    body('preferred_branch')
        .optional()
        .matches(patterns.address)
        .withMessage('Preferred branch contains invalid characters')
        .trim()
        .escape()
];

// Transaction validation
const validateTransaction = [
    body('account_id')
        .matches(patterns.accountID)
        .withMessage('Invalid account ID format'),
    
    body('transaction_type_code')
        .isIn(['DEPOSIT', 'WITHDRAWAL', 'TRANSFER'])
        .withMessage('Invalid transaction type'),
    
    body('amount')
        .isFloat({ gt: 0, max: 100000 })
        .withMessage('Amount must be between 0.01 and 100,000')
        .toFloat(),
    
    body('description')
        .optional()
        .isLength({ max: 255 })
        .withMessage('Description too long')
        .trim()
        .escape(),
    
    body('recipient_account_id')
        .if(body('transaction_type_code').equals('TRANSFER'))
        .matches(patterns.accountID)
        .withMessage('Invalid recipient account ID format'),
    
    body('recipient_name')
        .if(body('transaction_type_code').equals('TRANSFER'))
        .matches(patterns.name)
        .withMessage('Invalid recipient name format')
        .trim()
        .escape()
];

// Address validation
const validateAddress = [
    body('address_type_code')
        .matches(/^AD[0-9]{2}$/)
        .withMessage('Invalid address type code format'),
    
    body('address_line_1')
        .matches(patterns.address)
        .withMessage('Address line 1 contains invalid characters')
        .trim()
        .escape(),
    
    body('address_line_2')
        .optional()
        .matches(patterns.address)
        .withMessage('Address line 2 contains invalid characters')
        .trim()
        .escape(),
    
    body('city')
        .matches(patterns.name)
        .withMessage('City contains invalid characters')
        .trim()
        .escape(),
    
    body('province')
        .matches(patterns.name)
        .withMessage('Province contains invalid characters')
        .trim()
        .escape(),
    
    body('postal_code')
        .matches(/^[0-9]{4}$/)
        .withMessage('Postal code must be 4 digits'),
    
    body('country')
        .matches(patterns.name)
        .withMessage('Country contains invalid characters')
        .trim()
        .escape()
];

// Contact validation
const validateContact = [
    body('contact_type_code')
        .matches(/^CT[0-9]{2}$/)
        .withMessage('Invalid contact type code format'),
    
    body('contact_value')
        .custom((value, { req }) => {
            const contactType = req.body.contact_type_code;
            
            if (contactType === 'CT01' || contactType === 'CT02') { // Phone types
                if (!patterns.phoneNumber.test(value)) {
                    throw new Error('Invalid phone number format');
                }
            } else if (contactType === 'CT03') { // Email
                if (!patterns.email.test(value)) {
                    throw new Error('Invalid email format');
                }
            }
            return true;
        })
        .trim()
        .escape()
];

// Employment validation
const validateEmployment = [
    body('employer_name')
        .matches(patterns.name)
        .withMessage('Employer name contains invalid characters')
        .trim()
        .escape(),
    
    body('position_code')
        .matches(/^EP[0-9]{2}$/)
        .withMessage('Invalid position code format'),
    
    body('monthly_income')
        .isFloat({ min: 0, max: 10000000 })
        .withMessage('Monthly income must be between 0 and 10,000,000')
        .toFloat(),
    
    body('employment_start_date')
        .isISO8601()
        .withMessage('Invalid employment start date')
        .custom((value) => {
            if (new Date(value) > new Date()) {
                throw new Error('Employment start date cannot be in the future');
            }
            return true;
        }),
    
    body('work_address')
        .matches(patterns.address)
        .withMessage('Work address contains invalid characters')
        .trim()
        .escape()
];

// Query parameter validation
const validatePagination = [
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100')
        .toInt(),
    
    query('offset')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Offset must be non-negative')
        .toInt()
];

const validateDateRange = [
    query('start_date')
        .optional()
        .isISO8601()
        .withMessage('Invalid start date format'),
    
    query('end_date')
        .optional()
        .isISO8601()
        .withMessage('Invalid end date format')
        .custom((value, { req }) => {
            if (req.query.start_date && new Date(value) < new Date(req.query.start_date)) {
                throw new Error('End date must be after start date');
            }
            return true;
        })
];

// Parameter validation
const validateCustomerID = [
    param('customerId')
        .matches(patterns.customerID)
        .withMessage('Invalid customer ID format')
];

const validateAccountID = [
    param('accountId')
        .matches(patterns.accountID)
        .withMessage('Invalid account ID format')
];

const validateTransactionID = [
    param('transactionId')
        .matches(patterns.transactionID)
        .withMessage('Invalid transaction ID format')
];

// Input sanitization middleware
const sanitizeInput = (req, res, next) => {
    // Remove any null bytes and control characters
    const sanitize = (obj) => {
        for (let key in obj) {
            if (typeof obj[key] === 'string') {
                obj[key] = obj[key].replace(/[\x00-\x1F\x7F]/g, '');
            } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                sanitize(obj[key]);
            }
        }
    };

    if (req.body) sanitize(req.body);
    if (req.query) sanitize(req.query);
    if (req.params) sanitize(req.params);

    next();
};

// Rate limiting middleware
const rateLimit = require('express-rate-limit');

const loginRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per window
    message: {
        error: 'Too many login attempts, please try again in 15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

const generalRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
    message: {
        error: 'Too many requests, please try again later'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = {
    validateCustomerRegistration,
    validateLogin,
    validateAccountApplication,
    validateTransaction,
    validateAddress,
    validateContact,
    validateEmployment,
    validatePagination,
    validateDateRange,
    validateCustomerID,
    validateAccountID,
    validateTransactionID,
    sanitizeInput,
    loginRateLimit,
    generalRateLimit,
    patterns
};
