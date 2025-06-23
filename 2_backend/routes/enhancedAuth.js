const express = require('express');
const { body, validationResult } = require('express-validator');
const { createAuthMiddleware, validatePasswordStrength, hashPassword, comparePassword } = require('../middleware/enhancedAuth');
const { SecurityValidator, AccountLockoutManager, SuspiciousActivityDetector } = require('../middleware/security');
const crypto = require('crypto');
const router = express.Router();

// Initialize enhanced authentication system
let authMiddleware, sessionManager, lockoutManager, activityDetector;

// Middleware to initialize auth system with database
const initializeAuthSystem = (req, res, next) => {
    if (!authMiddleware) {
        const auth = createAuthMiddleware(req.db);
        authMiddleware = auth.authenticateToken;
        sessionManager = auth.sessionManager;
        lockoutManager = new AccountLockoutManager(req.db);
        activityDetector = new SuspiciousActivityDetector(req.db);
    }
    next();
};

router.use(initializeAuthSystem);

// ============================================================================
// ENHANCED AUTHENTICATION ENDPOINTS
// ============================================================================

/**
 * POST /api/auth/login
 * Enhanced login with comprehensive security features
 */
router.post('/login', 
    SecurityValidator.sanitizeInput,
    SecurityValidator.createValidationChain([
        body('identifier')
            .isLength({ min: 1, max: 255 })
            .withMessage('Username, email, or customer ID is required'),
        body('password')
            .isLength({ min: 1, max: 128 })
            .withMessage('Password is required'),
        body('userType')
            .optional()
            .isIn(['customer', 'employee', 'admin'])
            .withMessage('Invalid user type'),
        body('rememberMe')
            .optional()
            .isBoolean()
            .withMessage('Remember me must be boolean'),
        body('deviceName')
            .optional()
            .isLength({ max: 255 })
            .withMessage('Device name too long')
    ]),
    async (req, res) => {
        const connection = await req.db.getConnection();
        
        try {
            const { identifier, password, userType = 'customer', rememberMe = false, deviceName } = req.body;
            const ipAddress = req.ip || req.connection.remoteAddress;
            const userAgent = req.headers['user-agent'] || '';

            // Generate device fingerprint
            const deviceFingerprint = sessionManager.generateDeviceFingerprint(
                userAgent,
                req.headers['accept-language'] || '',
                req.headers['accept-encoding'] || ''
            );

            let user = null;
            let userTable, userIdField, usernameField;

            // Determine user table based on type
            switch (userType) {
                case 'admin':
                    userTable = 'admin';
                    userIdField = 'admin_id';
                    usernameField = 'username';
                    break;
                case 'employee':
                    userTable = 'BANK_EMPLOYEE';
                    userIdField = 'employee_id';
                    usernameField = 'employee_username';
                    break;
                default:
                    userTable = 'CUSTOMER';
                    userIdField = 'cif_number';
                    usernameField = 'customer_username';
            }

            // Get user from database
            const [users] = await connection.query(`
                SELECT ${userIdField} as user_id, ${usernameField} as username, 
                       password_hash, email, customer_status as status
                FROM ${userTable} 
                WHERE (${usernameField} = ? OR email = ?) AND is_deleted = FALSE
            `, [identifier, identifier]);

            if (users.length === 0) {
                // Log failed attempt
                await connection.query(`
                    INSERT INTO login_attempts 
                    (identifier, user_type, ip_address, user_agent, success, failure_reason)
                    VALUES (?, ?, ?, ?, FALSE, 'user_not_found')
                `, [identifier, userType, ipAddress, userAgent]);

                return res.status(401).json({ 
                    error: 'Invalid credentials',
                    code: 'INVALID_CREDENTIALS'
                });
            }

            user = users[0];

            // Check account lockout
            const lockoutStatus = await lockoutManager.checkLockout(user.user_id, userType);
            if (lockoutStatus.isLocked) {
                return res.status(423).json({
                    error: 'Account is locked',
                    code: 'ACCOUNT_LOCKED',
                    reason: lockoutStatus.reason,
                    unlockAt: lockoutStatus.unlockAt
                });
            }

            // Verify password
            const isValidPassword = await comparePassword(password, user.password_hash);
            if (!isValidPassword) {
                // Record failed attempt and check if should lock
                const failureResult = await lockoutManager.recordFailedAttempt(user.user_id, userType, ipAddress);
                
                await connection.query(`
                    INSERT INTO login_attempts 
                    (identifier, user_type, ip_address, user_agent, success, failure_reason)
                    VALUES (?, ?, ?, ?, FALSE, 'invalid_password')
                `, [identifier, userType, ipAddress, userAgent]);

                const response = { 
                    error: 'Invalid credentials',
                    code: 'INVALID_CREDENTIALS'
                };

                if (failureResult.shouldLock) {
                    response.warning = 'Account has been locked due to multiple failed attempts';
                    response.code = 'ACCOUNT_LOCKED_FAILED_ATTEMPTS';
                }

                return res.status(401).json(response);
            }

            // Check account status
            if (user.status && !['Active', 'ACTIVE', 'Verified'].includes(user.status)) {
                await connection.query(`
                    INSERT INTO login_attempts 
                    (identifier, user_type, ip_address, user_agent, success, failure_reason)
                    VALUES (?, ?, ?, ?, FALSE, 'account_inactive')
                `, [identifier, userType, ipAddress, userAgent]);

                return res.status(403).json({
                    error: 'Account is not active',
                    code: 'ACCOUNT_INACTIVE',
                    status: user.status
                });
            }

            // Detect suspicious activity
            const suspiciousActivity = await activityDetector.detectSuspiciousLogin(
                user.user_id, userType, ipAddress, userAgent
            );

            // Create session
            const sessionInfo = await sessionManager.createSession(
                user.user_id,
                userType,
                ipAddress,
                userAgent,
                deviceFingerprint
            );

            // Log successful login
            await connection.query(`
                INSERT INTO login_attempts 
                (identifier, user_type, ip_address, user_agent, success, session_id)
                VALUES (?, ?, ?, ?, TRUE, ?)
            `, [identifier, userType, ipAddress, userAgent, sessionInfo.sessionId]);

            // Prepare response
            const response = {
                message: 'Login successful',
                sessionId: sessionInfo.sessionId,
                accessToken: sessionInfo.accessToken,
                refreshToken: sessionInfo.refreshToken,
                expiresAt: sessionInfo.expiresAt,
                refreshExpiresAt: sessionInfo.refreshExpiresAt,
                user: {
                    id: user.user_id,
                    username: user.username,
                    email: user.email,
                    userType,
                    status: user.status
                }
            };

            // Add security warnings if suspicious activity detected
            if (suspiciousActivity.isSuspicious) {
                response.security = {
                    warning: 'Unusual login activity detected',
                    indicators: suspiciousActivity.indicators,
                    riskScore: suspiciousActivity.riskScore
                };
            }

            res.json(response);

        } catch (error) {
            console.error('Enhanced login error:', error);
            res.status(500).json({ 
                error: 'Login failed',
                code: 'INTERNAL_ERROR'
            });
        } finally {
            connection.release();
        }
    }
);

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 */
router.post('/refresh',
    SecurityValidator.sanitizeInput,
    SecurityValidator.createValidationChain([
        body('refreshToken')
            .isLength({ min: 1 })
            .withMessage('Refresh token is required')
    ]),
    async (req, res) => {
        try {
            const { refreshToken } = req.body;
            const ipAddress = req.ip || req.connection.remoteAddress;
            const userAgent = req.headers['user-agent'] || '';

            const sessionInfo = await sessionManager.refreshSession(refreshToken, ipAddress, userAgent);

            res.json({
                message: 'Token refreshed successfully',
                accessToken: sessionInfo.accessToken,
                expiresAt: sessionInfo.expiresAt,
                sessionId: sessionInfo.sessionId
            });

        } catch (error) {
            console.error('Token refresh error:', error);
            
            if (error.message.includes('Invalid') || error.message.includes('expired')) {
                return res.status(401).json({
                    error: error.message,
                    code: 'REFRESH_TOKEN_INVALID'
                });
            }

            res.status(500).json({
                error: 'Token refresh failed',
                code: 'INTERNAL_ERROR'
            });
        }
    }
);

/**
 * POST /api/auth/logout
 * Logout and revoke session
 */
router.post('/logout',
    (req, res, next) => authMiddleware(req, res, next),
    async (req, res) => {
        try {
            const { sessionId } = req.user;
            const { logoutAllDevices = false } = req.body;

            if (logoutAllDevices) {
                await sessionManager.revokeAllUserSessions(req.user.userId, req.user.userType, sessionId);
            } else {
                await sessionManager.revokeSession(sessionId, 'user_logout');
            }

            res.json({
                message: 'Logout successful',
                loggedOutAllDevices: logoutAllDevices
            });

        } catch (error) {
            console.error('Logout error:', error);
            res.status(500).json({
                error: 'Logout failed',
                code: 'INTERNAL_ERROR'
            });
        }
    }
);

/**
 * GET /api/auth/profile
 * Get current user profile with session information
 */
router.get('/profile',
    (req, res, next) => authMiddleware(req, res, next),
    async (req, res) => {
        try {
            const { userId, userType, sessionId } = req.user;
            
            let userTable, userFields;
            switch (userType) {
                case 'admin':
                    userTable = 'admin';
                    userFields = 'admin_id as user_id, username, email, created_at';
                    break;
                case 'employee':
                    userTable = 'BANK_EMPLOYEE';
                    userFields = 'employee_id as user_id, employee_username as username, email, hire_date as created_at';
                    break;
                default:
                    userTable = 'CUSTOMER';
                    userFields = `cif_number as user_id, customer_username as username, 
                                 customer_first_name as first_name, customer_last_name as last_name,
                                 email, registration_date as created_at, customer_status as status`;
            }

            const [users] = await req.db.query(`
                SELECT ${userFields} FROM ${userTable} WHERE ${userTable === 'admin' ? 'admin_id' : userTable === 'BANK_EMPLOYEE' ? 'employee_id' : 'cif_number'} = ?
            `, [userId]);

            if (users.length === 0) {
                return res.status(404).json({
                    error: 'User not found',
                    code: 'USER_NOT_FOUND'
                });
            }

            // Get session information
            const [sessions] = await req.db.query(`
                SELECT session_id, created_at, last_activity, expires_at, 
                       ip_address, device_fingerprint
                FROM user_sessions 
                WHERE session_id = ? AND status = 'active'
            `, [sessionId]);

            // Get user devices
            const [devices] = await req.db.query(`
                SELECT device_fingerprint, device_name, device_type, browser, os,
                       is_trusted, first_seen, last_seen, last_ip
                FROM user_devices 
                WHERE user_id = ? AND user_type = ? AND is_active = TRUE
                ORDER BY last_seen DESC
            `, [userId, userType]);

            res.json({
                user: users[0],
                session: sessions[0] || null,
                devices,
                userType
            });

        } catch (error) {
            console.error('Profile fetch error:', error);
            res.status(500).json({
                error: 'Failed to fetch profile',
                code: 'INTERNAL_ERROR'
            });
        }
    }
);

/**
 * PUT /api/auth/change-password
 * Change user password with enhanced security
 */
router.put('/change-password',
    (req, res, next) => authMiddleware(req, res, next),
    SecurityValidator.sanitizeInput,
    SecurityValidator.createValidationChain([
        body('currentPassword')
            .isLength({ min: 1 })
            .withMessage('Current password is required'),
        body('newPassword')
            .isLength({ min: 8, max: 128 })
            .withMessage('New password must be at least 8 characters'),
        body('confirmPassword')
            .custom((value, { req }) => {
                if (value !== req.body.newPassword) {
                    throw new Error('Password confirmation does not match');
                }
                return true;
            })
    ]),
    async (req, res) => {
        const connection = await req.db.getConnection();
        
        try {
            const { currentPassword, newPassword } = req.body;
            const { userId, userType, sessionId } = req.user;
            const ipAddress = req.ip || req.connection.remoteAddress;

            // Validate new password strength
            const passwordValidation = validatePasswordStrength(newPassword);
            if (!passwordValidation.isValid) {
                return res.status(400).json({
                    error: 'Password does not meet security requirements',
                    code: 'WEAK_PASSWORD',
                    requirements: passwordValidation.errors
                });
            }

            // Get current user
            let userTable, userIdField;
            switch (userType) {
                case 'admin':
                    userTable = 'admin';
                    userIdField = 'admin_id';
                    break;
                case 'employee':
                    userTable = 'BANK_EMPLOYEE';
                    userIdField = 'employee_id';
                    break;
                default:
                    userTable = 'CUSTOMER';
                    userIdField = 'cif_number';
            }

            const [users] = await connection.query(
                `SELECT password_hash FROM ${userTable} WHERE ${userIdField} = ?`,
                [userId]
            );

            if (users.length === 0) {
                return res.status(404).json({
                    error: 'User not found',
                    code: 'USER_NOT_FOUND'
                });
            }

            // Verify current password
            const isValidPassword = await comparePassword(currentPassword, users[0].password_hash);
            if (!isValidPassword) {
                return res.status(401).json({
                    error: 'Current password is incorrect',
                    code: 'INVALID_CURRENT_PASSWORD'
                });
            }

            // Hash new password
            const hashedNewPassword = await hashPassword(newPassword);

            await connection.beginTransaction();

            // Update password
            await connection.query(
                `UPDATE ${userTable} SET password_hash = ? WHERE ${userIdField} = ?`,
                [hashedNewPassword, userId]
            );

            // Log security event
            await connection.query(`
                INSERT INTO security_events 
                (event_type, user_id, user_type, session_id, ip_address, severity, details)
                VALUES ('password_change', ?, ?, ?, ?, 'medium', ?)
            `, [userId, userType, sessionId, ipAddress, JSON.stringify({
                strength: passwordValidation.strength,
                changedAt: new Date().toISOString()
            })]);

            // Optionally revoke all other sessions (force re-login on all devices)
            await sessionManager.revokeAllUserSessions(userId, userType, sessionId);

            await connection.commit();

            res.json({
                message: 'Password changed successfully',
                passwordStrength: passwordValidation.strength,
                allSessionsRevoked: true
            });

        } catch (error) {
            await connection.rollback();
            console.error('Password change error:', error);
            res.status(500).json({
                error: 'Failed to change password',
                code: 'INTERNAL_ERROR'
            });
        } finally {
            connection.release();
        }
    }
);

/**
 * POST /api/auth/request-password-reset
 * Request password reset token
 */
router.post('/request-password-reset',
    SecurityValidator.sanitizeInput,
    SecurityValidator.createValidationChain([
        body('identifier')
            .isLength({ min: 1 })
            .withMessage('Email or username is required'),
        body('userType')
            .optional()
            .isIn(['customer', 'employee', 'admin'])
            .withMessage('Invalid user type')
    ]),
    async (req, res) => {
        try {
            const { identifier, userType = 'customer' } = req.body;
            const ipAddress = req.ip || req.connection.remoteAddress;
            const userAgent = req.headers['user-agent'] || '';

            // Find user
            let userTable, userIdField, usernameField;
            switch (userType) {
                case 'admin':
                    userTable = 'admin';
                    userIdField = 'admin_id';
                    usernameField = 'username';
                    break;
                case 'employee':
                    userTable = 'BANK_EMPLOYEE';
                    userIdField = 'employee_id';
                    usernameField = 'employee_username';
                    break;
                default:
                    userTable = 'CUSTOMER';
                    userIdField = 'cif_number';
                    usernameField = 'customer_username';
            }

            const [users] = await req.db.query(`
                SELECT ${userIdField} as user_id, email
                FROM ${userTable} 
                WHERE (${usernameField} = ? OR email = ?) AND is_deleted = FALSE
            `, [identifier, identifier]);

            // Always return success to prevent user enumeration
            if (users.length === 0) {
                return res.json({
                    message: 'If the account exists, a password reset link has been sent',
                    code: 'RESET_REQUESTED'
                });
            }

            const user = users[0];

            // Generate reset token
            const resetToken = crypto.randomBytes(32).toString('hex');
            const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
            const expiresAt = new Date(Date.now() + (60 * 60 * 1000)); // 1 hour

            // Store reset token
            await req.db.query(`
                INSERT INTO password_reset_tokens 
                (user_id, user_type, token, token_hash, expires_at, ip_address, user_agent)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [user.user_id, userType, resetToken, tokenHash, expiresAt, ipAddress, userAgent]);

            // Log security event
            await req.db.query(`
                INSERT INTO security_events 
                (event_type, user_id, user_type, ip_address, user_agent, severity, details)
                VALUES ('password_reset_request', ?, ?, ?, ?, 'medium', ?)
            `, [user.user_id, userType, ipAddress, userAgent, JSON.stringify({
                email: user.email,
                requestedAt: new Date().toISOString()
            })]);

            // TODO: Send email with reset token
            // In production, you would send an email here
            console.log(`Password reset token for ${user.email}: ${resetToken}`);

            res.json({
                message: 'If the account exists, a password reset link has been sent',
                code: 'RESET_REQUESTED'
            });

        } catch (error) {
            console.error('Password reset request error:', error);
            res.status(500).json({
                error: 'Failed to process password reset request',
                code: 'INTERNAL_ERROR'
            });
        }
    }
);

/**
 * POST /api/auth/reset-password
 * Reset password using token
 */
router.post('/reset-password',
    SecurityValidator.sanitizeInput,
    SecurityValidator.createValidationChain([
        body('token')
            .isLength({ min: 1 })
            .withMessage('Reset token is required'),
        body('newPassword')
            .isLength({ min: 8, max: 128 })
            .withMessage('New password must be at least 8 characters'),
        body('confirmPassword')
            .custom((value, { req }) => {
                if (value !== req.body.newPassword) {
                    throw new Error('Password confirmation does not match');
                }
                return true;
            })
    ]),
    async (req, res) => {
        const connection = await req.db.getConnection();
        
        try {
            const { token, newPassword } = req.body;
            const ipAddress = req.ip || req.connection.remoteAddress;
            const userAgent = req.headers['user-agent'] || '';

            // Validate password strength
            const passwordValidation = validatePasswordStrength(newPassword);
            if (!passwordValidation.isValid) {
                return res.status(400).json({
                    error: 'Password does not meet security requirements',
                    code: 'WEAK_PASSWORD',
                    requirements: passwordValidation.errors
                });
            }

            // Find and validate reset token
            const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
            const [tokens] = await connection.query(`
                SELECT user_id, user_type, expires_at, is_used
                FROM password_reset_tokens 
                WHERE token_hash = ? AND is_used = FALSE
            `, [tokenHash]);

            if (tokens.length === 0) {
                return res.status(400).json({
                    error: 'Invalid or expired reset token',
                    code: 'INVALID_TOKEN'
                });
            }

            const resetInfo = tokens[0];

            // Check if token is expired
            if (new Date() > new Date(resetInfo.expires_at)) {
                return res.status(400).json({
                    error: 'Reset token has expired',
                    code: 'TOKEN_EXPIRED'
                });
            }

            await connection.beginTransaction();

            // Hash new password
            const hashedPassword = await hashPassword(newPassword);

            // Update password
            let userTable, userIdField;
            switch (resetInfo.user_type) {
                case 'admin':
                    userTable = 'admin';
                    userIdField = 'admin_id';
                    break;
                case 'employee':
                    userTable = 'BANK_EMPLOYEE';
                    userIdField = 'employee_id';
                    break;
                default:
                    userTable = 'CUSTOMER';
                    userIdField = 'cif_number';
            }

            await connection.query(
                `UPDATE ${userTable} SET password_hash = ? WHERE ${userIdField} = ?`,
                [hashedPassword, resetInfo.user_id]
            );

            // Mark token as used
            await connection.query(`
                UPDATE password_reset_tokens 
                SET is_used = TRUE, used_at = NOW()
                WHERE token_hash = ?
            `, [tokenHash]);

            // Revoke all active sessions for security
            await sessionManager.revokeAllUserSessions(resetInfo.user_id, resetInfo.user_type);

            // Log security event
            await connection.query(`
                INSERT INTO security_events 
                (event_type, user_id, user_type, ip_address, user_agent, severity, details)
                VALUES ('password_reset_complete', ?, ?, ?, ?, 'medium', ?)
            `, [resetInfo.user_id, resetInfo.user_type, ipAddress, userAgent, JSON.stringify({
                passwordStrength: passwordValidation.strength,
                resetAt: new Date().toISOString(),
                allSessionsRevoked: true
            })]);

            await connection.commit();

            res.json({
                message: 'Password reset successfully',
                passwordStrength: passwordValidation.strength,
                allSessionsRevoked: true
            });

        } catch (error) {
            await connection.rollback();
            console.error('Password reset error:', error);
            res.status(500).json({
                error: 'Failed to reset password',
                code: 'INTERNAL_ERROR'
            });
        } finally {
            connection.release();
        }
    }
);

/**
 * GET /api/auth/sessions
 * Get all active sessions for current user
 */
router.get('/sessions',
    (req, res, next) => authMiddleware(req, res, next),
    async (req, res) => {
        try {
            const { userId, userType } = req.user;

            const [sessions] = await req.db.query(`
                SELECT s.session_id, s.created_at, s.last_activity, s.expires_at,
                       s.ip_address, s.device_fingerprint,
                       d.device_name, d.device_type, d.browser, d.os, d.is_trusted
                FROM user_sessions s
                LEFT JOIN user_devices d ON s.device_fingerprint = d.device_fingerprint
                WHERE s.user_id = ? AND s.user_type = ? AND s.status = 'active'
                ORDER BY s.last_activity DESC
            `, [userId, userType]);

            res.json({
                sessions: sessions.map(session => ({
                    ...session,
                    isCurrent: session.session_id === req.user.sessionId
                })),
                total: sessions.length
            });

        } catch (error) {
            console.error('Sessions fetch error:', error);
            res.status(500).json({
                error: 'Failed to fetch sessions',
                code: 'INTERNAL_ERROR'
            });
        }
    }
);

/**
 * DELETE /api/auth/sessions/:sessionId
 * Revoke specific session
 */
router.delete('/sessions/:sessionId',
    (req, res, next) => authMiddleware(req, res, next),
    async (req, res) => {
        try {
            const { sessionId } = req.params;
            const { userId, userType, sessionId: currentSessionId } = req.user;

            if (sessionId === currentSessionId) {
                return res.status(400).json({
                    error: 'Cannot revoke current session. Use logout instead.',
                    code: 'CANNOT_REVOKE_CURRENT_SESSION'
                });
            }

            // Verify session belongs to user
            const [sessions] = await req.db.query(`
                SELECT session_id FROM user_sessions 
                WHERE session_id = ? AND user_id = ? AND user_type = ? AND status = 'active'
            `, [sessionId, userId, userType]);

            if (sessions.length === 0) {
                return res.status(404).json({
                    error: 'Session not found',
                    code: 'SESSION_NOT_FOUND'
                });
            }

            await sessionManager.revokeSession(sessionId, 'revoked_by_user');

            res.json({
                message: 'Session revoked successfully',
                sessionId
            });

        } catch (error) {
            console.error('Session revoke error:', error);
            res.status(500).json({
                error: 'Failed to revoke session',
                code: 'INTERNAL_ERROR'
            });
        }
    }
);

module.exports = router;
