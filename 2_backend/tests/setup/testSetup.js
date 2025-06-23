const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.test' });

// Global test configuration
global.testConfig = {
  db: {
    host: process.env.TEST_DB_HOST || '127.0.0.1',
    user: process.env.TEST_DB_USER || 'root',
    password: process.env.TEST_DB_PASSWORD || 'kV:a7ij?,8GbSKG',
    database: process.env.TEST_DB_NAME || 'univault_test',
    multipleStatements: true
  },
  api: {
    baseURL: process.env.TEST_API_URL || 'http://localhost:3001',
    timeout: 10000
  }
};

// Test database connection
let testConnection;

// Setup test database
beforeAll(async () => {
  try {
    // Create test database connection
    testConnection = await mysql.createConnection({
      ...global.testConfig.db,
      database: undefined // Connect without database first
    });

    // Create test database if it doesn't exist
    await testConnection.execute(`CREATE DATABASE IF NOT EXISTS ${global.testConfig.db.database}`);
    await testConnection.execute(`USE ${global.testConfig.db.database}`);

    // Run basic schema setup
    await setupTestDatabase();
    
    console.log('✅ Test database setup completed');
  } catch (error) {
    console.error('❌ Test database setup failed:', error.message);
    throw error;
  }
});

// Cleanup after all tests
afterAll(async () => {
  if (testConnection) {
    // Clean up test database
    await testConnection.execute(`DROP DATABASE IF EXISTS ${global.testConfig.db.database}`);
    await testConnection.end();
    console.log('✅ Test database cleanup completed');
  }
});

// Clean up data between tests
beforeEach(async () => {
  if (testConnection) {
    // Clear test data but keep structure
    await cleanupTestData();
  }
});

async function setupTestDatabase() {
  // Create essential tables for testing
  await testConnection.execute(`
    CREATE TABLE IF NOT EXISTS CUSTOMER (
      cif_number INT PRIMARY KEY AUTO_INCREMENT,
      customer_username VARCHAR(50) UNIQUE NOT NULL,
      customer_password VARCHAR(255) NOT NULL,
      customer_first_name VARCHAR(100) NOT NULL,
      customer_last_name VARCHAR(100) NOT NULL,
      customer_middle_name VARCHAR(100),
      email VARCHAR(255),
      birth_date DATE,
      customer_status VARCHAR(50) DEFAULT 'Pending Verification',
      registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      is_deleted BOOLEAN DEFAULT FALSE
    )
  `);

  await testConnection.execute(`
    CREATE TABLE IF NOT EXISTS user_sessions (
      id INT PRIMARY KEY AUTO_INCREMENT,
      session_id VARCHAR(255) UNIQUE NOT NULL,
      user_id VARCHAR(50) NOT NULL,
      user_type ENUM('customer', 'employee', 'admin') NOT NULL,
      access_token VARCHAR(512) NOT NULL,
      refresh_token VARCHAR(512) UNIQUE,
      ip_address VARCHAR(45),
      user_agent TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      expires_at TIMESTAMP NOT NULL,
      status ENUM('active', 'expired', 'revoked') DEFAULT 'active'
    )
  `);

  await testConnection.execute(`
    CREATE TABLE IF NOT EXISTS login_attempts (
      id INT PRIMARY KEY AUTO_INCREMENT,
      identifier VARCHAR(255) NOT NULL,
      user_type ENUM('customer', 'employee', 'admin') NOT NULL,
      ip_address VARCHAR(45),
      attempt_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      success BOOLEAN DEFAULT FALSE,
      failure_reason VARCHAR(255)
    )
  `);

  await testConnection.execute(`
    CREATE TABLE IF NOT EXISTS registration_sessions (
      id INT PRIMARY KEY AUTO_INCREMENT,
      session_id VARCHAR(255) UNIQUE NOT NULL,
      registration_id VARCHAR(255) UNIQUE NOT NULL,
      current_step INT DEFAULT 1,
      total_steps INT DEFAULT 15,
      step_data JSON,
      step_progress JSON,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      expires_at TIMESTAMP NOT NULL,
      status ENUM('active', 'completed', 'expired', 'cancelled') DEFAULT 'active',
      cif_number INT
    )
  `);

  await testConnection.execute(`
    CREATE TABLE IF NOT EXISTS system_configurations (
      id INT PRIMARY KEY AUTO_INCREMENT,
      config_key VARCHAR(255) UNIQUE NOT NULL,
      config_value JSON NOT NULL,
      description TEXT,
      category VARCHAR(50) DEFAULT 'general',
      is_active BOOLEAN DEFAULT TRUE
    )
  `);

  // Insert test configurations
  await testConnection.execute(`
    INSERT IGNORE INTO system_configurations (config_key, config_value, description, category) VALUES
    ('session.max_concurrent_sessions', '3', 'Test session limit', 'session'),
    ('security.max_login_attempts', '5', 'Test login attempts', 'security')
  `);
}

async function cleanupTestData() {
  const tables = [
    'user_sessions',
    'login_attempts', 
    'registration_sessions',
    'CUSTOMER'
  ];

  for (const table of tables) {
    await testConnection.execute(`DELETE FROM ${table}`);
  }
}

// Global test utilities
global.testUtils = {
  // Create test database connection
  createConnection: async () => {
    return mysql.createConnection(global.testConfig.db);
  },

  // Create test customer
  createTestCustomer: async (overrides = {}) => {
    const connection = await global.testUtils.createConnection();
    
    const customerData = {
      customer_username: 'testuser',
      customer_password: '$2b$12$test.hash.here',
      customer_first_name: 'Test',
      customer_last_name: 'User',
      email: 'test@example.com',
      birth_date: '1990-01-01',
      ...overrides
    };

    const [result] = await connection.execute(`
      INSERT INTO CUSTOMER (
        customer_username, customer_password, customer_first_name,
        customer_last_name, email, birth_date
      ) VALUES (?, ?, ?, ?, ?, ?)
    `, [
      customerData.customer_username,
      customerData.customer_password,
      customerData.customer_first_name,
      customerData.customer_last_name,
      customerData.email,
      customerData.birth_date
    ]);

    await connection.end();
    
    return {
      cif_number: result.insertId,
      ...customerData
    };
  },

  // Create test session
  createTestSession: async (userId, userType = 'customer') => {
    const connection = await global.testUtils.createConnection();
    
    const sessionData = {
      session_id: 'test-session-' + Date.now(),
      user_id: userId.toString(),
      user_type: userType,
      access_token: 'test.access.token',
      refresh_token: 'test.refresh.token',
      ip_address: '127.0.0.1',
      expires_at: new Date(Date.now() + 3600000) // 1 hour
    };

    await connection.execute(`
      INSERT INTO user_sessions (
        session_id, user_id, user_type, access_token, 
        refresh_token, ip_address, expires_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      sessionData.session_id,
      sessionData.user_id,
      sessionData.user_type,
      sessionData.access_token,
      sessionData.refresh_token,
      sessionData.ip_address,
      sessionData.expires_at
    ]);

    await connection.end();
    return sessionData;
  },

  // Wait for async operations
  delay: (ms) => new Promise(resolve => setTimeout(resolve, ms)),

  // Generate test data
  generateTestData: {
    email: () => `test${Date.now()}@example.com`,
    username: () => `testuser${Date.now()}`,
    phoneNumber: () => '+639171234567',
    uuid: () => require('crypto').randomUUID()
  }
};

// Custom Jest matchers
expect.extend({
  toBeValidUUID(received) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const pass = uuidRegex.test(received);
    
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid UUID`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid UUID`,
        pass: false,
      };
    }
  },

  toBeValidEmail(received) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const pass = emailRegex.test(received);
    
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid email`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid email`,
        pass: false,
      };
    }
  },

  toBeWithinRange(received, floor, ceiling) {
    const pass = received >= floor && received <= ceiling;
    
    if (pass) {
      return {
        message: () => `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  }
});

// Global error handler for tests
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

module.exports = {
  testConfig: global.testConfig,
  testUtils: global.testUtils
};
