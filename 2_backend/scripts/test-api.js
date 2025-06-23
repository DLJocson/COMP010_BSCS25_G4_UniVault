const http = require('http');
const https = require('https');

/**
 * UniVault API Integration Test
 * Tests critical API endpoints to ensure proper integration
 */

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';

// Simple HTTP request helper
function makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const isHttps = url.startsWith('https');
        const client = isHttps ? https : http;
        
        const requestOptions = {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                ...options.headers
            }
        };
        
        const req = client.request(url, requestOptions, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const jsonData = data ? JSON.parse(data) : {};
                    resolve({
                        status: res.statusCode,
                        headers: res.headers,
                        data: jsonData
                    });
                } catch (error) {
                    resolve({
                        status: res.statusCode,
                        headers: res.headers,
                        data: data
                    });
                }
            });
        });
        
        req.on('error', reject);
        
        if (options.body) {
            req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
        }
        
        req.end();
    });
}

async function testHealthEndpoint() {
    console.log('🔍 Testing Health Endpoint...');
    
    try {
        const response = await makeRequest(`${BASE_URL}/api/health`);
        
        if (response.status === 200) {
            console.log('✅ Health endpoint working');
            console.log(`   Status: ${response.data.status}`);
            console.log(`   Database: ${response.data.database}`);
            return true;
        } else {
            console.log(`❌ Health endpoint failed: ${response.status}`);
            return false;
        }
    } catch (error) {
        console.log(`❌ Health endpoint error: ${error.message}`);
        return false;
    }
}

async function testRegistrationStart() {
    console.log('🔍 Testing Registration Start...');
    
    try {
        const response = await makeRequest(`${BASE_URL}/api/customers/register/start`, {
            method: 'POST',
            body: {}
        });
        
        if (response.status === 201) {
            console.log('✅ Registration start working');
            console.log(`   Registration ID: ${response.data.registration_id}`);
            return { success: true, registrationId: response.data.registration_id };
        } else {
            console.log(`❌ Registration start failed: ${response.status}`);
            console.log(`   Error: ${response.data.error || 'Unknown error'}`);
            return { success: false };
        }
    } catch (error) {
        console.log(`❌ Registration start error: ${error.message}`);
        return { success: false };
    }
}

async function testReferenceData() {
    console.log('🔍 Testing Reference Data Endpoints...');
    
    const endpoints = [
        '/api/civil-status',
        '/api/address-types',
        '/api/employment-positions'
    ];
    
    let allPassed = true;
    
    for (const endpoint of endpoints) {
        try {
            const response = await makeRequest(`${BASE_URL}${endpoint}`);
            
            if (response.status === 200 && Array.isArray(response.data)) {
                console.log(`✅ ${endpoint} working (${response.data.length} items)`);
            } else {
                console.log(`❌ ${endpoint} failed: ${response.status}`);
                allPassed = false;
            }
        } catch (error) {
            console.log(`❌ ${endpoint} error: ${error.message}`);
            allPassed = false;
        }
    }
    
    return allPassed;
}

async function testAuthentication() {
    console.log('🔍 Testing Authentication...');
    
    try {
        // Test login with invalid credentials
        const response = await makeRequest(`${BASE_URL}/api/auth/login`, {
            method: 'POST',
            body: {
                identifier: 'test@example.com',
                password: 'wrongpassword'
            }
        });
        
        if (response.status === 401) {
            console.log('✅ Authentication properly rejects invalid credentials');
            return true;
        } else {
            console.log(`❌ Authentication test unexpected result: ${response.status}`);
            return false;
        }
    } catch (error) {
        console.log(`❌ Authentication test error: ${error.message}`);
        return false;
    }
}

async function testFrontendFiles() {
    console.log('🔍 Testing Frontend File Serving...');
    
    const frontendFiles = [
        '/',
        '/Registration-Customer/landing.html',
        '/js/api-config.js'
    ];
    
    let allPassed = true;
    
    for (const file of frontendFiles) {
        try {
            const response = await makeRequest(`${BASE_URL}${file}`);
            
            if (response.status === 200) {
                console.log(`✅ ${file} served successfully`);
            } else {
                console.log(`❌ ${file} failed: ${response.status}`);
                allPassed = false;
            }
        } catch (error) {
            console.log(`❌ ${file} error: ${error.message}`);
            allPassed = false;
        }
    }
    
    return allPassed;
}

async function main() {
    console.log('🧪 UniVault API Integration Tests');
    console.log('==================================\n');
    
    const results = {
        health: await testHealthEndpoint(),
        referenceData: await testReferenceData(),
        authentication: await testAuthentication(),
        registrationStart: (await testRegistrationStart()).success,
        frontendFiles: await testFrontendFiles()
    };
    
    console.log('\n📊 Test Results:');
    console.log('=================');
    
    const totalTests = Object.keys(results).length;
    const passedTests = Object.values(results).filter(result => result).length;
    
    for (const [test, passed] of Object.entries(results)) {
        const status = passed ? '✅ PASS' : '❌ FAIL';
        console.log(`${test.toUpperCase()}: ${status}`);
    }
    
    console.log(`\nResult: ${passedTests}/${totalTests} tests passed`);
    
    if (passedTests === totalTests) {
        console.log('🎉 All API integration tests passed!');
        console.log('🚀 UniVault frontend and backend are properly integrated.');
    } else {
        console.log('⚠️  Some integration tests failed.');
        console.log('💡 Make sure the server is running: npm run dev');
        console.log('💡 Check database connectivity and configuration');
    }
    
    console.log(`\n🌐 Test URL: ${BASE_URL}`);
    console.log('');
    
    process.exit(passedTests === totalTests ? 0 : 1);
}

// Only run if called directly
if (require.main === module) {
    main().catch(error => {
        console.error('💥 Test suite failed:', error);
        process.exit(1);
    });
}

module.exports = { makeRequest, testHealthEndpoint };
