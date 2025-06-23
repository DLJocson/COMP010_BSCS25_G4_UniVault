#!/usr/bin/env node

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

console.log('🚀 UniVault Enhanced System Setup');
console.log('==================================\n');

const DB_CONFIG = {
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'kV:a7ij?,8GbSKG',
    database: process.env.DB_NAME || 'univault_schema',
    multipleStatements: true
};

async function setupEnhancedSystem() {
    let connection;
    
    try {
        // 1. Connect to database
        console.log('📡 Connecting to database...');
        connection = await mysql.createConnection(DB_CONFIG);
        console.log('✅ Database connection established\n');

        // 2. Run migrations
        console.log('🔧 Running enhanced system migrations...');
        const migrationPath = path.join(__dirname, '../../3_database/migrations/002_simple_session_tables.sql');
        
        if (fs.existsSync(migrationPath)) {
            const migration = fs.readFileSync(migrationPath, 'utf8');
            await connection.execute(migration);
            console.log('✅ Session management tables created');
        } else {
            console.log('⚠️ Migration file not found, skipping...');
        }

        // 3. Verify table creation
        console.log('\n📊 Verifying database tables...');
        const expectedTables = [
            'user_sessions',
            'login_attempts', 
            'password_reset_tokens',
            'security_events',
            'account_lockouts',
            'rate_limit_tracking',
            'registration_sessions',
            'user_devices',
            'system_configurations'
        ];

        let tablesCreated = 0;
        for (const table of expectedTables) {
            try {
                const [rows] = await connection.execute(`SHOW TABLES LIKE '${table}'`);
                if (rows.length > 0) {
                    console.log(`  ✅ ${table}`);
                    tablesCreated++;
                } else {
                    console.log(`  ❌ ${table} - not found`);
                }
            } catch (error) {
                console.log(`  ❌ ${table} - error: ${error.message}`);
            }
        }

        console.log(`\n📈 Tables Status: ${tablesCreated}/${expectedTables.length} created\n`);

        // 4. Verify system configurations
        console.log('⚙️ Checking system configurations...');
        const [configs] = await connection.execute('SELECT COUNT(*) as count FROM system_configurations');
        console.log(`  📊 Found ${configs[0].count} system configuration entries`);

        if (configs[0].count > 0) {
            const [configList] = await connection.execute('SELECT config_key, config_value FROM system_configurations LIMIT 5');
            console.log('  📋 Sample configurations:');
            configList.forEach(config => {
                console.log(`    - ${config.config_key}: ${config.config_value}`);
            });
        }

        // 5. Create logs directory
        console.log('\n📝 Setting up logging system...');
        const logsDir = path.join(__dirname, '../logs');
        if (!fs.existsSync(logsDir)) {
            fs.mkdirSync(logsDir, { recursive: true });
            console.log('  ✅ Logs directory created');
        } else {
            console.log('  ✅ Logs directory already exists');
        }

        // 6. Verify middleware files
        console.log('\n🔧 Verifying enhanced middleware...');
        const middlewareFiles = [
            '../middleware/enhancedAuth.js',
            '../middleware/security.js',
            '../middleware/enhancedErrorHandler.js'
        ];

        let middlewareReady = 0;
        for (const file of middlewareFiles) {
            const filePath = path.join(__dirname, file);
            if (fs.existsSync(filePath)) {
                console.log(`  ✅ ${path.basename(file)}`);
                middlewareReady++;
            } else {
                console.log(`  ❌ ${path.basename(file)} - not found`);
            }
        }

        // 7. Verify route files
        console.log('\n🛣️ Verifying enhanced routes...');
        const routeFiles = [
            '../routes/enhancedAuth.js',
            '../routes/reference.js'
        ];

        let routesReady = 0;
        for (const file of routeFiles) {
            const filePath = path.join(__dirname, file);
            if (fs.existsSync(filePath)) {
                console.log(`  ✅ ${path.basename(file)}`);
                routesReady++;
            } else {
                console.log(`  ❌ ${path.basename(file)} - not found`);
            }
        }

        // 8. Test basic functionality
        console.log('\n🧪 Testing enhanced system components...');
        
        try {
            // Test enhanced auth middleware loading
            const { createAuthMiddleware } = require('../middleware/enhancedAuth');
            console.log('  ✅ Enhanced authentication middleware loaded');
        } catch (error) {
            console.log('  ❌ Enhanced authentication middleware failed:', error.message);
        }

        try {
            // Test security middleware loading
            const { AdvancedRateLimiter } = require('../middleware/security');
            console.log('  ✅ Advanced security middleware loaded');
        } catch (error) {
            console.log('  ❌ Advanced security middleware failed:', error.message);
        }

        try {
            // Test error handler loading
            const { createEnhancedErrorSystem } = require('../middleware/enhancedErrorHandler');
            console.log('  ✅ Enhanced error handling system loaded');
        } catch (error) {
            console.log('  ❌ Enhanced error handling system failed:', error.message);
        }

        // 9. Generate setup report
        console.log('\n📋 Setup Report');
        console.log('================');
        
        const totalComponents = expectedTables.length + middlewareFiles.length + routeFiles.length;
        const readyComponents = tablesCreated + middlewareReady + routesReady;
        const successRate = (readyComponents / totalComponents) * 100;
        
        console.log(`📊 Database Tables: ${tablesCreated}/${expectedTables.length}`);
        console.log(`🔧 Middleware Files: ${middlewareReady}/${middlewareFiles.length}`);
        console.log(`🛣️ Route Files: ${routesReady}/${routeFiles.length}`);
        console.log(`📈 Overall Completion: ${successRate.toFixed(1)}%`);
        
        const status = successRate >= 90 ? '🟢 EXCELLENT' : 
                      successRate >= 70 ? '🟡 GOOD' : 
                      successRate >= 50 ? '🟠 NEEDS ATTENTION' : '🔴 INCOMPLETE';
        
        console.log(`🎯 Status: ${status}\n`);

        // 10. Next steps
        console.log('🚀 Next Steps:');
        console.log('==============');
        console.log('1. Start the development server: npm run dev');
        console.log('2. Test the API endpoints using the documentation');
        console.log('3. Check the logs directory for application logs');
        console.log('4. Review the API_DOCUMENTATION.md for endpoint details');
        console.log('5. Configure environment variables for production\n');

        // 11. Show important endpoints
        console.log('🔗 Key API Endpoints:');
        console.log('=====================');
        console.log('• Health Check: GET /api/health');
        console.log('• Enhanced Auth: POST /api/enhanced-auth/login');
        console.log('• Reference Data: GET /api/reference/countries');
        console.log('• Bulk Reference: GET /api/reference/bulk');
        console.log('• User Profile: GET /api/enhanced-auth/profile');
        console.log('• Cache Management: GET /api/reference/cache/info\n');

        if (successRate < 100) {
            console.log('⚠️ Some components are missing. Please check the error messages above.');
            console.log('   Run this setup script again after fixing any issues.\n');
        } else {
            console.log('🎉 Enhanced UniVault system setup completed successfully!');
            console.log('   All components are ready for development and testing.\n');
        }

    } catch (error) {
        console.error('❌ Setup failed:', error.message);
        console.error('\nPlease check your database configuration and try again.');
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

// Run setup if called directly
if (require.main === module) {
    setupEnhancedSystem().catch(console.error);
}

module.exports = { setupEnhancedSystem };
