const express = require('express');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const { SecurityValidator, AdvancedRateLimiter } = require('../middleware/security');
const { createEnhancedErrorSystem } = require('../middleware/enhancedErrorHandler');
const { hashPassword } = require('../middleware/enhancedAuth');
const router = express.Router();

// Initialize enhanced error system
let logger, ValidationError, DatabaseError, ConflictError, NotFoundError;

const initializeErrorSystem = (req, res, next) => {
    if (!logger) {
        const errorSystem = createEnhancedErrorSystem(req.db);
        logger = errorSystem.logger;
        ValidationError = errorSystem.ValidationError;
        DatabaseError = errorSystem.DatabaseError;
        ConflictError = errorSystem.ConflictError;
        NotFoundError = errorSystem.NotFoundError;
    }
    next();
};

router.use(initializeErrorSystem);

// ============================================================================
// ENHANCED REGISTRATION SESSION MANAGEMENT
// ============================================================================

class RegistrationSessionManager {
    constructor(db, logger) {
        this.db = db;
        this.logger = logger;
        this.sessionTimeout = 24 * 60 * 60 * 1000; // 24 hours
        this.stepTimeout = 30 * 60 * 1000; // 30 minutes for each step
    }

    // Create new registration session
    async createSession(ipAddress, userAgent, deviceFingerprint) {
        const connection = await this.db.getConnection();
        
        try {
            await connection.beginTransaction();

            const sessionId = uuidv4();
            const registrationId = uuidv4();
            const expiresAt = new Date(Date.now() + this.sessionTimeout);

            // Create registration session
            await connection.query(`
                INSERT INTO registration_sessions (
                    session_id, registration_id, current_step, total_steps,
                    step_data, step_progress, expires_at, ip_address, 
                    user_agent, device_fingerprint
                ) VALUES (?, ?, 1, 15, '{}', '{}', ?, ?, ?, ?)
            `, [sessionId, registrationId, expiresAt, ipAddress, userAgent, deviceFingerprint]);

            // Log session creation
            this.logger.info('Registration session created', {
                sessionId,
                registrationId,
                ipAddress,
                userAgent: userAgent?.substring(0, 100)
            });

            await connection.commit();

            return {
                sessionId,
                registrationId,
                currentStep: 1,
                totalSteps: 15,
                expiresAt
            };

        } catch (error) {
            await connection.rollback();
            this.logger.error('Failed to create registration session', { error: error.message });
            throw new DatabaseError('Failed to create registration session');
        } finally {
            connection.release();
        }
    }

    // Get registration session
    async getSession(registrationId) {
        try {
            const [sessions] = await this.db.query(`
                SELECT * FROM registration_sessions 
                WHERE registration_id = ? AND expires_at > NOW() AND status = 'active'
            `, [registrationId]);

            if (sessions.length === 0) {
                throw new NotFoundError('Registration session not found or expired');
            }

            const session = sessions[0];
            return {
                ...session,
                step_data: session.step_data ? JSON.parse(session.step_data) : {},
                step_progress: session.step_progress ? JSON.parse(session.step_progress) : {}
            };

        } catch (error) {
            if (error instanceof NotFoundError) throw error;
            this.logger.error('Failed to get registration session', { 
                registrationId, 
                error: error.message 
            });
            throw new DatabaseError('Failed to retrieve registration session');
        }
    }

    // Update session step data
    async updateStep(registrationId, stepNumber, stepData, isComplete = true) {
        const connection = await this.db.getConnection();
        
        try {
            await connection.beginTransaction();

            // Get current session
            const session = await this.getSession(registrationId);
            
            // Validate step number
            if (stepNumber < 1 || stepNumber > 15) {
                throw new ValidationError('Invalid step number', 'stepNumber');
            }

            // Validate step sequence (allow going back, but not skipping ahead)
            if (stepNumber > session.current_step + 1) {
                throw new ValidationError(`Cannot skip to step ${stepNumber}. Complete previous steps first.`, 'stepNumber');
            }

            // Update step data
            const currentStepData = session.step_data || {};
            const currentProgress = session.step_progress || {};
            
            currentStepData[`step${stepNumber}`] = stepData;
            currentProgress[`step${stepNumber}`] = isComplete;

            // Calculate next step
            const nextStep = isComplete ? Math.min(Math.max(session.current_step, stepNumber + 1), 15) : session.current_step;
            
            // Check if all steps are completed
            const allStepsCompleted = Object.keys(currentProgress).length === 15 && 
                                     Object.values(currentProgress).every(Boolean);

            await connection.query(`
                UPDATE registration_sessions 
                SET step_data = ?, step_progress = ?, current_step = ?, updated_at = NOW()
                WHERE registration_id = ?
            `, [
                JSON.stringify(currentStepData),
                JSON.stringify(currentProgress),
                nextStep,
                registrationId
            ]);

            this.logger.info('Registration step updated', {
                registrationId,
                stepNumber,
                nextStep,
                isComplete,
                allStepsCompleted
            });

            await connection.commit();

            return {
                currentStep: nextStep,
                stepProgress: currentProgress,
                allStepsCompleted,
                nextStepUrl: allStepsCompleted ? 
                    '/api/enhanced-registration/finalize' : 
                    `/api/enhanced-registration/step/${nextStep}`
            };

        } catch (error) {
            await connection.rollback();
            if (error instanceof ValidationError || error instanceof NotFoundError) throw error;
            this.logger.error('Failed to update registration step', { 
                registrationId, 
                stepNumber, 
                error: error.message 
            });
            throw new DatabaseError('Failed to update registration step');
        } finally {
            connection.release();
        }
    }

    // Validate step data based on step number
    validateStepData(stepNumber, data) {
        const errors = [];

        switch (stepNumber) {
            case 1: // Personal Information
                if (!data.customer_first_name) errors.push('First name is required');
                if (!data.customer_last_name) errors.push('Last name is required');
                if (!data.birth_date) errors.push('Birth date is required');
                if (!data.customer_username) errors.push('Username is required');
                if (!data.customer_password) errors.push('Password is required');
                break;

            case 2: // Address Information
                if (!data.address_barangay) errors.push('Barangay is required');
                if (!data.address_city) errors.push('City is required');
                if (!data.address_province) errors.push('Province is required');
                if (!data.address_zip_code) errors.push('ZIP code is required');
                break;

            case 3: // Primary Contact
            case 4: // Secondary Contact
                if (!data.contact_type_code) errors.push('Contact type is required');
                if (!data.contact_value) errors.push('Contact value is required');
                break;

            case 5: // Employment Information
                if (!data.employer_business_name) errors.push('Employer name is required');
                if (!data.employment_start_date) errors.push('Employment start date is required');
                if (!data.position_code) errors.push('Position is required');
                if (!data.income_monthly_gross) errors.push('Monthly income is required');
                break;

            case 6: // Fund Source
                if (!data.fund_source_code) errors.push('Fund source is required');
                break;

            case 7: // Primary ID
            case 8: // Secondary ID
                if (!data.id_type_code) errors.push('ID type is required');
                if (!data.id_number) errors.push('ID number is required');
                if (!data.id_issue_date) errors.push('ID issue date is required');
                break;

            // Steps 9-15 can have flexible validation
            default:
                if (stepNumber >= 9 && stepNumber <= 15) {
                    // Minimal validation for additional information steps
                    if (typeof data !== 'object') {
                        errors.push('Step data must be an object');
                    }
                }
                break;
        }

        return errors;
    }

    // Finalize registration and create customer
    async finalizeRegistration(registrationId) {
        const connection = await this.db.getConnection();
        
        try {
            await connection.beginTransaction();

            // Get complete session
            const session = await this.getSession(registrationId);
            
            // Validate all required steps are completed
            const requiredSteps = [1, 2, 3, 5, 6, 7]; // Minimum required steps
            const completedSteps = Object.keys(session.step_progress).map(s => parseInt(s.replace('step', '')));
            const missingSteps = requiredSteps.filter(step => !completedSteps.includes(step));

            if (missingSteps.length > 0) {
                throw new ValidationError(`Missing required steps: ${missingSteps.join(', ')}`);
            }

            const stepData = session.step_data;
            
            // Check for duplicate username/email
            const [existingCustomer] = await connection.query(`
                SELECT cif_number FROM CUSTOMER 
                WHERE customer_username = ? OR 
                      (customer_first_name = ? AND customer_last_name = ? AND birth_date = ?)
            `, [
                stepData.step1.customer_username,
                stepData.step1.customer_first_name,
                stepData.step1.customer_last_name,
                stepData.step1.birth_date
            ]);

            if (existingCustomer.length > 0) {
                throw new ConflictError('Customer with this username or personal information already exists');
            }

            // Hash password
            const hashedPassword = await hashPassword(stepData.step1.customer_password);

            // Create customer record
            const [customerResult] = await connection.query(`
                INSERT INTO CUSTOMER (
                    customer_type, customer_last_name, customer_first_name, 
                    customer_middle_name, customer_suffix_name, customer_username, 
                    customer_password, birth_date, gender, civil_status_code, 
                    birth_country, residency_status, citizenship, 
                    tax_identification_number, customer_status, registration_date
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending Verification', NOW())
            `, [
                stepData.step1.customer_type || 'Individual',
                stepData.step1.customer_last_name,
                stepData.step1.customer_first_name,
                stepData.step1.customer_middle_name || null,
                stepData.step1.customer_suffix_name || null,
                stepData.step1.customer_username,
                hashedPassword,
                stepData.step1.birth_date,
                stepData.step1.gender,
                stepData.step1.civil_status_code,
                stepData.step1.birth_country,
                stepData.step1.residency_status,
                stepData.step1.citizenship,
                stepData.step1.tax_identification_number
            ]);

            const cifNumber = customerResult.insertId;

            // Create address record
            if (stepData.step2) {
                await connection.query(`
                    INSERT INTO CUSTOMER_ADDRESS (
                        cif_number, address_type_code, address_unit, address_building,
                        address_street, address_subdivision, address_barangay, 
                        address_city, address_province, address_country, address_zip_code
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                    cifNumber,
                    stepData.step2.address_type_code || 'AD01',
                    stepData.step2.address_unit || null,
                    stepData.step2.address_building || null,
                    stepData.step2.address_street || null,
                    stepData.step2.address_subdivision || null,
                    stepData.step2.address_barangay,
                    stepData.step2.address_city,
                    stepData.step2.address_province,
                    stepData.step2.address_country || 'Philippines',
                    stepData.step2.address_zip_code
                ]);
            }

            // Create contact records
            if (stepData.step3) {
                await connection.query(`
                    INSERT INTO CUSTOMER_CONTACT_DETAILS (cif_number, contact_type_code, contact_value)
                    VALUES (?, ?, ?)
                `, [cifNumber, stepData.step3.contact_type_code, stepData.step3.contact_value]);
            }

            if (stepData.step4) {
                await connection.query(`
                    INSERT INTO CUSTOMER_CONTACT_DETAILS (cif_number, contact_type_code, contact_value)
                    VALUES (?, ?, ?)
                `, [cifNumber, stepData.step4.contact_type_code, stepData.step4.contact_value]);
            }

            // Create employment record
            if (stepData.step5) {
                await connection.query(`
                    INSERT INTO CUSTOMER_EMPLOYMENT_INFORMATION (
                        cif_number, employer_business_name, employment_start_date,
                        employment_end_date, position_code, income_monthly_gross
                    ) VALUES (?, ?, ?, ?, ?, ?)
                `, [
                    cifNumber,
                    stepData.step5.employer_business_name,
                    stepData.step5.employment_start_date,
                    stepData.step5.employment_end_date || null,
                    stepData.step5.position_code,
                    stepData.step5.income_monthly_gross
                ]);
            }

            // Create fund source record
            if (stepData.step6) {
                await connection.query(`
                    INSERT INTO CUSTOMER_FUND_SOURCE (cif_number, fund_source_code)
                    VALUES (?, ?)
                `, [cifNumber, stepData.step6.fund_source_code]);
            }

            // Create ID records
            if (stepData.step7) {
                await connection.query(`
                    INSERT INTO CUSTOMER_ID (
                        cif_number, id_type_code, id_number, id_storage,
                        id_issue_date, id_expiry_date
                    ) VALUES (?, ?, ?, ?, ?, ?)
                `, [
                    cifNumber,
                    stepData.step7.id_type_code,
                    stepData.step7.id_number,
                    stepData.step7.id_storage || 'pending_upload',
                    stepData.step7.id_issue_date,
                    stepData.step7.id_expiry_date || null
                ]);
            }

            if (stepData.step8) {
                await connection.query(`
                    INSERT INTO CUSTOMER_ID (
                        cif_number, id_type_code, id_number, id_storage,
                        id_issue_date, id_expiry_date
                    ) VALUES (?, ?, ?, ?, ?, ?)
                `, [
                    cifNumber,
                    stepData.step8.id_type_code,
                    stepData.step8.id_number,
                    stepData.step8.id_storage || 'pending_upload',
                    stepData.step8.id_issue_date,
                    stepData.step8.id_expiry_date || null
                ]);
            }

            // Mark registration session as completed
            await connection.query(`
                UPDATE registration_sessions 
                SET status = 'completed', completed_at = NOW(), cif_number = ?
                WHERE registration_id = ?
            `, [cifNumber, registrationId]);

            this.logger.info('Registration finalized successfully', {
                registrationId,
                cifNumber,
                username: stepData.step1.customer_username
            });

            await connection.commit();

            return {
                cifNumber,
                username: stepData.step1.customer_username,
                status: 'Pending Verification',
                message: 'Registration completed successfully. Your account is pending verification.'
            };

        } catch (error) {
            await connection.rollback();
            if (error instanceof ValidationError || error instanceof ConflictError) throw error;
            this.logger.error('Failed to finalize registration', { 
                registrationId, 
                error: error.message 
            });
            throw new DatabaseError('Failed to finalize registration');
        } finally {
            connection.release();
        }
    }
}

// Initialize registration manager
let registrationManager;

const initializeRegistrationManager = (req, res, next) => {
    if (!registrationManager) {
        registrationManager = new RegistrationSessionManager(req.db, logger);
    }
    next();
};

router.use(initializeRegistrationManager);

// ============================================================================
// ENHANCED REGISTRATION ENDPOINTS
// ============================================================================

/**
 * POST /api/enhanced-registration/start
 * Start new registration session with enhanced tracking
 */
router.post('/start',
    SecurityValidator.sanitizeInput,
    async (req, res, next) => {
        try {
            const ipAddress = req.ip || req.connection.remoteAddress;
            const userAgent = req.headers['user-agent'] || '';
            const deviceFingerprint = req.headers['x-device-fingerprint'] || 
                                    Buffer.from(`${userAgent}-${ipAddress}`).toString('base64');

            const sessionInfo = await registrationManager.createSession(ipAddress, userAgent, deviceFingerprint);

            res.status(201).json({
                success: true,
                message: 'Registration session started successfully',
                data: sessionInfo,
                nextStepUrl: '/api/enhanced-registration/step/1'
            });

        } catch (error) {
            next(error);
        }
    }
);

/**
 * GET /api/enhanced-registration/progress/:registrationId
 * Get registration progress and current state
 */
router.get('/progress/:registrationId',
    SecurityValidator.sanitizeInput,
    async (req, res, next) => {
        try {
            const { registrationId } = req.params;
            const session = await registrationManager.getSession(registrationId);

            // Calculate completion percentage
            const completedSteps = Object.values(session.step_progress).filter(Boolean).length;
            const completionPercentage = Math.round((completedSteps / 15) * 100);

            res.json({
                success: true,
                data: {
                    registrationId: session.registration_id,
                    currentStep: session.current_step,
                    totalSteps: session.total_steps,
                    completedSteps,
                    completionPercentage,
                    stepProgress: session.step_progress,
                    status: session.status,
                    createdAt: session.created_at,
                    expiresAt: session.expires_at,
                    timeRemaining: new Date(session.expires_at).getTime() - Date.now()
                }
            });

        } catch (error) {
            next(error);
        }
    }
);

/**
 * GET /api/enhanced-registration/data/:registrationId
 * Get saved registration data (sanitized)
 */
router.get('/data/:registrationId',
    SecurityValidator.sanitizeInput,
    async (req, res, next) => {
        try {
            const { registrationId } = req.params;
            const session = await registrationManager.getSession(registrationId);

            // Sanitize sensitive data
            const sanitizedData = { ...session.step_data };
            if (sanitizedData.step1?.customer_password) {
                delete sanitizedData.step1.customer_password;
            }

            res.json({
                success: true,
                data: {
                    registrationId: session.registration_id,
                    currentStep: session.current_step,
                    stepData: sanitizedData,
                    stepProgress: session.step_progress
                }
            });

        } catch (error) {
            next(error);
        }
    }
);

/**
 * POST /api/enhanced-registration/step/:stepNumber
 * Save data for specific registration step
 */
router.post('/step/:stepNumber',
    SecurityValidator.sanitizeInput,
    [
        body('registrationId').isUUID().withMessage('Valid registration ID is required'),
        body('stepData').isObject().withMessage('Step data must be an object'),
        body('isComplete').optional().isBoolean().withMessage('isComplete must be boolean')
    ],
    async (req, res, next) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                throw new ValidationError('Validation failed', null, 'VALIDATION_ERROR');
            }

            const stepNumber = parseInt(req.params.stepNumber);
            const { registrationId, stepData, isComplete = true } = req.body;

            // Validate step data
            const validationErrors = registrationManager.validateStepData(stepNumber, stepData);
            if (validationErrors.length > 0 && isComplete) {
                throw new ValidationError(`Step ${stepNumber} validation failed: ${validationErrors.join(', ')}`);
            }

            const result = await registrationManager.updateStep(registrationId, stepNumber, stepData, isComplete);

            res.json({
                success: true,
                message: `Step ${stepNumber} ${isComplete ? 'completed' : 'saved'} successfully`,
                data: {
                    currentStep: result.currentStep,
                    stepProgress: result.stepProgress,
                    allStepsCompleted: result.allStepsCompleted,
                    nextStepUrl: result.nextStepUrl
                }
            });

        } catch (error) {
            next(error);
        }
    }
);

/**
 * PUT /api/enhanced-registration/step/:stepNumber
 * Update existing step data
 */
router.put('/step/:stepNumber',
    SecurityValidator.sanitizeInput,
    [
        body('registrationId').isUUID().withMessage('Valid registration ID is required'),
        body('stepData').isObject().withMessage('Step data must be an object')
    ],
    async (req, res, next) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                throw new ValidationError('Validation failed', null, 'VALIDATION_ERROR');
            }

            const stepNumber = parseInt(req.params.stepNumber);
            const { registrationId, stepData } = req.body;

            // Update step without changing completion status
            const session = await registrationManager.getSession(registrationId);
            const currentProgress = session.step_progress;
            const isCurrentlyComplete = currentProgress[`step${stepNumber}`] || false;

            const result = await registrationManager.updateStep(registrationId, stepNumber, stepData, isCurrentlyComplete);

            res.json({
                success: true,
                message: `Step ${stepNumber} updated successfully`,
                data: {
                    currentStep: result.currentStep,
                    stepProgress: result.stepProgress
                }
            });

        } catch (error) {
            next(error);
        }
    }
);

/**
 * POST /api/enhanced-registration/finalize
 * Finalize registration and create customer account
 */
router.post('/finalize',
    SecurityValidator.sanitizeInput,
    [
        body('registrationId').isUUID().withMessage('Valid registration ID is required')
    ],
    async (req, res, next) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                throw new ValidationError('Validation failed', null, 'VALIDATION_ERROR');
            }

            const { registrationId } = req.body;
            const result = await registrationManager.finalizeRegistration(registrationId);

            res.status(201).json({
                success: true,
                message: 'Registration completed successfully',
                data: result
            });

        } catch (error) {
            next(error);
        }
    }
);

/**
 * DELETE /api/enhanced-registration/:registrationId
 * Cancel registration session
 */
router.delete('/:registrationId',
    SecurityValidator.sanitizeInput,
    async (req, res, next) => {
        try {
            const { registrationId } = req.params;

            await req.db.query(`
                UPDATE registration_sessions 
                SET status = 'cancelled', updated_at = NOW()
                WHERE registration_id = ?
            `, [registrationId]);

            logger.info('Registration session cancelled', { registrationId });

            res.json({
                success: true,
                message: 'Registration session cancelled successfully'
            });

        } catch (error) {
            next(error);
        }
    }
);

/**
 * POST /api/enhanced-registration/validate-step
 * Validate step data without saving
 */
router.post('/validate-step',
    SecurityValidator.sanitizeInput,
    [
        body('stepNumber').isInt({ min: 1, max: 15 }).withMessage('Valid step number required'),
        body('stepData').isObject().withMessage('Step data must be an object')
    ],
    async (req, res, next) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                throw new ValidationError('Validation failed', null, 'VALIDATION_ERROR');
            }

            const { stepNumber, stepData } = req.body;
            const validationErrors = registrationManager.validateStepData(stepNumber, stepData);

            res.json({
                success: true,
                data: {
                    isValid: validationErrors.length === 0,
                    errors: validationErrors,
                    stepNumber
                }
            });

        } catch (error) {
            next(error);
        }
    }
);

module.exports = router;
