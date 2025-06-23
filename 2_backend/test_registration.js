const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/customers';

async function testRegistration() {
    try {
        console.log('Testing step-by-step customer registration...\n');

        // Step 1: Start registration
        console.log('1. Starting registration...');
        const startResponse = await axios.post(`${BASE_URL}/register/start`);
        console.log('✓ Registration started:', startResponse.data);
        
        const registrationId = startResponse.data.registration_id;

        // Step 2: Complete step 1 (basic info)
        console.log('\n2. Completing step 1 (basic info)...');
        const step1Data = {
            registration_id: registrationId,
            customer_type: 'Account Owner',
            customer_last_name: 'Test',
            customer_first_name: 'User',
            customer_middle_name: 'Middle',
            customer_username: `testuser_${Date.now()}`,
            customer_password: 'TestPassword123!',
            birth_date: '1990-01-01',
            gender: 'Male',
            civil_status_code: 'CS01',
            birth_country: 'Philippines',
            residency_status: 'Resident',
            citizenship: 'Filipino',
            tax_identification_number: '123456789012'
        };
        
        const step1Response = await axios.post(`${BASE_URL}/register/step1`, step1Data);
        console.log('✓ Step 1 completed:', step1Response.data);

        // Step 3: Complete step 2 (address)
        console.log('\n3. Completing step 2 (address)...');
        const step2Data = {
            registration_id: registrationId,
            address_type_code: 'AD01',
            address_street: '123 Test Street',
            address_barangay: 'Test Barangay',
            address_city: 'Test City',
            address_province: 'Test Province',
            address_country: 'Philippines',
            address_zip_code: '1234'
        };
        
        const step2Response = await axios.post(`${BASE_URL}/register/step2`, step2Data);
        console.log('✓ Step 2 completed:', step2Response.data);

        // Step 4: Check progress
        console.log('\n4. Checking registration progress...');
        const progressResponse = await axios.get(`${BASE_URL}/register/progress/${registrationId}`);
        console.log('✓ Progress retrieved:', progressResponse.data);

        // Step 5: Get registration data
        console.log('\n5. Getting registration data...');
        const dataResponse = await axios.get(`${BASE_URL}/register/data/${registrationId}`);
        console.log('✓ Registration data retrieved:', JSON.stringify(dataResponse.data, null, 2));

        console.log('\n✅ All tests passed! Registration system is working correctly.');

    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
    }
}

if (require.main === module) {
    testRegistration();
}

module.exports = testRegistration;
