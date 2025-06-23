const rateLimit = require('express-rate-limit');
const { body, query, param, validationResult } = require('express-validator');
const crypto = require('crypto');
const validator = require('validator');

// ============================================================================
// ADVANCED RATE LIMITING
// ============================================================================

class AdvancedRateLimiter {
    constructor(db) {
        this.db = db;
        this.memoryStore = new Map(); // In-memory cache for fast lookups
    }

    // Create rate limiter with database persistence
    createRateLimiter(options = {}) {
        const {
            windowMs = 15 * 60 * 1000, // 15 minutes
            max = 100, // requests per window
            message = 'Too many requests',
            skipSuccessfulRequests = false,
            skipFailedRequests = false,
            keyGenerator = null,
            endpoint = 'general',
            blockDuration = null // Optional additional block duration
        } = options;

        return async (req, res, next) => {
            try {
                const key = keyGenerator ? keyGenerator(req) : this.generateKey(req, endpoint);
                const now = new Date();
                const windowStart = new Date(Math.floor(now.getTime() / windowMs) * windowMs);

                // Check memory cache first for performance
                const memoryKey = `${key}_${windowStart.getTime()}`;
                let requestCount = this.memoryStore.get(memoryKey) || 0;

                // Sync with database periodically
                if (requestCount === 0) {
                    const [rows] = await this.db.query(`
                        SELECT request_count, is_blocked, block_expires_at 
                        FROM rate_limit_tracking 
                        WHERE identifier = ? AND endpoint = ? AND window_start = ?
                    `, [key, endpoint, windowStart]);

                    if (rows.length > 0) {
                        const record = rows[0];
                        requestCount = record.request_count;

                        // Check if currently blocked
                        if (record.is_blocked && record.block_expires_at > now) {
                            return res.status(429).json({
                                error: 'Rate limit exceeded - temporarily blocked',
                                retryAfter: Math.ceil((new Date(record.block_expires_at) - now) / 1000),
                                blockExpiresAt: record.block_expires_at
                            });
                        }
                    }
                }

                // Check if rate limit exceeded
                if (requestCount >= max) {
                    // Block for additional duration if specified
                    if (blockDuration) {
                        const blockExpiresAt = new Date(now.getTime() + blockDuration);
                        await this.db.query(`
                            UPDATE rate_limit_tracking 
                            SET is_blocked = TRUE, block_expires_at = ?
                            WHERE identifier = ? AND endpoint = ? AND window_start = ?
                        `, [blockExpiresAt, key, endpoint, windowStart]);
                    }

                    return res.status(429).json({
                        error: message,
                        retryAfter: Math.ceil(windowMs / 1000),
                        limit: max,
                        windowMs,
                        resetTime: new Date(windowStart.getTime() + windowMs)
                    });
                }

                // Increment counter
                requestCount++;
                this.memoryStore.set(memoryKey, requestCount);

                // Update database
                await this.db.query(`
                    INSERT INTO rate_limit_tracking 
                    (identifier, identifier_type, endpoint, request_count, window_start, last_request)
                    VALUES (?, ?, ?, 1, ?, NOW())
                    ON DUPLICATE KEY UPDATE 
                    request_count = request_count + 1,
                    last_request = NOW()
                `, [key, this.getIdentifierType(req), endpoint, windowStart]);

                // Set response headers
                res.set({
                    'X-RateLimit-Limit': max,
                    'X-RateLimit-Remaining': Math.max(0, max - requestCount),
                    'X-RateLimit-Reset': new Date(windowStart.getTime() + windowMs).toISOString()
                });

                next();

            } catch (error) {
                console.error('Rate limiter error:', error);
                // Fail open - don't block requests if rate limiter fails
                next();
            }
        };
    }

    generateKey(req, endpoint) {
        // Use user ID if authenticated, otherwise IP address
        if (req.user && req.user.userId) {
            return `user_${req.user.userId}_${endpoint}`;
        }
        return `ip_${this.getClientIP(req)}_${endpoint}`;
    }

    getIdentifierType(req) {
        return req.user && req.user.userId ? 'user' : 'ip';
    }

    getClientIP(req) {
        return req.ip || 
               req.connection.remoteAddress || 
               req.socket.remoteAddress || 
               (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
               '0.0.0.0';
    }

    // Clean up old rate limit records
    async cleanup() {
        try {
            await this.db.query(`
                DELETE FROM rate_limit_tracking 
                WHERE window_start < DATE_SUB(NOW(), INTERVAL 24 HOUR)
            `);

            // Clear old memory cache entries
            const cutoff = Date.now() - (24 * 60 * 60 * 1000);
            for (const [key, value] of this.memoryStore.entries()) {
                const timestamp = parseInt(key.split('_').pop());
                if (timestamp < cutoff) {
                    this.memoryStore.delete(key);
                }
            }
        } catch (error) {
            console.error('Rate limiter cleanup error:', error);
        }
    }
}

// ============================================================================
// ACCOUNT LOCKOUT PROTECTION
// ============================================================================

class AccountLockoutManager {
    constructor(db) {
        this.db = db;
    }

    async checkLockout(userId, userType) {
        const [rows] = await this.db.query(`
            SELECT * FROM account_lockouts 
            WHERE user_id = ? AND user_type = ? AND is_active = TRUE
        `, [userId, userType]);

        if (rows.length > 0) {
            const lockout = rows[0];
            
            // Check if lockout has expired
            if (lockout.unlock_at && new Date() > new Date(lockout.unlock_at)) {
                await this.unlockAccount(userId, userType, 'automatic_expiry');
                return { isLocked: false };
            }

            return {
                isLocked: true,
                reason: lockout.lockout_reason,
                lockedAt: lockout.locked_at,
                unlockAt: lockout.unlock_at,
                attemptCount: lockout.attempt_count
            };
        }

        return { isLocked: false };
    }

    async recordFailedAttempt(userId, userType, ipAddress) {
        const maxAttempts = 5; // Should be configurable
        const lockoutDuration = 15 * 60 * 1000; // 15 minutes

        // Get recent failed attempts
        const [attempts] = await this.db.query(`
            SELECT COUNT(*) as count FROM login_attempts 
            WHERE identifier = ? AND success = FALSE 
            AND attempt_time > DATE_SUB(NOW(), INTERVAL 1 HOUR)
        `, [userId]);

        const failedAttempts = attempts[0].count + 1;

        if (failedAttempts >= maxAttempts) {
            await this.lockAccount(userId, userType, 'failed_attempts', lockoutDuration, ipAddress, failedAttempts);
            return { shouldLock: true, attemptCount: failedAttempts };
        }

        return { shouldLock: false, attemptCount: failedAttempts };
    }

    async lockAccount(userId, userType, reason, duration, ipAddress, attemptCount) {
        const unlockAt = duration ? new Date(Date.now() + duration) : null;

        await this.db.query(`
            INSERT INTO account_lockouts 
            (user_id, user_type, lockout_reason, unlock_at, attempt_count, ip_address)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [userId, userType, reason, unlockAt, attemptCount, ipAddress]);

        // Log security event
        await this.db.query(`
            INSERT INTO security_events 
            (event_type, user_id, user_type, ip_address, severity, details)
            VALUES ('account_locked', ?, ?, ?, 'high', ?)
        `, [userId, userType, ipAddress, JSON.stringify({
            reason,
            attemptCount,
            unlockAt
        })]);
    }

    async unlockAccount(userId, userType, reason, unlockedBy = null) {
        await this.db.query(`
            UPDATE account_lockouts 
            SET is_active = FALSE, unlocked_by = ?, unlock_reason = ?
            WHERE user_id = ? AND user_type = ? AND is_active = TRUE
        `, [unlockedBy, reason, userId, userType]);

        // Log security event
        await this.db.query(`
            INSERT INTO security_events 
            (event_type, user_id, user_type, severity, details)
            VALUES ('account_unlocked', ?, ?, 'medium', ?)
        `, [userId, userType, JSON.stringify({
            reason,
            unlockedBy
        })]);
    }
}

// ============================================================================
// INPUT VALIDATION AND SANITIZATION
// ============================================================================

class SecurityValidator {
    // Comprehensive input sanitization
    static sanitizeInput(req, res, next) {
        const sanitizeValue = (value) => {
            if (typeof value === 'string') {
                // Remove potential XSS vectors
                value = value.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
                value = value.replace(/javascript:/gi, '');
                value = value.replace(/on\w+\s*=/gi, '');
                
                // Escape HTML entities
                value = validator.escape(value);
                
                // Trim whitespace
                value = value.trim();
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

        // Sanitize request data
        if (req.body) req.body = sanitizeObject(req.body);
        if (req.query) req.query = sanitizeObject(req.query);
        if (req.params) req.params = sanitizeObject(req.params);

        next();
    }

    // SQL injection protection
    static validateSQLInjection(input) {
        const sqlPatterns = [
            /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
            /('|('')|;|--|\/\*|\*\/)/,
            /(\b(OR|AND)\b.*[=<>].*(\b(OR|AND)\b|$))/i
        ];

        return !sqlPatterns.some(pattern => pattern.test(input));
    }

    // XSS protection validation
    static validateXSS(input) {
        const xssPatterns = [
            /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
            /javascript:/gi,
            /on\w+\s*=/gi,
            /<iframe|<object|<embed|<form/gi
        ];

        return !xssPatterns.some(pattern => pattern.test(input));
    }

    // Common validation rules
    static commonValidationRules = {
        // User identification
        customerId: body('customer_id')
            .isLength({ min: 1, max: 50 })
            .matches(/^[A-Za-z0-9_-]+$/)
            .withMessage('Invalid customer ID format'),

        username: body('username')
            .isLength({ min: 3, max: 50 })
            .matches(/^[A-Za-z0-9._-]+$/)
            .withMessage('Username contains invalid characters'),

        email: body('email')
            .isEmail()
            .normalizeEmail()
            .isLength({ max: 255 })
            .withMessage('Invalid email address'),

        password: body('password')
            .isLength({ min: 8, max: 128 })
            .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
            .withMessage('Password must contain at least 8 characters with uppercase, lowercase, number, and special character'),

        // Personal information
        firstName: body('first_name')
            .isLength({ min: 1, max: 100 })
            .matches(/^[A-Za-z\s'-]+$/)
            .withMessage('First name contains invalid characters'),

        lastName: body('last_name')
            .isLength({ min: 1, max: 100 })
            .matches(/^[A-Za-z\s'-]+$/)
            .withMessage('Last name contains invalid characters'),

        phoneNumber: body('phone_number')
            .isMobilePhone()
            .withMessage('Invalid phone number format'),

        dateOfBirth: body('date_of_birth')
            .isISO8601()
            .custom((value) => {
                const age = (new Date() - new Date(value)) / (365.25 * 24 * 60 * 60 * 1000);
                if (age < 18) throw new Error('Must be at least 18 years old');
                if (age > 120) throw new Error('Invalid birth date');
                return true;
            }),

        // Address validation
        streetAddress: body('street_address')
            .isLength({ min: 1, max: 255 })
            .matches(/^[A-Za-z0-9\s,.-]+$/)
            .withMessage('Street address contains invalid characters'),

        postalCode: body('postal_code')
            .isLength({ min: 4, max: 10 })
            .matches(/^[A-Za-z0-9\s-]+$/)
            .withMessage('Invalid postal code format'),

        // Financial information
        amount: body('amount')
            .isFloat({ min: 0.01 })
            .custom((value) => {
                if (value > 1000000) throw new Error('Amount exceeds maximum limit');
                return true;
            }),

        accountNumber: body('account_number')
            .isLength({ min: 8, max: 20 })
            .matches(/^[0-9]+$/)
            .withMessage('Invalid account number format'),

        // File validation
        fileUpload: body('file_path')
            .isLength({ min: 1, max: 500 })
            .custom((value) => {
                const allowedExtensions = ['.jpg', '.jpeg', '.png', '.pdf', '.doc', '.docx'];
                const extension = value.toLowerCase().slice(value.lastIndexOf('.'));
                if (!allowedExtensions.includes(extension)) {
                    throw new Error('Invalid file type');
                }
                return true;
            })
    };

    // Create custom validation chain
    static createValidationChain(rules) {
        return [
            ...rules,
            (req, res, next) => {
                const errors = validationResult(req);
                if (!errors.isEmpty()) {
                    return res.status(400).json({
                        error: 'Validation failed',
                        details: errors.array()
                    });
                }
                next();
            }
        ];
    }
}

// ============================================================================
// CSRF PROTECTION
// ============================================================================

class CSRFProtection {
    constructor() {
        this.tokens = new Map(); // In production, use Redis
    }

    generateToken(sessionId) {
        const token = crypto.randomBytes(32).toString('hex');
        const expires = Date.now() + (60 * 60 * 1000); // 1 hour
        
        this.tokens.set(sessionId, { token, expires });
        return token;
    }

    validateToken(sessionId, token) {
        const stored = this.tokens.get(sessionId);
        
        if (!stored || stored.expires < Date.now()) {
            this.tokens.delete(sessionId);
            return false;
        }

        return stored.token === token;
    }

    middleware() {
        return (req, res, next) => {
            // Skip for GET requests and auth endpoints
            if (req.method === 'GET' || req.path.includes('/auth/')) {
                return next();
            }

            const sessionId = req.user?.sessionId || req.sessionID;
            const token = req.headers['x-csrf-token'] || req.body._csrf_token;

            if (!sessionId || !token || !this.validateToken(sessionId, token)) {
                return res.status(403).json({
                    error: 'CSRF token validation failed'
                });
            }

            next();
        };
    }

    // Endpoint to get CSRF token
    getTokenEndpoint() {
        return (req, res) => {
            const sessionId = req.user?.sessionId || req.sessionID;
            if (!sessionId) {
                return res.status(401).json({ error: 'Session required' });
            }

            const token = this.generateToken(sessionId);
            res.json({ csrf_token: token });
        };
    }
}

// ============================================================================
// SECURITY HEADERS MIDDLEWARE
// ============================================================================

const securityHeaders = (req, res, next) => {
    // Content Security Policy
    res.setHeader('Content-Security-Policy', 
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
        "style-src 'self' 'unsafe-inline'; " +
        "img-src 'self' data: https:; " +
        "font-src 'self' https:; " +
        "connect-src 'self'; " +
        "frame-ancestors 'none'"
    );

    // XSS Protection
    res.setHeader('X-XSS-Protection', '1; mode=block');

    // Content Type Options
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // Frame Options
    res.setHeader('X-Frame-Options', 'DENY');

    // Referrer Policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Permissions Policy
    res.setHeader('Permissions-Policy', 
        'camera=(), microphone=(), geolocation=(), payment=()'
    );

    next();
};

// ============================================================================
// SUSPICIOUS ACTIVITY DETECTION
// ============================================================================

class SuspiciousActivityDetector {
    constructor(db) {
        this.db = db;
    }

    async detectSuspiciousLogin(userId, userType, ipAddress, userAgent) {
        const suspiciousIndicators = [];

        // Check for login from new location
        const [recentLogins] = await this.db.query(`
            SELECT DISTINCT ip_address, last_activity 
            FROM user_sessions 
            WHERE user_id = ? AND user_type = ? 
            ORDER BY last_activity DESC 
            LIMIT 10
        `, [userId, userType]);

        const knownIPs = recentLogins.map(login => login.ip_address);
        if (!knownIPs.includes(ipAddress)) {
            suspiciousIndicators.push('new_ip_address');
        }

        // Check for multiple rapid login attempts
        const [rapidAttempts] = await this.db.query(`
            SELECT COUNT(*) as count 
            FROM login_attempts 
            WHERE identifier = ? AND attempt_time > DATE_SUB(NOW(), INTERVAL 5 MINUTE)
        `, [userId]);

        if (rapidAttempts[0].count > 3) {
            suspiciousIndicators.push('rapid_login_attempts');
        }

        // Check for unusual user agent
        const [recentSessions] = await this.db.query(`
            SELECT DISTINCT user_agent 
            FROM user_sessions 
            WHERE user_id = ? AND user_type = ? 
            ORDER BY last_activity DESC 
            LIMIT 5
        `, [userId, userType]);

        const knownUserAgents = recentSessions.map(session => session.user_agent);
        if (!knownUserAgents.some(ua => ua && ua.includes(userAgent.split(' ')[0]))) {
            suspiciousIndicators.push('new_user_agent');
        }

        // Log suspicious activity if detected
        if (suspiciousIndicators.length > 0) {
            await this.db.query(`
                INSERT INTO security_events 
                (event_type, user_id, user_type, ip_address, user_agent, severity, details)
                VALUES ('suspicious_activity', ?, ?, ?, ?, 'medium', ?)
            `, [userId, userType, ipAddress, userAgent, JSON.stringify({
                indicators: suspiciousIndicators,
                risk_score: suspiciousIndicators.length * 10
            })]);
        }

        return {
            isSuspicious: suspiciousIndicators.length > 0,
            indicators: suspiciousIndicators,
            riskScore: suspiciousIndicators.length * 10
        };
    }
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
    AdvancedRateLimiter,
    AccountLockoutManager,
    SecurityValidator,
    CSRFProtection,
    SuspiciousActivityDetector,
    securityHeaders
};
