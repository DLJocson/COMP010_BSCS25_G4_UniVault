const mysql = require('mysql2/promise');

// Database configuration validation
if (!process.env.DB_USER || !process.env.DB_PASSWORD || !process.env.DB_DATABASE) {
    console.error('❌ Missing required database environment variables');
    process.exit(1);
}

// MySQL Connection Pool with performance optimizations
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 15, // Increased for better concurrency
    queueLimit: 0,
    acquireTimeout: 60000, // 60 seconds
    timeout: 60000, // 60 seconds
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    multipleStatements: false,
    charset: 'utf8mb4'
});

// Test database connection
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Connected to MySQL database!');
        connection.release();
        return true;
    } catch (err) {
        console.error('❌ Database connection failed:', err.message);
        return false;
    }
}

module.exports = { pool, testConnection };
