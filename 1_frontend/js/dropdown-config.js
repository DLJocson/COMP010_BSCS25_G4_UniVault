/**
 * UniVault Dropdown Configuration
 * Manages dynamic population of dropdown menus from API endpoints
 */

class DropdownConfig {
    // Dropdown configurations mapped to API endpoints
    static DROPDOWN_CONFIGS = {
        // Civil status dropdown
        'civil-status': {
            endpoint: '/civil-status',
            valueField: 'civil_status_code',
            textField: 'civil_status_description',
            placeholder: 'Select Civil Status'
        },
        
        // Employment position dropdown
        'position': {
            endpoint: '/employment-positions',
            valueField: 'position_code',
            textField: 'job_title',
            placeholder: 'Select Position'
        },
        
        // Address type dropdown
        'address-type': {
            endpoint: '/address-types',
            valueField: 'address_type_code',
            textField: 'address_type',
            placeholder: 'Select Address Type'
        },

        // Fund source dropdown
        'fund-source': {
            endpoint: '/fund-sources',
            valueField: 'fund_source_code',
            textField: 'fund_source',
            placeholder: 'Select Fund Source'
        },

        // Contact type dropdown
        'contact-type': {
            endpoint: '/contact-types',
            valueField: 'contact_type_code',
            textField: 'contact_type_description',
            placeholder: 'Select Contact Type'
        },

        // Biometric type dropdown
        'biometric-type': {
            endpoint: '/biometric-types',
            valueField: 'biometric_type_code',
            textField: 'biometric_description',
            placeholder: 'Select Biometric Type'
        },

        // Work nature dropdown
        'work-nature': {
            endpoint: '/work-natures',
            valueField: 'work_nature_code',
            textField: 'nature_description',
            placeholder: 'Select Work Nature'
        }
    };

    // Static options for dropdowns that don't come from API
    static STATIC_OPTIONS = {
        'gender': [
            { value: 'M', text: 'Male' },
            { value: 'F', text: 'Female' },
            { value: 'O', text: 'Other' }
        ],
        
        'country': [
            { value: 'PH', text: 'Philippines' },
            { value: 'US', text: 'United States' },
            { value: 'CA', text: 'Canada' },
            { value: 'AU', text: 'Australia' },
            { value: 'UK', text: 'United Kingdom' },
            { value: 'JP', text: 'Japan' },
            { value: 'SG', text: 'Singapore' },
            { value: 'MY', text: 'Malaysia' },
            { value: 'TH', text: 'Thailand' },
            { value: 'VN', text: 'Vietnam' }
        ],

        'citizenship': [
            { value: 'Filipino', text: 'Filipino' },
            { value: 'American', text: 'American' },
            { value: 'Canadian', text: 'Canadian' },
            { value: 'Australian', text: 'Australian' },
            { value: 'British', text: 'British' },
            { value: 'Japanese', text: 'Japanese' },
            { value: 'Singaporean', text: 'Singaporean' },
            { value: 'Malaysian', text: 'Malaysian' },
            { value: 'Thai', text: 'Thai' },
            { value: 'Vietnamese', text: 'Vietnamese' }
        ],

        'residency-status': [
            { value: 'citizen', text: 'Citizen' },
            { value: 'permanent_resident', text: 'Permanent Resident' },
            { value: 'temporary_resident', text: 'Temporary Resident' },
            { value: 'tourist', text: 'Tourist' },
            { value: 'student', text: 'Student' },
            { value: 'worker', text: 'Foreign Worker' }
        ],

        'remittance-country': [
            { value: 'PH', text: 'Philippines' },
            { value: 'US', text: 'United States' },
            { value: 'CA', text: 'Canada' },
            { value: 'AU', text: 'Australia' },
            { value: 'UK', text: 'United Kingdom' },
            { value: 'JP', text: 'Japan' },
            { value: 'SG', text: 'Singapore' },
            { value: 'MY', text: 'Malaysia' },
            { value: 'SA', text: 'Saudi Arabia' },
            { value: 'AE', text: 'United Arab Emirates' }
        ]
    };

    // Initialize dropdowns on page load
    static async initializePageDropdowns() {
        const dropdowns = document.querySelectorAll('select[id]');
        const promises = [];

        dropdowns.forEach(dropdown => {
            const id = dropdown.id;
            
            if (this.DROPDOWN_CONFIGS[id]) {
                // API-based dropdown
                promises.push(this.populateFromAPI(dropdown, id));
            } else if (this.STATIC_OPTIONS[id]) {
                // Static options dropdown
                this.populateStatic(dropdown, id);
            }
        });

        // Wait for all API calls to complete
        if (promises.length > 0) {
            try {
                await Promise.allSettled(promises);
            } catch (error) {
                console.error('Error initializing dropdowns:', error);
            }
        }
    }

    // Populate dropdown from API
    static async populateFromAPI(selectElement, configKey) {
        const config = this.DROPDOWN_CONFIGS[configKey];
        if (!config) return;

        try {
            // Add loading state
            const loadingOption = document.createElement('option');
            loadingOption.textContent = 'Loading...';
            loadingOption.disabled = true;
            selectElement.appendChild(loadingOption);

            const data = await APIClient.get(config.endpoint);
            
            // Clear loading state
            selectElement.innerHTML = '';

            // Add placeholder option
            if (config.placeholder) {
                const placeholderOption = document.createElement('option');
                placeholderOption.value = '';
                placeholderOption.textContent = config.placeholder;
                placeholderOption.disabled = true;
                placeholderOption.selected = true;
                selectElement.appendChild(placeholderOption);
            }

            // Add data options
            data.forEach(item => {
                const option = document.createElement('option');
                option.value = item[config.valueField];
                option.textContent = item[config.textField];
                selectElement.appendChild(option);
            });

        } catch (error) {
            console.error(`Failed to populate ${configKey} dropdown:`, error);
            
            // Clear loading and show error
            selectElement.innerHTML = '';
            const errorOption = document.createElement('option');
            errorOption.textContent = 'Failed to load options';
            errorOption.disabled = true;
            selectElement.appendChild(errorOption);
            
            UINotifications.error(`Failed to load ${configKey} options`);
        }
    }

    // Populate dropdown with static options
    static populateStatic(selectElement, configKey) {
        const options = this.STATIC_OPTIONS[configKey];
        if (!options) return;

        // Clear existing options
        selectElement.innerHTML = '';

        // Add placeholder option
        const placeholderOption = document.createElement('option');
        placeholderOption.value = '';
        placeholderOption.textContent = `Select ${configKey.charAt(0).toUpperCase() + configKey.slice(1)}`;
        placeholderOption.disabled = true;
        placeholderOption.selected = true;
        selectElement.appendChild(placeholderOption);

        // Add options
        options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option.value;
            optionElement.textContent = option.text;
            selectElement.appendChild(optionElement);
        });
    }

    // Refresh specific dropdown
    static async refreshDropdown(selectId) {
        const selectElement = document.getElementById(selectId);
        if (!selectElement) return;

        if (this.DROPDOWN_CONFIGS[selectId]) {
            await this.populateFromAPI(selectElement, selectId);
        } else if (this.STATIC_OPTIONS[selectId]) {
            this.populateStatic(selectElement, selectId);
        }
    }

    // Get dropdown data for validation
    static async getDropdownData(configKey) {
        const config = this.DROPDOWN_CONFIGS[configKey];
        if (config) {
            try {
                return await APIClient.get(config.endpoint);
            } catch (error) {
                console.error(`Failed to get ${configKey} data:`, error);
                return [];
            }
        }
        
        return this.STATIC_OPTIONS[configKey] || [];
    }

    // Validate dropdown selection
    static isValidSelection(selectId, value) {
        const selectElement = document.getElementById(selectId);
        if (!selectElement) return false;

        const options = Array.from(selectElement.options);
        return options.some(option => option.value === value && !option.disabled);
    }
}

// Auto-initialize dropdowns when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Wait for API config to be available
    if (typeof APIClient !== 'undefined') {
        DropdownConfig.initializePageDropdowns();
    } else {
        // Retry after a short delay
        setTimeout(() => {
            if (typeof APIClient !== 'undefined') {
                DropdownConfig.initializePageDropdowns();
            }
        }, 100);
    }
});

// Export for use in other files
window.DropdownConfig = DropdownConfig;
