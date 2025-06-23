const http = require('http');
const fs = require('fs');
const path = require('path');

console.log('🔍 Diagnosing UniVault Server Issues...\n');

// Check 1: Node.js and dependencies
console.log('1️⃣ Checking Node.js and dependencies:');
console.log('   Node.js version:', process.version);

try {
    require('express');
    console.log('   ✅ Express installed');
} catch (e) {
    console.log('   ❌ Express not found - run: npm install');
}

try {
    require('mysql2');
    console.log('   ✅ MySQL2 installed');
} catch (e) {
    console.log('   ❌ MySQL2 not found - run: npm install');
}

try {
    require('bcryptjs');
    console.log('   ✅ bcryptjs installed');
} catch (e) {
    console.log('   ❌ bcryptjs not found - run: npm install');
}

// Check 2: Environment file
console.log('\n2️⃣ Checking environment configuration:');
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
    console.log('   ✅ .env file exists');
    // Don't read the actual content for security
} else {
    console.log('   ❌ .env file missing');
    console.log('   📝 Create .env file from env-template.txt');
}

// Check 3: Frontend files
console.log('\n3️⃣ Checking frontend files:');
const frontendPath = path.join(__dirname, '../1_frontend');
const adminPath = path.join(frontendPath, 'Dashboard-Admin');
const loginFile = path.join(adminPath, 'admin-login.html');

if (fs.existsSync(frontendPath)) {
    console.log('   ✅ Frontend directory exists');
} else {
    console.log('   ❌ Frontend directory missing');
}

if (fs.existsSync(adminPath)) {
    console.log('   ✅ Dashboard-Admin directory exists');
} else {
    console.log('   ❌ Dashboard-Admin directory missing');
}

if (fs.existsSync(loginFile)) {
    console.log('   ✅ admin-login.html exists');
} else {
    console.log('   ❌ admin-login.html missing');
}

// Check 4: Port availability
console.log('\n4️⃣ Checking port availability:');
const port = process.env.PORT || 3000;

const server = http.createServer();
server.listen(port, (err) => {
    if (err) {
        console.log(`   ❌ Port ${port} is already in use`);
        console.log('   💡 Try a different port or stop other services');
    } else {
        console.log(`   ✅ Port ${port} is available`);
        server.close();
    }
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.log(`   ❌ Port ${port} is already in use`);
        console.log('   💡 Stop other servers or use a different port');
    } else {
        console.log(`   ❌ Port error: ${err.message}`);
    }
});

// Check 5: Simple server test
console.log('\n5️⃣ Testing basic server functionality:');
setTimeout(() => {
    try {
        const express = require('express');
        const app = express();
        
        app.get('/test', (req, res) => {
            res.send('Server is working!');
        });
        
        const testServer = app.listen(3001, () => {
            console.log('   ✅ Basic Express server can start');
            testServer.close();
            
            console.log('\n📋 Diagnosis Summary:');
            console.log('If all checks pass, try these solutions:\n');
            console.log('🔧 Solution 1 - Start the server:');
            console.log('   cd 2_backend');
            console.log('   node server.js\n');
            console.log('🔧 Solution 2 - Check for server output:');
            console.log('   Look for "Server running on http://localhost:3000"');
            console.log('   If you see database errors, fix .env first\n');
            console.log('🔧 Solution 3 - Try alternative URL:');
            console.log('   http://127.0.0.1:3000/Dashboard-Admin/admin-login.html\n');
            console.log('🔧 Solution 4 - Check firewall/antivirus:');
            console.log('   Some security software blocks local servers\n');
        });
        
        testServer.on('error', (err) => {
            console.log('   ❌ Express server failed to start:', err.message);
        });
        
    } catch (e) {
        console.log('   ❌ Express test failed:', e.message);
    }
}, 1000);
