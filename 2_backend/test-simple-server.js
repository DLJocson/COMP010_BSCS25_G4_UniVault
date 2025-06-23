// Extremely simple test server to verify port 3000 works
const express = require('express');
const app = express();
const PORT = 3000;

console.log('🔧 Starting minimal test server...');

app.get('/api', (req, res) => {
    console.log('✅ /api endpoint hit!');
    res.json({ message: 'TEST SERVER WORKING!', time: new Date() });
});

app.get('/admin/pending-verifications', (req, res) => {
    console.log('✅ /admin/pending-verifications endpoint hit!');
    res.json([
        { cif_number: '12345', customer_first_name: 'Test', customer_last_name: 'User', customer_status: 'Pending Verification' }
    ]);
});

app.get('/', (req, res) => {
    res.send('<h1>MINIMAL TEST SERVER RUNNING</h1><p>If you see this, the new server is working!</p>');
});

app.listen(PORT, () => {
    console.log(`🚀 MINIMAL TEST SERVER running on http://localhost:${PORT}`);
    console.log(`Test: http://localhost:${PORT}/api`);
    console.log(`Test: http://localhost:${PORT}/admin/pending-verifications`);
});
