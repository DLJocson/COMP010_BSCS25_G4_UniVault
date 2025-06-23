/**
 * UniVault Integration Test Suite
 * Tests API connectivity, form functionality, and registration flow
 */

class IntegrationTester {
    static async runAllTests() {
        console.log('🧪 Starting UniVault Integration Tests...');
        
        const results = {
            apiConnectivity: await this.testAPIConnectivity(),
            authentication: await this.testAuthentication(),
            dropdowns: await this.testDropdownPopulation(),
            formValidation: await this.testFormValidation(),
            registrationFlow: await this.testRegistrationFlow()
        };

        this.displayResults(results);
        return results;
    }

    static async testAPIConnectivity() {
        console.log('🔌 Testing API Connectivity...');
        
        try {
            const healthResponse = await APIClient.get('/health');
            if (healthResponse.status === 'healthy') {
                console.log('✅ API Health Check: PASSED');
                return { status: 'PASSED', message: 'API is healthy' };
            } else {
                console.log('❌ API Health Check: FAILED');
                return { status: 'FAILED', message: 'API unhealthy' };
            }
        } catch (error) {
            console.log('❌ API Health Check: ERROR', error.message);
            return { status: 'ERROR', message: error.message };
        }
    }

    static async testAuthentication() {
        console.log('🔐 Testing Authentication...');
        
        try {
            // Test if auth endpoints exist
            const statusResponse = await APIClient.get('/status');
            if (statusResponse.service === 'UniVault API') {
                console.log('✅ Auth Endpoints: ACCESSIBLE');
                return { status: 'PASSED', message: 'Auth endpoints accessible' };
            }
        } catch (error) {
            console.log('❌ Auth Endpoints: ERROR', error.message);
            return { status: 'ERROR', message: error.message };
        }
    }

    static async testDropdownPopulation() {
        console.log('📋 Testing Dropdown Population...');
        
        const results = {};
        const endpoints = [
            { name: 'Civil Status', endpoint: '/civil-status' },
            { name: 'Address Types', endpoint: '/address-types' },
            { name: 'Employment Positions', endpoint: '/employment-positions' }
        ];

        for (const { name, endpoint } of endpoints) {
            try {
                const data = await APIClient.get(endpoint);
                if (Array.isArray(data) && data.length > 0) {
                    console.log(`✅ ${name}: LOADED (${data.length} items)`);
                    results[name] = { status: 'PASSED', count: data.length };
                } else {
                    console.log(`⚠️ ${name}: EMPTY`);
                    results[name] = { status: 'WARNING', message: 'No data' };
                }
            } catch (error) {
                console.log(`❌ ${name}: ERROR`, error.message);
                results[name] = { status: 'ERROR', message: error.message };
            }
        }

        return results;
    }

    static async testFormValidation() {
        console.log('📝 Testing Form Validation...');
        
        try {
            // Create a test form
            const testForm = document.createElement('form');
            testForm.innerHTML = `
                <input type="text" name="test_field" value="">
                <input type="email" name="email" value="invalid-email">
                <input type="text" name="required_field" value="">
            `;
            
            const validation = FormValidator.validateForm(testForm, {
                test_field: { required: true },
                email: { required: true, email: true },
                required_field: { required: true }
            });

            if (!validation.isValid && Object.keys(validation.errors).length === 3) {
                console.log('✅ Form Validation: WORKING');
                return { status: 'PASSED', message: 'Validation working correctly' };
            } else {
                console.log('❌ Form Validation: FAILED');
                return { status: 'FAILED', message: 'Validation not working' };
            }
        } catch (error) {
            console.log('❌ Form Validation: ERROR', error.message);
            return { status: 'ERROR', message: error.message };
        }
    }

    static async testRegistrationFlow() {
        console.log('🔄 Testing Registration Flow...');
        
        try {
            // Test session management
            RegistrationManager.saveStepData(1, { customerType: 'account_owner' });
            const stepData = RegistrationManager.getStepData(1);
            
            if (stepData.customerType === 'account_owner') {
                RegistrationManager.clearSession(); // Clean up
                console.log('✅ Registration Session: WORKING');
                return { status: 'PASSED', message: 'Session management working' };
            } else {
                console.log('❌ Registration Session: FAILED');
                return { status: 'FAILED', message: 'Session management failed' };
            }
        } catch (error) {
            console.log('❌ Registration Session: ERROR', error.message);
            return { status: 'ERROR', message: error.message };
        }
    }

    static displayResults(results) {
        console.log('\n📊 Integration Test Results:');
        console.log('================================');
        
        Object.entries(results).forEach(([testName, result]) => {
            if (typeof result === 'object' && result.status) {
                const emoji = result.status === 'PASSED' ? '✅' : 
                             result.status === 'WARNING' ? '⚠️' : '❌';
                console.log(`${emoji} ${testName}: ${result.status} - ${result.message || ''}`);
            } else {
                console.log(`📋 ${testName}:`, result);
            }
        });
        
        console.log('================================\n');
        
        // Show notification
        const passedTests = Object.values(results).filter(r => 
            typeof r === 'object' && r.status === 'PASSED'
        ).length;
        
        const totalTests = Object.keys(results).length;
        
        if (passedTests === totalTests) {
            UINotifications.success(`All ${totalTests} integration tests passed! 🎉`);
        } else {
            UINotifications.warning(`${passedTests}/${totalTests} tests passed. Check console for details.`);
        }
    }

    // Quick test for individual components
    static async quickTest() {
        console.log('🚀 Running Quick Integration Test...');
        
        try {
            // Test API
            await APIClient.get('/health');
            console.log('✅ API: Connected');
            
            // Test validation
            const isValid = FormValidator.validators.email('test@example.com');
            console.log(`✅ Validation: ${isValid ? 'Working' : 'Failed'}`);
            
            // Test notifications
            UINotifications.info('Integration test completed!', 2000);
            console.log('✅ UI: Working');
            
            return true;
        } catch (error) {
            console.error('❌ Quick test failed:', error);
            UINotifications.error('Integration test failed: ' + error.message);
            return false;
        }
    }
}

// Auto-run quick test if this is a test page
if (window.location.pathname.includes('test') || window.location.search.includes('test=true')) {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => IntegrationTester.quickTest(), 1000);
    });
}

// Export for manual testing
window.IntegrationTester = IntegrationTester;

// Console helper
console.log('🧪 UniVault Integration Tester loaded. Run IntegrationTester.runAllTests() to test everything.');
