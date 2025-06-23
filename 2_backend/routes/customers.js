const express = require('express');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const { hashPassword } = require('../middleware/auth');
const router = express.Router();

// Import validation middleware
const { patterns, sanitizeInput } = require('../middleware/validation');

// Step-by-step registration validation rules
const validateStep1 = [
    body('customer_type')
        .isIn(['Account Owner', 'Business Owner'])
        .withMessage('Invalid customer type'),
    body('customer_last_name')
        .matches(/^[A-Za-z \-]+$/)
        .withMessage('Last name contains invalid characters')
        .isLength({ min: 1, max: 255 })
        .trim(),
    body('customer_first_name')
        .matches(/^[A-Za-z ]+$/)
        .withMessage('First name contains invalid characters')
        .isLength({ min: 1, max: 255 })
        .trim(),
    body('customer_middle_name')
        .optional()
        .matches(/^[A-Za-z ]*$/)
        .withMessage('Middle name contains invalid characters')
        .isLength({ max: 255 })
        .trim(),
    body('customer_suffix_name')
        .optional()
        .matches(/^[A-Za-z\.]*$/)
        .withMessage('Suffix name contains invalid characters')
        .isLength({ max: 255 })
        .trim(),
    body('customer_username')
        .matches(/^[A-Za-z0-9._-]+$/)
        .withMessage('Username contains invalid characters')
        .isLength({ min: 3, max: 50 })
        .trim(),
    body('customer_password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters'),
    body('birth_date')
        .isISO8601()
        .withMessage('Invalid birth date format')
        .custom((value) => {
            const age = (new Date() - new Date(value)) / (365.25 * 24 * 60 * 60 * 1000);
            if (age < 18) throw new Error('Must be at least 18 years old');
            if (age > 120) throw new Error('Invalid birth date');
            return true;
        }),
    body('gender')
        .isIn(['Male', 'Female', 'Non-Binary/Third Gender', 'Prefer not to say', 'Other'])
        .withMessage('Invalid gender selection'),
    body('civil_status_code')
        .matches(/^CS[0-9]{2}$/)
        .withMessage('Invalid civil status code format'),
    body('birth_country')
        .matches(/^[A-Za-z'\- ]+$/)
        .withMessage('Birth country contains invalid characters')
        .isLength({ min: 1, max: 100 })
        .trim(),
    body('residency_status')
        .isIn(['Resident', 'Non-Resident'])
        .withMessage('Invalid residency status'),
    body('citizenship')
        .matches(/^[A-Za-z'\- ]+$/)
        .withMessage('Citizenship contains invalid characters')
        .isLength({ min: 1, max: 100 })
        .trim(),
    body('tax_identification_number')
        .matches(/^[0-9]{12}$/)
        .withMessage('Tax ID must be 12 digits')
];

const validateStep2 = [
    body('address_type_code')
        .matches(/^AD[0-9]{2}$/)
        .withMessage('Invalid address type code'),
    body('address_unit')
        .optional()
        .isLength({ max: 255 })
        .trim(),
    body('address_building')
        .optional()
        .isLength({ max: 255 })
        .trim(),
    body('address_street')
        .optional()
        .isLength({ max: 255 })
        .trim(),
    body('address_subdivision')
        .optional()
        .isLength({ max: 255 })
        .trim(),
    body('address_barangay')
        .matches(/^[A-Za-z0-9.\-'\/ ]+$/)
        .withMessage('Barangay contains invalid characters')
        .isLength({ min: 1, max: 255 })
        .trim(),
    body('address_city')
        .matches(/^[A-Za-z0-9.\-'\/ ]+$/)
        .withMessage('City contains invalid characters')
        .isLength({ min: 1, max: 255 })
        .trim(),
    body('address_province')
        .matches(/^[A-Za-z0-9.\-'\/ ]+$/)
        .withMessage('Province contains invalid characters')
        .isLength({ min: 1, max: 255 })
        .trim(),
    body('address_country')
        .matches(/^[A-Za-z0-9.\-'\/ ]+$/)
        .withMessage('Country contains invalid characters')
        .isLength({ min: 1, max: 255 })
        .trim(),
    body('address_zip_code')
        .matches(/^[A-Za-z0-9.\-'\/ ]{4}$/)
        .withMessage('ZIP code must be 4 characters')
];

const validateContactStep = [
    body('contact_type_code')
        .matches(/^CT[0-9]{2}$/)
        .withMessage('Invalid contact type code'),
    body('contact_value')
        .isLength({ min: 1, max: 255 })
        .withMessage('Contact value is required')
        .trim()
];

const validateEmploymentStep = [
    body('employer_business_name')
        .matches(/^[A-Za-z0-9 .,&()'\/-]+$/)
        .withMessage('Employer name contains invalid characters')
        .isLength({ min: 1, max: 255 })
        .trim(),
    body('employment_start_date')
        .isISO8601()
        .withMessage('Invalid employment start date')
        .custom((value) => {
            if (new Date(value) > new Date()) {
                throw new Error('Employment start date cannot be in the future');
            }
            return true;
        }),
    body('employment_end_date')
        .optional()
        .isISO8601()
        .withMessage('Invalid employment end date')
        .custom((value, { req }) => {
            if (value && new Date(value) > new Date()) {
                throw new Error('Employment end date cannot be in the future');
            }
            if (value && req.body.employment_start_date && new Date(value) < new Date(req.body.employment_start_date)) {
                throw new Error('Employment end date cannot be before start date');
            }
            return true;
        }),
    body('position_code')
        .matches(/^EP[0-9]{2}$/)
        .withMessage('Invalid position code'),
    body('income_monthly_gross')
        .isFloat({ min: 0 })
        .withMessage('Monthly income must be a positive number')
        .toFloat()
];

const validateFundSourceStep = [
    body('fund_source_code')
        .matches(/^FS[0-9]{3}$/)
        .withMessage('Invalid fund source code'),
    body('remittance_country')
        .optional()
        .matches(/^[A-Za-z ]+$/)
        .withMessage('Remittance country contains invalid characters')
        .isLength({ max: 100 })
        .trim(),
    body('remittance_purpose')
        .optional()
        .matches(/^[A-Za-z0-9 ,.\-]+$/)
        .withMessage('Remittance purpose contains invalid characters')
        .isLength({ max: 255 })
        .trim()
];

const validateIDStep = [
    body('id_type_code')
        .matches(/^[A-Z]{3}$/)
        .withMessage('Invalid ID type code'),
    body('id_number')
        .matches(/^[A-Za-z0-9\-]+$/)
        .withMessage('ID number contains invalid characters')
        .isLength({ min: 1, max: 20 })
        .trim(),
    body('id_storage')
        .isLength({ min: 1, max: 255 })
        .withMessage('ID storage path is required')
        .trim(),
    body('id_issue_date')
        .isISO8601()
        .withMessage('Invalid ID issue date')
        .custom((value) => {
            if (new Date(value) > new Date()) {
                throw new Error('ID issue date cannot be in the future');
            }
            return true;
        }),
    body('id_expiry_date')
        .optional()
        .isISO8601()
        .withMessage('Invalid ID expiry date')
        .custom((value, { req }) => {
            if (value && new Date(value) <= new Date()) {
                throw new Error('ID expiry date must be in the future');
            }
            if (value && req.body.id_issue_date && new Date(value) <= new Date(req.body.id_issue_date)) {
                throw new Error('ID expiry date must be after issue date');
            }
            return true;
        })
];

// Helper function to check if registration session exists and is valid
const getRegistrationSession = async (db, registrationId) => {
    const [rows] = await db.query(
        'SELECT * FROM CUSTOMER_REGISTRATION_PROGRESS WHERE registration_id = ? AND expires_at > NOW()',
        [registrationId]
    );
    return rows.length > 0 ? rows[0] : null;
};

// Helper function to update registration progress
const updateRegistrationProgress = async (db, registrationId, stepData, stepNumber) => {
    const session = await getRegistrationSession(db, registrationId);
    if (!session) {
        throw new Error('Registration session not found or expired');
    }

    const currentData = session.registration_data || {};
    const stepProgress = session.step_progress || {};
    
    // Merge new step data
    currentData[`step${stepNumber}`] = stepData;
    stepProgress[`step${stepNumber}`] = true;
    
    // Update current step to next step if this step is completed
    const nextStep = Math.max(session.current_step, stepNumber + 1);
    
    await db.query(`
        UPDATE CUSTOMER_REGISTRATION_PROGRESS 
        SET registration_data = ?, step_progress = ?, current_step = ?, updated_at = NOW()
        WHERE registration_id = ?
    `, [JSON.stringify(currentData), JSON.stringify(stepProgress), nextStep, registrationId]);
    
    return { currentData, stepProgress, nextStep };
};

// POST /api/customers/register/start - Start registration process
router.post('/register/start', sanitizeInput, async (req, res) => {
    try {
        const registrationId = uuidv4();
        const sessionId = req.sessionID || uuidv4();
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

        await req.db.query(`
            INSERT INTO CUSTOMER_REGISTRATION_PROGRESS 
            (registration_id, session_id, current_step, total_steps, expires_at)
            VALUES (?, ?, 1, 15, ?)
        `, [registrationId, sessionId, expiresAt]);

        res.status(201).json({
            message: 'Registration started successfully',
            registration_id: registrationId,
            current_step: 1,
            total_steps: 15,
            expires_at: expiresAt
        });
    } catch (error) {
        console.error('Start registration error:', error);
        res.status(500).json({ error: 'Failed to start registration' });
    }
});

// POST /api/customers/register/step1 - Save basic customer info
router.post('/register/step1', sanitizeInput, validateStep1, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { registration_id } = req.body;
        if (!registration_id) {
            return res.status(400).json({ error: 'Registration ID is required' });
        }

        // Check if username already exists
        const [existingUser] = await req.db.query(
            'SELECT customer_username FROM CUSTOMER WHERE customer_username = ?',
            [req.body.customer_username]
        );
        
        if (existingUser.length > 0) {
            return res.status(409).json({ error: 'Username already exists' });
        }

        // Hash password
        const hashedPassword = await hashPassword(req.body.customer_password);
        
        const stepData = {
            ...req.body,
            customer_password: hashedPassword
        };
        delete stepData.registration_id;

        const { nextStep } = await updateRegistrationProgress(req.db, registration_id, stepData, 1);

        res.json({
            message: 'Step 1 completed successfully',
            current_step: nextStep,
            next_step_url: '/api/customers/register/step2'
        });
    } catch (error) {
        console.error('Step 1 error:', error);
        res.status(500).json({ error: error.message || 'Failed to save step 1 data' });
    }
});

// POST /api/customers/register/step2 - Save address information
router.post('/register/step2', sanitizeInput, validateStep2, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { registration_id } = req.body;
        if (!registration_id) {
            return res.status(400).json({ error: 'Registration ID is required' });
        }

        const stepData = { ...req.body };
        delete stepData.registration_id;

        const { nextStep } = await updateRegistrationProgress(req.db, registration_id, stepData, 2);

        res.json({
            message: 'Step 2 completed successfully',
            current_step: nextStep,
            next_step_url: '/api/customers/register/step3'
        });
    } catch (error) {
        console.error('Step 2 error:', error);
        res.status(500).json({ error: error.message || 'Failed to save step 2 data' });
    }
});

// Generic step handler for steps 3-15
const createStepHandler = (stepNumber, validationRules, stepDescription) => {
    return [sanitizeInput, ...validationRules, async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { registration_id } = req.body;
            if (!registration_id) {
                return res.status(400).json({ error: 'Registration ID is required' });
            }

            const stepData = { ...req.body };
            delete stepData.registration_id;

            const { nextStep } = await updateRegistrationProgress(req.db, registration_id, stepData, stepNumber);

            const isLastStep = stepNumber === 15;
            let response = {
                message: `${stepDescription} completed successfully`,
                current_step: nextStep
            };

            if (!isLastStep) {
                response.next_step_url = `/api/customers/register/step${nextStep}`;
            } else {
                response.message = 'All registration steps completed! You can now finalize your registration.';
                response.finalize_url = '/api/customers/register/finalize';
            }

            res.json(response);
        } catch (error) {
            console.error(`Step ${stepNumber} error:`, error);
            res.status(500).json({ error: error.message || `Failed to save step ${stepNumber} data` });
        }
    }];
};

// Register step handlers for steps 3-15
router.post('/register/step3', ...createStepHandler(3, validateContactStep, 'Step 3 (Primary Contact)'));
router.post('/register/step4', ...createStepHandler(4, validateContactStep, 'Step 4 (Secondary Contact)'));
router.post('/register/step5', ...createStepHandler(5, validateEmploymentStep, 'Step 5 (Employment Information)'));
router.post('/register/step6', ...createStepHandler(6, validateFundSourceStep, 'Step 6 (Fund Source)'));
router.post('/register/step7', ...createStepHandler(7, validateIDStep, 'Step 7 (Primary ID)'));
router.post('/register/step8', ...createStepHandler(8, validateIDStep, 'Step 8 (Secondary ID)'));

// Steps 9-15 can be additional information, aliases, or other required data
const validateGenericStep = [
    body('data')
        .isObject()
        .withMessage('Step data must be an object')
];

router.post('/register/step9', ...createStepHandler(9, validateGenericStep, 'Step 9 (Additional Information)'));
router.post('/register/step10', ...createStepHandler(10, validateGenericStep, 'Step 10'));
router.post('/register/step11', ...createStepHandler(11, validateGenericStep, 'Step 11'));
router.post('/register/step12', ...createStepHandler(12, validateGenericStep, 'Step 12'));
router.post('/register/step13', ...createStepHandler(13, validateGenericStep, 'Step 13'));
router.post('/register/step14', ...createStepHandler(14, validateGenericStep, 'Step 14'));
router.post('/register/step15', ...createStepHandler(15, validateGenericStep, 'Step 15 (Final Information)'));

// GET /api/customers/register/progress/:registrationId - Get registration progress
router.get('/register/progress/:registrationId', async (req, res) => {
    try {
        const { registrationId } = req.params;
        const session = await getRegistrationSession(req.db, registrationId);
        
        if (!session) {
            return res.status(404).json({ error: 'Registration session not found or expired' });
        }

        res.json({
            registration_id: session.registration_id,
            current_step: session.current_step,
            total_steps: session.total_steps,
            is_completed: session.is_completed,
            step_progress: session.step_progress || {},
            created_at: session.created_at,
            updated_at: session.updated_at,
            expires_at: session.expires_at
        });
    } catch (error) {
        console.error('Get progress error:', error);
        res.status(500).json({ error: 'Failed to get registration progress' });
    }
});

// GET /api/customers/register/data/:registrationId - Get saved registration data
router.get('/register/data/:registrationId', async (req, res) => {
    try {
        const { registrationId } = req.params;
        const session = await getRegistrationSession(req.db, registrationId);
        
        if (!session) {
            return res.status(404).json({ error: 'Registration session not found or expired' });
        }

        // Remove sensitive data before returning
        const registrationData = session.registration_data || {};
        if (registrationData.step1 && registrationData.step1.customer_password) {
            registrationData.step1 = { ...registrationData.step1 };
            delete registrationData.step1.customer_password;
        }

        res.json({
            registration_id: session.registration_id,
            current_step: session.current_step,
            registration_data: registrationData,
            step_progress: session.step_progress || {}
        });
    } catch (error) {
        console.error('Get registration data error:', error);
        res.status(500).json({ error: 'Failed to get registration data' });
    }
});

// POST /api/customers/register/finalize - Finalize registration and create customer
router.post('/register/finalize', sanitizeInput, async (req, res) => {
    const connection = await req.db.getConnection();
    
    try {
        const { registration_id } = req.body;
        if (!registration_id) {
            return res.status(400).json({ error: 'Registration ID is required' });
        }

        const session = await getRegistrationSession(req.db, registration_id);
        if (!session) {
            return res.status(404).json({ error: 'Registration session not found or expired' });
        }

        const registrationData = session.registration_data || {};
        const step1Data = registrationData.step1;
        const step2Data = registrationData.step2;
        
        if (!step1Data || !step2Data) {
            return res.status(400).json({ error: 'Required registration steps not completed' });
        }

        await connection.beginTransaction();

        // Create customer record
        const [customerResult] = await connection.query(`
            INSERT INTO CUSTOMER (
                customer_type, customer_last_name, customer_first_name, customer_middle_name,
                customer_suffix_name, customer_username, customer_password, birth_date,
                gender, civil_status_code, birth_country, residency_status, citizenship,
                tax_identification_number, remittance_country, remittance_purpose, customer_status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending Verification')
        `, [
            step1Data.customer_type, step1Data.customer_last_name, step1Data.customer_first_name,
            step1Data.customer_middle_name || null, step1Data.customer_suffix_name || null,
            step1Data.customer_username, step1Data.customer_password, step1Data.birth_date,
            step1Data.gender, step1Data.civil_status_code, step1Data.birth_country,
            step1Data.residency_status, step1Data.citizenship, step1Data.tax_identification_number,
            step1Data.remittance_country || null, step1Data.remittance_purpose || null
        ]);

        const cifNumber = customerResult.insertId;

        // Create address record
        await connection.query(`
            INSERT INTO CUSTOMER_ADDRESS (
                cif_number, address_type_code, address_unit, address_building,
                address_street, address_subdivision, address_barangay, address_city,
                address_province, address_country, address_zip_code
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            cifNumber, step2Data.address_type_code, step2Data.address_unit || null,
            step2Data.address_building || null, step2Data.address_street || null,
            step2Data.address_subdivision || null, step2Data.address_barangay,
            step2Data.address_city, step2Data.address_province, step2Data.address_country,
            step2Data.address_zip_code
        ]);

        // Create contact records if available
        if (registrationData.step3) {
            await connection.query(`
                INSERT INTO CUSTOMER_CONTACT_DETAILS (cif_number, contact_type_code, contact_value)
                VALUES (?, ?, ?)
            `, [cifNumber, registrationData.step3.contact_type_code, registrationData.step3.contact_value]);
        }

        if (registrationData.step4) {
            await connection.query(`
                INSERT INTO CUSTOMER_CONTACT_DETAILS (cif_number, contact_type_code, contact_value)
                VALUES (?, ?, ?)
            `, [cifNumber, registrationData.step4.contact_type_code, registrationData.step4.contact_value]);
        }

        // Create employment record if available
        if (registrationData.step5) {
            const empData = registrationData.step5;
            await connection.query(`
                INSERT INTO CUSTOMER_EMPLOYMENT_INFORMATION (
                    cif_number, employer_business_name, employment_start_date,
                    employment_end_date, position_code, income_monthly_gross
                ) VALUES (?, ?, ?, ?, ?, ?)
            `, [
                cifNumber, empData.employer_business_name, empData.employment_start_date,
                empData.employment_end_date || null, empData.position_code, empData.income_monthly_gross
            ]);
        }

        // Create fund source record if available
        if (registrationData.step6) {
            await connection.query(`
                INSERT INTO CUSTOMER_FUND_SOURCE (cif_number, fund_source_code)
                VALUES (?, ?)
            `, [cifNumber, registrationData.step6.fund_source_code]);
        }

        // Create ID records if available
        if (registrationData.step7) {
            const idData = registrationData.step7;
            await connection.query(`
                INSERT INTO CUSTOMER_ID (
                    cif_number, id_type_code, id_number, id_storage,
                    id_issue_date, id_expiry_date
                ) VALUES (?, ?, ?, ?, ?, ?)
            `, [
                cifNumber, idData.id_type_code, idData.id_number, idData.id_storage,
                idData.id_issue_date, idData.id_expiry_date || null
            ]);
        }

        if (registrationData.step8) {
            const idData = registrationData.step8;
            await connection.query(`
                INSERT INTO CUSTOMER_ID (
                    cif_number, id_type_code, id_number, id_storage,
                    id_issue_date, id_expiry_date
                ) VALUES (?, ?, ?, ?, ?, ?)
            `, [
                cifNumber, idData.id_type_code, idData.id_number, idData.id_storage,
                idData.id_issue_date, idData.id_expiry_date || null
            ]);
        }

        // Update registration progress as completed
        await connection.query(`
            UPDATE CUSTOMER_REGISTRATION_PROGRESS 
            SET cif_number = ?, is_completed = TRUE, updated_at = NOW()
            WHERE registration_id = ?
        `, [cifNumber, registration_id]);

        await connection.commit();

        res.status(201).json({
            message: 'Customer registration completed successfully',
            cif_number: cifNumber,
            customer_username: step1Data.customer_username,
            customer_status: 'Pending Verification'
        });

    } catch (error) {
        await connection.rollback();
        console.error('Finalize registration error:', error);
        res.status(500).json({ error: 'Failed to finalize registration' });
    } finally {
        connection.release();
    }
});

// Existing customer CRUD operations (updated to use correct schema)
router.get('/', async (req, res) => {
    try {
        const [rows] = await req.db.query(`
            SELECT c.*, cst.civil_status_description 
            FROM CUSTOMER c 
            LEFT JOIN CIVIL_STATUS_TYPE cst ON c.civil_status_code = cst.civil_status_code
            WHERE c.is_deleted = FALSE
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/:cif_number', async (req, res) => {
    try {
        const [rows] = await req.db.query(`
            SELECT c.*, cst.civil_status_description 
            FROM CUSTOMER c 
            LEFT JOIN CIVIL_STATUS_TYPE cst ON c.civil_status_code = cst.civil_status_code
            WHERE c.cif_number = ? AND c.is_deleted = FALSE
        `, [req.params.cif_number]);
        
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Customer not found' });
        }
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
