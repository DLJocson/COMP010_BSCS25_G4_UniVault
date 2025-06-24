document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const employeeId = localStorage.getItem('employee_id');
    const employeeUsername = localStorage.getItem('employee_username');
    
    if (!employeeId || !employeeUsername) {
        window.location.href = 'admin-login.html';
        return;
    }

    // Get CIF number from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const cifNumber = urlParams.get('cif');
    
    if (cifNumber) {
        loadCustomerDetails(cifNumber);
        loadCustomerAccounts(cifNumber);
    } else {
        console.error('No CIF number provided');
        window.location.href = 'admin-user-management.html';
    }
});

async function loadCustomerDetails(cifNumber) {
    // Show loading indicator
    showPageLoading(true);
    
    try {
        // Add timeout for initial page load
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
        
        const response = await fetch(`/admin/customer/${cifNumber}/details`, {
            signal: controller.signal,
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            }
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Failed to load customer data: ${response.status}`);
        }
        
        const customerData = await response.json();
        populateCustomerDetails(customerData);
        
    } catch (error) {
        console.error('Error loading customer details:', error);
        
        let errorMessage = 'Error loading customer details';
        if (error.name === 'AbortError') {
            errorMessage = 'Request timed out. Please refresh the page.';
        } else if (error.message) {
            errorMessage = error.message;
        }
        
        alert(errorMessage);
        window.location.href = 'admin-user-management.html';
    } finally {
        showPageLoading(false);
    }
}

function showPageLoading(isLoading) {
    const loadingOverlay = document.getElementById('page-loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = isLoading ? 'flex' : 'none';
    }
    
    // Also disable/enable form controls during loading
    const formControls = document.querySelectorAll('input, select, button');
    formControls.forEach(control => {
        if (isLoading) {
            control.setAttribute('data-original-disabled', control.disabled);
            control.disabled = true;
        } else {
            const originalDisabled = control.getAttribute('data-original-disabled') === 'true';
            control.disabled = originalDisabled;
            control.removeAttribute('data-original-disabled');
        }
    });
}

function populateCustomerDetails(data) {
    const { customer, addresses, contacts, employment, ids, profileValidation } = data;
    
    // Update page title with customer name
    const nameTitle = document.querySelector('.blue-text');
    if (nameTitle) {
        nameTitle.textContent = `${customer.customer_last_name}, ${customer.customer_first_name} ${customer.customer_middle_name || ''}`.trim();
    }
    
    // Store customer data globally for status updates
    window.currentCustomer = customer;
    
    // Account Information
    document.getElementById('cif-number').value = customer.cif_number || '';
    document.getElementById('customer-type').value = customer.customer_type || '';
    document.getElementById('account-type').value = customer.customer_type || '';
    
    // Initialize status dropdown
    initializeStatusDropdown(customer.customer_status);
    
    // Personal Information - Full Name
    document.getElementById('first-name').value = customer.customer_first_name || '';
    document.getElementById('middle-name').value = customer.customer_middle_name || '';
    document.getElementById('last-name').value = customer.customer_last_name || '';
    document.getElementById('suffix-name').value = customer.customer_suffix_name || '';
    
    // Biographical Information
    document.getElementById('date').value = customer.birth_date || '';
    document.getElementById('country-of-birth').value = customer.birth_country || '';
    document.getElementById('citizenship').value = customer.citizenship || '';
    document.getElementById('gender').value = customer.gender || '';
    document.getElementById('civil-status').value = customer.civil_status_description || '';
    document.getElementById('residency').value = customer.residency_status || '';
    
    // Contact Details
    if (contacts && contacts.length > 0) {
        const personalMobile = contacts.find(c => c.contact_type_description === 'Mobile' || c.contact_type_code === 'CT02');
        const landline = contacts.find(c => c.contact_type_description === 'Landline' || c.contact_type_code === 'CT03');
        const email = contacts.find(c => c.contact_type_description === 'Email' || c.contact_type_code === 'CT01');
        
        document.getElementById('mobile-number').value = personalMobile ? personalMobile.contact_value : '';
        document.getElementById('landline-number').value = landline ? landline.contact_value : '';
        document.getElementById('email-address').value = email ? email.contact_value : '';
    }
    
    // Address Information
    if (addresses && addresses.length > 0) {
        const homeAddress = addresses.find(a => a.address_type_code === 'AD01');
        const altAddress = addresses.find(a => a.address_type_code === 'AD02');
        
        if (homeAddress) {
            document.getElementById('unit').value = homeAddress.address_unit || '';
            document.getElementById('building').value = homeAddress.address_building || '';
            document.getElementById('street').value = homeAddress.address_street || '';
            document.getElementById('subdivision').value = homeAddress.address_subdivision || '';
            document.getElementById('barangay').value = homeAddress.address_barangay || '';
            document.getElementById('city').value = homeAddress.address_city || '';
            document.getElementById('province').value = homeAddress.address_province || '';
            document.getElementById('country').value = homeAddress.address_country || '';
            document.getElementById('zip-code').value = homeAddress.address_zip_code || '';
        }
        
        if (altAddress) {
            document.getElementById('alt-unit').value = altAddress.address_unit || '';
            document.getElementById('alt-building').value = altAddress.address_building || '';
            document.getElementById('alt-street').value = altAddress.address_street || '';
            document.getElementById('alt-subdivision').value = altAddress.address_subdivision || '';
            document.getElementById('alt-barangay').value = altAddress.address_barangay || '';
            document.getElementById('alt-city').value = altAddress.address_city || '';
            document.getElementById('alt-province').value = altAddress.address_province || '';
            document.getElementById('alt-country').value = altAddress.address_country || '';
            document.getElementById('alt-zip-code').value = altAddress.address_zip_code || '';
        }
    }
    
    // Employment Information
    if (employment && employment.length > 0) {
        const primaryEmployment = employment[0];
        document.getElementById('primary-employer').value = primaryEmployment.employer_business_name || '';
        document.getElementById('position').value = primaryEmployment.job_title || '';
        document.getElementById('monthly-income').value = primaryEmployment.income_monthly_gross || '';
    }
    
    // TIN Number
    document.getElementById('tin-number').value = customer.tax_identification_number || '';
    
    // Fund Source
    if (data.fundSources && data.fundSources.length > 0) {
        document.getElementById('source-of-fund').value = data.fundSources[0].fund_source || '';
    }
    
    // Aliases
    if (data.aliases && data.aliases.length > 0) {
        const alias = data.aliases[0];
        document.getElementById('alias-first-name').value = alias.alias_first_name || '';
        document.getElementById('alias-middle-name').value = alias.alias_middle_name || '';
        document.getElementById('alias-last-name').value = alias.alias_last_name || '';
    }
    
    // Display profile validation information
    if (profileValidation) {
        displayProfileValidation(profileValidation);
    }
    
    // Make all inputs readonly since this is a view-only page (except status controls)
    const inputs = document.querySelectorAll('input[type="text"], input[type="date"], select:not(#status-dropdown)');
    inputs.forEach(input => {
        input.readOnly = true;
        input.disabled = true;
    });
}

// Status dropdown management functions
function initializeStatusDropdown(currentStatus) {
    const statusDropdown = document.getElementById('status-dropdown');
    const updateBtn = document.getElementById('update-status-btn');
    const messageDiv = document.getElementById('status-update-message');
    
    if (!statusDropdown || !updateBtn) {
        console.error('Status controls not found');
        return;
    }
    
    // Define available statuses
    const statuses = [
        'Active',
        'Pending Verification', 
        'Inactive',
        'Suspended',
        'Dormant'
    ];
    
    // Use DocumentFragment for efficient DOM manipulation
    const fragment = document.createDocumentFragment();
    statusDropdown.innerHTML = '';
    
    statuses.forEach(status => {
        const option = document.createElement('option');
        option.value = status;
        option.textContent = status;
        option.selected = status === currentStatus;
        fragment.appendChild(option);
    });
    
    statusDropdown.appendChild(fragment);
    
    // Remove existing listeners to prevent duplicates
    const newDropdown = statusDropdown.cloneNode(true);
    statusDropdown.parentNode.replaceChild(newDropdown, statusDropdown);
    
    const newUpdateBtn = updateBtn.cloneNode(true);
    updateBtn.parentNode.replaceChild(newUpdateBtn, updateBtn);
    
    // Enable the update button when status changes
    newDropdown.addEventListener('change', function() {
        newUpdateBtn.disabled = this.value === currentStatus;
        hideStatusMessage();
    });
    
    // Set initial button state
    newUpdateBtn.disabled = true;
    
    // Add click handler for update button with debouncing
    let clickTimeout;
    newUpdateBtn.addEventListener('click', function() {
        clearTimeout(clickTimeout);
        clickTimeout = setTimeout(() => {
            showConfirmationModal(newDropdown.value, currentStatus);
        }, 100);
    });
}

async function updateCustomerStatus(newStatus, originalStatus) {
    const updateBtn = document.getElementById('update-status-btn');
    const statusDropdown = document.getElementById('status-dropdown');
    
    if (!window.currentCustomer || !window.currentCustomer.cif_number) {
        showStatusMessage('Error: Customer data not found', 'error');
        return;
    }
    
    // Prevent duplicate requests
    if (updateBtn.dataset.updating === 'true') {
        return;
    }
    
    try {
        // Mark as updating to prevent duplicates
        updateBtn.dataset.updating = 'true';
        
        // Optimistic UI update
        const previousStatus = window.currentCustomer.customer_status;
        window.currentCustomer.customer_status = newStatus;
        
        // Show enhanced loading state with faster feedback
        updateBtn.disabled = true;
        statusDropdown.disabled = true;
        updateBtn.innerHTML = '<span class="loading-spinner"></span>Updating...';
        showStatusMessage('Updating customer status...', 'loading');
        
        // Reduced timeout for faster failure detection
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        const response = await fetch(`/admin/customer/${window.currentCustomer.cif_number}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache'
            },
            body: JSON.stringify({
                status: newStatus,
                updated_by: localStorage.getItem('employee_username') || 'admin',
                timestamp: new Date().toISOString()
            }),
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Server error: ${response.status}`);
        }
        
        const result = await response.json();
        
        // Update profile validation if included in response
        if (result.profileValidation) {
            displayProfileValidation(result.profileValidation);
        }
        
        // Show warnings if any
        let successMessage = `Status updated to "${newStatus}"`;
        if (result.warnings && result.warnings.length > 0) {
            successMessage += ` (${result.warnings.join(', ')})`;
        }
        
        // Batch DOM updates for better performance
        requestAnimationFrame(() => {
            showStatusMessage(successMessage, 'success');
            updateBtn.disabled = true;
            statusDropdown.disabled = false;
            updateBtn.innerHTML = 'Update Status';
            initializeStatusDropdown(newStatus);
        });
        
        // Auto-hide success message
        setTimeout(hideStatusMessage, result.warnings && result.warnings.length > 0 ? 8000 : 3000);
        
    } catch (error) {
        console.error('Error updating customer status:', error);
        
        // Revert optimistic update on error
        window.currentCustomer.customer_status = originalStatus;
        
        let errorMessage = 'Failed to update status';
        if (error.name === 'AbortError') {
            errorMessage = 'Request timed out. Please try again.';
        } else if (error.message) {
            errorMessage = `Failed to update status: ${error.message}`;
        }
        
        // Batch DOM updates for error state
        requestAnimationFrame(() => {
            showStatusMessage(errorMessage, 'error');
            statusDropdown.value = originalStatus;
            statusDropdown.disabled = false;
            updateBtn.disabled = true;
            updateBtn.innerHTML = 'Update Status';
        });
        
        // Auto-hide error message
        setTimeout(hideStatusMessage, 5000);
        
    } finally {
        // Always clear the updating flag
        updateBtn.dataset.updating = 'false';
    }
}

function showStatusMessage(message, type) {
    const messageDiv = document.getElementById('status-update-message');
    if (!messageDiv) return;
    
    messageDiv.textContent = message;
    messageDiv.className = `status-message ${type}`;
    messageDiv.style.display = 'block';
}

function hideStatusMessage() {
    const messageDiv = document.getElementById('status-update-message');
    if (messageDiv) {
        messageDiv.style.display = 'none';
    }
}

// Modal functionality
function showConfirmationModal(newStatus, currentStatus) {
    const modal = document.getElementById('status-confirmation-modal');
    const currentStatusText = document.getElementById('current-status-text');
    const newStatusText = document.getElementById('new-status-text');
    const confirmBtn = document.getElementById('modal-confirm-btn');
    const cancelBtn = document.getElementById('modal-cancel-btn');
    const closeBtn = document.getElementById('modal-close-btn');
    
    if (!modal) {
        console.error('Confirmation modal not found');
        // Fallback to direct update if modal is not available
        updateCustomerStatus(newStatus, currentStatus);
        return;
    }
    
    // Populate modal content
    currentStatusText.textContent = currentStatus;
    newStatusText.textContent = newStatus;
    
    // Show modal
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
    
    // Store status info for confirmation
    modal.dataset.newStatus = newStatus;
    modal.dataset.currentStatus = currentStatus;
    
    // Setup event listeners
    const handleConfirm = () => {
        hideConfirmationModal();
        updateCustomerStatus(newStatus, currentStatus);
        cleanup();
    };
    
    const handleCancel = () => {
        hideConfirmationModal();
        // Reset dropdown to original value
        const statusDropdown = document.getElementById('status-dropdown');
        if (statusDropdown) {
            statusDropdown.value = currentStatus;
            const updateBtn = document.getElementById('update-status-btn');
            if (updateBtn) {
                updateBtn.disabled = true;
            }
        }
        cleanup();
    };
    
    const handleClickOutside = (event) => {
        if (event.target === modal) {
            handleCancel();
        }
    };
    
    const handleEscape = (event) => {
        if (event.key === 'Escape') {
            handleCancel();
        }
    };
    
    const cleanup = () => {
        confirmBtn.removeEventListener('click', handleConfirm);
        cancelBtn.removeEventListener('click', handleCancel);
        closeBtn.removeEventListener('click', handleCancel);
        modal.removeEventListener('click', handleClickOutside);
        document.removeEventListener('keydown', handleEscape);
    };
    
    // Add event listeners
    confirmBtn.addEventListener('click', handleConfirm);
    cancelBtn.addEventListener('click', handleCancel);
    closeBtn.addEventListener('click', handleCancel);
    modal.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
}

function hideConfirmationModal() {
    const modal = document.getElementById('status-confirmation-modal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = ''; // Restore scrolling
    }
}

// Load customer accounts
async function loadCustomerAccounts(cifNumber) {
    const loadingEl = document.getElementById('accounts-loading');
    const accountsListEl = document.getElementById('accounts-list');
    const noAccountsEl = document.getElementById('no-accounts-message');
    
    try {
        showAccountsLoading(true);
        
        const response = await fetch(`/api/customers/${cifNumber}/accounts`);
        
        if (!response.ok) {
            if (response.status === 404) {
                showNoAccounts();
                return;
            }
            throw new Error(`Failed to load accounts: ${response.status}`);
        }
        
        const accountsData = await response.json();
        displayAccounts(accountsData.accounts);
        
    } catch (error) {
        console.error('Error loading customer accounts:', error);
        showAccountsError(error.message);
    } finally {
        showAccountsLoading(false);
    }
}

function showAccountsLoading(isLoading) {
    const loadingEl = document.getElementById('accounts-loading');
    const accountsListEl = document.getElementById('accounts-list');
    const noAccountsEl = document.getElementById('no-accounts-message');
    
    if (isLoading) {
        loadingEl.style.display = 'block';
        accountsListEl.style.display = 'none';
        noAccountsEl.style.display = 'none';
    } else {
        loadingEl.style.display = 'none';
    }
}

function displayAccounts(accounts) {
    const accountsListEl = document.getElementById('accounts-list');
    const noAccountsEl = document.getElementById('no-accounts-message');
    
    if (!accounts || accounts.length === 0) {
        showNoAccounts();
        return;
    }
    
    accountsListEl.innerHTML = '';
    
    accounts.forEach(account => {
        const accountCard = createAccountCard(account);
        accountsListEl.appendChild(accountCard);
    });
    
    accountsListEl.style.display = 'grid';
    noAccountsEl.style.display = 'none';
}

function createAccountCard(account) {
    const card = document.createElement('div');
    card.className = `account-card status-${account.account_status.toLowerCase()}`;
    
    const openDate = new Date(account.account_open_date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
    
    const closeDateHTML = account.account_close_date 
        ? `<div>Closed: ${new Date(account.account_close_date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })}</div>`
        : '';
    
    card.innerHTML = `
        <div class="account-number">${account.account_number}</div>
        <div class="account-type">${account.account_type}</div>
        <div class="account-status ${account.account_status.toLowerCase()}">${account.account_status}</div>
        <div class="account-dates">
            <div>Opened: ${openDate}</div>
            ${closeDateHTML}
        </div>
        <div class="account-referral">Referral: ${account.referral_type}</div>
    `;
    
    return card;
}

function showNoAccounts() {
    const accountsListEl = document.getElementById('accounts-list');
    const noAccountsEl = document.getElementById('no-accounts-message');
    
    accountsListEl.style.display = 'none';
    noAccountsEl.style.display = 'block';
}

function showAccountsError(errorMessage) {
    const accountsListEl = document.getElementById('accounts-list');
    const noAccountsEl = document.getElementById('no-accounts-message');
    
    accountsListEl.style.display = 'none';
    noAccountsEl.style.display = 'block';
    noAccountsEl.innerHTML = `<p>Error loading accounts: ${errorMessage}</p>`;
}

function displayProfileValidation(validation) {
    const validationContent = document.getElementById('validation-content');
    
    if (!validation) {
        validationContent.style.display = 'none';
        return;
    }
    
    // Create validation overview
    const overviewHtml = `
        <div class="validation-overview">
            <div class="completion-status ${validation.isComplete ? 'complete' : 'incomplete'}">
                <div class="completion-percentage">
                    <span class="percentage">${validation.completionPercentage}%</span>
                    <span class="label">Complete</span>
                </div>
                <div class="completion-indicator">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${validation.completionPercentage}%"></div>
                    </div>
                    <span class="status-text">${validation.isComplete ? 'Profile Complete' : 'Profile Incomplete'}</span>
                </div>
            </div>
        </div>
    `;
    
    // Create sections validation details
    const sectionsHtml = Object.entries(validation.sections).map(([sectionName, sectionData]) => {
        const sectionDisplayName = formatSectionName(sectionName);
        const statusClass = sectionData.complete ? 'complete' : 'incomplete';
        const statusIcon = sectionData.complete ? '✓' : '✗';
        
        return `
            <div class="validation-section ${statusClass}">
                <div class="section-header">
                    <span class="section-icon">${statusIcon}</span>
                    <span class="section-name">${sectionDisplayName}</span>
                    <span class="section-status">${sectionData.complete ? 'Complete' : 'Incomplete'}</span>
                </div>
                <div class="section-details">
                    ${sectionData.details.map(detail => `<div class="detail-item">${detail}</div>`).join('')}
                </div>
            </div>
        `;
    }).join('');
    
    // Create warnings section if there are any
    const warningsHtml = validation.warnings && validation.warnings.length > 0 ? `
        <div class="validation-warnings">
            <h3>⚠️ Warnings</h3>
            ${validation.warnings.map(warning => `<div class="warning-item">${warning}</div>`).join('')}
        </div>
    ` : '';
    
    // Create missing sections summary
    const missingSectionsHtml = validation.missingSections && validation.missingSections.length > 0 ? `
        <div class="missing-sections">
            <h3>Missing Required Sections</h3>
            ${validation.missingSections.map(section => `<div class="missing-item">${formatSectionName(section)}</div>`).join('')}
        </div>
    ` : '';
    
    validationContent.innerHTML = overviewHtml + sectionsHtml + warningsHtml + missingSectionsHtml;
    validationContent.style.display = 'block';
}

function formatSectionName(sectionName) {
    const nameMap = {
        'personalInformation': 'Personal Information',
        'contactDetails': 'Contact Details',
        'employmentFinancial': 'Employment & Financial Information',
        'workNature': 'Work/Business Nature',
        'fundSources': 'Fund Sources',
        'aliases': 'Aliases',
        'regulatoryRequirements': 'Regulatory Requirements',
        'accounts': 'Account Requirements'
    };
    
    return nameMap[sectionName] || sectionName;
}


