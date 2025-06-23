const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const path = require('path');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Import migration function
const { runMigrations } = require('./migrate-db');

// Import routes
const customerRoutes = require('./routes/customers');
const addressRoutes = require('./routes/addresses');
const employmentRoutes = require('./routes/employment');
const authRoutes = require('./routes/auth');
const enhancedAuthRoutes = require('./routes/enhancedAuth');
const enhancedRegistrationRoutes = require('./routes/enhancedRegistration');
const referenceRoutes = require('./routes/reference');
const accountRoutes = require('./routes/accounts');
const transactionRoutes = require('./routes/transactions');
const adminRoutes = require('./routes/admin');

// Import middleware
const { sanitizeInput, generalRateLimit } = require('./middleware/validation');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { AdvancedRateLimiter, securityHeaders } = require('./middleware/security');
const { createEnhancedErrorSystem } = require('./middleware/enhancedErrorHandler');
const { SystemMonitor } = require('./monitoring/systemMonitor');

// Security middleware
app.use(helmet());
app.use(securityHeaders);
app.use(generalRateLimit);

// Basic middleware
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? process.env.FRONTEND_URL 
        : ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(sanitizeInput);
app.use(express.static(path.join(__dirname, '../1_frontend')));

// Database Connection Pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || "127.0.0.1",
    user: process.env.DB_USER || "root", 
    password: process.env.DB_PASSWORD || "kV:a7ij?,8GbSKG",
    database: process.env.DB_NAME || "univault_schema",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Database middleware
app.use((req, res, next) => {
    req.db = pool;
    next();
});

// Initialize enhanced systems
const rateLimiter = new AdvancedRateLimiter(pool);
const errorSystem = createEnhancedErrorSystem(pool);
const systemMonitor = new SystemMonitor(pool, { logger: errorSystem.logger });

// Add enhanced middleware
app.use(errorSystem.requestLoggerMiddleware);
app.use(systemMonitor.createMetricsMiddleware());

// API Routes with enhanced security
app.use('/api/auth', authRoutes); // Legacy auth routes
app.use('/api/enhanced-auth', enhancedAuthRoutes); // New enhanced auth
app.use('/api/enhanced-registration', enhancedRegistrationRoutes); // Enhanced registration
app.use('/api/reference', referenceRoutes); // Reference data APIs
app.use('/api/customers', customerRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/employment', employmentRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/admin', adminRoutes);

// Reference data endpoints
app.get('/api/civil-status', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM civil_status_type');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/address-types', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM address_type');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/employment-positions', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM employment_position');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Enhanced health check endpoint
app.get('/api/health', async (req, res) => {
    try {
        const healthStatus = await systemMonitor.getStatus();
        const dbHealth = await pool.query('SELECT 1');
        
        res.json({ 
            status: 'healthy', 
            timestamp: new Date().toISOString(),
            database: 'connected',
            environment: process.env.NODE_ENV || 'development',
            monitoring: healthStatus,
            version: '2.0.0'
        });
    } catch (error) {
        res.status(503).json({ 
            status: 'unhealthy', 
            error: 'Database connection failed',
            timestamp: new Date().toISOString()
        });
    }
});

// Detailed health check for monitoring systems
app.get('/api/health/detailed', async (req, res) => {
    try {
        const healthReport = await systemMonitor.generateReport('1h');
        res.json(healthReport);
    } catch (error) {
        res.status(500).json({ error: 'Failed to generate health report' });
    }
});

// API status endpoint
app.get('/api/status', (req, res) => {
    res.json({
        service: 'UniVault API',
        version: '2.0.0',
        status: 'running',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        monitoring: systemMonitor.isMonitoring
    });
});

// Serve frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../1_frontend/Registration-Customer/landing.html'));
});

// Error handling middleware (must be last)
app.use(errorSystem.notFoundMiddleware);
app.use(errorSystem.errorMiddleware);

// Auto-migration on startup
async function startServer() {
    try {
        // Check if database exists and is properly set up
        const testConnection = await mysql.createConnection({
            host: process.env.DB_HOST || "127.0.0.1",
            user: process.env.DB_USER || "root",
            password: process.env.DB_PASSWORD || "kV:a7ij?,8GbSKG",
            database: process.env.DB_NAME || "univault_schema"
        });

        try {
            await testConnection.execute('SELECT 1 FROM customer LIMIT 1');
            await testConnection.end();
            console.log('✅ Database connection verified');
        } catch (error) {
            await testConnection.end();
            console.log('🔧 Database not ready, running migrations...');
            await runMigrations();
        }

        app.listen(PORT, () => {
            console.log(`🚀 UniVault Enhanced Server v2.0.0 running on http://localhost:${PORT}`);
            console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
            console.log(`🔍 Detailed health: http://localhost:${PORT}/api/health/detailed`);
            console.log(`🌐 Customer Portal: http://localhost:${PORT}/Registration-Customer/landing.html`);
            console.log(`👑 Admin Dashboard: http://localhost:${PORT}/Dashboard-Admin/admin-homepage.html`);
            console.log(`🔐 Enhanced Auth: http://localhost:${PORT}/api/enhanced-auth/`);
            console.log(`📋 Enhanced Registration: http://localhost:${PORT}/api/enhanced-registration/`);
            console.log(`📚 Reference Data: http://localhost:${PORT}/api/reference/`);
            
            // Start system monitoring (disabled for now due to missing tables)
            if (process.env.MONITORING_ENABLED === 'true') {
                systemMonitor.startMonitoring(60000); // 1 minute interval
                console.log(`📈 System monitoring started`);
            } else {
                console.log(`📈 System monitoring disabled`);
            }
        });
    } catch (error) {
        console.error('❌ Server startup failed:', error.message);
        process.exit(1);
    }
}

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down gracefully...');
    systemMonitor.stopMonitoring();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
    systemMonitor.stopMonitoring();
    process.exit(0);
});

startServer();
