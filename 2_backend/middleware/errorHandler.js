// Centralized error handling middleware
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err.message);
    
    // Database errors
    if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ 
            message: 'Duplicate entry. This username or email already exists.' 
        });
    }
    
    if (err.code === 'ER_NO_REFERENCED_ROW_2') {
        return res.status(400).json({ 
            message: 'Invalid reference data provided.' 
        });
    }
    
    // Validation errors
    if (err.name === 'ValidationError') {
        return res.status(400).json({ 
            message: err.message 
        });
    }
    
    // Default server error
    res.status(500).json({ 
        message: 'Internal server error' 
    });
};

module.exports = errorHandler;
