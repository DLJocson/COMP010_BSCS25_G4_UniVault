const express = require('express');
const router = express.Router();
const { customerLogin, adminLogin } = require('../controllers/authController');
const { validateLogin, validateAdminLogin } = require('../middleware/validation');

// Customer login
router.post('/login', validateLogin, customerLogin);

// Admin login
router.post('/admin/login', validateAdminLogin, adminLogin);

// Method not allowed for GET requests
router.get('/login', (req, res) => {
    res.status(405).json({ message: 'Use POST /auth/login to log in.' });
});

router.get('/register', (req, res) => {
    res.status(405).json({ message: 'Use POST /api/register to create a new user.' });
});

module.exports = router;
