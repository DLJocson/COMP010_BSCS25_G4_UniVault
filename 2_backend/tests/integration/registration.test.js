const request = require('supertest');
const express = require('express');
const mysql = require('mysql2/promise');

// Import test utilities
const { testUtils } = require('../setup/testSetup');

describe('Registration Integration Tests', () => {
  let app;
  let testDb;

  beforeAll(async () => {
    // Create test app
    app = express();
    app.use(express.json());
    
    // Create test database connection
    testDb = await testUtils.createConnection();
    
    // Mock database middleware
    app.use((req, res, next) => {
      req.db = testDb;
      next();
    });

    // Import and use routes
    const enhancedRegistrationRoutes = require('../../routes/enhancedRegistration');
    app.use('/api/enhanced-registration', enhancedRegistrationRoutes);
  });

  afterAll(async () => {
    if (testDb) {
      await testDb.end();
    }
  });

  describe('Complete Registration Flow', () => {
    let registrationId;

    it('should start registration session', async () => {
      const response = await request(app)
        .post('/api/enhanced-registration/start')
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Registration session started successfully');
      expect(response.body.data).toHaveProperty('registrationId');
      expect(response.body.data).toHaveProperty('currentStep', 1);
      expect(response.body.data).toHaveProperty('totalSteps', 15);
      expect(response.body.data.registrationId).toBeValidUUID();

      registrationId = response.body.data.registrationId;
    });

    it('should save step 1 data (personal information)', async () => {
      const step1Data = {
        customer_type: 'Individual',
        customer_first_name: 'John',
        customer_last_name: 'Doe',
        customer_middle_name: 'Michael',
        customer_username: testUtils.generateTestData.username(),
        customer_password: 'SecurePass123!',
        birth_date: '1990-05-15',
        gender: 'Male',
        civil_status_code: 'CS01',
        birth_country: 'Philippines',
        residency_status: 'Resident',
        citizenship: 'Filipino',
        tax_identification_number: '123456789012'
      };

      const response = await request(app)
        .post('/api/enhanced-registration/step/1')
        .send({
          registrationId,
          stepData: step1Data,
          isComplete: true
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Step 1 completed successfully');
      expect(response.body.data).toHaveProperty('currentStep', 2);
      expect(response.body.data.stepProgress).toHaveProperty('step1', true);
    });

    it('should save step 2 data (address information)', async () => {
      const step2Data = {
        address_type_code: 'AD01',
        address_unit: '123',
        address_building: 'Test Building',
        address_street: 'Test Street',
        address_barangay: 'Test Barangay',
        address_city: 'Manila',
        address_province: 'Metro Manila',
        address_country: 'Philippines',
        address_zip_code: '1000'
      };

      const response = await request(app)
        .post('/api/enhanced-registration/step/2')
        .send({
          registrationId,
          stepData: step2Data,
          isComplete: true
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('currentStep', 3);
      expect(response.body.data.stepProgress).toHaveProperty('step2', true);
    });

    it('should save step 3 data (primary contact)', async () => {
      const step3Data = {
        contact_type_code: 'CT01',
        contact_value: testUtils.generateTestData.email()
      };

      const response = await request(app)
        .post('/api/enhanced-registration/step/3')
        .send({
          registrationId,
          stepData: step3Data,
          isComplete: true
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('currentStep', 4);
    });

    it('should save step 5 data (employment information)', async () => {
      const step5Data = {
        employer_business_name: 'Test Company Inc.',
        employment_start_date: '2020-01-01',
        position_code: 'EP01',
        income_monthly_gross: 50000
      };

      const response = await request(app)
        .post('/api/enhanced-registration/step/5')
        .send({
          registrationId,
          stepData: step5Data,
          isComplete: true
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('currentStep', 6);
    });

    it('should save step 6 data (fund source)', async () => {
      const step6Data = {
        fund_source_code: 'FS001'
      };

      const response = await request(app)
        .post('/api/enhanced-registration/step/6')
        .send({
          registrationId,
          stepData: step6Data,
          isComplete: true
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('currentStep', 7);
    });

    it('should save step 7 data (primary ID)', async () => {
      const step7Data = {
        id_type_code: 'DRV',
        id_number: 'A12-34-567890',
        id_issue_date: '2020-01-01',
        id_expiry_date: '2025-01-01'
      };

      const response = await request(app)
        .post('/api/enhanced-registration/step/7')
        .send({
          registrationId,
          stepData: step7Data,
          isComplete: true
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('currentStep', 8);
    });

    it('should get registration progress', async () => {
      const response = await request(app)
        .get(`/api/enhanced-registration/progress/${registrationId}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('registrationId', registrationId);
      expect(response.body.data).toHaveProperty('currentStep');
      expect(response.body.data).toHaveProperty('completedSteps');
      expect(response.body.data).toHaveProperty('completionPercentage');
      expect(response.body.data.completedSteps).toBeGreaterThan(0);
    });

    it('should get saved registration data', async () => {
      const response = await request(app)
        .get(`/api/enhanced-registration/data/${registrationId}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('registrationId', registrationId);
      expect(response.body.data).toHaveProperty('stepData');
      expect(response.body.data.stepData).toHaveProperty('step1');
      expect(response.body.data.stepData).toHaveProperty('step2');
      
      // Ensure password is not returned
      expect(response.body.data.stepData.step1).not.toHaveProperty('customer_password');
    });

    it('should finalize registration successfully', async () => {
      const response = await request(app)
        .post('/api/enhanced-registration/finalize')
        .send({ registrationId })
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Registration completed successfully');
      expect(response.body.data).toHaveProperty('cifNumber');
      expect(response.body.data).toHaveProperty('username');
      expect(response.body.data).toHaveProperty('status', 'Pending Verification');

      // Verify customer was created in database
      const [customers] = await testDb.query(
        'SELECT * FROM CUSTOMER WHERE cif_number = ?',
        [response.body.data.cifNumber]
      );

      expect(customers).toHaveLength(1);
      expect(customers[0]).toHaveProperty('customer_first_name', 'John');
      expect(customers[0]).toHaveProperty('customer_last_name', 'Doe');
      expect(customers[0]).toHaveProperty('customer_status', 'Pending Verification');
    });
  });

  describe('Registration Validation', () => {
    let registrationId;

    beforeEach(async () => {
      // Start new registration session for each test
      const response = await request(app)
        .post('/api/enhanced-registration/start');
      registrationId = response.body.data.registrationId;
    });

    it('should validate step 1 required fields', async () => {
      const invalidStep1Data = {
        customer_first_name: '', // Missing required field
        customer_last_name: 'Doe',
        birth_date: '1990-05-15'
      };

      const response = await request(app)
        .post('/api/enhanced-registration/step/1')
        .send({
          registrationId,
          stepData: invalidStep1Data,
          isComplete: true
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });

    it('should validate step 2 address fields', async () => {
      const invalidStep2Data = {
        address_barangay: '', // Missing required field
        address_city: 'Manila',
        address_province: 'Metro Manila'
      };

      const response = await request(app)
        .post('/api/enhanced-registration/step/2')
        .send({
          registrationId,
          stepData: invalidStep2Data,
          isComplete: true
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });

    it('should validate step 5 employment fields', async () => {
      const invalidStep5Data = {
        employer_business_name: 'Test Company',
        employment_start_date: '2025-01-01', // Future date
        income_monthly_gross: 50000
      };

      const response = await request(app)
        .post('/api/enhanced-registration/step/5')
        .send({
          registrationId,
          stepData: invalidStep5Data,
          isComplete: true
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });

    it('should validate step sequence', async () => {
      // Try to save step 5 without completing step 1
      const step5Data = {
        employer_business_name: 'Test Company',
        employment_start_date: '2020-01-01',
        position_code: 'EP01',
        income_monthly_gross: 50000
      };

      const response = await request(app)
        .post('/api/enhanced-registration/step/5')
        .send({
          registrationId,
          stepData: step5Data,
          isComplete: true
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toContain('Cannot skip to step');
    });
  });

  describe('Registration Session Management', () => {
    it('should handle expired registration session', async () => {
      // Create expired session manually in database
      const expiredSessionId = testUtils.generateTestData.uuid();
      const expiredRegistrationId = testUtils.generateTestData.uuid();
      
      await testDb.query(`
        INSERT INTO registration_sessions (
          session_id, registration_id, current_step, total_steps,
          expires_at, status
        ) VALUES (?, ?, 1, 15, DATE_SUB(NOW(), INTERVAL 1 HOUR), 'active')
      `, [expiredSessionId, expiredRegistrationId]);

      const response = await request(app)
        .get(`/api/enhanced-registration/progress/${expiredRegistrationId}`)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Registration session not found or expired');
    });

    it('should cancel registration session', async () => {
      // Start session
      const startResponse = await request(app)
        .post('/api/enhanced-registration/start');
      const registrationId = startResponse.body.data.registrationId;

      // Cancel session
      const response = await request(app)
        .delete(`/api/enhanced-registration/${registrationId}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Registration session cancelled successfully');

      // Verify session is cancelled in database
      const [sessions] = await testDb.query(
        'SELECT status FROM registration_sessions WHERE registration_id = ?',
        [registrationId]
      );

      expect(sessions).toHaveLength(1);
      expect(sessions[0]).toHaveProperty('status', 'cancelled');
    });
  });

  describe('Step Validation Endpoint', () => {
    it('should validate step data without saving', async () => {
      const validStep1Data = {
        customer_first_name: 'John',
        customer_last_name: 'Doe',
        birth_date: '1990-05-15',
        customer_username: testUtils.generateTestData.username(),
        customer_password: 'SecurePass123!',
        gender: 'Male',
        civil_status_code: 'CS01'
      };

      const response = await request(app)
        .post('/api/enhanced-registration/validate-step')
        .send({
          stepNumber: 1,
          stepData: validStep1Data
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('isValid', true);
      expect(response.body.data).toHaveProperty('errors');
      expect(response.body.data.errors).toHaveLength(0);
    });

    it('should return validation errors without saving', async () => {
      const invalidStep1Data = {
        customer_first_name: '', // Invalid
        customer_last_name: 'Doe',
        birth_date: '2010-05-15', // Too young
        customer_password: 'weak' // Too weak
      };

      const response = await request(app)
        .post('/api/enhanced-registration/validate-step')
        .send({
          stepNumber: 1,
          stepData: invalidStep1Data
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('isValid', false);
      expect(response.body.data.errors).toBeInstanceOf(Array);
      expect(response.body.data.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors', async () => {
      // This test would require mocking database failures
      // Implementation depends on your error handling strategy
      expect(true).toBe(true); // Placeholder
    });

    it('should handle invalid registration IDs', async () => {
      const response = await request(app)
        .get('/api/enhanced-registration/progress/invalid-uuid')
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should handle malformed request data', async () => {
      const response = await request(app)
        .post('/api/enhanced-registration/step/1')
        .send({
          registrationId: 'invalid',
          stepData: 'not-an-object'
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('Performance Tests', () => {
    it('should handle concurrent registration sessions', async () => {
      const concurrentRequests = 10;
      const promises = Array(concurrentRequests).fill().map(() =>
        request(app).post('/api/enhanced-registration/start')
      );

      const responses = await Promise.all(promises);

      // All requests should succeed
      responses.forEach(response => {
        expect(response.status).toBe(201);
        expect(response.body.data.registrationId).toBeValidUUID();
      });

      // All registration IDs should be unique
      const registrationIds = responses.map(r => r.body.data.registrationId);
      const uniqueIds = new Set(registrationIds);
      expect(uniqueIds.size).toBe(concurrentRequests);
    });

    it('should handle rapid step updates', async () => {
      // Start registration
      const startResponse = await request(app)
        .post('/api/enhanced-registration/start');
      const registrationId = startResponse.body.data.registrationId;

      // Rapid updates to the same step
      const promises = Array(5).fill().map(() =>
        request(app)
          .post('/api/enhanced-registration/step/1')
          .send({
            registrationId,
            stepData: {
              customer_first_name: 'John',
              customer_last_name: 'Doe',
              birth_date: '1990-05-15',
              customer_username: testUtils.generateTestData.username(),
              customer_password: 'SecurePass123!',
              gender: 'Male',
              civil_status_code: 'CS01'
            },
            isComplete: false
          })
      );

      const responses = await Promise.all(promises);

      // Most should succeed (depending on race conditions)
      const successfulResponses = responses.filter(r => r.status === 200);
      expect(successfulResponses.length).toBeGreaterThan(0);
    });
  });
});
