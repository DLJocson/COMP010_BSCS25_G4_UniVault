const { body, query, param, validationResult } = require('express-validator');
const validator = require('validator');
const xss = require('xss');

// ============================================================================
// COMPREHENSIVE INPUT VALIDATION SYSTEM
// ============================================================================

class ComprehensiveValidator {
    constructor() {
        this.customValidators = new Map();
        this.sanitizers = new Map();
        this.businessRules = new Map();
    }

    // ============================
    // FIELD-SPECIFIC VALIDATORS
    // ============================

    // Personal Information Validators
    static personalInfo = {
        firstName: body('first_name')
            .trim()
            .isLength({ min: 1, max: 100 })
            .withMessage('First name must be 1-100 characters')
            .matches(/^[A-Za-z\s'-]+$/)
            .withMessage('First name can only contain letters, spaces, hyphens, and apostrophes')
            .custom((value) => {
                if (value.length < 2) throw new Error('First name must be at least 2 characters');
                if (/^\s/.test(value) || /\s$/.test(value)) throw new Error('First name cannot start or end with spaces');
                if (/\s{2,}/.test(value)) throw new Error('First name cannot contain multiple consecutive spaces');
                return true;
            }),

        lastName: body('last_name')
            .trim()
            .isLength({ min: 1, max: 100 })
            .withMessage('Last name must be 1-100 characters')
            .matches(/^[A-Za-z\s'-]+$/)
            .withMessage('Last name can only contain letters, spaces, hyphens, and apostrophes')
            .custom((value) => {
                if (value.length < 2) throw new Error('Last name must be at least 2 characters');
                return true;
            }),

        middleName: body('middle_name')
            .optional()
            .trim()
            .isLength({ max: 100 })
            .withMessage('Middle name cannot exceed 100 characters')
            .matches(/^[A-Za-z\s'-]*$/)
            .withMessage('Middle name can only contain letters, spaces, hyphens, and apostrophes'),

        birthDate: body('birth_date')
            .isISO8601()
            .withMessage('Birth date must be in YYYY-MM-DD format')
            .custom((value) => {
                const birthDate = new Date(value);
                const today = new Date();
                const age = today.getFullYear() - birthDate.getFullYear();
                const monthDiff = today.getMonth() - birthDate.getMonth();
                
                // Adjust age if birthday hasn't occurred this year
                const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()) 
                    ? age - 1 : age;
                
                if (actualAge < 18) throw new Error('Must be at least 18 years old');
                if (actualAge > 120) throw new Error('Age cannot exceed 120 years');
                if (birthDate > today) throw new Error('Birth date cannot be in the future');
                
                return true;
            }),

        gender: body('gender')
            .isIn(['Male', 'Female', 'Non-Binary', 'Prefer not to say', 'Other'])
            .withMessage('Invalid gender selection'),

        civilStatus: body('civil_status_code')
            .matches(/^CS\d{2}$/)
            .withMessage('Invalid civil status code format')
    };

    // Contact Information Validators
    static contactInfo = {
        email: body('email')
            .trim()
            .toLowerCase()
            .isEmail()
            .withMessage('Invalid email format')
            .isLength({ max: 255 })
            .withMessage('Email cannot exceed 255 characters')
            .custom((value) => {
                // Additional email validation rules
                const domain = value.split('@')[1];
                if (domain && domain.length > 63) {
                    throw new Error('Email domain too long');
                }
                
                // Check for common disposable email domains
                const disposableDomains = ['10minutemail.com', 'tempmail.org', 'guerrillamail.com'];
                if (disposableDomains.includes(domain)) {
                    throw new Error('Disposable email addresses are not allowed');
                }
                
                return true;
            }),

        phoneNumber: body('phone_number')
            .trim()
            .matches(/^(\+63|0)[0-9]{10}$/)
            .withMessage('Invalid Philippine phone number format')
            .custom((value) => {
                // Normalize phone number
                const normalized = value.replace(/^\+63/, '0');
                const validPrefixes = ['090', '091', '092', '093', '094', '095', '096', '097', '098', '099'];
                const prefix = normalized.substring(0, 3);
                
                if (!validPrefixes.includes(prefix)) {
                    throw new Error('Invalid mobile network prefix');
                }
                
                return true;
            }),

        landlineNumber: body('landline_number')
            .optional()
            .trim()
            .matches(/^(\+63|0)[0-9]{9,10}$/)
            .withMessage('Invalid landline number format')
    };

    // Address Validators
    static addressInfo = {
        streetAddress: body('street_address')
            .optional()
            .trim()
            .isLength({ max: 255 })
            .withMessage('Street address cannot exceed 255 characters')
            .matches(/^[A-Za-z0-9\s,.-]+$/)
            .withMessage('Street address contains invalid characters'),

        barangay: body('barangay')
            .trim()
            .isLength({ min: 1, max: 100 })
            .withMessage('Barangay is required and cannot exceed 100 characters')
            .matches(/^[A-Za-z0-9\s,.-]+$/)
            .withMessage('Barangay contains invalid characters'),

        city: body('city')
            .trim()
            .isLength({ min: 1, max: 100 })
            .withMessage('City is required and cannot exceed 100 characters')
            .matches(/^[A-Za-z\s'-]+$/)
            .withMessage('City can only contain letters, spaces, hyphens, and apostrophes'),

        province: body('province')
            .trim()
            .isLength({ min: 1, max: 100 })
            .withMessage('Province is required and cannot exceed 100 characters')
            .matches(/^[A-Za-z\s'-]+$/)
            .withMessage('Province can only contain letters, spaces, hyphens, and apostrophes'),

        postalCode: body('postal_code')
            .trim()
            .matches(/^\d{4}$/)
            .withMessage('Postal code must be exactly 4 digits'),

        country: body('country')
            .optional()
            .trim()
            .isLength({ max: 100 })
            .withMessage('Country cannot exceed 100 characters')
            .default('Philippines')
    };

    // Financial Information Validators
    static financialInfo = {
        monthlyIncome: body('monthly_income')
            .isFloat({ min: 0, max: 10000000 })
            .withMessage('Monthly income must be between 0 and 10,000,000')
            .toFloat()
            .custom((value) => {
                if (value < 8000) {
                    throw new Error('Monthly income must be at least ₱8,000 for account eligibility');
                }
                return true;
            }),

        employerName: body('employer_name')
            .trim()
            .isLength({ min: 1, max: 255 })
            .withMessage('Employer name is required and cannot exceed 255 characters')
            .matches(/^[A-Za-z0-9\s,.'&()-]+$/)
            .withMessage('Employer name contains invalid characters'),

        employmentDate: body('employment_start_date')
            .isISO8601()
            .withMessage('Employment start date must be in YYYY-MM-DD format')
            .custom((value) => {
                const empDate = new Date(value);
                const today = new Date();
                
                if (empDate > today) {
                    throw new Error('Employment start date cannot be in the future');
                }
                
                // Must be employed for at least 6 months
                const sixMonthsAgo = new Date();
                sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
                
                if (empDate > sixMonthsAgo) {
                    throw new Error('Must be employed for at least 6 months');
                }
                
                return true;
            })
    };

    // Authentication Validators
    static authInfo = {
        username: body('username')
            .trim()
            .isLength({ min: 3, max: 50 })
            .withMessage('Username must be 3-50 characters')
            .matches(/^[A-Za-z0-9._-]+$/)
            .withMessage('Username can only contain letters, numbers, dots, underscores, and hyphens')
            .custom((value) => {
                if (value.startsWith('.') || value.endsWith('.')) {
                    throw new Error('Username cannot start or end with a dot');
                }
                if (value.includes('..')) {
                    throw new Error('Username cannot contain consecutive dots');
                }
                return true;
            }),

        password: body('password')
            .isLength({ min: 8, max: 128 })
            .withMessage('Password must be 8-128 characters')
            .custom((value) => {
                const hasUpperCase = /[A-Z]/.test(value);
                const hasLowerCase = /[a-z]/.test(value);
                const hasNumbers = /\d/.test(value);
                const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);
                
                const errors = [];
                if (!hasUpperCase) errors.push('at least one uppercase letter');
                if (!hasLowerCase) errors.push('at least one lowercase letter');
                if (!hasNumbers) errors.push('at least one number');
                if (!hasSpecialChar) errors.push('at least one special character');
                
                if (errors.length > 0) {
                    throw new Error(`Password must contain ${errors.join(', ')}`);
                }
                
                // Check for common weak patterns
                if (value.toLowerCase().includes('password')) {
                    throw new Error('Password cannot contain the word "password"');
                }
                
                if (/^(.)\1+$/.test(value)) {
                    throw new Error('Password cannot be all the same character');
                }
                
                if (/123456|abcdef|qwerty/i.test(value)) {
                    throw new Error('Password cannot contain common sequences');
                }
                
                return true;
            }),

        confirmPassword: body('confirm_password')
            .custom((value, { req }) => {
                if (value !== req.body.password) {
                    throw new Error('Password confirmation does not match');
                }
                return true;
            })
    };

    // ID Document Validators
    static idInfo = {
        idType: body('id_type_code')
            .matches(/^[A-Z]{3}$/)
            .withMessage('Invalid ID type code format'),

        idNumber: body('id_number')
            .trim()
            .isLength({ min: 1, max: 20 })
            .withMessage('ID number is required and cannot exceed 20 characters')
            .custom((value, { req }) => {
                const idType = req.body.id_type_code;
                
                // Validate specific ID formats
                switch (idType) {
                    case 'SSS':
                        if (!/^\d{2}-\d{7}-\d{1}$/.test(value)) {
                            throw new Error('SSS number must follow format: XX-XXXXXXX-X');
                        }
                        break;
                    case 'TIN':
                        if (!/^\d{3}-\d{3}-\d{3}-\d{3}$/.test(value)) {
                            throw new Error('TIN must follow format: XXX-XXX-XXX-XXX');
                        }
                        break;
                    case 'DRV':
                        if (!/^[A-Z]\d{2}-\d{2}-\d{6}$/.test(value)) {
                            throw new Error('Driver\'s License must follow format: AXX-XX-XXXXXX');
                        }
                        break;
                    default:
                        // Generic alphanumeric validation
                        if (!/^[A-Za-z0-9-]+$/.test(value)) {
                            throw new Error('ID number contains invalid characters');
                        }
                }
                
                return true;
            }),

        idIssueDate: body('id_issue_date')
            .isISO8601()
            .withMessage('ID issue date must be in YYYY-MM-DD format')
            .custom((value) => {
                const issueDate = new Date(value);
                const today = new Date();
                
                if (issueDate > today) {
                    throw new Error('ID issue date cannot be in the future');
                }
                
                // ID cannot be older than 20 years
                const twentyYearsAgo = new Date();
                twentyYearsAgo.setFullYear(twentyYearsAgo.getFullYear() - 20);
                
                if (issueDate < twentyYearsAgo) {
                    throw new Error('ID is too old, please provide a more recent identification');
                }
                
                return true;
            }),

        idExpiryDate: body('id_expiry_date')
            .optional()
            .isISO8601()
            .withMessage('ID expiry date must be in YYYY-MM-DD format')
            .custom((value, { req }) => {
                if (value) {
                    const expiryDate = new Date(value);
                    const today = new Date();
                    const issueDate = new Date(req.body.id_issue_date);
                    
                    if (expiryDate <= today) {
                        throw new Error('ID has expired, please provide a valid identification');
                    }
                    
                    if (expiryDate <= issueDate) {
                        throw new Error('ID expiry date must be after issue date');
                    }
                }
                return true;
            })
    };

    // ============================
    // BUSINESS RULE VALIDATORS
    // ============================

    static businessRules = {
        // Validate TIN format and check digit
        validateTIN: (tin) => {
            const cleanTIN = tin.replace(/-/g, '');
            if (cleanTIN.length !== 12) return false;
            
            // TIN check digit algorithm (simplified)
            const weights = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
            let sum = 0;
            
            for (let i = 0; i < 11; i++) {
                sum += parseInt(cleanTIN[i]) * weights[i];
            }
            
            const remainder = sum % 11;
            const checkDigit = remainder < 2 ? remainder : 11 - remainder;
            
            return parseInt(cleanTIN[11]) === checkDigit;
        },

        // Validate SSS number format and check digit
        validateSSS: (sss) => {
            const cleanSSS = sss.replace(/-/g, '');
            if (cleanSSS.length !== 10) return false;
            
            // Basic SSS validation (simplified)
            const areaCode = parseInt(cleanSSS.substring(0, 2));
            return areaCode >= 1 && areaCode <= 99;
        },

        // Age eligibility check
        validateAgeEligibility: (birthDate, minAge = 18, maxAge = 65) => {
            const today = new Date();
            const birth = new Date(birthDate);
            const age = today.getFullYear() - birth.getFullYear();
            const monthDiff = today.getMonth() - birth.getMonth();
            
            const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate()) 
                ? age - 1 : age;
                
            return actualAge >= minAge && actualAge <= maxAge;
        },

        // Income verification
        validateIncomeRequirement: (income, employmentType) => {
            const minimumIncomes = {
                'regular': 15000,
                'contractual': 20000,
                'freelance': 25000,
                'business': 30000
            };
            
            return income >= (minimumIncomes[employmentType] || 15000);
        }
    };

    // ============================
    // ADVANCED SANITIZATION
    // ============================

    static sanitizeInput = (req, res, next) => {
        const sanitizeValue = (value) => {
            if (typeof value === 'string') {
                // Remove XSS vectors
                value = xss(value, {
                    whiteList: {}, // No HTML tags allowed
                    stripIgnoreTag: true,
                    stripIgnoreTagBody: ['script']
                });
                
                // Remove SQL injection patterns
                value = value.replace(/['";\\]/g, '');
                
                // Remove control characters except newlines and tabs
                value = value.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
                
                // Trim whitespace
                value = value.trim();
                
                // Normalize Unicode
                value = value.normalize('NFC');
            }
            return value;
        };

        const sanitizeObject = (obj) => {
            if (Array.isArray(obj)) {
                return obj.map(sanitizeObject);
            } else if (obj && typeof obj === 'object') {
                const sanitized = {};
                for (const [key, value] of Object.entries(obj)) {
                    sanitized[key] = sanitizeObject(value);
                }
                return sanitized;
            }
            return sanitizeValue(obj);
        };

        // Sanitize all request data
        if (req.body) req.body = sanitizeObject(req.body);
        if (req.query) req.query = sanitizeObject(req.query);
        if (req.params) req.params = sanitizeObject(req.params);

        next();
    };

    // ============================
    // VALIDATION MIDDLEWARE FACTORY
    // ============================

    static createValidationMiddleware(validationRules, customRules = []) {
        return [
            ...validationRules,
            ...customRules,
            (req, res, next) => {
                const errors = validationResult(req);
                if (!errors.isEmpty()) {
                    const formattedErrors = errors.array().map(error => ({
                        field: error.param,
                        message: error.msg,
                        value: error.value,
                        location: error.location
                    }));

                    return res.status(400).json({
                        success: false,
                        error: 'Validation failed',
                        code: 'VALIDATION_ERROR',
                        details: formattedErrors,
                        timestamp: new Date().toISOString()
                    });
                }
                next();
            }
        ];
    }

    // ============================
    // COMBINED VALIDATION SETS
    // ============================

    static registrationStep1Validation = this.createValidationMiddleware([
        this.personalInfo.firstName,
        this.personalInfo.lastName,
        this.personalInfo.middleName,
        this.personalInfo.birthDate,
        this.personalInfo.gender,
        this.personalInfo.civilStatus,
        this.authInfo.username,
        this.authInfo.password,
        this.authInfo.confirmPassword
    ]);

    static registrationStep2Validation = this.createValidationMiddleware([
        this.addressInfo.streetAddress,
        this.addressInfo.barangay,
        this.addressInfo.city,
        this.addressInfo.province,
        this.addressInfo.postalCode,
        this.addressInfo.country
    ]);

    static registrationStep3Validation = this.createValidationMiddleware([
        this.contactInfo.email,
        this.contactInfo.phoneNumber
    ]);

    static registrationStep5Validation = this.createValidationMiddleware([
        this.financialInfo.employerName,
        this.financialInfo.employmentDate,
        this.financialInfo.monthlyIncome
    ]);

    static registrationStep7Validation = this.createValidationMiddleware([
        this.idInfo.idType,
        this.idInfo.idNumber,
        this.idInfo.idIssueDate,
        this.idInfo.idExpiryDate
    ]);

    // ============================
    // QUERY PARAMETER VALIDATORS
    // ============================

    static queryValidators = {
        pagination: [
            query('limit')
                .optional()
                .isInt({ min: 1, max: 1000 })
                .withMessage('Limit must be between 1 and 1000')
                .toInt(),
            query('offset')
                .optional()
                .isInt({ min: 0 })
                .withMessage('Offset must be non-negative')
                .toInt(),
            query('page')
                .optional()
                .isInt({ min: 1 })
                .withMessage('Page must be positive')
                .toInt()
        ],

        search: [
            query('search')
                .optional()
                .trim()
                .isLength({ max: 255 })
                .withMessage('Search query too long')
                .custom((value) => {
                    // Prevent search injection
                    if (/%|_|\*/.test(value)) {
                        throw new Error('Search query contains invalid characters');
                    }
                    return true;
                })
        ],

        dateRange: [
            query('start_date')
                .optional()
                .isISO8601()
                .withMessage('Start date must be in YYYY-MM-DD format'),
            query('end_date')
                .optional()
                .isISO8601()
                .withMessage('End date must be in YYYY-MM-DD format')
                .custom((value, { req }) => {
                    if (value && req.query.start_date) {
                        const startDate = new Date(req.query.start_date);
                        const endDate = new Date(value);
                        if (endDate <= startDate) {
                            throw new Error('End date must be after start date');
                        }
                    }
                    return true;
                })
        ]
    };

    // ============================
    // FILE UPLOAD VALIDATORS
    // ============================

    static fileValidators = {
        validateImageUpload: (req, res, next) => {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    error: 'No file uploaded',
                    code: 'FILE_REQUIRED'
                });
            }

            const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
            const maxSize = 5 * 1024 * 1024; // 5MB

            if (!allowedTypes.includes(req.file.mimetype)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid file type. Only JPEG and PNG images are allowed',
                    code: 'INVALID_FILE_TYPE'
                });
            }

            if (req.file.size > maxSize) {
                return res.status(400).json({
                    success: false,
                    error: 'File too large. Maximum size is 5MB',
                    code: 'FILE_TOO_LARGE'
                });
            }

            next();
        },

        validateDocumentUpload: (req, res, next) => {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    error: 'No document uploaded',
                    code: 'DOCUMENT_REQUIRED'
                });
            }

            const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
            const maxSize = 10 * 1024 * 1024; // 10MB

            if (!allowedTypes.includes(req.file.mimetype)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid file type. Only PDF, JPEG, and PNG files are allowed',
                    code: 'INVALID_DOCUMENT_TYPE'
                });
            }

            if (req.file.size > maxSize) {
                return res.status(400).json({
                    success: false,
                    error: 'Document too large. Maximum size is 10MB',
                    code: 'DOCUMENT_TOO_LARGE'
                });
            }

            next();
        }
    };
}

module.exports = {
    ComprehensiveValidator,
    ValidationError: class ValidationError extends Error {
        constructor(message, field = null, code = 'VALIDATION_ERROR') {
            super(message);
            this.name = 'ValidationError';
            this.field = field;
            this.code = code;
            this.statusCode = 400;
        }
    }
};
