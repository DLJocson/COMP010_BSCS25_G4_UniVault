require('dotenv').config();

const express = require('express');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const cors = require('cors');

// Import configurations and utilities
const { testConnection } = require('./config/database');
const { createDefaultAdmin } = require('./utils/adminSetup');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/api');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;

// Test database connection and setup
(async () => {
    const connected = await testConnection();
    if (connected) {
        await createDefaultAdmin();
    }
})();

// Security middleware
app.use(cors()); // Enable CORS for all origins
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static file serving (moved after routes to avoid conflicts)
// This will be set up after API routes but before catch-all

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer configuration for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname.replace(/\s+/g, '_'));
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        // Allow common file types
        const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPEG, PNG, PDF, DOC, and DOCX files are allowed.'));
        }
    }
});

// File upload endpoint
app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    const filePath = `/uploads/${req.file.filename}`;
    res.json({ filePath });
});

// Routes
app.use('/auth', authRoutes);
app.use('/api', apiRoutes);
app.use('/admin', adminRoutes);

// Direct admin endpoints for compatibility with existing frontend
app.get('/admin/pending-verifications', async (req, res) => {
    try {
        const { pool } = require('./config/database');
        const [verifications] = await pool.query(`
            SELECT 
                c.cif_number, c.customer_type, c.customer_first_name, c.customer_last_name,
                c.customer_middle_name, c.customer_suffix_name, c.created_at,
                cd.contact_value as email, cd2.contact_value as phone, c.customer_status
            FROM CUSTOMER c
            LEFT JOIN CUSTOMER_CONTACT_DETAILS cd ON c.cif_number = cd.cif_number AND cd.contact_type_code = 'CT01'
            LEFT JOIN CUSTOMER_CONTACT_DETAILS cd2 ON c.cif_number = cd2.cif_number AND cd2.contact_type_code = 'CT02'
            WHERE c.customer_status = 'Pending Verification' AND c.is_deleted = FALSE
            ORDER BY c.created_at ASC
            LIMIT 100
        `);
        
        res.json(verifications);
    } catch (err) {
        console.error('Error fetching pending verifications:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/admin/close-requests', async (req, res) => {
    try {
        const { pool } = require('./config/database');
        const [closeRequests] = await pool.query(`
            SELECT 
                cr.close_request_id,
                cr.cif_number,
                cr.request_date,
                cr.request_reason,
                cr.request_status,
                cr.processed_by,
                cr.processed_date,
                c.customer_type,
                c.customer_first_name,
                c.customer_last_name,
                c.customer_middle_name,
                c.customer_suffix_name,
                cd.contact_value as email,
                cd2.contact_value as phone
            FROM CLOSE_REQUEST cr
            INNER JOIN CUSTOMER c ON cr.cif_number = c.cif_number
            LEFT JOIN CUSTOMER_CONTACT_DETAILS cd ON c.cif_number = cd.cif_number AND cd.contact_type_code = 'CT01'
            LEFT JOIN CUSTOMER_CONTACT_DETAILS cd2 ON c.cif_number = cd2.cif_number AND cd2.contact_type_code = 'CT02'
            WHERE c.is_deleted = FALSE AND cr.request_status = 'Pending'
            ORDER BY cr.request_date DESC
            LIMIT 100
        `);
        
        res.json(closeRequests);
    } catch (err) {
        console.error('Error fetching close requests:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all accounts for a specific customer
app.get('/api/customers/:cif_number/accounts', async (req, res) => {
    const { cif_number } = req.params;
    try {
        const [accounts] = await pool.query(
            `SELECT account_number, account_type, account_status
             FROM account
             WHERE cif_number = ?`,
            [cif_number]
        );
        res.json(accounts);
    } catch (err) {
        console.error('Error fetching accounts:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'UniVault API is running',
        version: '2.0.0',
        status: 'healthy'
    });
});

// Static file serving (after API routes, before catch-all)
app.use(express.static(path.join(__dirname, '../1_frontend')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 404 handler for all other routes
app.all('*', (req, res) => {
    res.status(404).json({ 
        message: 'Endpoint not found',
        availableEndpoints: [
            'GET /',
            'POST /auth/login',
            'POST /auth/admin/login',
            'POST /api/register',
            'GET /api/customer/:cif_number',
            'POST /upload'
        ]
    });
});

// Error handling middleware (must be last)
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`🚀 UniVault Server running on http://localhost:${PORT}`);
    console.log(`📂 Serving static files from: ${path.join(__dirname, '../1_frontend')}`);
    console.log(`📁 Upload directory: ${uploadDir}`);
});
