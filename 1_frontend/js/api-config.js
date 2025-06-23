/**
 * UniVault API Configuration and Utilities
 * Central configuration for all API calls
 */

// API Configuration
const API_CONFIG = {
    BASE_URL: window.location.origin + '/api',
    TIMEOUT: 10000,
    HEADERS: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
};

// Authentication utilities
class AuthManager {
    static TOKEN_KEY = 'univault_token';
    static USER_KEY = 'univault_user';

    static setToken(token) {
        localStorage.setItem(this.TOKEN_KEY, token);
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

    static clearAuth() {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
    }

    static isAuthenticated() {
        return !!this.getToken();
    }

    static getAuthHeaders() {
        const token = this.getToken();
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    }

    static redirectToLogin() {
        window.location.href = '/Registration-Customer/login.html';
    }

    static redirectToDashboard(userType = 'customer') {
        if (userType === 'admin') {
            window.location.href = '/Dashboard-Admin/admin-homepage.html';
        } else {
            window.location.href = '/Dashboard-Customer/accounts.html';
        }
    }
}

// API Client
class APIClient {
    static async request(endpoint, options = {}) {
        const url = `${API_CONFIG.BASE_URL}${endpoint}`;
        
        const config = {
            headers: {
                ...API_CONFIG.HEADERS,
                ...AuthManager.getAuthHeaders(),
                ...options.headers
            },
            ...options
        };

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

            const response = await fetch(url, {
                ...config,
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (response.status === 401) {
                AuthManager.clearAuth();
                AuthManager.redirectToLogin();
                throw new Error('Authentication required');
            }

            const data = await response.json();

            if (!response.ok) {
                throw new APIError(data.error || 'Request failed', response.status, data);
            }

            return data;
        } catch (error) {
            if (error.name === 'AbortError') {
                throw new Error('Request timeout');
            }
            throw error;
        }
    }

    static async get(endpoint, params = {}) {
        const query = new URLSearchParams(params).toString();
        const url = query ? `${endpoint}?${query}` : endpoint;
        return this.request(url);
    }

    static async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    static async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    static async delete(endpoint) {
        return this.request(endpoint, {
            method: 'DELETE'
        });
    }
}

// Custom API Error class
class APIError extends Error {
    constructor(message, status, details = {}) {
        super(message);
        this.name = 'APIError';
        this.status = status;
        this.details = details;
    }
}

// Export for use in other files
window.APIClient = APIClient;
window.AuthManager = AuthManager;
window.APIError = APIError;
