require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
    console.log('🚀 Starting UniVault Database Setup...\n');
    
    try {
        // First, connect without specifying a database to create it if needed
        const baseConnection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            port: process.env.DB_PORT || 3306
        });

        console.log('✅ Connected to MySQL server');

        // Create database if it doesn't exist
        const dbName = process.env.DB_DATABASE || 'univault_schema';
        await baseConnection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
        console.log(`✅ Database '${dbName}' created/verified`);

        await baseConnection.end();

        // Now connect to the specific database
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: dbName,
            port: process.env.DB_PORT || 3306,
            multipleStatements: true
        });

        console.log(`✅ Connected to database '${dbName}'`);

        // Check if tables already exist
        const [tables] = await connection.query('SHOW TABLES');
        
        if (tables.length > 0) {
            console.log(`⚠️  Database already has ${tables.length} tables. Skipping schema creation.`);
        } else {
            console.log('📊 Creating database schema...');
            await createSchema(connection);
        }

        // Check if seed data exists
        const [customerCount] = await connection.query('SELECT COUNT(*) as count FROM CUSTOMER');
        const [employeeCount] = await connection.query('SELECT COUNT(*) as count FROM BANK_EMPLOYEE');
        
        if (customerCount[0].count === 0 && employeeCount[0].count === 0) {
            console.log('🌱 Adding seed data...');
            await addSeedData(connection);
        } else {
            console.log(`⚠️  Database already has data (${customerCount[0].count} customers, ${employeeCount[0].count} employees). Skipping seed data.`);
        }

        // Create admin user
        await createAdminUser(connection);

        await connection.end();
        console.log('\n🎉 Database setup completed successfully!');
        console.log('\n📋 Admin Login Credentials:');
        console.log('Username: admin');
        console.log('Password: Admin123!');
        console.log('\n🌐 Start server with: node server.js');
        console.log('🔗 Admin URL: http://localhost:3000/Dashboard-Admin/admin-login.html');

    } catch (error) {
        console.error('❌ Database setup failed:', error.message);
        
        if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.log('\n💡 Database connection failed. Please check your .env file:');
            console.log('   - DB_HOST (default: localhost)');
            console.log('   - DB_USER (default: root)');
            console.log('   - DB_PASSWORD (your MySQL password)');
            console.log('   - DB_PORT (default: 3306)');
        }
        
        process.exit(1);
    }
}

async function createSchema(connection) {
    try {
        const schemaPath = path.join(__dirname, '../3_database/db_univault_schema.sql');
        const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
        
        // Split SQL into individual statements and execute them
        const statements = schemaSQL.split(';').filter(stmt => stmt.trim().length > 0);
        
        for (const statement of statements) {
            if (statement.trim()) {
                await connection.query(statement);
            }
        }
        
        console.log('✅ Schema created successfully');
    } catch (error) {
        console.error('❌ Error creating schema:', error.message);
        throw error;
    }
}

async function addSeedData(connection) {
    try {
        const seedPath = path.join(__dirname, '../3_database/db_univault_seed.sql');
        const seedSQL = fs.readFileSync(seedPath, 'utf8');
        
        // Split SQL into individual statements and execute them
        const statements = seedSQL.split(';').filter(stmt => stmt.trim().length > 0);
        
        for (const statement of statements) {
            if (statement.trim()) {
                await connection.query(statement);
            }
        }
        
        console.log('✅ Seed data added successfully');
    } catch (error) {
        console.error('❌ Error adding seed data:', error.message);
        throw error;
    }
}

async function createAdminUser(connection) {
    try {
        // Check if admin user exists
        const [existingAdmin] = await connection.query(
            'SELECT employee_id FROM BANK_EMPLOYEE WHERE employee_username = ?',
            ['admin']
        );
        
        if (existingAdmin.length > 0) {
            console.log('✅ Admin user already exists');
            return;
        }
        
        // Create admin user
        // Password hash for "Admin123!"
        const hashedPassword = '$2b$12$IEatmdijhyebJJqO7tpD/.flonO/u/J.abV8aXbt.xcR7PSXbf9lS';
        
        // Temporarily disable constraints
        await connection.query('SET foreign_key_checks = 0');
        await connection.query('SET sql_mode = ""');
        
        const [result] = await connection.query(
            `INSERT INTO BANK_EMPLOYEE (
                employee_position, 
                employee_last_name, 
                employee_first_name, 
                employee_username, 
                employee_password
            ) VALUES (?, ?, ?, ?, ?)`,
            [
                'System Administrator',
                'Administrator',
                'System',
                'admin',
                hashedPassword
            ]
        );
        
        // Re-enable constraints
        await connection.query('SET foreign_key_checks = 1');
        await connection.query('SET sql_mode = "STRICT_TRANS_TABLES,NO_ZERO_DATE,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO"');
        
        console.log(`✅ Admin user created (ID: ${result.insertId})`);
        
    } catch (error) {
        console.error('❌ Error creating admin user:', error.message);
        // Don't throw here, admin creation is not critical for basic setup
    }
}

// Run the setup
setupDatabase();
