const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

// Enhanced JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'univault_secret_key_2024_enhanced';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'univault_refresh_secret_2024';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m'; // Short-lived access tokens
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS) || 12;

// Enhanced session management class
class SessionManager {
    constructor(db) {
        this.db = db;
    }

    // Generate secure device fingerprint
    generateDeviceFingerprint(userAgent, acceptLanguage, acceptEncoding) {
        const data = `${userAgent}-${acceptLanguage}-${acceptEncoding}`;
        return crypto.createHash('sha256').update(data).digest('hex');
    }

    // Generate JWT access token
    generateAccessToken(userId, userType, sessionId, deviceFingerprint) {
        return jwt.sign(
            {
                userId,
                userType,
                sessionId,
                deviceFingerprint,
                type: 'access',
                iat: Math.floor(Date.now() / 1000)
            },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );
    }

    // Generate JWT refresh token
    generateRefreshToken(userId, userType, sessionId) {
        return jwt.sign(
            {
                userId,
                userType,
                sessionId,
                type: 'refresh',
                iat: Math.floor(Date.now() / 1000)
            },
            JWT_REFRESH_SECRET,
            { expiresIn: JWT_REFRESH_EXPIRES_IN }
        );
    }

    // Create new session with comprehensive tracking
    async createSession(userId, userType, ipAddress, userAgent, deviceFingerprint) {
        const connection = await this.db.getConnection();
        
        try {
            await connection.beginTransaction();

            const sessionId = uuidv4();
            const accessToken = this.generateAccessToken(userId, userType, sessionId, deviceFingerprint);
            const refreshToken = this.generateRefreshToken(userId, userType, sessionId);
            
            const now = new Date();
            const accessExpiresAt = new Date(now.getTime() + (15 * 60 * 1000)); // 15 minutes
            const refreshExpiresAt = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000)); // 7 days

            // Check for max concurrent sessions
            const maxSessions = await this.getSystemConfig('session.max_concurrent_sessions', 3);
            const [activeSessions] = await connection.query(
                'SELECT COUNT(*) as count FROM user_sessions WHERE user_id = ? AND user_type = ? AND status = "active"',
                [userId, userType]
            );

            if (activeSessions[0].count >= maxSessions) {
                // Revoke oldest session
                await connection.query(`
                    UPDATE user_sessions 
                    SET status = 'revoked' 
                    WHERE user_id = ? AND user_type = ? AND status = 'active'
                    ORDER BY last_activity ASC 
                    LIMIT 1
                `, [userId, userType]);
            }

            // Create new session
            await connection.query(`
                INSERT INTO user_sessions (
                    session_id, user_id, user_type, access_token, refresh_token,
                    ip_address, user_agent, expires_at, refresh_expires_at,
                    device_fingerprint
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                sessionId, userId, userType, accessToken, refreshToken,
                ipAddress, userAgent, accessExpiresAt, refreshExpiresAt,
                deviceFingerprint
            ]);

            // Track device
            await this.trackDevice(connection, userId, userType, deviceFingerprint, userAgent, ipAddress);

            // Log security event
            await this.logSecurityEvent(connection, 'login_success', userId, userType, sessionId, ipAddress, userAgent);

            await connection.commit();

            return {
                sessionId,
                accessToken,
                refreshToken,
                expiresAt: accessExpiresAt,
                refreshExpiresAt
            };

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // Refresh access token using refresh token
    async refreshSession(refreshToken, ipAddress, userAgent) {
        const connection = await this.db.getConnection();
        
        try {
            // Verify refresh token
            const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
            
            // Get session from database
            const [sessions] = await connection.query(
                'SELECT * FROM user_sessions WHERE refresh_token = ? AND status = "active"',
                [refreshToken]
            );

            if (sessions.length === 0) {
                throw new Error('Invalid refresh token');
            }

            const session = sessions[0];

            // Check if refresh token is expired
            if (new Date() > new Date(session.refresh_expires_at)) {
                await connection.query(
                    'UPDATE user_sessions SET status = "expired" WHERE session_id = ?',
                    [session.session_id]
                );
                throw new Error('Refresh token expired');
            }

            // Generate new access token
            const newAccessToken = this.generateAccessToken(
                session.user_id,
                session.user_type,
                session.session_id,
                session.device_fingerprint
            );

            const newExpiresAt = new Date(Date.now() + (15 * 60 * 1000));

            // Update session
            await connection.query(`
                UPDATE user_sessions 
                SET access_token = ?, expires_at = ?, last_activity = NOW(),
                    ip_address = ?, user_agent = ?
                WHERE session_id = ?
            `, [newAccessToken, newExpiresAt, ipAddress, userAgent, session.session_id]);

            // Log security event
            await this.logSecurityEvent(connection, 'token_refresh', session.user_id, session.user_type, session.session_id, ipAddress, userAgent);

            return {
                accessToken: newAccessToken,
                expiresAt: newExpiresAt,
                sessionId: session.session_id
            };

        } catch (error) {
            if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
                // Log suspicious activity
                await this.logSecurityEvent(connection, 'unauthorized_access', null, null, null, ipAddress, userAgent, {
                    error: 'Invalid refresh token attempt',
                    token: refreshToken.substring(0, 20) + '...'
                });
            }
            throw error;
        } finally {
            connection.release();
        }
    }

    // Validate session and return user info
    async validateSession(sessionId, accessToken, deviceFingerprint) {
        const [sessions] = await this.db.query(
            'SELECT * FROM user_sessions WHERE session_id = ? AND access_token = ? AND status = "active"',
            [sessionId, accessToken]
        );

        if (sessions.length === 0) {
            throw new Error('Invalid session');
        }

        const session = sessions[0];

        // Check expiration
        if (new Date() > new Date(session.expires_at)) {
            await this.db.query(
                'UPDATE user_sessions SET status = "expired" WHERE session_id = ?',
                [sessionId]
            );
            throw new Error('Session expired');
        }

        // Verify device fingerprint for additional security
        if (session.device_fingerprint !== deviceFingerprint) {
            await this.logSecurityEvent(null, 'suspicious_activity', session.user_id, session.user_type, sessionId, null, null, {
                reason: 'Device fingerprint mismatch',
                expected: session.device_fingerprint,
                received: deviceFingerprint
            });
            throw new Error('Device fingerprint mismatch');
        }

        // Update last activity
        await this.db.query(
            'UPDATE user_sessions SET last_activity = NOW() WHERE session_id = ?',
            [sessionId]
        );

        return {
            userId: session.user_id,
            userType: session.user_type,
            sessionId: session.session_id
        };
    }

    // Revoke session (logout)
    async revokeSession(sessionId, reason = 'user_logout') {
        const connection = await this.db.getConnection();
        
        try {
            const [sessions] = await connection.query(
                'SELECT user_id, user_type FROM user_sessions WHERE session_id = ?',
                [sessionId]
            );

            if (sessions.length > 0) {
                const session = sessions[0];
                
                await connection.query(
                    'UPDATE user_sessions SET status = "revoked" WHERE session_id = ?',
                    [sessionId]
                );

                await this.logSecurityEvent(connection, 'logout', session.user_id, session.user_type, sessionId, null, null, {
                    reason
                });
            }

        } finally {
            connection.release();
        }
    }

    // Revoke all sessions for a user
    async revokeAllUserSessions(userId, userType, exceptSessionId = null) {
        const connection = await this.db.getConnection();
        
        try {
            let query = 'UPDATE user_sessions SET status = "revoked" WHERE user_id = ? AND user_type = ? AND status = "active"';
            let params = [userId, userType];

            if (exceptSessionId) {
                query += ' AND session_id != ?';
                params.push(exceptSessionId);
            }

            await connection.query(query, params);

            await this.logSecurityEvent(connection, 'logout', userId, userType, null, null, null, {
                reason: 'all_sessions_revoked',
                except_session: exceptSessionId
            });

        } finally {
            connection.release();
        }
    }

    // Track device information for security
    async trackDevice(connection, userId, userType, deviceFingerprint, userAgent, ipAddress) {
        const browserInfo = this.parseUserAgent(userAgent);
        
        await connection.query(`
            INSERT INTO user_devices (
                user_id, user_type, device_fingerprint, device_name,
                device_type, browser, os, last_ip, last_seen
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
            ON DUPLICATE KEY UPDATE
                last_seen = NOW(), last_ip = VALUES(last_ip),
                device_name = VALUES(device_name), browser = VALUES(browser),
                os = VALUES(os)
        `, [
            userId, userType, deviceFingerprint,
            browserInfo.device, browserInfo.type,
            browserInfo.browser, browserInfo.os, ipAddress
        ]);
    }

    // Parse user agent for device information
    parseUserAgent(userAgent) {
        // Simple user agent parsing (in production, use a proper library)
        const device = userAgent.includes('Mobile') ? 'Mobile Device' : 'Desktop';
        const type = userAgent.includes('Mobile') ? 'mobile' : 'desktop';
        
        let browser = 'Unknown';
        if (userAgent.includes('Chrome')) browser = 'Chrome';
        else if (userAgent.includes('Firefox')) browser = 'Firefox';
        else if (userAgent.includes('Safari')) browser = 'Safari';
        else if (userAgent.includes('Edge')) browser = 'Edge';

        let os = 'Unknown';
        if (userAgent.includes('Windows')) os = 'Windows';
        else if (userAgent.includes('Mac')) os = 'macOS';
        else if (userAgent.includes('Linux')) os = 'Linux';
        else if (userAgent.includes('Android')) os = 'Android';
        else if (userAgent.includes('iOS')) os = 'iOS';

        return { device, type, browser, os };
    }

    // Log security events
    async logSecurityEvent(connection, eventType, userId, userType, sessionId, ipAddress, userAgent, details = {}) {
        const db = connection || this.db;
        
        await db.query(`
            INSERT INTO security_events (
                event_type, user_id, user_type, session_id,
                ip_address, user_agent, details
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
            eventType, userId, userType, sessionId,
            ipAddress, userAgent, JSON.stringify(details)
        ]);
    }

    // Get system configuration
    async getSystemConfig(key, defaultValue) {
        try {
            const [rows] = await this.db.query(
                'SELECT config_value FROM system_configurations WHERE config_key = ? AND is_active = TRUE',
                [key]
            );
            
            if (rows.length > 0) {
                const value = JSON.parse(rows[0].config_value);
                return typeof value === 'string' ? JSON.parse(value) : value;
            }
            
            return defaultValue;
        } catch (error) {
            console.error('Error getting system config:', error);
            return defaultValue;
        }
    }

    // Clean up expired sessions (should be run periodically)
    async cleanupExpiredSessions() {
        const connection = await this.db.getConnection();
        
        try {
            await connection.query(`
                UPDATE user_sessions 
                SET status = 'expired' 
                WHERE (expires_at < NOW() OR refresh_expires_at < NOW()) 
                AND status = 'active'
            `);

            await connection.query(`
                DELETE FROM user_sessions 
                WHERE status IN ('expired', 'revoked') 
                AND last_activity < DATE_SUB(NOW(), INTERVAL 30 DAY)
            `);

        } finally {
            connection.release();
        }
    }
}

// Enhanced authentication middleware
const createAuthMiddleware = (db) => {
    const sessionManager = new SessionManager(db);

    return {
        // Authenticate and validate token
        authenticateToken: (requireAuth = true) => {
            return async (req, res, next) => {
                try {
                    const authHeader = req.headers['authorization'];
                    const token = authHeader && authHeader.split(' ')[1];

                    if (!token) {
                        if (requireAuth) {
                            return res.status(401).json({ error: 'Access token required' });
                        }
                        return next();
                    }

                    // Verify JWT token
                    const decoded = jwt.verify(token, JWT_SECRET);
                    
                    if (decoded.type !== 'access') {
                        return res.status(401).json({ error: 'Invalid token type' });
                    }

                    // Generate device fingerprint
                    const deviceFingerprint = sessionManager.generateDeviceFingerprint(
                        req.headers['user-agent'] || '',
                        req.headers['accept-language'] || '',
                        req.headers['accept-encoding'] || ''
                    );

                    // Validate session
                    const sessionInfo = await sessionManager.validateSession(
                        decoded.sessionId,
                        token,
                        deviceFingerprint
                    );

                    req.user = {
                        ...sessionInfo,
                        deviceFingerprint
                    };

                    next();

                } catch (error) {
                    console.error('Authentication error:', error.message);
                    
                    if (error.name === 'JsonWebTokenError') {
                        return res.status(401).json({ error: 'Invalid token' });
                    } else if (error.name === 'TokenExpiredError') {
                        return res.status(401).json({ error: 'Token expired', code: 'TOKEN_EXPIRED' });
                    } else if (error.message === 'Session expired') {
                        return res.status(401).json({ error: 'Session expired', code: 'SESSION_EXPIRED' });
                    } else if (error.message === 'Device fingerprint mismatch') {
                        return res.status(401).json({ error: 'Security validation failed', code: 'DEVICE_MISMATCH' });
                    } else {
                        return res.status(401).json({ error: 'Authentication failed' });
                    }
                }
            };
        },

        // Role-based authorization
        requireRole: (allowedRoles) => {
            return (req, res, next) => {
                if (!req.user) {
                    return res.status(401).json({ error: 'Authentication required' });
                }

                const userRole = req.user.userType;
                const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

                if (!roles.includes(userRole)) {
                    return res.status(403).json({ 
                        error: 'Insufficient permissions',
                        required: roles,
                        current: userRole
                    });
                }

                next();
            };
        },

        // Admin-only middleware
        requireAdmin: (req, res, next) => {
            if (req.user && req.user.userType === 'admin') {
                next();
            } else {
                res.status(403).json({ error: 'Admin access required' });
            }
        },

        sessionManager
    };
};

// Password utilities
const hashPassword = async (password) => {
    return await bcrypt.hash(password, BCRYPT_ROUNDS);
};

const comparePassword = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
};

// Password strength validation
const validatePasswordStrength = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const errors = [];

    if (password.length < minLength) {
        errors.push(`Password must be at least ${minLength} characters long`);
    }
    if (!hasUpperCase) {
        errors.push('Password must contain at least one uppercase letter');
    }
    if (!hasLowerCase) {
        errors.push('Password must contain at least one lowercase letter');
    }
    if (!hasNumbers) {
        errors.push('Password must contain at least one number');
    }
    if (!hasSpecialChar) {
        errors.push('Password must contain at least one special character');
    }

    return {
        isValid: errors.length === 0,
        errors,
        strength: errors.length === 0 ? 'strong' : errors.length <= 2 ? 'medium' : 'weak'
    };
};

module.exports = {
    createAuthMiddleware,
    SessionManager,
    hashPassword,
    comparePassword,
    validatePasswordStrength,
    JWT_SECRET,
    JWT_REFRESH_SECRET
};
