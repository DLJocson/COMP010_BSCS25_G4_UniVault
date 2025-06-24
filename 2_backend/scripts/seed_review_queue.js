require('dotenv').config();
const { pool } = require('./config/database');
const fs = require('fs');
const path = require('path');

async function seedReviewQueue() {
    try {
        console.log('✅ Using existing database connection!');
        
        // Read the SQL file
        const sqlFile = path.join(__dirname, '../3_database/update_existing_customers.sql');
        const sqlContent = fs.readFileSync(sqlFile, 'utf8');
        
        // Split the SQL content into individual statements
        const statements = sqlContent.split(';').filter(stmt => stmt.trim());
        
        console.log('📝 Seeding review queue data...');
        
        // Execute each statement separately
        for (const statement of statements) {
            if (statement.trim()) {
                await pool.query(statement);
            }
        }
        
        console.log('✅ Review queue data seeded successfully!');
        
        // Verify the data
        const [pendingVerifications] = await pool.query(`
            SELECT COUNT(*) as count
            FROM CUSTOMER 
            WHERE customer_status = 'Pending Verification' AND is_deleted = FALSE
        `);
        
        const [closeRequests] = await pool.query(`
            SELECT COUNT(*) as count
            FROM CLOSE_REQUEST 
            WHERE request_status = 'Pending'
        `);
        
        console.log(`\n📊 Data Summary:`);
        console.log(`   Pending Verifications: ${pendingVerifications[0].count}`);
        console.log(`   Close Requests: ${closeRequests[0].count}`);
        
        console.log('✅ Database seeding completed successfully!');
        
    } catch (error) {
        console.error('❌ Error seeding review queue data:', error.message);
        process.exit(1);
    }
}

seedReviewQueue();
