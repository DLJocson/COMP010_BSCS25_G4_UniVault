require('dotenv').config();

const express = require('express');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

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
