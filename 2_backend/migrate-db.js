const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runMigrations() {
    console.log('🚀 Starting UniVault Database Migration...\n');

    // Database connection
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || "127.0.0.1",
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD,
        multipleStatements: true
    });

    try {
        console.log('✅ Connected to database server');

        // Create database if it doesn't exist
        console.log('📝 Creating database if not exists...');
        await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'univault_schema'}`);
        console.log('✅ Database ensured');

        // Use the database
        await connection.query(`USE ${process.env.DB_NAME || 'univault_schema'}`);

        // Read and execute schema file
        console.log('📋 Running schema migration...');
        const schemaPath = path.join(__dirname, '../3_database/db_univault_schema.sql');
        if (fs.existsSync(schemaPath)) {
            try {
                const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
                await connection.query(schemaSQL);
                console.log('✅ Schema migration completed');
            } catch (error) {
                if (error.message.includes('already exists')) {
                    console.log('✅ Schema already exists, skipping...');
                } else {
                    throw error;
                }
            }
        } else {
            console.log('⚠️  Schema file not found, skipping...');
        }

        // Run additional tables migration
        console.log('🔧 Running additional tables migration...');
        const additionalPath = path.join(__dirname, '../3_database/db_additional_tables.sql');
        if (fs.existsSync(additionalPath)) {
            try {
                const additionalSQL = fs.readFileSync(additionalPath, 'utf8');
                await connection.query(additionalSQL);
                console.log('✅ Additional tables migration completed');
            } catch (error) {
                if (error.message.includes('already exists') || error.message.includes('Duplicate')) {
                    console.log('✅ Additional tables already exist, skipping...');
                } else {
                    console.log('⚠️  Additional tables migration warning:', error.message);
                }
            }
        } else {
            console.log('⚠️  Additional tables file not found, skipping...');
        }

        // Run seed data migration
        console.log('🌱 Running seed data migration...');
        const seedPath = path.join(__dirname, '../3_database/db_univault_seed.sql');
        if (fs.existsSync(seedPath)) {
            const seedSQL = fs.readFileSync(seedPath, 'utf8');
            await connection.query(seedSQL);
            console.log('✅ Seed data migration completed');
        } else {
            console.log('⚠️  Seed data file not found, skipping...');
        }

        // Verify critical tables exist
        console.log('🔍 Verifying database structure...');
        const [tables] = await connection.query('SHOW TABLES');
        const tableNames = tables.map(row => Object.values(row)[0]);
        
        const requiredTables = [
            'customer', 'account', 'transaction', 'admin',
            'civil_status_type', 'address_type', 'account_type',
            'transaction_type', 'account_status_type'
        ];

        const missingTables = requiredTables.filter(table => !tableNames.includes(table));
        
        if (missingTables.length > 0) {
            console.log('⚠️  Warning: Missing tables:', missingTables.join(', '));
        } else {
            console.log('✅ All required tables present');
        }

        // Check admin user exists
        console.log('👤 Checking admin user...');
        const [adminUsers] = await connection.query('SELECT COUNT(*) as count FROM admin WHERE admin_id = "ADMIN001"');
        if (adminUsers[0].count === 0) {
            console.log('⚠️  Warning: Default admin user not found. Creating...');
            await connection.query(`
                INSERT INTO admin (admin_id, username, email, password_hash, full_name, role) 
                VALUES (
                    'ADMIN001', 
                    'admin', 
                    'admin@univault.com', 
                    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewNF2/c.XqlAOGsq', 
                    'System Administrator',
                    'SUPER_ADMIN'
                )
            `);
            console.log('✅ Default admin user created (username: admin, password: admin123456)');
            console.log('🔒 IMPORTANT: Change the default admin password immediately!');
        } else {
            console.log('✅ Admin user exists');
        }

        console.log('\n🎉 Database migration completed successfully!');
        console.log('\n📊 Database Summary:');
        console.log(`   Database: ${process.env.DB_NAME || 'univault_schema'}`);
        console.log(`   Tables: ${tableNames.length}`);
        console.log(`   Host: ${process.env.DB_HOST || "127.0.0.1"}`);
        
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        process.exit(1);
    } finally {
        await connection.end();
        console.log('\n✅ Database connection closed');
    }
}

// Run if called directly
if (require.main === module) {
    runMigrations()
        .then(() => {
            console.log('\n🚀 Ready to start UniVault server!');
            process.exit(0);
        })
        .catch(error => {
            console.error('\n💥 Migration failed:', error);
            process.exit(1);
        });
}

module.exports = { runMigrations };
