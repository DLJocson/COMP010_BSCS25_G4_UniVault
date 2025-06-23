// Simple server starter that bypasses database connection for testing
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

console.log('🚀 Starting simple UniVault server (no database)...\n');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the frontend directory
const frontendPath = path.join(__dirname, '../1_frontend');
app.use(express.static(frontendPath));

console.log('📁 Serving static files from:', frontendPath);

// Test route
app.get('/test', (req, res) => {
    res.json({ 
        message: 'Server is working!', 
        timestamp: new Date().toISOString(),
        frontendPath: frontendPath
    });
});

// Test admin login page specifically
app.get('/admin-test', (req, res) => {
    const adminLoginPath = path.join(frontendPath, 'Dashboard-Admin', 'admin-login.html');
    res.sendFile(adminLoginPath);
});

// Handle admin login requests (mock response)
app.post('/admin/login', (req, res) => {
    console.log('🔐 Admin login attempt:', req.body);
    res.json({ 
        message: 'Database not connected - this is a test server',
        received: req.body
    });
});

// Root route
app.get('/', (req, res) => {
    res.send(`
        <h1>UniVault Server Running</h1>
        <p>Server is working properly!</p>
        <ul>
            <li><a href="/test">Test API</a></li>
            <li><a href="/Dashboard-Admin/admin-login.html">Admin Login</a></li>
            <li><a href="/admin-test">Direct Admin Login</a></li>
        </ul>
        <p>Frontend path: ${frontendPath}</p>
    `);
});

// Start server
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`🔗 Admin Login: http://localhost:${PORT}/Dashboard-Admin/admin-login.html`);
    console.log(`🧪 Test Page: http://localhost:${PORT}/test`);
    console.log('\n💡 If you can access these URLs, the server is working!');
    console.log('   Next step: Fix database connection in main server.js');
});

app.on('error', (err) => {
    console.error('❌ Server error:', err.message);
});
