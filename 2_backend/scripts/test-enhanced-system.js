const mysql = require('mysql2/promise');
const axios = require('axios');
const fs = require('fs');
require('dotenv').config();

// Test configuration
const API_BASE = 'http://localhost:3000/api';
const DB_CONFIG = {
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'kV:a7ij?,8GbSKG',
    database: process.env.DB_NAME || 'univault_schema',
    multipleStatements: true
};

class EnhancedSystemTester {
    constructor() {
        this.connection = null;
        this.testResults = {
            database: [],
            api: [],
            security: [],
            performance: []
        };
    }

    async connect() {
        try {
            this.connection = await mysql.createConnection(DB_CONFIG);
            console.log('✅ Database connection established');
            return true;
        } catch (error) {
            console.error('❌ Database connection failed:', error.message);
            return false;
        }
    }

    async runMigration() {
        try {
            console.log('🔧 Running migration...');
            const migration = fs.readFileSync('../3_database/migrations/001_session_management_tables.sql', 'utf8');
            await this.connection.execute(migration);
            console.log('✅ Migration completed successfully');
            return true;
        } catch (error) {
            console.error('❌ Migration failed:', error.message);
            return false;
        }
    }

    async testDatabaseTables() {
        console.log('\n📊 Testing Database Tables...');
        
        const expectedTables = [
            'user_sessions',
            'login_attempts', 
            'password_reset_tokens',
            'security_events',
            'account_lockouts',
            'rate_limit_tracking',
            'registration_sessions',
            'user_devices',
            'two_factor_auth',
            'api_access_logs',
            'system_configurations'
        ];

        for (const table of expectedTables) {
            try {
                const [rows] = await this.connection.execute(`SHOW TABLES LIKE '${table}'`);
                if (rows.length > 0) {
                    console.log(`  ✅ ${table} - exists`);
                    this.testResults.database.push({ table, status: 'exists' });
                } else {
                    console.log(`  ❌ ${table} - missing`);
                    this.testResults.database.push({ table, status: 'missing' });
                }
            } catch (error) {
                console.log(`  ❌ ${table} - error: ${error.message}`);
                this.testResults.database.push({ table, status: 'error', error: error.message });
            }
        }
    }

    async testSystemConfigurations() {
        console.log('\n⚙️ Testing System Configurations...');
        
        try {
            const [configs] = await this.connection.execute('SELECT * FROM system_configurations');
            console.log(`  ✅ Found ${configs.length} system configurations`);
            
            const expectedConfigs = [
                'session.max_concurrent_sessions',
                'security.max_login_attempts',
                'rate_limit.api_requests_per_minute'
            ];

            for (const configKey of expectedConfigs) {
                const config = configs.find(c => c.config_key === configKey);
                if (config) {
                    console.log(`    ✅ ${configKey}: ${config.config_value}`);
                } else {
                    console.log(`    ❌ ${configKey}: missing`);
                }
            }
        } catch (error) {
            console.error('  ❌ System configurations test failed:', error.message);
        }
    }

    async testReferenceDataAPI() {
        console.log('\n🌍 Testing Reference Data APIs...');
        
        const endpoints = [
            '/reference/countries',
            '/reference/civil-status',
            '/reference/address-types',
            '/reference/account-types',
            '/reference/id-types'
        ];

        for (const endpoint of endpoints) {
            try {
                const response = await axios.get(`${API_BASE}${endpoint}`);
                if (response.status === 200 && response.data) {
                    console.log(`  ✅ ${endpoint} - ${response.status} - ${JSON.stringify(response.data).length} bytes`);
                    this.testResults.api.push({ endpoint, status: 'success', code: response.status });
                } else {
                    console.log(`  ⚠️ ${endpoint} - ${response.status} - unexpected response`);
                    this.testResults.api.push({ endpoint, status: 'warning', code: response.status });
                }
            } catch (error) {
                console.log(`  ❌ ${endpoint} - ${error.message}`);
                this.testResults.api.push({ endpoint, status: 'error', error: error.message });
            }
        }
    }

    async testBulkReferenceAPI() {
        console.log('\n📦 Testing Bulk Reference Data API...');
        
        try {
            const response = await axios.get(`${API_BASE}/reference/bulk?types=countries,civil-status,address-types`);
            if (response.status === 200 && response.data && response.data.data) {
                console.log(`  ✅ Bulk API - ${response.status}`);
                console.log(`    📊 Data types returned: ${Object.keys(response.data.data).join(', ')}`);
                this.testResults.api.push({ endpoint: '/reference/bulk', status: 'success', code: response.status });
            } else {
                console.log(`  ⚠️ Bulk API - unexpected response format`);
                this.testResults.api.push({ endpoint: '/reference/bulk', status: 'warning' });
            }
        } catch (error) {
            console.log(`  ❌ Bulk API - ${error.message}`);
            this.testResults.api.push({ endpoint: '/reference/bulk', status: 'error', error: error.message });
        }
    }

    async testHealthEndpoints() {
        console.log('\n🏥 Testing Health Check Endpoints...');
        
        const healthEndpoints = [
            '/health',
            '/status'
        ];

        for (const endpoint of healthEndpoints) {
            try {
                const response = await axios.get(`${API_BASE}${endpoint}`);
                console.log(`  ✅ ${endpoint} - ${response.status} - ${response.data.status}`);
                this.testResults.api.push({ endpoint, status: 'success', code: response.status });
            } catch (error) {
                console.log(`  ❌ ${endpoint} - ${error.message}`);
                this.testResults.api.push({ endpoint, status: 'error', error: error.message });
            }
        }
    }

    async testDatabaseIndexes() {
        console.log('\n🔍 Testing Database Indexes...');
        
        try {
            // Test key indexes
            const indexQueries = [
                { table: 'user_sessions', index: 'idx_session_id' },
                { table: 'login_attempts', index: 'idx_login_attempts_ip' },
                { table: 'security_events', index: 'idx_security_events_type' }
            ];

            for (const { table, index } of indexQueries) {
                try {
                    const [indexes] = await this.connection.execute(`SHOW INDEX FROM ${table} WHERE Key_name = '${index}'`);
                    if (indexes.length > 0) {
                        console.log(`  ✅ ${table}.${index} - exists`);
                    } else {
                        console.log(`  ⚠️ ${table}.${index} - missing`);
                    }
                } catch (error) {
                    console.log(`  ❌ ${table}.${index} - error checking`);
                }
            }
        } catch (error) {
            console.error('  ❌ Index testing failed:', error.message);
        }
    }

    async testSecurityHeaders() {
        console.log('\n🔒 Testing Security Headers...');
        
        try {
            const response = await axios.get(`${API_BASE}/health`);
            const headers = response.headers;
            
            const securityHeaders = [
                'x-frame-options',
                'x-content-type-options',
                'x-xss-protection',
                'referrer-policy'
            ];

            for (const header of securityHeaders) {
                if (headers[header]) {
                    console.log(`  ✅ ${header}: ${headers[header]}`);
                    this.testResults.security.push({ header, status: 'present', value: headers[header] });
                } else {
                    console.log(`  ❌ ${header}: missing`);
                    this.testResults.security.push({ header, status: 'missing' });
                }
            }
        } catch (error) {
            console.log(`  ❌ Security headers test failed: ${error.message}`);
        }
    }

    async performanceTest() {
        console.log('\n⚡ Running Performance Tests...');
        
        const testEndpoint = `${API_BASE}/health`;
        const requests = 10;
        const times = [];

        for (let i = 0; i < requests; i++) {
            try {
                const start = Date.now();
                await axios.get(testEndpoint);
                const end = Date.now();
                times.push(end - start);
            } catch (error) {
                console.log(`  ❌ Request ${i + 1} failed`);
            }
        }

        if (times.length > 0) {
            const avg = times.reduce((a, b) => a + b, 0) / times.length;
            const min = Math.min(...times);
            const max = Math.max(...times);
            
            console.log(`  📊 Performance Results (${requests} requests):`);
            console.log(`    ⏱️ Average: ${avg.toFixed(2)}ms`);
            console.log(`    🏃 Fastest: ${min}ms`);
            console.log(`    🐌 Slowest: ${max}ms`);
            
            this.testResults.performance.push({
                requests,
                averageTime: avg,
                minTime: min,
                maxTime: max
            });
        }
    }

    async generateReport() {
        console.log('\n📋 Test Report Summary');
        console.log('=' .repeat(50));
        
        const dbSuccess = this.testResults.database.filter(r => r.status === 'exists').length;
        const dbTotal = this.testResults.database.length;
        console.log(`📊 Database Tables: ${dbSuccess}/${dbTotal} successful`);
        
        const apiSuccess = this.testResults.api.filter(r => r.status === 'success').length;
        const apiTotal = this.testResults.api.length;
        console.log(`🌐 API Endpoints: ${apiSuccess}/${apiTotal} successful`);
        
        const securityPresent = this.testResults.security.filter(r => r.status === 'present').length;
        const securityTotal = this.testResults.security.length;
        console.log(`🔒 Security Headers: ${securityPresent}/${securityTotal} present`);
        
        if (this.testResults.performance.length > 0) {
            const perf = this.testResults.performance[0];
            console.log(`⚡ Performance: ${perf.averageTime.toFixed(2)}ms average response time`);
        }
        
        console.log('\n📝 Detailed Results:');
        console.log(JSON.stringify(this.testResults, null, 2));
        
        // Overall status
        const overallSuccess = (dbSuccess + apiSuccess + securityPresent) / (dbTotal + apiTotal + securityTotal);
        const grade = overallSuccess >= 0.9 ? '🟢 EXCELLENT' : 
                     overallSuccess >= 0.7 ? '🟡 GOOD' : 
                     overallSuccess >= 0.5 ? '🟠 FAIR' : '🔴 NEEDS WORK';
        
        console.log(`\n🎯 Overall Status: ${grade} (${(overallSuccess * 100).toFixed(1)}%)`);
    }

    async cleanup() {
        if (this.connection) {
            await this.connection.end();
            console.log('🔌 Database connection closed');
        }
    }

    async runAllTests() {
        console.log('🚀 Starting Enhanced UniVault System Tests');
        console.log('=' .repeat(50));

        if (!(await this.connect())) {
            console.log('❌ Cannot continue without database connection');
            return;
        }

        // Run migration first
        await this.runMigration();

        // Database tests
        await this.testDatabaseTables();
        await this.testSystemConfigurations();
        await this.testDatabaseIndexes();

        // API tests (will fail if server is not running)
        console.log('\n🌐 Testing API endpoints (requires running server)...');
        try {
            await this.testHealthEndpoints();
            await this.testReferenceDataAPI();
            await this.testBulkReferenceAPI();
            await this.testSecurityHeaders();
            await this.performanceTest();
        } catch (error) {
            console.log('⚠️ API tests skipped - server may not be running');
            console.log('   To test APIs, run: npm run dev');
        }

        await this.generateReport();
        await this.cleanup();
    }
}

// Run tests
const tester = new EnhancedSystemTester();
tester.runAllTests().catch(console.error);
