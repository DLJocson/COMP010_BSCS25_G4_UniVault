const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Database configuration
const config = {
    host: 'localhost',
    user: 'root',
    password: '123456789', // Replace with your MySQL password
    database: 'db_univault',
    port: 3306,
    multipleStatements: true
};

async function loadDummyData() {
    try {
        // Create connection
        const connection = await mysql.createConnection(config);
        console.log('✅ Connected to MySQL database!');
        
        // Read the SQL file
        const sqlFile = path.join(__dirname, '../3_database/admin_dashboard_dummy_data.sql');
        const sqlContent = fs.readFileSync(sqlFile, 'utf8');
        
        // Execute the SQL
        console.log('📝 Loading dummy data...');
        await connection.execute(sqlContent);
        
        console.log('✅ Dummy data loaded successfully!');
        
        // Verify the data
        const [rows] = await connection.execute(`
            SELECT 
                customer_status,
                COUNT(*) as count
            FROM CUSTOMER 
            WHERE is_deleted = FALSE
            GROUP BY customer_status
        `);
        
        console.log('\n📊 Customer Status Summary:');
        rows.forEach(row => {
            console.log(`   ${row.customer_status}: ${row.count}`);
        });
        
        // Check monthly stats
        const [monthlyRows] = await connection.execute(`
            SELECT 
                MONTH(created_at) as month,
                MONTHNAME(created_at) as month_name,
                COUNT(*) as registrations
            FROM CUSTOMER 
            WHERE YEAR(created_at) = 2025 AND is_deleted = FALSE
            GROUP BY MONTH(created_at), MONTHNAME(created_at)
            ORDER BY MONTH(created_at)
        `);
        
        console.log('\n📈 Monthly Registrations for 2025:');
        monthlyRows.forEach(row => {
            console.log(`   ${row.month_name}: ${row.registrations}`);
        });
        
        await connection.end();
        
    } catch (error) {
        console.error('❌ Error loading dummy data:', error.message);
        process.exit(1);
    }
}

loadDummyData();
