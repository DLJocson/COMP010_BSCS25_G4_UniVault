/**
 * UniVault Form Utilities
 * Handles form validation, UI feedback, and common form operations
 */

class FormValidator {
    static validators = {
        required: (value) => value && value.trim() !== '',
        email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
        phone: (value) => /^[\+]?[0-9\s\-\(\)]{10,}$/.test(value),
        customerID: (value) => /^CUST[0-9]{6}$/.test(value),
        date: (value) => {
            const date = new Date(value);
            return !isNaN(date.getTime()) && date <= new Date();
        },
        minLength: (length) => (value) => value && value.length >= length,
        maxLength: (length) => (value) => value && value.length <= length,
        numeric: (value) => /^[0-9]+$/.test(value),
        alphanumeric: (value) => /^[a-zA-Z0-9\s]+$/.test(value),
        name: (value) => /^[a-zA-Z\s\.\-\']+$/.test(value)
    };

    static validateField(field, rules) {
        const value = field.value;
        const errors = [];

        for (const [ruleName, ruleValue] of Object.entries(rules)) {
            let isValid = false;

            if (typeof this.validators[ruleName] === 'function') {
                if (typeof ruleValue === 'boolean' && ruleValue) {
                    isValid = this.validators[ruleName](value);
                } else if (typeof ruleValue !== 'boolean') {
                    isValid = this.validators[ruleName](ruleValue)(value);
                } else {
                    isValid = true;
                }
            }

            if (!isValid) {
                errors.push(this.getErrorMessage(ruleName, ruleValue));
            }
        }

        return errors;
    }

    static getErrorMessage(rule, value) {
        const messages = {
            required: 'This field is required',
            email: 'Please enter a valid email address',
            phone: 'Please enter a valid phone number',
            customerID: 'Customer ID must be in format CUST123456',
            date: 'Please enter a valid date',
            minLength: `Minimum length is ${value} characters`,
            maxLength: `Maximum length is ${value} characters`,
            numeric: 'Only numbers are allowed',
            alphanumeric: 'Only letters and numbers are allowed',
            name: 'Only letters, spaces, periods, hyphens and apostrophes are allowed'
        };
        return messages[rule] || 'Invalid input';
    }

    static validateForm(formElement, validationRules) {
        const errors = {};
        let isValid = true;

        // Clear previous errors
        this.clearFormErrors(formElement);

        for (const [fieldName, rules] of Object.entries(validationRules)) {
            const field = formElement.querySelector(`[name="${fieldName}"]`);
            if (field) {
                const fieldErrors = this.validateField(field, rules);
                if (fieldErrors.length > 0) {
                    errors[fieldName] = fieldErrors;
                    isValid = false;
                    this.showFieldError(field, fieldErrors[0]);
                }
            }
        }

        return { isValid, errors };
    }

    static showFieldError(field, message) {
        field.classList.add('error');
        
        // Remove existing error message
        const existingError = field.parentNode.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }

        // Add new error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        field.parentNode.appendChild(errorDiv);
    }

    static clearFieldError(field) {
        field.classList.remove('error');
        const errorMessage = field.parentNode.querySelector('.error-message');
        if (errorMessage) {
            errorMessage.remove();
        }
    }

    static clearFormErrors(formElement) {
        const errorFields = formElement.querySelectorAll('.error');
        errorFields.forEach(field => this.clearFieldError(field));
    }
}

// UI Notification System
class UINotifications {
    static show(message, type = 'info', duration = 5000) {
        // Remove existing notifications
        this.removeAll();

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;

        document.body.appendChild(notification);

        // Auto remove after duration
        if (duration > 0) {
            setTimeout(() => notification.remove(), duration);
        }

        return notification;
    }

    static success(message, duration = 5000) {
        return this.show(message, 'success', duration);
    }

    static error(message, duration = 8000) {
        return this.show(message, 'error', duration);
    }

    static warning(message, duration = 6000) {
        return this.show(message, 'warning', duration);
    }

    static info(message, duration = 5000) {
        return this.show(message, 'info', duration);
    }

    static loading(message = 'Loading...') {
        return this.show(message, 'loading', 0);
    }

    static removeAll() {
        const notifications = document.querySelectorAll('.notification');
        notifications.forEach(n => n.remove());
    }
}

// Loading State Manager
class LoadingManager {
    static show(element, text = 'Loading...') {
        element.disabled = true;
        element.dataset.originalText = element.textContent;
        element.textContent = text;
        element.classList.add('loading');
    }

    static hide(element) {
        element.disabled = false;
        element.textContent = element.dataset.originalText || element.textContent;
        element.classList.remove('loading');
        delete element.dataset.originalText;
    }
}

// Form Data Utilities
class FormDataUtils {
    static serialize(formElement) {
        const formData = new FormData(formElement);
        const data = {};
        
        for (const [key, value] of formData.entries()) {
            // Handle multiple values (checkboxes, multiple selects)
            if (data[key]) {
                if (Array.isArray(data[key])) {
                    data[key].push(value);
                } else {
                    data[key] = [data[key], value];
                }
            } else {
                data[key] = value;
            }
        }
        
        return data;
    }

    static populate(formElement, data) {
        for (const [key, value] of Object.entries(data)) {
            const field = formElement.querySelector(`[name="${key}"]`);
            if (field) {
                if (field.type === 'checkbox' || field.type === 'radio') {
                    field.checked = field.value === value;
                } else {
                    field.value = value;
                }
            }
        }
    }

    static reset(formElement) {
        formElement.reset();
        FormValidator.clearFormErrors(formElement);
    }
}

// Dropdown Population Utility
class DropdownManager {
    static async populateSelect(selectElement, endpoint, valueField = 'code', textField = 'description') {
        try {
            const data = await APIClient.get(endpoint);
            
            // Clear existing options except the first (usually placeholder)
            const firstOption = selectElement.firstElementChild;
            selectElement.innerHTML = '';
            if (firstOption && firstOption.value === '') {
                selectElement.appendChild(firstOption);
            }

            // Add new options
            data.forEach(item => {
                const option = document.createElement('option');
                option.value = item[valueField];
                option.textContent = item[textField];
                selectElement.appendChild(option);
            });

            return data;
        } catch (error) {
            console.error(`Failed to populate dropdown from ${endpoint}:`, error);
            UINotifications.error(`Failed to load ${selectElement.name || 'dropdown'} options`);
            throw error;
        }
    }

    static async populateMultiple(selectors) {
        const promises = selectors.map(async ({ selector, endpoint, valueField, textField }) => {
            const element = document.querySelector(selector);
            if (element) {
                return this.populateSelect(element, endpoint, valueField, textField);
            }
        });

        return Promise.allSettled(promises);
    }
}

// Export utilities
window.FormValidator = FormValidator;
window.UINotifications = UINotifications;
window.LoadingManager = LoadingManager;
window.FormDataUtils = FormDataUtils;
window.DropdownManager = DropdownManager;
