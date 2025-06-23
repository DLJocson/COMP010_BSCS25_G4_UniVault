// UniVault API Helper
class UniVaultAPI {
    constructor() {
        this.baseURL = window.location.origin + '/api';
        this.token = localStorage.getItem('auth_token');
    }

    // Set authentication token
    setToken(token) {
        this.token = token;
        if (token) {
            localStorage.setItem('auth_token', token);
        } else {
            localStorage.removeItem('auth_token');
        }
    }

    // Get authentication headers
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        
        return headers;
    }

    // Generic API request method
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: this.getHeaders(),
            ...options
        };

        try {
            const response = await fetch(url, config);
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

    // GET request
    async get(endpoint, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;
        
        return this.request(url, {
            method: 'GET'
        });
    }

    // POST request
    async post(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    // PUT request
    async put(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    // DELETE request
    async delete(endpoint) {
        return this.request(endpoint, {
            method: 'DELETE'
        });
    }

    // Authentication methods
    async register(customerData) {
        const response = await this.post('/auth/register', customerData);
        if (response.token) {
            this.setToken(response.token);
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
            this.setToken(response.token);
        }
        
        return response;
    }

    async logout() {
        try {
            await this.post('/auth/logout');
        } finally {
            this.setToken(null);
        }
    }

    async getProfile() {
        return this.get('/auth/profile');
    }

    async changePassword(currentPassword, newPassword) {
        return this.put('/auth/change-password', {
            currentPassword,
            newPassword
        });
    }

    // Customer methods
    async getCustomers(params = {}) {
        return this.get('/customers', params);
    }

    async getCustomer(customerId) {
        return this.get(`/customers/${customerId}`);
    }

    async updateCustomer(customerId, data) {
        return this.put(`/customers/${customerId}`, data);
    }

    // Account methods
    async getAccounts() {
        return this.get('/accounts');
    }

    async getAccount(accountId) {
        return this.get(`/accounts/${accountId}`);
    }

    async applyForAccount(accountData) {
        return this.post('/accounts/apply', accountData);
    }

    async updateAccount(accountId, data) {
        return this.put(`/accounts/${accountId}`, data);
    }

    async cancelAccount(accountId) {
        return this.delete(`/accounts/${accountId}`);
    }

    async requestAccountClosure(accountId, reason, transferToAccount = null) {
        return this.post(`/accounts/${accountId}/close`, {
            reason,
            transfer_to_account: transferToAccount
        });
    }

    async getAccountBalance(accountId) {
        return this.get(`/transactions/accounts/${accountId}/balance`);
    }

    // Transaction methods
    async getTransactions(params = {}) {
        return this.get('/transactions', params);
    }

    async getTransaction(transactionId) {
        return this.get(`/transactions/${transactionId}`);
    }

    async createTransaction(transactionData) {
        return this.post('/transactions', transactionData);
    }

    async getTransactionSummary(accountId, period = 30) {
        return this.get(`/transactions/summary/${accountId}`, { period });
    }

    // Address methods
    async getAddresses(customerId) {
        return this.get(`/addresses?customer_id=${customerId}`);
    }

    async addAddress(addressData) {
        return this.post('/addresses', addressData);
    }

    async updateAddress(addressId, addressData) {
        return this.put(`/addresses/${addressId}`, addressData);
    }

    async deleteAddress(addressId) {
        return this.delete(`/addresses/${addressId}`);
    }

    // Employment methods
    async getEmployment(customerId) {
        return this.get(`/employment?customer_id=${customerId}`);
    }

    async addEmployment(employmentData) {
        return this.post('/employment', employmentData);
    }

    async updateEmployment(employmentId, employmentData) {
        return this.put(`/employment/${employmentId}`, employmentData);
    }

    // Reference data methods
    async getCivilStatusTypes() {
        return this.get('/civil-status');
    }

    async getAddressTypes() {
        return this.get('/address-types');
    }

    async getEmploymentPositions() {
        return this.get('/employment-positions');
    }

    // Admin methods
    async getReviewQueue(type = 'all', params = {}) {
        return this.get('/admin/review-queue', { type, ...params });
    }

    async approveCustomer(customerId, notes = '') {
        return this.put(`/admin/customers/${customerId}/approve`, { notes });
    }

    async rejectCustomer(customerId, reason) {
        return this.put(`/admin/customers/${customerId}/reject`, { reason });
    }

    async getCustomerDetails(customerId) {
        return this.get(`/admin/customers/${customerId}`);
    }

    async approveAccount(accountId, accountNumber = null, notes = '') {
        return this.put(`/admin/accounts/${accountId}/approve`, {
            account_number: accountNumber,
            notes
        });
    }

    async rejectAccount(accountId, reason) {
        return this.put(`/admin/accounts/${accountId}/reject`, { reason });
    }

    async approveAccountClosure(requestId, notes = '') {
        return this.put(`/admin/closures/${requestId}/approve`, { notes });
    }

    async rejectAccountClosure(requestId, reason) {
        return this.put(`/admin/closures/${requestId}/reject`, { reason });
    }

    async getAdminStats() {
        return this.get('/admin/dashboard/stats');
    }

    async searchCustomers(query, status = null, params = {}) {
        return this.get('/admin/customers/search', { q: query, status, ...params });
    }

    async getAllTransactions(params = {}) {
        return this.get('/admin/transactions/all', params);
    }

    // Utility methods
    isAuthenticated() {
        return !!this.token;
    }

    clearAuth() {
        this.setToken(null);
    }

    // Error handling helper
    handleError(error) {
        console.error('API Error:', error);
        
        if (error.message.includes('401') || error.message.includes('403')) {
            this.clearAuth();
            window.location.href = '/Registration-Customer/login.html';
        }
        
        return {
            success: false,
            error: error.message || 'An unexpected error occurred'
        };
    }
}

// Create global API instance
const api = new UniVaultAPI();

// Helper functions for common operations
const UIHelpers = {
    // Show loading state
    showLoading(element, text = 'Loading...') {
        if (element) {
            element.disabled = true;
            element.innerHTML = `<span class="loading-spinner"></span> ${text}`;
        }
    },

    // Hide loading state
    hideLoading(element, originalText) {
        if (element) {
            element.disabled = false;
            element.innerHTML = originalText;
        }
    },

    // Show error message
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

    // Show success message
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

    // Clear messages
    clearMessages() {
        ['error-container', 'success-container'].forEach(id => {
            const container = document.getElementById(id);
            if (container) container.innerHTML = '';
        });
    },

    // Format currency
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP'
        }).format(amount);
    },

    // Format date
    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },

    // Validate form before submission
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

    // Auto-redirect if not authenticated
    requireAuth() {
        if (!api.isAuthenticated()) {
            window.location.href = '/Registration-Customer/login.html';
            return false;
        }
        return true;
    },

    // Auto-redirect if authenticated (for login/register pages)
    redirectIfAuth(defaultPath = '/Dashboard-Customer/profile.html') {
        if (api.isAuthenticated()) {
            window.location.href = defaultPath;
            return true;
        }
        return false;
    }
};

// Global error handler
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    UIHelpers.showError('An unexpected error occurred. Please try again.');
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { UniVaultAPI, UIHelpers };
}
