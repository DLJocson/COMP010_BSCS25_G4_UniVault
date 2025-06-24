// Simple script to seed the database
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function seedDatabase() {
    try {
        // Database connection config
        const config = {
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'univault_schema',
            multipleStatements: true
        };

        console.log('Connecting to database...');
        const connection = await mysql.createConnection(config);
        
        // Read the seed file
        const sqlFile = path.join(__dirname, 'seed_review_queue_data.sql');
        const sql = fs.readFileSync(sqlFile, 'utf8');
        
        console.log('Executing seed script...');
        await connection.execute(sql);
        
        console.log('✅ Database seeded successfully!');
        await connection.end();
        
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
}

seedDatabase();
