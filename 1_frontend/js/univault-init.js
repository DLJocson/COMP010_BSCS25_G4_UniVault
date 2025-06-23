/**
 * UniVault Initialization Script
 * Master initialization script that sets up all components
 */

class UniVaultInit {
    static async initialize() {
        console.log('🚀 Initializing UniVault Frontend...');
        
        try {
            // Wait for DOM to be ready
            await this.waitForDOM();
            
            // Initialize components in order
            await this.initializeAPI();
            await this.initializeAuth();
            await this.initializeUI();
            await this.initializeDropdowns();
            await this.initializeFormHandlers();
            await this.initializeRegistrationFlow();
            
            console.log('✅ UniVault Frontend initialized successfully!');
            
            // Show success notification
            UINotifications.success('UniVault system ready!', 3000);
            
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize UniVault:', error);
            UINotifications.error('System initialization failed: ' + error.message);
            return false;
        }
    }

    static waitForDOM() {
        return new Promise((resolve) => {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', resolve);
            } else {
                resolve();
            }
        });
    }

    static async initializeAPI() {
        console.log('🔌 Initializing API connection...');
        
        try {
            // Test API connectivity
            const health = await APIClient.get('/health');
            if (health.status === 'healthy') {
                console.log('✅ API connection established');
                return true;
            } else {
                throw new Error('API unhealthy');
            }
        } catch (error) {
            console.warn('⚠️ API connection failed, running in offline mode');
            // Don't throw - allow offline functionality
            return false;
        }
    }

    static async initializeAuth() {
        console.log('🔐 Initializing authentication...');
        
        try {
            // Check if user is already authenticated
            if (AuthManager.isAuthenticated()) {
                const user = AuthManager.getUser();
                console.log('✅ User authenticated:', user?.email || 'Unknown');
                
                // Redirect if on login/register pages
                const currentPage = window.location.pathname;
                if (currentPage.includes('login.html') || currentPage.includes('register.html')) {
                    AuthManager.redirectToDashboard(user?.userType || 'customer');
                    return;
                }
            }
            
            console.log('ℹ️ User not authenticated');
            return true;
        } catch (error) {
            console.error('❌ Auth initialization failed:', error);
            AuthManager.clearAuth();
            return false;
        }
    }

    static async initializeUI() {
        console.log('🎨 Initializing UI components...');
        
        try {
            // Initialize form styles
            this.addFormEnhancements();
            
            // Initialize accessibility features
            this.addAccessibilityFeatures();
            
            // Initialize keyboard navigation
            this.addKeyboardNavigation();
            
            console.log('✅ UI components initialized');
            return true;
        } catch (error) {
            console.error('❌ UI initialization failed:', error);
            return false;
        }
    }

    static async initializeDropdowns() {
        console.log('📋 Initializing dropdowns...');
        
        try {
            // Initialize dropdowns if DropdownConfig is available
            if (typeof DropdownConfig !== 'undefined') {
                await DropdownConfig.initializePageDropdowns();
                console.log('✅ Dropdowns initialized');
            } else {
                console.log('ℹ️ DropdownConfig not available, skipping');
            }
            return true;
        } catch (error) {
            console.error('❌ Dropdown initialization failed:', error);
            return false;
        }
    }

    static async initializeFormHandlers() {
        console.log('📝 Initializing form handlers...');
        
        try {
            // Add real-time validation to all forms
            const forms = document.querySelectorAll('form');
            forms.forEach(form => {
                this.addRealTimeValidation(form);
                this.addFormSubmissionHandler(form);
            });
            
            // Add input formatting
            this.addInputFormatting();
            
            console.log(`✅ Form handlers added to ${forms.length} forms`);
            return true;
        } catch (error) {
            console.error('❌ Form handler initialization failed:', error);
            return false;
        }
    }

    static async initializeRegistrationFlow() {
        console.log('🔄 Initializing registration flow...');
        
        try {
            const currentPage = window.location.pathname;
            
            // Only initialize if on registration pages
            if (currentPage.includes('registration') && typeof RegistrationManager !== 'undefined') {
                // Extract step number from filename
                const stepMatch = currentPage.match(/registration(\d+)\.html/);
                if (stepMatch) {
                    const stepNumber = parseInt(stepMatch[1]);
                    const form = document.querySelector('form');
                    
                    if (form && !form.hasAttribute('data-univault-initialized')) {
                        // Mark as initialized to prevent double-initialization
                        form.setAttribute('data-univault-initialized', 'true');
                        
                        // Get validation rules for this step
                        const validationRules = this.getStepValidationRules(stepNumber);
                        
                        // Initialize registration manager
                        RegistrationManager.initializeStepForm(stepNumber, form, validationRules);
                        
                        // Enable auto-save
                        RegistrationManager.enableAutoSave(stepNumber, form);
                        
                        console.log(`✅ Registration step ${stepNumber} initialized`);
                    }
                }
            }
            
            return true;
        } catch (error) {
            console.error('❌ Registration flow initialization failed:', error);
            return false;
        }
    }

    static addFormEnhancements() {
        // Add loading states to buttons
        const buttons = document.querySelectorAll('button[type="submit"]');
        buttons.forEach(button => {
            button.addEventListener('click', function() {
                if (this.form && this.form.checkValidity && this.form.checkValidity()) {
                    LoadingManager.show(this);
                }
            });
        });

        // Add focus enhancement
        const inputs = document.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('focus', function() {
                this.parentElement.classList.add('focused');
            });
            
            input.addEventListener('blur', function() {
                this.parentElement.classList.remove('focused');
            });
        });
    }

    static addAccessibilityFeatures() {
        // Add ARIA labels for screen readers
        const requiredFields = document.querySelectorAll('[required]');
        requiredFields.forEach(field => {
            if (!field.getAttribute('aria-label')) {
                const label = document.querySelector(`label[for="${field.id}"]`);
                if (label) {
                    field.setAttribute('aria-label', label.textContent + ' (required)');
                }
            }
        });

        // Add keyboard navigation hints
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.setAttribute('role', 'form');
        });
    }

    static addKeyboardNavigation() {
        // Add Escape key to close notifications
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                UINotifications.removeAll();
            }
        });

        // Add Enter key navigation between form fields
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA' && e.target.type !== 'submit') {
                const form = e.target.closest('form');
                if (form) {
                    const inputs = Array.from(form.querySelectorAll('input, select'));
                    const currentIndex = inputs.indexOf(e.target);
                    const nextInput = inputs[currentIndex + 1];
                    
                    if (nextInput) {
                        e.preventDefault();
                        nextInput.focus();
                    }
                }
            }
        });
    }

    static addRealTimeValidation(form) {
        const inputs = form.querySelectorAll('input, select');
        
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                // Get validation rules for this input
                const fieldName = input.name;
                const rules = this.getFieldValidationRules(fieldName);
                
                if (rules && Object.keys(rules).length > 0) {
                    const errors = FormValidator.validateField(input, rules);
                    
                    if (errors.length > 0) {
                        FormValidator.showFieldError(input, errors[0]);
                    } else {
                        FormValidator.clearFieldError(input);
                        input.classList.add('field-success');
                        setTimeout(() => input.classList.remove('field-success'), 2000);
                    }
                }
            });
        });
    }

    static addFormSubmissionHandler(form) {
        form.addEventListener('submit', (e) => {
            const submitButton = form.querySelector('button[type="submit"]');
            if (submitButton && !submitButton.hasAttribute('data-univault-handled')) {
                // Mark as handled to prevent double-handling
                submitButton.setAttribute('data-univault-handled', 'true');
            }
        });
    }

    static addInputFormatting() {
        // Format phone numbers
        const phoneInputs = document.querySelectorAll('input[type="tel"], input[name*="phone"]');
        phoneInputs.forEach(input => {
            input.addEventListener('input', function() {
                this.value = this.value.replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
            });
        });

        // Format customer IDs
        const customerIdInputs = document.querySelectorAll('input[name*="customer_id"]');
        customerIdInputs.forEach(input => {
            input.addEventListener('input', function() {
                this.value = this.value.toUpperCase();
            });
        });
    }

    static getStepValidationRules(stepNumber) {
        const rules = {
            1: { customerType: { required: true } },
            2: { 
                first_name: { required: true, name: true, minLength: 2 },
                last_name: { required: true, name: true, minLength: 2 },
                date_of_birth: { required: true, date: true }
            },
            3: {
                first_name: { required: true, name: true, minLength: 2 },
                last_name: { required: true, name: true, minLength: 2 },
                date_of_birth: { required: true, date: true },
                place_of_birth: { required: true },
                gender: { required: true },
                'civil-status': { required: true }
            }
            // Add more steps as needed
        };
        
        return rules[stepNumber] || {};
    }

    static getFieldValidationRules(fieldName) {
        const commonRules = {
            first_name: { required: true, name: true, minLength: 2 },
            last_name: { required: true, name: true, minLength: 2 },
            email: { required: true, email: true },
            phone: { required: true, phone: true },
            customer_id: { customerID: true },
            date_of_birth: { required: true, date: true }
        };
        
        return commonRules[fieldName] || {};
    }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    UniVaultInit.initialize();
});

// Export for manual initialization
window.UniVaultInit = UniVaultInit;
