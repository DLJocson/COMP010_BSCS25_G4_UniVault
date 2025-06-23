// Quick test script to verify the pending-verifications endpoint
require('dotenv').config();

const express = require('express');
const mysql = require('mysql2/promise');

const app = express();
const PORT = 3001; // Use different port for testing

// MySQL Connection Pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

app.use(express.json());

// Test the pending verifications endpoint
app.get('/admin/pending-verifications', async (req, res) => {
    console.log('Received request for pending verifications');
    try {
        const [verifications] = await pool.query(`
            SELECT 
                c.cif_number,
                c.customer_type,
                c.customer_first_name,
                c.customer_last_name,
                c.customer_middle_name,
                c.customer_suffix_name,
                c.created_at,
                cd.contact_value as email,
                cd2.contact_value as phone,
                c.customer_status
            FROM CUSTOMER c
            LEFT JOIN CUSTOMER_CONTACT_DETAILS cd ON c.cif_number = cd.cif_number AND cd.contact_type_code = 'CT01'
            LEFT JOIN CUSTOMER_CONTACT_DETAILS cd2 ON c.cif_number = cd2.cif_number AND cd2.contact_type_code = 'CT02'
            WHERE c.customer_status = 'Pending Verification' AND c.is_deleted = FALSE
            ORDER BY c.created_at ASC
            LIMIT 100
        `);
        
        console.log(`Found ${verifications.length} pending verifications`);
        res.json(verifications);
    } catch (err) {
        console.error('Error fetching pending verifications:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Test endpoint
app.get('/test', (req, res) => {
    res.json({ message: 'Test server is working!', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`Test server running on http://localhost:${PORT}`);
    console.log('Test the pending verifications endpoint:');
    console.log(`  curl http://localhost:${PORT}/admin/pending-verifications`);
    console.log(`  curl http://localhost:${PORT}/test`);
});
