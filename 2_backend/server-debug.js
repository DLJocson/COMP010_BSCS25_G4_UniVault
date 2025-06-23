require('dotenv').config(); // This MUST be the first line

console.log('🔍 Starting server in debug mode...');

const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

console.log('📝 Environment variables loaded');
console.log('DB_HOST:', process.env.DB_HOST || 'NOT_SET');
console.log('DB_USER:', process.env.DB_USER || 'NOT_SET');
console.log('DB_DATABASE:', process.env.DB_DATABASE || 'NOT_SET');

// MySQL Connection Pool
let pool;
try {
    pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        port: process.env.DB_PORT,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });
    console.log('✅ Database pool created');
} catch (err) {
    console.error('❌ Database pool creation failed:', err.message);
}

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the '1_frontend' directory at the root URL
app.use(express.static(path.join(__dirname, '../1_frontend')));

console.log('✅ Middleware setup complete');

// Test route
app.get('/api', (req, res) => {
    res.json({
        message: 'Welcome to the UniVault API!',
        status: 'running',
        timestamp: new Date().toISOString()
    });
});

// Admin Get Pending Verifications (with mock data if DB fails)
app.get('/admin/pending-verifications', async (req, res) => {
    console.log('📥 Request received for /admin/pending-verifications');
    
    if (!pool) {
        console.log('⚠️ No database pool, returning mock data');
        return res.json([
            {
                cif_number: '123456',
                customer_type: 'Individual',
                customer_first_name: 'John',
                customer_last_name: 'Doe',
                customer_middle_name: 'M',
                customer_suffix_name: null,
                created_at: new Date().toISOString(),
                email: 'john.doe@email.com',
                phone: '+1234567890',
                customer_status: 'Pending Verification'
            },
            {
                cif_number: '789012',
                customer_type: 'Business',
                customer_first_name: 'Jane',
                customer_last_name: 'Smith',
                customer_middle_name: null,
                customer_suffix_name: null,
                created_at: new Date().toISOString(),
                email: 'jane.smith@business.com',
                phone: '+0987654321',
                customer_status: 'Pending Verification'
            }
        ]);
    }
    
    try {
        const [verifications] = await pool.query(`
            SELECT 
                c.cif_number,
                c.customer_type,
                c.customer_first_name,
                c.customer_last_name,
                c.customer_middle_name,
                c.customer_suffix_name,
                c.created_at,
                cd.contact_value as email,
                cd2.contact_value as phone,
                c.customer_status
            FROM CUSTOMER c
            LEFT JOIN CUSTOMER_CONTACT_DETAILS cd ON c.cif_number = cd.cif_number AND cd.contact_type_code = 'CT01'
            LEFT JOIN CUSTOMER_CONTACT_DETAILS cd2 ON c.cif_number = cd2.cif_number AND cd2.contact_type_code = 'CT02'
            WHERE c.customer_status = 'Pending Verification' AND c.is_deleted = FALSE
            ORDER BY c.created_at ASC
            LIMIT 100
        `);
        
        console.log(`✅ Found ${verifications.length} pending verifications from database`);
        res.json(verifications);
    } catch (err) {
        console.error('❌ Database query failed:', err.message);
        // Return mock data if database fails
        res.json([
            {
                cif_number: '123456',
                customer_type: 'Individual',
                customer_first_name: 'John',
                customer_last_name: 'Doe',
                customer_middle_name: 'M',
                customer_suffix_name: null,
                created_at: new Date().toISOString(),
                email: 'john.doe@email.com',
                phone: '+1234567890',
                customer_status: 'Pending Verification'
            }
        ]);
    }
});

// Admin Login (mock for testing)
app.post('/admin/login', async (req, res) => {
    console.log('🔐 Admin login attempt:', req.body);
    
    const { employee_username, employee_password } = req.body;
    
    // Simple mock authentication
    if (employee_username === 'admin' && employee_password === 'Admin123!') {
        res.json({ 
            message: 'Login successful', 
            employee_id: 1,
            employee_position: 'System Administrator',
            employee_name: 'System Administrator'
        });
    } else {
        res.status(401).json({ message: 'Invalid username or password.' });
    }
});

// Admin Dashboard Stats (mock)
app.get('/admin/dashboard-stats', async (req, res) => {
    console.log('📊 Dashboard stats requested');
    res.json({
        totalCustomers: 150,
        verifiedCustomers: 120,
        pendingVerifications: 25,
        newAccounts: 5,
        rejectedApplications: 3,
        pendingApprovals: 2,
        monthlyStats: [
            { month: 1, registrations: 10 },
            { month: 2, registrations: 15 },
            { month: 3, registrations: 20 }
        ]
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.send(`
        <h1>UniVault API Debug Server</h1>
        <p>Debug server is running!</p>
        <ul>
            <li><a href="/api">API Test</a></li>
            <li><a href="/admin/pending-verifications">Pending Verifications</a></li>
            <li><a href="/admin/dashboard-stats">Dashboard Stats</a></li>
            <li><a href="/Dashboard-Admin/admin-login.html">Admin Login</a></li>
            <li><a href="/Dashboard-Admin/admin-review-queue.html">Review Queue</a></li>
        </ul>
        <p>Time: ${new Date().toISOString()}</p>
    `);
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Debug server running on http://localhost:${PORT}`);
    console.log(`🔗 Test API: http://localhost:${PORT}/api`);
    console.log(`🔗 Pending Verifications: http://localhost:${PORT}/admin/pending-verifications`);
    console.log(`🔗 Admin Review Queue: http://localhost:${PORT}/Dashboard-Admin/admin-review-queue.html`);
    console.log('\n✅ Debug server started successfully!');
});

// Handle server errors
app.on('error', (err) => {
    console.error('❌ Server error:', err.message);
});

process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err.message);
});

process.on('unhandledRejection', (err) => {
    console.error('❌ Unhandled Rejection:', err.message);
});
