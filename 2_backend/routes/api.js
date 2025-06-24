const express = require('express');
const router = express.Router();
const { registerCustomer, getCustomer } = require('../controllers/customerController');
const { validateRegistration } = require('../middleware/validation');

// Customer registration
router.post('/register', validateRegistration, registerCustomer);

// Get customer info by cif_number
router.get('/customer/:cif_number', getCustomer);

// API info endpoint
router.get('/', (req, res) => {
    res.json({
        message: 'Welcome to the UniVault API!',
        endpoints: [
            { method: 'GET', path: '/' },
            { method: 'GET', path: '/api' },
            { method: 'POST', path: '/api/register', description: 'Register a new user' },
            { method: 'POST', path: '/auth/login', description: 'Login as a user' },
            { method: 'POST', path: '/auth/admin/login', description: 'Admin login' },
            { method: 'GET', path: '/api/customer/:cif_number', description: 'Get customer info' }
        ]
    });
});

module.exports = router;
