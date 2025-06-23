/**
 * UniVault Unified API System
 * Single source of truth for all API communications
 */

// API Configuration
const UNIVAULT_CONFIG = {
    BASE_URL: window.location.origin + '/api',
    TIMEOUT: 10000
};

// Authentication Manager
class AuthManager {
    static TOKEN_KEY = 'univault_token';
    static USER_KEY = 'univault_user';

    static setToken(token) {
        if (token) {
            localStorage.setItem(this.TOKEN_KEY, token);
        } else {
            localStorage.removeItem(this.TOKEN_KEY);
        }
    }

    static getToken() {
        return localStorage.getItem(this.TOKEN_KEY);
    }

    static setUser(user) {
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }

    static getUser() {
        const user = localStorage.getItem(this.USER_KEY);
        return user ? JSON.parse(user) : null;
    }

    static isAuthenticated() {
        return !!this.getToken();
    }

    static logout() {
        this.setToken(null);
        localStorage.removeItem(this.USER_KEY);
    }

    static redirectToDashboard(userType = 'customer') {
        if (userType === 'admin') {
            window.location.href = '/Dashboard-Admin/admin-homepage.html';
        } else {
            window.location.href = '/Dashboard-Customer/accounts.html';
        }
    }

    static redirectToLogin() {
        window.location.href = '/Registration-Customer/login.html';
    }
}

// Unified API Client
class UniVaultAPI {
    constructor() {
        this.baseURL = UNIVAULT_CONFIG.BASE_URL;
    }

    getHeaders() {
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
        
        const token = AuthManager.getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        return headers;
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        
        const config = {
            headers: this.getHeaders(),
            ...options
        };

        try {
            const response = await fetch(url, config);
            
            // Handle authentication errors
            if (response.status === 401) {
                AuthManager.logout();
                AuthManager.redirectToLogin();
                throw new Error('Authentication required');
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
            }

            return data;
        } catch (error) {
            console.error('API Request failed:', error);
            throw error;
        }
    }

    async get(endpoint, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;
        
        return this.request(url, { method: 'GET' });
    }

    async post(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async put(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }

    // Authentication
    async register(userData) {
        const response = await this.post('/auth/register', userData);
        if (response.token) {
            AuthManager.setToken(response.token);
            AuthManager.setUser(response.customer || response.user);
        }
        return response;
    }

    async login(identifier, password, userType = 'customer') {
        const response = await this.post('/auth/login', {
            identifier,
            password,
            userType
        });
        
        if (response.token) {
            AuthManager.setToken(response.token);
            AuthManager.setUser(response.user);
        }
        
        return response;
    }

    async logout() {
        try {
            await this.post('/auth/logout');
        } finally {
            AuthManager.logout();
        }
    }

    async getProfile() {
        return this.get('/auth/profile');
    }

    // Reference Data
    async getCivilStatusTypes() {
        return this.get('/civil-status');
    }

    async getAddressTypes() {
        return this.get('/address-types');
    }

    async getEmploymentPositions() {
        return this.get('/employment-positions');
    }

    // Customer Management
    async getAccounts() {
        return this.get('/accounts');
    }

    async getAccountBalance(accountId) {
        return this.get(`/transactions/accounts/${accountId}/balance`);
    }

    async requestAccountClosure(accountId, reason) {
        return this.post(`/accounts/${accountId}/close`, { reason });
    }

    async cancelAccount(accountId) {
        return this.delete(`/accounts/${accountId}`);
    }

    // Utility methods
    isAuthenticated() {
        return AuthManager.isAuthenticated();
    }

    clearAuth() {
        AuthManager.logout();
    }
}

// UI Helper Functions
const UIHelpers = {
    showLoading(element, text = 'Loading...') {
        if (element) {
            element.disabled = true;
            element.innerHTML = `<span class="loading-spinner"></span> ${text}`;
        }
    },

    hideLoading(element, originalText) {
        if (element) {
            element.disabled = false;
            element.innerHTML = originalText;
        }
    },

    showError(message, containerId = 'error-container') {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = `
                <div class="alert alert-error">
                    <span class="error-icon">⚠️</span>
                    ${message}
                </div>
            `;
            container.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
            alert(message);
        }
    },

    showSuccess(message, containerId = 'success-container') {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = `
                <div class="alert alert-success">
                    <span class="success-icon">✅</span>
                    ${message}
                </div>
            `;
            container.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    },

    clearMessages() {
        ['error-container', 'success-container'].forEach(id => {
            const container = document.getElementById(id);
            if (container) container.innerHTML = '';
        });
    },

    validateForm(form) {
        const requiredFields = form.querySelectorAll('[required]');
        let isValid = true;

        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                field.classList.add('error');
                isValid = false;
            } else {
                field.classList.remove('error');
            }
        });

        return isValid;
    },

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP'
        }).format(amount);
    },

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },

    requireAuth() {
        if (!AuthManager.isAuthenticated()) {
            AuthManager.redirectToLogin();
            return false;
        }
        return true;
    },

    redirectIfAuth(defaultPath = '/Dashboard-Customer/accounts.html') {
        if (AuthManager.isAuthenticated()) {
            window.location.href = defaultPath;
            return true;
        }
        return false;
    }
};

// Form Validation Utilities
const FormValidator = {
    validateForm(form, rules = {}) {
        const data = new FormData(form);
        const errors = {};
        let isValid = true;

        for (const [field, rule] of Object.entries(rules)) {
            const value = data.get(field);
            
            if (rule.required && (!value || !value.trim())) {
                errors[field] = `${field} is required`;
                isValid = false;
            }
            
            if (value && rule.minLength && value.length < rule.minLength) {
                errors[field] = `${field} must be at least ${rule.minLength} characters`;
                isValid = false;
            }
            
            if (value && rule.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                errors[field] = `${field} must be a valid email`;
                isValid = false;
            }
        }

        return { isValid, errors };
    }
};

// Form Data Utilities
const FormDataUtils = {
    serialize(form) {
        const formData = new FormData(form);
        const data = {};
        
        for (const [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        return data;
    }
};

// Loading Manager
const LoadingManager = {
    show(element, text = 'Loading...') {
        UIHelpers.showLoading(element, text);
    },
    
    hide(element, originalText = 'Submit') {
        UIHelpers.hideLoading(element, originalText);
    }
};

// UI Notifications
const UINotifications = {
    error(message) {
        UIHelpers.showError(message);
    },
    
    success(message) {
        UIHelpers.showSuccess(message);
    },
    
    warning(message) {
        UIHelpers.showError(message); // Use error styling for warnings
    },
    
    clear() {
        UIHelpers.clearMessages();
    }
};

// Create global instances
const api = new UniVaultAPI();
const APIClient = new UniVaultAPI(); // For backward compatibility

// Export for global use
window.api = api;
window.APIClient = APIClient;
window.AuthManager = AuthManager;
window.UIHelpers = UIHelpers;
window.FormValidator = FormValidator;
window.FormDataUtils = FormDataUtils;
window.LoadingManager = LoadingManager;
window.UINotifications = UINotifications;

console.log('✅ UniVault Unified API System loaded');
