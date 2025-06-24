// Request validation middleware
const validateRegistration = (req, res, next) => {
    const { 
        customer_type, customer_last_name, customer_first_name, 
        customer_username, customer_password, birth_date, gender, 
        civil_status_code, birth_country, citizenship 
    } = req.body;

    const requiredFields = [
        'customer_type', 'customer_last_name', 'customer_first_name',
        'customer_username', 'customer_password', 'birth_date', 
        'gender', 'civil_status_code', 'birth_country', 'citizenship'
    ];

    for (const field of requiredFields) {
        if (!req.body[field]) {
            return res.status(400).json({ 
                message: `Missing required field: ${field}` 
            });
        }
    }

    // Address validation
    const addressFields = ['address_barangay', 'address_city', 'address_province', 'address_country', 'address_zip_code'];
    for (const field of addressFields) {
        if (!req.body[field]) {
            return res.status(400).json({ 
                message: `Missing required address field: ${field}` 
            });
        }
    }

    next();
};

const validateLogin = (req, res, next) => {
    const { customer_username, customer_password } = req.body;
    
    if (!customer_username || !customer_password) {
        return res.status(400).json({ 
            message: 'Username and password are required.' 
        });
    }
    
    next();
};

const validateAdminLogin = (req, res, next) => {
    const { employee_username, employee_password } = req.body;
    
    if (!employee_username || !employee_password) {
        return res.status(400).json({ 
            message: 'Username and password are required.' 
        });
    }
    
    next();
};

module.exports = {
    validateRegistration,
    validateLogin,
    validateAdminLogin
};
