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
        loadVerificationAccounts(cifNumber);
    } else {
        console.error('No CIF number provided');
        window.location.href = 'admin-review-queue.html';
    }
    
    // Set up verification buttons
    setupVerificationButtons(cifNumber);
});

async function loadCustomerDetails(cifNumber) {
    try {
        const response = await fetch(`/admin/customer/${cifNumber}/details`);
        const customerData = await response.json();
        
        if (response.ok) {
            populateCustomerDetails(customerData);
        } else {
            console.error('Failed to load customer details:', customerData.message);
            alert('Customer not found');
            window.location.href = 'admin-review-queue.html';
        }
    } catch (error) {
        console.error('Error loading customer details:', error);
        alert('Error loading customer details');
        window.location.href = 'admin-review-queue.html';
    }
}

function populateCustomerDetails(data) {
    const { customer, addresses, contacts, employment, ids } = data;
    
    // Update page title with customer name
    const nameTitle = document.querySelector('.blue-text');
    if (nameTitle) {
        nameTitle.textContent = `${customer.customer_last_name}, ${customer.customer_first_name} ${customer.customer_middle_name || ''}`.trim();
    }
    
    // Account Information
    document.getElementById('cif-number').value = customer.cif_number || '';
    document.getElementById('customer-type').value = customer.customer_type || '';
    document.getElementById('account-type').value = customer.customer_type || ''; // Using customer_type as account type
    document.getElementById('status').value = customer.customer_status || '';
    
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
        
        // Work address (if available)
        // Note: The current schema doesn't seem to have work address in employment table
        // This would need to be added to the database schema
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
    
    // Make all inputs readonly since this is a verification page
    const inputs = document.querySelectorAll('input[type="text"], input[type="date"], select');
    inputs.forEach(input => {
        input.readOnly = true;
        input.disabled = true;
    });
}

function setupVerificationButtons(cifNumber) {
    const employeeId = localStorage.getItem('employee_id');
    
    // Set up view documents button
    const viewBtn = document.getElementById('view');
    if (viewBtn) {
        viewBtn.onclick = () => {
            window.location.href = `admin-customer-verification2.html?cif=${cifNumber}`;
        };
    }
    
    // Set up approve button
    const approveBtn = document.getElementById('approve');
    if (approveBtn) {
        approveBtn.onclick = () => verifyCustomer(cifNumber, 'approve', employeeId);
    }
    
    // Set up reject button
    const rejectBtn = document.getElementById('reject');
    if (rejectBtn) {
        rejectBtn.onclick = () => verifyCustomer(cifNumber, 'reject', employeeId);
    }
}

async function verifyCustomer(cifNumber, action, employeeId) {
    // Check if documents are verified before allowing approval
    if (action === 'approve') {
        const documentsVerified = localStorage.getItem(`documents_verified_${cifNumber}`);
        if (!documentsVerified || documentsVerified !== 'true') {
            showNotification('Please verify all attached documents before approving this verification. Click "View Attached Documents" to review and verify documents.', 'warning');
            return;
        }
    }
    
    try {
        const response = await fetch(`/admin/customer/${cifNumber}/verify`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                employee_id: employeeId,
                action: action
            })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            // Clear verification status from localStorage on successful approval/rejection
            localStorage.removeItem(`documents_verified_${cifNumber}`);
            localStorage.removeItem(`verification_status_${cifNumber}`);
            showNotification(`Customer verification ${action}d successfully!`, 'success');
            setTimeout(() => {
                window.location.href = 'admin-review-queue.html';
            }, 1500);
        } else {
            showNotification('Error: ' + result.message, 'error');
        }
    } catch (error) {
        console.error('Error verifying customer:', error);
        showNotification('Error processing verification', 'error');
    }
}

// Notification System
function showNotification(message, type = 'info') {
    const container = document.getElementById('notification-container');
    if (!container) {
        console.error('Notification container not found');
        return;
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    const messageElement = document.createElement('div');
    messageElement.className = 'notification-message';
    messageElement.textContent = message;
    
    notification.appendChild(messageElement);
    container.appendChild(notification);

    // Show notification with animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);

    // Auto-hide notification after 5 seconds (or 7 seconds for warnings)
    const hideDelay = type === 'warning' ? 7000 : 5000;
    
    setTimeout(() => {
        hideNotification(notification);
    }, hideDelay);

    // Click to dismiss
    notification.addEventListener('click', () => {
        hideNotification(notification);
    });

    return notification;
}

function hideNotification(notification) {
    notification.classList.remove('show');
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 300);
}

// Load verification accounts for context
async function loadVerificationAccounts(cifNumber) {
    const loadingEl = document.getElementById('verification-accounts-loading');
    const accountsListEl = document.getElementById('verification-accounts-list');
    const noAccountsEl = document.getElementById('verification-no-accounts');
    
    try {
        showVerificationAccountsLoading(true);
        
        const response = await fetch(`/api/customers/${cifNumber}/accounts`);
        
        if (!response.ok) {
            if (response.status === 404) {
                showVerificationNoAccounts();
                return;
            }
            throw new Error(`Failed to load accounts: ${response.status}`);
        }
        
        const accountsData = await response.json();
        displayVerificationAccounts(accountsData.accounts);
        
    } catch (error) {
        console.error('Error loading verification accounts:', error);
        showVerificationAccountsError(error.message);
    } finally {
        showVerificationAccountsLoading(false);
    }
}

function showVerificationAccountsLoading(isLoading) {
    const loadingEl = document.getElementById('verification-accounts-loading');
    const accountsListEl = document.getElementById('verification-accounts-list');
    const noAccountsEl = document.getElementById('verification-no-accounts');
    
    if (isLoading) {
        loadingEl.style.display = 'block';
        accountsListEl.style.display = 'none';
        noAccountsEl.style.display = 'none';
    } else {
        loadingEl.style.display = 'none';
    }
}

function displayVerificationAccounts(accounts) {
    const accountsListEl = document.getElementById('verification-accounts-list');
    const noAccountsEl = document.getElementById('verification-no-accounts');
    
    if (!accounts || accounts.length === 0) {
        showVerificationNoAccounts();
        return;
    }
    
    accountsListEl.innerHTML = '';
    
    accounts.forEach(account => {
        const accountCard = createVerificationAccountCard(account);
        accountsListEl.appendChild(accountCard);
    });
    
    accountsListEl.style.display = 'grid';
    noAccountsEl.style.display = 'none';
}

function createVerificationAccountCard(account) {
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
        <div class="account-relationship">${account.relationship_type}</div>
    `;
    
    return card;
}

function showVerificationNoAccounts() {
    const accountsListEl = document.getElementById('verification-accounts-list');
    const noAccountsEl = document.getElementById('verification-no-accounts');
    
    accountsListEl.style.display = 'none';
    noAccountsEl.style.display = 'block';
}

function showVerificationAccountsError(errorMessage) {
    const accountsListEl = document.getElementById('verification-accounts-list');
    const noAccountsEl = document.getElementById('verification-no-accounts');
    
    accountsListEl.style.display = 'none';
    noAccountsEl.style.display = 'block';
    noAccountsEl.innerHTML = `<p>Error loading accounts: ${errorMessage}</p>`;
}
