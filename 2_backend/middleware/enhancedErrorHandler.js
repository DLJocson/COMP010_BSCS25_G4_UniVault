const fs = require('fs');
const path = require('path');

// ============================================================================
// ENHANCED LOGGING SYSTEM
// ============================================================================

class Logger {
    constructor(options = {}) {
        this.logDir = options.logDir || path.join(__dirname, '../logs');
        this.maxFileSize = options.maxFileSize || 10 * 1024 * 1024; // 10MB
        this.maxFiles = options.maxFiles || 5;
        this.enableConsole = options.enableConsole !== false;
        this.enableFile = options.enableFile !== false;
        
        // Create logs directory if it doesn't exist
        if (this.enableFile && !fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir, { recursive: true });
        }
    }

    formatMessage(level, message, metadata = {}) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            level: level.toUpperCase(),
            message,
            ...metadata
        };

        // Add process information
        logEntry.process = {
            pid: process.pid,
            memory: process.memoryUsage(),
            uptime: process.uptime()
        };

        return logEntry;
    }

    writeToFile(level, logEntry) {
        if (!this.enableFile) return;

        const filename = `${level}-${new Date().toISOString().split('T')[0]}.log`;
        const filepath = path.join(this.logDir, filename);
        const logLine = JSON.stringify(logEntry) + '\n';

        try {
            // Check file size and rotate if necessary
            if (fs.existsSync(filepath)) {
                const stats = fs.statSync(filepath);
                if (stats.size > this.maxFileSize) {
                    this.rotateLogFile(filepath);
                }
            }

            fs.appendFileSync(filepath, logLine);
        } catch (error) {
            console.error('Failed to write to log file:', error);
        }
    }

    rotateLogFile(filepath) {
        try {
            const dir = path.dirname(filepath);
            const ext = path.extname(filepath);
            const basename = path.basename(filepath, ext);
            
            // Move current files
            for (let i = this.maxFiles - 1; i > 0; i--) {
                const oldFile = path.join(dir, `${basename}.${i}${ext}`);
                const newFile = path.join(dir, `${basename}.${i + 1}${ext}`);
                
                if (fs.existsSync(oldFile)) {
                    if (i === this.maxFiles - 1) {
                        fs.unlinkSync(oldFile); // Delete oldest
                    } else {
                        fs.renameSync(oldFile, newFile);
                    }
                }
            }
            
            // Move current file to .1
            const rotatedFile = path.join(dir, `${basename}.1${ext}`);
            fs.renameSync(filepath, rotatedFile);
        } catch (error) {
            console.error('Failed to rotate log file:', error);
        }
    }

    log(level, message, metadata = {}) {
        const logEntry = this.formatMessage(level, message, metadata);

        // Console output with color coding
        if (this.enableConsole) {
            const colors = {
                ERROR: '\x1b[31m',   // Red
                WARN: '\x1b[33m',    // Yellow
                INFO: '\x1b[36m',    // Cyan
                DEBUG: '\x1b[90m',   // Bright Black
                RESET: '\x1b[0m'     // Reset
            };

            const color = colors[level.toUpperCase()] || colors.RESET;
            const resetColor = colors.RESET;
            
            console.log(
                `${color}[${logEntry.timestamp}] ${logEntry.level}:${resetColor} ${message}`,
                Object.keys(metadata).length > 0 ? metadata : ''
            );
        }

        // File output
        this.writeToFile(level, logEntry);
    }

    error(message, metadata = {}) {
        this.log('error', message, metadata);
    }

    warn(message, metadata = {}) {
        this.log('warn', message, metadata);
    }

    info(message, metadata = {}) {
        this.log('info', message, metadata);
    }

    debug(message, metadata = {}) {
        this.log('debug', message, metadata);
    }

    // Security-specific logging
    security(event, details = {}) {
        this.log('warn', `SECURITY EVENT: ${event}`, {
            category: 'security',
            event,
            ...details
        });
    }

    // API request logging
    api(req, res, duration, error = null) {
        const metadata = {
            category: 'api',
            method: req.method,
            url: req.originalUrl,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip || req.connection.remoteAddress,
            userAgent: req.headers['user-agent'],
            userId: req.user?.userId || null,
            userType: req.user?.userType || null
        };

        if (error) {
            metadata.error = {
                message: error.message,
                stack: error.stack
            };
            this.error(`API Error: ${req.method} ${req.originalUrl}`, metadata);
        } else {
            const level = res.statusCode >= 400 ? 'warn' : 'info';
            this.log(level, `API Request: ${req.method} ${req.originalUrl}`, metadata);
        }
    }

    // Database operation logging
    database(operation, details = {}) {
        this.info(`Database Operation: ${operation}`, {
            category: 'database',
            operation,
            ...details
        });
    }
}

// ============================================================================
// CUSTOM ERROR CLASSES
// ============================================================================

class ValidationError extends Error {
    constructor(message, field = null, code = 'VALIDATION_ERROR') {
        super(message);
        this.name = 'ValidationError';
        this.field = field;
        this.code = code;
        this.statusCode = 400;
        this.isOperational = true;
    }
}

class AuthenticationError extends Error {
    constructor(message = 'Authentication failed', code = 'AUTH_ERROR') {
        super(message);
        this.name = 'AuthenticationError';
        this.code = code;
        this.statusCode = 401;
        this.isOperational = true;
    }
}

class AuthorizationError extends Error {
    constructor(message = 'Access denied', code = 'ACCESS_DENIED') {
        super(message);
        this.name = 'AuthorizationError';
        this.code = code;
        this.statusCode = 403;
        this.isOperational = true;
    }
}

class NotFoundError extends Error {
    constructor(message = 'Resource not found', code = 'NOT_FOUND') {
        super(message);
        this.name = 'NotFoundError';
        this.code = code;
        this.statusCode = 404;
        this.isOperational = true;
    }
}

class ConflictError extends Error {
    constructor(message = 'Resource conflict', code = 'CONFLICT') {
        super(message);
        this.name = 'ConflictError';
        this.code = code;
        this.statusCode = 409;
        this.isOperational = true;
    }
}

class RateLimitError extends Error {
    constructor(message = 'Rate limit exceeded', retryAfter = null) {
        super(message);
        this.name = 'RateLimitError';
        this.code = 'RATE_LIMIT_EXCEEDED';
        this.statusCode = 429;
        this.retryAfter = retryAfter;
        this.isOperational = true;
    }
}

class DatabaseError extends Error {
    constructor(message = 'Database operation failed', code = 'DB_ERROR') {
        super(message);
        this.name = 'DatabaseError';
        this.code = code;
        this.statusCode = 500;
        this.isOperational = true;
    }
}

class ExternalServiceError extends Error {
    constructor(message = 'External service error', service = null, code = 'EXTERNAL_ERROR') {
        super(message);
        this.name = 'ExternalServiceError';
        this.service = service;
        this.code = code;
        this.statusCode = 503;
        this.isOperational = true;
    }
}

// ============================================================================
// ENHANCED ERROR HANDLER MIDDLEWARE
// ============================================================================

class EnhancedErrorHandler {
    constructor(logger) {
        this.logger = logger;
    }

    // Express error handling middleware
    middleware() {
        return (error, req, res, next) => {
            // If response was already sent, delegate to Express default handler
            if (res.headersSent) {
                return next(error);
            }

            // Log the error
            this.logError(error, req);

            // Determine if this is an operational error or a programming error
            const isOperational = error.isOperational || false;
            
            // Create standardized error response
            const errorResponse = this.createErrorResponse(error, req, isOperational);

            // Security: Don't expose internal errors in production
            if (process.env.NODE_ENV === 'production' && !isOperational) {
                errorResponse.error = 'Internal server error';
                errorResponse.message = 'An unexpected error occurred';
                delete errorResponse.stack;
                delete errorResponse.details;
            }

            // Send error response
            res.status(error.statusCode || 500).json(errorResponse);

            // For non-operational errors in production, consider alerting
            if (!isOperational && process.env.NODE_ENV === 'production') {
                this.alertCriticalError(error, req);
            }
        };
    }

    logError(error, req = null) {
        const metadata = {
            error: {
                name: error.name,
                message: error.message,
                code: error.code,
                statusCode: error.statusCode,
                stack: error.stack,
                isOperational: error.isOperational
            }
        };

        if (req) {
            metadata.request = {
                method: req.method,
                url: req.originalUrl,
                headers: req.headers,
                body: this.sanitizeRequestBody(req.body),
                query: req.query,
                params: req.params,
                ip: req.ip || req.connection.remoteAddress,
                userAgent: req.headers['user-agent'],
                userId: req.user?.userId,
                userType: req.user?.userType,
                sessionId: req.user?.sessionId
            };
        }

        this.logger.error(`${error.name}: ${error.message}`, metadata);
    }

    sanitizeRequestBody(body) {
        if (!body || typeof body !== 'object') return body;

        const sanitized = { ...body };
        const sensitiveFields = ['password', 'token', 'secret', 'key', 'ssn', 'credit_card'];
        
        for (const field of sensitiveFields) {
            if (sanitized[field]) {
                sanitized[field] = '[REDACTED]';
            }
        }

        return sanitized;
    }

    createErrorResponse(error, req, isOperational) {
        const response = {
            success: false,
            error: error.message || 'An error occurred',
            code: error.code || 'UNKNOWN_ERROR',
            statusCode: error.statusCode || 500,
            timestamp: new Date().toISOString(),
            path: req?.originalUrl || 'unknown',
            requestId: req?.headers['x-request-id'] || this.generateRequestId()
        };

        // Add specific error details for operational errors
        if (isOperational) {
            if (error.field) response.field = error.field;
            if (error.retryAfter) response.retryAfter = error.retryAfter;
            if (error.service) response.service = error.service;
        }

        // Add validation details for validation errors
        if (error.name === 'ValidationError' && error.details) {
            response.details = error.details;
        }

        // Add stack trace in development
        if (process.env.NODE_ENV === 'development') {
            response.stack = error.stack;
        }

        return response;
    }

    generateRequestId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    alertCriticalError(error, req) {
        // In production, this would send alerts to monitoring services
        // For now, just log a critical message
        this.logger.error('CRITICAL ERROR ALERT', {
            error: {
                name: error.name,
                message: error.message,
                stack: error.stack
            },
            request: req ? {
                method: req.method,
                url: req.originalUrl,
                ip: req.ip
            } : null,
            alertLevel: 'CRITICAL'
        });
    }

    // 404 Not Found handler
    notFoundHandler() {
        return (req, res, next) => {
            const error = new NotFoundError(`Route not found: ${req.method} ${req.originalUrl}`);
            next(error);
        };
    }

    // Async error wrapper for route handlers
    asyncWrapper(fn) {
        return (req, res, next) => {
            Promise.resolve(fn(req, res, next)).catch(next);
        };
    }
}

// ============================================================================
// REQUEST LOGGING MIDDLEWARE
// ============================================================================

const createRequestLogger = (logger) => {
    return (req, res, next) => {
        const startTime = Date.now();
        
        // Generate request ID
        req.requestId = req.headers['x-request-id'] || 
                       Date.now().toString(36) + Math.random().toString(36).substr(2);
        
        // Set request ID header
        res.setHeader('X-Request-ID', req.requestId);

        // Log request start
        logger.info('Request started', {
            category: 'request',
            requestId: req.requestId,
            method: req.method,
            url: req.originalUrl,
            ip: req.ip || req.connection.remoteAddress,
            userAgent: req.headers['user-agent'],
            userId: req.user?.userId,
            userType: req.user?.userType
        });

        // Override res.end to capture response
        const originalEnd = res.end;
        res.end = function(chunk, encoding) {
            const duration = Date.now() - startTime;
            
            // Log request completion
            logger.api(req, res, duration);
            
            originalEnd.call(this, chunk, encoding);
        };

        next();
    };
};

// ============================================================================
// HEALTH CHECK UTILITIES
// ============================================================================

class HealthChecker {
    constructor(db, logger) {
        this.db = db;
        this.logger = logger;
        this.checks = new Map();
    }

    addCheck(name, checkFn, timeout = 5000) {
        this.checks.set(name, { fn: checkFn, timeout });
    }

    async runCheck(name, checkConfig) {
        const startTime = Date.now();
        
        try {
            const result = await Promise.race([
                checkConfig.fn(),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Health check timeout')), checkConfig.timeout)
                )
            ]);

            const duration = Date.now() - startTime;
            
            return {
                name,
                status: 'healthy',
                duration: `${duration}ms`,
                details: result
            };
        } catch (error) {
            const duration = Date.now() - startTime;
            
            this.logger.warn(`Health check failed: ${name}`, {
                error: error.message,
                duration: `${duration}ms`
            });

            return {
                name,
                status: 'unhealthy',
                duration: `${duration}ms`,
                error: error.message
            };
        }
    }

    async checkDatabase() {
        try {
            await this.db.query('SELECT 1');
            return { message: 'Database connection successful' };
        } catch (error) {
            throw new Error(`Database check failed: ${error.message}`);
        }
    }

    async checkMemory() {
        const usage = process.memoryUsage();
        const total = usage.heapTotal;
        const used = usage.heapUsed;
        const percentage = (used / total) * 100;

        if (percentage > 90) {
            throw new Error(`High memory usage: ${percentage.toFixed(2)}%`);
        }

        return {
            heapUsed: `${Math.round(used / 1024 / 1024)}MB`,
            heapTotal: `${Math.round(total / 1024 / 1024)}MB`,
            percentage: `${percentage.toFixed(2)}%`
        };
    }

    async getHealthStatus() {
        const results = [];
        let overallStatus = 'healthy';

        // Add default checks
        this.addCheck('database', () => this.checkDatabase());
        this.addCheck('memory', () => this.checkMemory());

        for (const [name, checkConfig] of this.checks) {
            const result = await this.runCheck(name, checkConfig);
            results.push(result);
            
            if (result.status === 'unhealthy') {
                overallStatus = 'unhealthy';
            }
        }

        return {
            status: overallStatus,
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            version: process.env.npm_package_version || '1.0.0',
            environment: process.env.NODE_ENV || 'development',
            checks: results
        };
    }
}

// ============================================================================
// INITIALIZATION FUNCTION
// ============================================================================

const createEnhancedErrorSystem = (db, options = {}) => {
    const logger = new Logger(options.logger);
    const errorHandler = new EnhancedErrorHandler(logger);
    const healthChecker = new HealthChecker(db, logger);

    return {
        logger,
        errorHandler,
        healthChecker,
        requestLogger: createRequestLogger(logger),
        
        // Middleware exports
        errorMiddleware: errorHandler.middleware(),
        notFoundMiddleware: errorHandler.notFoundHandler(),
        requestLoggerMiddleware: createRequestLogger(logger),
        asyncWrapper: errorHandler.asyncWrapper.bind(errorHandler),

        // Error classes
        ValidationError,
        AuthenticationError,
        AuthorizationError,
        NotFoundError,
        ConflictError,
        RateLimitError,
        DatabaseError,
        ExternalServiceError
    };
};

module.exports = {
    createEnhancedErrorSystem,
    Logger,
    EnhancedErrorHandler,
    HealthChecker,
    ValidationError,
    AuthenticationError,
    AuthorizationError,
    NotFoundError,
    ConflictError,
    RateLimitError,
    DatabaseError,
    ExternalServiceError
};
