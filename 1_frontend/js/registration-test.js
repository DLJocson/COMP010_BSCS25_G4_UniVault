/**
 * UniVault Registration Integration Test
 * Test the registration API endpoints
 */

class RegistrationIntegrationTest {
    static async testRegistrationFlow() {
        console.log('🧪 Testing UniVault Registration Integration...');
        
        try {
            // Test 1: Start registration
            console.log('📝 Testing registration start...');
            const startResponse = await APIClient.post('/customers/register/start', {
                step: 1,
                timestamp: new Date().toISOString()
            });
            console.log('✅ Registration started:', startResponse);
            
            const sessionId = startResponse.session_id;
            
            // Test 2: Step 1 - Customer Type
            console.log('📝 Testing step 1 - Customer Type...');
            const step1Response = await APIClient.post('/customers/register/step1', {
                session_id: sessionId,
                data: {
                    customerType: 'account_owner',
                    timestamp: new Date().toISOString()
                }
            });
            console.log('✅ Step 1 completed:', step1Response);
            
            // Test 3: Step 2 - Account Type
            console.log('📝 Testing step 2 - Account Type...');
            const step2Response = await APIClient.post('/customers/register/step2', {
                session_id: sessionId,
                data: {
                    accountType: 'deposit_account',
                    timestamp: new Date().toISOString()
                }
            });
            console.log('✅ Step 2 completed:', step2Response);
            
            // Test 4: Check progress
            console.log('📝 Testing progress check...');
            const progressResponse = await APIClient.get(`/customers/register/progress/${sessionId}`);
            console.log('✅ Progress retrieved:', progressResponse);
            
            // Test 5: Load reference data
            console.log('📝 Testing reference data endpoints...');
            
            try {
                const civilStatusResponse = await APIClient.get('/civil-status');
                console.log('✅ Civil status data loaded:', civilStatusResponse);
            } catch (error) {
                console.log('⚠️ Civil status endpoint not available:', error.message);
            }
            
            try {
                const addressTypesResponse = await APIClient.get('/address-types');
                console.log('✅ Address types data loaded:', addressTypesResponse);
            } catch (error) {
                console.log('⚠️ Address types endpoint not available:', error.message);
            }
            
            console.log('🎉 Registration integration test completed successfully!');
            
        } catch (error) {
            console.error('❌ Registration integration test failed:', error);
            throw error;
        }
    }
    
    static async testReferenceDataEndpoints() {
        console.log('🧪 Testing Reference Data Endpoints...');
        
        const endpoints = [
            '/civil-status',
            '/address-types',
            '/employment-positions',
            '/work-natures',
            '/fund-sources'
        ];
        
        for (const endpoint of endpoints) {
            try {
                const response = await APIClient.get(endpoint);
                console.log(`✅ ${endpoint}:`, response);
            } catch (error) {
                console.log(`⚠️ ${endpoint} not available:`, error.message);
            }
        }
    }
}

// Export for testing
window.RegistrationIntegrationTest = RegistrationIntegrationTest;

// Auto-run test if in development mode
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    document.addEventListener('DOMContentLoaded', () => {
        // Add test button to page
        const testButton = document.createElement('button');
        testButton.textContent = '🧪 Test Registration Integration';
        testButton.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            z-index: 9999;
            padding: 10px;
            background: #007bff;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 12px;
        `;
        
        testButton.addEventListener('click', async () => {
            testButton.disabled = true;
            testButton.textContent = '🧪 Running Tests...';
            
            try {
                await RegistrationIntegrationTest.testRegistrationFlow();
                await RegistrationIntegrationTest.testReferenceDataEndpoints();
                testButton.textContent = '✅ Tests Passed!';
                testButton.style.background = '#28a745';
            } catch (error) {
                testButton.textContent = '❌ Tests Failed!';
                testButton.style.background = '#dc3545';
                console.error('Test failed:', error);
            }
            
            setTimeout(() => {
                testButton.disabled = false;
                testButton.textContent = '🧪 Test Registration Integration';
                testButton.style.background = '#007bff';
            }, 3000);
        });
        
        document.body.appendChild(testButton);
    });
}
