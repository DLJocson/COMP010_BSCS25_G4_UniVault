const express = require('express');
const router = express.Router();
const { registerCustomer, getCustomer, getCustomerAccounts, getCustomersWithClosedAccounts, getCustomerProfile, getCustomerProfileUpdateRequest, getCustomerDocuments, processProfileUpdate, processAccountClosure } = require('../controllers/customerController');
const { validateRegistration } = require('../middleware/validation');

// Customer registration
router.post('/register', validateRegistration, registerCustomer);

// Get customer info by cif_number
router.get('/customer/:cif_number', getCustomer);

// Get customer accounts by cif_number
router.get('/customers/:cif_number/accounts', getCustomerAccounts);

// Get customers with closed accounts
router.get('/customers/closed-accounts', getCustomersWithClosedAccounts);

// Enhanced customer request processing routes
router.get('/customer/:cif_number/profile', getCustomerProfile);
router.get('/customer/:cif_number/profile-update-request', getCustomerProfileUpdateRequest);
router.get('/customer/:cif_number/documents', getCustomerDocuments);
router.post('/customer/:cif_number/profile-update/:action', processProfileUpdate);
router.post('/customer/:cif_number/accounts/closure/:action', processAccountClosure);

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
            { method: 'GET', path: '/api/customer/:cif_number', description: 'Get customer info' },
            { method: 'GET', path: '/api/customers/:cif_number/accounts', description: 'Get customer accounts' },
            { method: 'GET', path: '/api/customers/closed-accounts', description: 'Get customers with closed accounts' },
            { method: 'GET', path: '/api/customer/:cif_number/profile', description: 'Get customer profile data' },
            { method: 'GET', path: '/api/customer/:cif_number/profile-update-request', description: 'Get profile update request' },
            { method: 'GET', path: '/api/customer/:cif_number/documents', description: 'Get customer documents' },
            { method: 'POST', path: '/api/customer/:cif_number/profile-update/:action', description: 'Process profile update' },
            { method: 'POST', path: '/api/customer/:cif_number/accounts/closure/:action', description: 'Process account closure' }
        ]
    });
});

module.exports = router;
