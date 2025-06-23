/**
 * UniVault Registration Manager
 * Handles multi-step registration process with session management
 */

class RegistrationManager {
    static SESSION_KEY = 'univault_registration';
    static CURRENT_STEP_KEY = 'univault_registration_step';

    // Registration steps configuration
    static STEPS = {
        1: { name: 'Customer Type', required: ['customerType'] },
        2: { name: 'Customer Details', required: ['first_name', 'last_name', 'date_of_birth'] },
        3: { name: 'Contact Information', required: ['email', 'phone'] },
        4: { name: 'Address Information', required: ['address_line1', 'city', 'postal_code'] },
        5: { name: 'Employment Information', required: ['employer_name', 'position'] },
        6: { name: 'Fund Source', required: ['fund_source_code'] },
        7: { name: 'Account Preferences', required: ['account_type'] },
        8: { name: 'Security Setup', required: ['password', 'security_question'] },
        9: { name: 'Document Upload', required: ['identification_type'] },
        10: { name: 'Terms & Conditions', required: ['terms_accepted'] },
        11: { name: 'Biometric Setup', required: [] },
        12: { name: 'Review Information', required: [] },
        13: { name: 'Verification', required: [] },
        14: { name: 'Account Setup', required: [] },
        15: { name: 'Completion', required: [] }
    };

    // Store form data in session
    static saveStepData(step, data) {
        const registrationData = this.getRegistrationData();
        registrationData[`step_${step}`] = {
            ...registrationData[`step_${step}`],
            ...data,
            timestamp: new Date().toISOString()
        };
        
        localStorage.setItem(this.SESSION_KEY, JSON.stringify(registrationData));
        this.setCurrentStep(step);
    }

    // Get all registration data
    static getRegistrationData() {
        const data = localStorage.getItem(this.SESSION_KEY);
        return data ? JSON.parse(data) : {};
    }

    // Get specific step data
    static getStepData(step) {
        const registrationData = this.getRegistrationData();
        return registrationData[`step_${step}`] || {};
    }

    // Set current step
    static setCurrentStep(step) {
        localStorage.setItem(this.CURRENT_STEP_KEY, step.toString());
    }

    // Get current step
    static getCurrentStep() {
        return parseInt(localStorage.getItem(this.CURRENT_STEP_KEY)) || 1;
    }

    // Clear registration session
    static clearSession() {
        localStorage.removeItem(this.SESSION_KEY);
        localStorage.removeItem(this.CURRENT_STEP_KEY);
    }

    // Validate step completion
    static isStepComplete(step) {
        const stepData = this.getStepData(step);
        const requiredFields = this.STEPS[step]?.required || [];
        
        return requiredFields.every(field => {
            const value = stepData[field];
            return value !== undefined && value !== null && value !== '';
        });
    }

    // Get progress percentage
    static getProgress() {
        const currentStep = this.getCurrentStep();
        const totalSteps = Object.keys(this.STEPS).length;
        return Math.round((currentStep / totalSteps) * 100);
    }

    // Navigate to next step
    static async goToNextStep(currentStep) {
        const nextStep = currentStep + 1;
        if (nextStep <= Object.keys(this.STEPS).length) {
            window.location.href = `registration${nextStep}.html`;
        } else {
            // Final submission
            await this.submitRegistration();
        }
    }

    // Navigate to previous step
    static goToPreviousStep(currentStep) {
        const prevStep = currentStep - 1;
        if (prevStep >= 1) {
            window.location.href = `registration${prevStep}.html`;
        } else {
            window.location.href = 'entry.html';
        }
    }

    // Compile all data for final submission
    static compileRegistrationData() {
        const allData = this.getRegistrationData();
        const compiled = {
            customer: {},
            address: {},
            employment: {},
            contact: {},
            account: {},
            fund_source: {},
            biometric: {},
            documents: []
        };

        // Map step data to database structure
        Object.values(allData).forEach(stepData => {
            // Customer information
            if (stepData.first_name) compiled.customer.first_name = stepData.first_name;
            if (stepData.last_name) compiled.customer.last_name = stepData.last_name;
            if (stepData.middle_name) compiled.customer.middle_name = stepData.middle_name;
            if (stepData.suffix) compiled.customer.suffix = stepData.suffix;
            if (stepData.date_of_birth) compiled.customer.date_of_birth = stepData.date_of_birth;
            if (stepData.place_of_birth) compiled.customer.place_of_birth = stepData.place_of_birth;
            if (stepData.nationality) compiled.customer.nationality = stepData.nationality;
            if (stepData.gender) compiled.customer.gender = stepData.gender;
            if (stepData.civil_status_code) compiled.customer.civil_status_code = stepData.civil_status_code;
            if (stepData.customerType) compiled.customer.customer_type = stepData.customerType;

            // Contact information
            if (stepData.email) compiled.contact.email = stepData.email;
            if (stepData.phone) compiled.contact.phone = stepData.phone;
            if (stepData.alternative_phone) compiled.contact.alternative_phone = stepData.alternative_phone;

            // Address information
            if (stepData.address_line1) compiled.address.address_line1 = stepData.address_line1;
            if (stepData.address_line2) compiled.address.address_line2 = stepData.address_line2;
            if (stepData.city) compiled.address.city = stepData.city;
            if (stepData.state_province) compiled.address.state_province = stepData.state_province;
            if (stepData.postal_code) compiled.address.postal_code = stepData.postal_code;
            if (stepData.country) compiled.address.country = stepData.country;
            if (stepData.address_type_code) compiled.address.address_type_code = stepData.address_type_code;

            // Employment information
            if (stepData.employer_name) compiled.employment.employer_name = stepData.employer_name;
            if (stepData.position) compiled.employment.job_title = stepData.position;
            if (stepData.employment_type) compiled.employment.employment_type = stepData.employment_type;
            if (stepData.monthly_income) compiled.employment.monthly_income = stepData.monthly_income;
            if (stepData.work_nature_code) compiled.employment.work_nature_code = stepData.work_nature_code;

            // Fund source
            if (stepData.fund_source_code) compiled.fund_source.fund_source_code = stepData.fund_source_code;

            // Account preferences
            if (stepData.account_type) compiled.account.account_type = stepData.account_type;
            if (stepData.initial_deposit) compiled.account.initial_deposit = stepData.initial_deposit;

            // Security
            if (stepData.password) compiled.customer.password = stepData.password;
            if (stepData.security_question) compiled.customer.security_question = stepData.security_question;
            if (stepData.security_answer) compiled.customer.security_answer = stepData.security_answer;
        });

        return compiled;
    }

    // Submit complete registration (using new step-by-step API)
    static async submitRegistration() {
        try {
            const sessionId = sessionStorage.getItem('registrationSessionId');
            if (!sessionId) {
                throw new Error('No active registration session found');
            }

            UINotifications.loading('Submitting registration...');

            // Use the finalize endpoint
            const response = await APIClient.post('/customers/register/finalize', {
                session_id: sessionId
            });

            UINotifications.removeAll();
            UINotifications.success('Registration completed successfully!');

            // Clear session and redirect
            this.clearSession();
            sessionStorage.removeItem('registrationSessionId');
            
            setTimeout(() => {
                Navigation.goto('login');
            }, 2000);

            return response;

        } catch (error) {
            UINotifications.removeAll();
            UINotifications.error('Registration failed: ' + error.message);
            throw error;
        }
    }

    // New method: Submit individual step data
    static async submitStepData(stepNumber, data) {
        try {
            const sessionId = sessionStorage.getItem('registrationSessionId');
            if (!sessionId) {
                throw new Error('No active registration session found');
            }

            const response = await APIClient.post(`/customers/register/step${stepNumber}`, {
                session_id: sessionId,
                data: {
                    ...data,
                    timestamp: new Date().toISOString()
                }
            });

            // Store data locally as backup
            this.saveStepData(stepNumber, data);

            return response;

        } catch (error) {
            console.error(`Failed to submit step ${stepNumber}:`, error);
            throw error;
        }
    }

    // New method: Get progress from API
    static async getProgressFromAPI() {
        try {
            const sessionId = sessionStorage.getItem('registrationSessionId');
            if (!sessionId) {
                return null;
            }

            const response = await APIClient.get(`/customers/register/progress/${sessionId}`);
            return response;

        } catch (error) {
            console.error('Failed to get progress from API:', error);
            return null;
        }
    }

    // New method: Start registration session
    static async startRegistrationSession() {
        try {
            const response = await APIClient.post('/customers/register/start', {
                step: 1,
                timestamp: new Date().toISOString()
            });

            const sessionId = response.session_id;
            sessionStorage.setItem('registrationSessionId', sessionId);
            
            return sessionId;

        } catch (error) {
            console.error('Failed to start registration session:', error);
            throw error;
        }
    }

    // Generate unique customer ID
    static generateCustomerID() {
        const timestamp = Date.now().toString().slice(-6);
        return `CUST${timestamp}`;
    }

    // Initialize step form
    static initializeStepForm(stepNumber, formElement, validationRules = {}) {
        // Load saved data
        const stepData = this.getStepData(stepNumber);
        if (Object.keys(stepData).length > 0) {
            FormDataUtils.populate(formElement, stepData);
        }

        // Update progress indicator
        this.updateProgressIndicator(stepNumber);

        // Handle form submission
        formElement.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = FormDataUtils.serialize(formElement);
            
            // Validate form
            const validation = FormValidator.validateForm(formElement, validationRules);
            if (!validation.isValid) {
                UINotifications.error('Please correct the errors and try again.');
                return;
            }

            // Save step data
            this.saveStepData(stepNumber, formData);

            // Navigate to next step
            await this.goToNextStep(stepNumber);
        });

        // Handle back button
        const backButton = document.querySelector('.back-button, #back');
        if (backButton) {
            backButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.goToPreviousStep(stepNumber);
            });
        }
    }

    // Update progress indicator
    static updateProgressIndicator(currentStep) {
        const progressElement = document.querySelector('.form-progress-fill');
        const progressTextElement = document.querySelector('.form-progress-text');
        
        if (progressElement) {
            const progress = (currentStep / Object.keys(this.STEPS).length) * 100;
            progressElement.style.width = `${progress}%`;
        }

        if (progressTextElement) {
            const stepInfo = this.STEPS[currentStep];
            progressTextElement.textContent = `Step ${currentStep} of ${Object.keys(this.STEPS).length}: ${stepInfo.name}`;
        }
    }

    // Auto-save form data
    static enableAutoSave(stepNumber, formElement, interval = 30000) {
        setInterval(() => {
            const formData = FormDataUtils.serialize(formElement);
            if (Object.keys(formData).length > 0) {
                this.saveStepData(stepNumber, formData);
            }
        }, interval);
    }
}

// Export for use in registration pages
window.RegistrationManager = RegistrationManager;
