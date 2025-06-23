const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

/**
 * UniVault System Validation Script
 * Checks all components are properly configured and ready
 */

async function validateEnvironment() {
    console.log('🔍 Validating Environment Configuration...\n');
    
    const requiredEnvVars = {
        'DB_HOST': process.env.DB_HOST || '127.0.0.1',
        'DB_USER': process.env.DB_USER || 'root',
        'DB_PASSWORD': process.env.DB_PASSWORD,
        'DB_NAME': process.env.DB_NAME || 'univault_schema',
        'JWT_SECRET': process.env.JWT_SECRET || 'univault_secret_key_2024',
        'NODE_ENV': process.env.NODE_ENV || 'development'
    };
    
    let envValid = true;
    
    for (const [key, value] of Object.entries(requiredEnvVars)) {
        if (!value) {
            console.log(`❌ Missing environment variable: ${key}`);
            envValid = false;
        } else {
            const displayValue = key.includes('PASSWORD') || key.includes('SECRET') ? '[HIDDEN]' : value;
            console.log(`✅ ${key}: ${displayValue}`);
        }
    }
    
    if (!envValid) {
        console.log('\n⚠️  Please create a .env file with the required variables.');
        return false;
    }
    
    console.log('✅ Environment configuration valid\n');
    return true;
}

async function validateDatabase() {
    console.log('🗄️  Validating Database Connection...\n');
    
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || '127.0.0.1',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME || 'univault_schema'
        });
        
        console.log('✅ Database connection successful');
        
        // Check essential tables
        const requiredTables = [
            'customer', 'customer_registration_progress', 'address', 'employment',
            'civil_status_type', 'address_type', 'employment_position', 'admin'
        ];
        
        const [tables] = await connection.query('SHOW TABLES');
        const existingTables = tables.map(row => Object.values(row)[0].toLowerCase());
        
        let tablesValid = true;
        for (const table of requiredTables) {
            if (existingTables.includes(table.toLowerCase())) {
                console.log(`✅ Table exists: ${table}`);
            } else {
                console.log(`❌ Missing table: ${table}`);
                tablesValid = false;
            }
        }
        
        // Check admin user
        try {
            const [adminCheck] = await connection.query('SELECT COUNT(*) as count FROM admin');
            if (adminCheck[0].count > 0) {
                console.log('✅ Admin user exists');
            } else {
                console.log('⚠️  No admin users found');
            }
        } catch (error) {
            console.log('⚠️  Could not check admin users');
        }
        
        await connection.end();
        
        if (!tablesValid) {
            console.log('\n⚠️  Run: npm run migrate to set up the database');
            return false;
        }
        
        console.log('✅ Database validation complete\n');
        return true;
        
    } catch (error) {
        console.log(`❌ Database connection failed: ${error.message}`);
        console.log('⚠️  Make sure MySQL is running and credentials are correct\n');
        return false;
    }
}

async function validateFrontendFiles() {
    console.log('🌐 Validating Frontend Files...\n');
    
    const requiredFiles = [
        '../1_frontend/Registration-Customer/landing.html',
        '../1_frontend/Registration-Customer/registration1.html',
        '../1_frontend/js/api-config.js',
        '../1_frontend/js/navigation.js'
    ];
    
    let filesValid = true;
    
    for (const file of requiredFiles) {
        const filePath = path.join(__dirname, file);
        if (fs.existsSync(filePath)) {
            console.log(`✅ File exists: ${file}`);
        } else {
            console.log(`❌ Missing file: ${file}`);
            filesValid = false;
        }
    }
    
    if (filesValid) {
        console.log('✅ Frontend files validation complete\n');
    } else {
        console.log('⚠️  Some frontend files are missing\n');
    }
    
    return filesValid;
}

async function validateAPIEndpoints() {
    console.log('🔌 Validating API Endpoints...\n');
    
    try {
        const PORT = process.env.PORT || 3000;
        const baseURL = `http://localhost:${PORT}`;
        
        // Note: This would require the server to be running
        // For now, just check if route files exist
        const routeFiles = [
            'auth.js', 'customers.js', 'addresses.js', 
            'employment.js', 'accounts.js', 'admin.js'
        ];
        
        let routesValid = true;
        
        for (const route of routeFiles) {
            const routePath = path.join(__dirname, '../routes', route);
            if (fs.existsSync(routePath)) {
                console.log(`✅ Route file exists: ${route}`);
            } else {
                console.log(`❌ Missing route file: ${route}`);
                routesValid = false;
            }
        }
        
        console.log('✅ API endpoints validation complete\n');
        return routesValid;
        
    } catch (error) {
        console.log(`❌ API validation failed: ${error.message}\n`);
        return false;
    }
}

async function main() {
    console.log('🚀 UniVault System Validation');
    console.log('===============================\n');
    
    const results = {
        environment: await validateEnvironment(),
        database: await validateDatabase(),
        frontend: await validateFrontendFiles(),
        api: await validateAPIEndpoints()
    };
    
    const allValid = Object.values(results).every(result => result);
    
    console.log('📊 Validation Summary:');
    console.log('======================');
    
    for (const [component, isValid] of Object.entries(results)) {
        const status = isValid ? '✅ PASS' : '❌ FAIL';
        console.log(`${component.toUpperCase()}: ${status}`);
    }
    
    console.log('\n' + '='.repeat(50));
    
    if (allValid) {
        console.log('🎉 All systems validated! UniVault is ready to run.');
        console.log('🚀 Start the server with: npm start');
    } else {
        console.log('⚠️  Some issues found. Please fix them before starting.');
        console.log('💡 Common fixes:');
        console.log('   - Run: npm run migrate (for database issues)');
        console.log('   - Check .env file configuration');
        console.log('   - Ensure MySQL is running');
    }
    
    console.log('\n');
    process.exit(allValid ? 0 : 1);
}

main().catch(error => {
    console.error('💥 Validation script failed:', error);
    process.exit(1);
});
