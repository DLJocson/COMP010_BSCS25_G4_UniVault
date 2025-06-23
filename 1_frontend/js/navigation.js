/**
 * UniVault Navigation System
 * Centralized navigation management for consistent routing
 */

class Navigation {
    static routes = {
        // Main pages
        home: 'Registration-Customer/landing.html',
        entry: 'Registration-Customer/entry.html',
        login: 'Registration-Customer/login.html',
        register: 'Registration-Customer/register.html',
        
        // Registration flow
        registration1: 'Registration-Customer/registration1.html',
        registration2: 'Registration-Customer/registration2.html',
        registration3: 'Registration-Customer/registration3.html',
        registration4: 'Registration-Customer/registration4.html',
        registration5: 'Registration-Customer/registration5.html',
        registration6: 'Registration-Customer/registration6.html',
        registration7: 'Registration-Customer/registration7.html',
        registration8: 'Registration-Customer/registration8.html',
        registration9: 'Registration-Customer/registration9.html',
        registration10: 'Registration-Customer/registration10.html',
        registration11: 'Registration-Customer/registration11.html',
        registration12: 'Registration-Customer/registration12.html',
        registration13: 'Registration-Customer/registration13.html',
        registration14: 'Registration-Customer/registration14.html',
        registration15: 'Registration-Customer/registration15.html',
        
        // Customer dashboard
        customerDashboard: 'Dashboard-Customer/accounts.html',
        customerProfile: 'Dashboard-Customer/profile.html',
        customerAccounts: 'Dashboard-Customer/accounts.html',
        customerTransactions: 'Dashboard-Customer/transaction1.html',
        addAccount: 'Dashboard-Customer/apply-account1.html',
        closeAccount: 'Dashboard-Customer/close-account.html',
        
        // Admin dashboard
        adminDashboard: 'Dashboard-Admin/admin-homepage.html',
        adminUsers: 'Dashboard-Admin/admin-user-management.html',
        adminVerification: 'Dashboard-Admin/admin-customer-verification.html',
        adminReview: 'Dashboard-Admin/admin-review-queue.html',
        adminCloseRequests: 'Dashboard-Admin/admin-customer-close-request.html'
    };

    /**
     * Navigate to a specific route
     * @param {string} routeName - The route name from Navigation.routes
     * @param {boolean} relative - Whether path is relative to current directory
     */
    static goto(routeName, relative = false) {
        const route = this.routes[routeName];
        if (!route) {
            console.error(`Navigation: Route '${routeName}' not found`);
            return;
        }
        
        let path = relative ? route : `../${route}`;
        
        // Adjust path based on current location
        const currentPath = window.location.pathname;
        if (currentPath.includes('Dashboard-Admin') || currentPath.includes('Dashboard-Customer')) {
            path = `../${route}`;
        } else if (currentPath.includes('Registration-Customer')) {
            // If we're in Registration-Customer and going to another Registration page
            if (route.startsWith('Registration-Customer/')) {
                path = route.replace('Registration-Customer/', '');
            } else {
                path = `../${route}`;
            }
        } else {
            // From root, use direct path
            path = route;
        }
        
        window.location.href = path;
    }

    /**
     * Navigate back in browser history
     */
    static back() {
        window.history.back();
    }

    /**
     * Navigate to home page
     */
    static home() {
        this.goto('home');
    }

    /**
     * Navigate to login page
     */
    static login() {
        this.goto('login');
    }

    /**
     * Navigate to registration start
     */
    static register() {
        this.goto('entry');
    }

    /**
     * Navigate to next registration step
     * @param {number} currentStep - Current registration step number
     */
    static nextRegistrationStep(currentStep) {
        const nextStep = currentStep + 1;
        if (nextStep <= 15) {
            this.goto(`registration${nextStep}`);
        } else {
            // Registration complete, go to customer dashboard
            this.goto('customerDashboard');
        }
    }

    /**
     * Navigate to previous registration step
     * @param {number} currentStep - Current registration step number
     */
    static prevRegistrationStep(currentStep) {
        const prevStep = currentStep - 1;
        if (prevStep >= 1) {
            this.goto(`registration${prevStep}`);
        } else {
            // Go back to entry page
            this.goto('entry');
        }
    }

    /**
     * Redirect to appropriate dashboard based on user type
     * @param {string} userType - 'admin' or 'customer'
     */
    static redirectToDashboard(userType = 'customer') {
        if (userType === 'admin') {
            this.goto('adminDashboard');
        } else {
            this.goto('customerDashboard');
        }
    }

    /**
     * Handle logout and redirect to login page
     */
    static logout() {
        // Clear any stored authentication data
        if (typeof AuthManager !== 'undefined') {
            AuthManager.logout();
        }
        localStorage.clear();
        sessionStorage.clear();
        this.goto('login');
    }
}

// Global navigation functions for backward compatibility
function gotoHome() { Navigation.home(); }
function gotoLogin() { Navigation.login(); }
function gotoRegister() { Navigation.register(); }
function gotoEntry() { Navigation.goto('entry'); }
function gotoRegistration1() { Navigation.goto('registration1'); }
function gotoCustomerDashboard() { Navigation.goto('customerDashboard'); }
function gotoAdminDashboard() { Navigation.goto('adminDashboard'); }
function logout() { Navigation.logout(); }

// Expose Navigation globally
window.Navigation = Navigation;

console.log('✅ UniVault Navigation System loaded');
