const fs = require('fs');
const path = require('path');

// Custom error classes
class APIError extends Error {
    constructor(message, status = 500, code = 'INTERNAL_ERROR', details = {}) {
        super(message);
        this.name = 'APIError';
        this.status = status;
        this.code = code;
        this.details = details;
        this.timestamp = new Date().toISOString();
    }
}

class ValidationError extends APIError {
    constructor(message, details = {}) {
        super(message, 400, 'VALIDATION_ERROR', details);
        this.name = 'ValidationError';
    }
}

class AuthenticationError extends APIError {
    constructor(message = 'Authentication required') {
        super(message, 401, 'AUTHENTICATION_ERROR');
        this.name = 'AuthenticationError';
    }
}

class AuthorizationError extends APIError {
    constructor(message = 'Insufficient permissions') {
        super(message, 403, 'AUTHORIZATION_ERROR');
        this.name = 'AuthorizationError';
    }
}

class NotFoundError extends APIError {
    constructor(resource = 'Resource') {
        super(`${resource} not found`, 404, 'NOT_FOUND');
        this.name = 'NotFoundError';
    }
}

class ConflictError extends APIError {
    constructor(message = 'Resource already exists') {
        super(message, 409, 'CONFLICT_ERROR');
        this.name = 'ConflictError';
    }
}

class DatabaseError extends APIError {
    constructor(message = 'Database operation failed', originalError = null) {
        super(message, 500, 'DATABASE_ERROR');
        this.name = 'DatabaseError';
        this.originalError = originalError;
    }
}

// Error logger
const logError = (error, req = null) => {
    const timestamp = new Date().toISOString();
    const logDir = path.join(__dirname, '../logs');
    
    // Ensure logs directory exists
    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
    }
    
    const logFile = path.join(logDir, `error-${new Date().toISOString().split('T')[0]}.log`);
    
    const logEntry = {
        timestamp,
        level: 'ERROR',
        message: error.message,
        status: error.status || 500,
        code: error.code || 'UNKNOWN_ERROR',
        stack: error.stack,
        request: req ? {
            method: req.method,
            url: req.url,
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            userId: req.user?.userId
        } : null,
        details: error.details || {}
    };
    
    const logString = JSON.stringify(logEntry, null, 2) + '\n';
    
    try {
        fs.appendFileSync(logFile, logString);
        console.error(`[${timestamp}] ERROR:`, error.message);
        if (process.env.NODE_ENV === 'development') {
            console.error('Stack:', error.stack);
        }
    } catch (logError) {
        console.error('Failed to write error log:', logError);
        console.error('Original error:', error);
    }
};

// Global error handler middleware
const errorHandler = (error, req, res, next) => {
    // Log the error
    logError(error, req);
    
    // Handle specific error types
    let status = 500;
    let code = 'INTERNAL_ERROR';
    let message = 'Internal server error';
    let details = {};
    
    if (error instanceof APIError) {
        status = error.status;
        code = error.code;
        message = error.message;
        details = error.details;
    } else if (error.name === 'ValidationError') {
        status = 400;
        code = 'VALIDATION_ERROR';
        message = 'Validation failed';
        details = error.errors || {};
    } else if (error.code === 'ER_DUP_ENTRY') {
        status = 409;
        code = 'DUPLICATE_ENTRY';
        message = 'Resource already exists';
        details = { field: error.sqlMessage };
    } else if (error.code === 'ER_NO_REFERENCED_ROW_2') {
        status = 400;
        code = 'INVALID_REFERENCE';
        message = 'Referenced resource does not exist';
    } else if (error.code === 'ER_BAD_FIELD_ERROR') {
        status = 400;
        code = 'INVALID_FIELD';
        message = 'Invalid field in request';
    } else if (error.code === 'ECONNREFUSED') {
        status = 503;
        code = 'DATABASE_UNAVAILABLE';
        message = 'Database connection failed';
    } else if (error.name === 'JsonWebTokenError') {
        status = 401;
        code = 'INVALID_TOKEN';
        message = 'Invalid authentication token';
    } else if (error.name === 'TokenExpiredError') {
        status = 401;
        code = 'TOKEN_EXPIRED';
        message = 'Authentication token has expired';
    } else if (error.name === 'MulterError') {
        status = 400;
        code = 'FILE_UPLOAD_ERROR';
        message = error.message;
    }
    
    // Don't expose sensitive information in production
    if (process.env.NODE_ENV === 'production') {
        details = {};
        if (status === 500) {
            message = 'Internal server error';
        }
    }
    
    // Send error response
    res.status(status).json({
        error: {
            message,
            code,
            status,
            timestamp: new Date().toISOString(),
            details
        }
    });
};

// 404 handler for undefined routes
const notFoundHandler = (req, res) => {
    const error = new NotFoundError(`Route ${req.method} ${req.url}`);
    logError(error, req);
    
    res.status(404).json({
        error: {
            message: error.message,
            code: error.code,
            status: 404,
            timestamp: new Date().toISOString()
        }
    });
};

// Async error wrapper
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

// Database error handler
const handleDatabaseError = (error) => {
    if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictError('Resource already exists');
    } else if (error.code === 'ER_NO_REFERENCED_ROW_2') {
        throw new ValidationError('Referenced resource does not exist');
    } else if (error.code === 'ECONNREFUSED') {
        throw new DatabaseError('Database connection failed');
    } else {
        throw new DatabaseError('Database operation failed', error);
    }
};

module.exports = {
    APIError,
    ValidationError,
    AuthenticationError,
    AuthorizationError,
    NotFoundError,
    ConflictError,
    DatabaseError,
    errorHandler,
    notFoundHandler,
    asyncHandler,
    handleDatabaseError,
    logError
};
