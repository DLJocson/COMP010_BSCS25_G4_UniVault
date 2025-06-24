// Enhanced admin customer request processing with dual functionality
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
        loadCustomerBasicInfo(cifNumber);
        loadProfileUpdateRequest(cifNumber);
        loadCustomerAccounts(cifNumber);
        setupEventListeners();
    } else {
        console.error('No CIF number provided');
        window.location.href = 'admin-review-queue2.html';
    }
});

// Global variables
let selectedAccounts = new Set();
let currentCustomerData = null;
let profileUpdateData = null;

// Tab switching functionality
function switchTab(tabType) {
    // Update tab buttons
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`${tabType}-tab`).classList.add('active');
    
    // Update panels
    document.querySelectorAll('.request-panel').forEach(panel => panel.classList.remove('active'));
    document.getElementById(`${tabType}-panel`).classList.add('active');
}

// Event listeners setup
function setupEventListeners() {
    // Documents modal
    const modal = document.getElementById('documents-modal');
    const closeBtn = document.querySelector('.documents-modal .close');
    
    closeBtn.onclick = () => modal.style.display = 'none';
    window.onclick = (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };
    
    // Action buttons
    document.getElementById('view-documents-btn').onclick = viewDocuments;
    document.getElementById('approve-profile-update-btn').onclick = () => processProfileUpdate('approve');
    document.getElementById('reject-profile-update-btn').onclick = () => processProfileUpdate('reject');
    document.getElementById('approve-account-closure-btn').onclick = () => processAccountClosure('approve');
    document.getElementById('reject-account-closure-btn').onclick = () => processAccountClosure('reject');
}

// Load basic customer information
async function loadCustomerBasicInfo(cifNumber) {
    try {
        const response = await fetch(`/api/customer/${cifNumber}`);
        if (!response.ok) throw new Error('Customer not found');
        
        const customerData = await response.json();
        currentCustomerData = customerData;
        
        // Update customer name in header
        const nameElement = document.getElementById('customer-name');
        nameElement.textContent = `${customerData.customer_last_name}, ${customerData.customer_first_name} ${customerData.customer_middle_name || ''}`.trim();
        
        // Populate basic account information
        document.getElementById('cif-number').value = customerData.cif_number || '';
        document.getElementById('customer-type').value = customerData.customer_type || '';
        document.getElementById('status').value = customerData.customer_status || '';
        
        // Make inputs readonly
        const inputs = document.querySelectorAll('input[type="text"]');
        inputs.forEach(input => {
            input.readOnly = true;
            input.disabled = true;
        });
        
    } catch (error) {
        console.error('Error loading customer info:', error);
        alert('Customer not found');
        window.location.href = 'admin-review-queue2.html';
    }
}

// Load profile update request data
async function loadProfileUpdateRequest(cifNumber) {
    try {
        // First get current profile data
        const currentResponse = await fetch(`/api/customer/${cifNumber}/profile`);
        const currentData = await currentResponse.json();
        
        // Try to get profile update request
        const updateResponse = await fetch(`/api/customer/${cifNumber}/profile-update-request`);
        let updateData = null;
        
        if (updateResponse.ok) {
            updateData = await updateResponse.json();
            profileUpdateData = updateData;
        }
        
        displayProfileComparison(currentData, updateData);
        
    } catch (error) {
        console.error('Error loading profile update request:', error);
        displayProfileComparison(currentCustomerData, null);
    }
}

// Display profile comparison
function displayProfileComparison(currentData, updateData) {
    const currentContainer = document.getElementById('current-profile-data');
    const updatedContainer = document.getElementById('updated-profile-data');
    
    // Display current data
    currentContainer.innerHTML = createProfileDataDisplay(currentData, 'current');
    
    // Display update data or no updates message
    if (updateData) {
        updatedContainer.innerHTML = createProfileDataDisplay(updateData, 'updated', currentData);
        document.getElementById('approve-profile-update-btn').disabled = false;
        document.getElementById('reject-profile-update-btn').disabled = false;
    } else {
        updatedContainer.innerHTML = '<div class="no-updates">No profile update requests pending</div>';
        document.getElementById('approve-profile-update-btn').disabled = true;
        document.getElementById('reject-profile-update-btn').disabled = true;
    }
}

// Create profile data display
function createProfileDataDisplay(data, type, compareData = null) {
    const fields = [
        { label: 'First Name', value: data.customer_first_name },
        { label: 'Middle Name', value: data.customer_middle_name },
        { label: 'Last Name', value: data.customer_last_name },
        { label: 'Suffix', value: data.customer_suffix_name },
        { label: 'Birth Date', value: data.birth_date },
        { label: 'Gender', value: data.gender },
        { label: 'Citizenship', value: data.citizenship },
        { label: 'Birth Country', value: data.birth_country }
    ];
    
    let html = '';
    fields.forEach(field => {
        const isChanged = compareData && compareData[field.value] !== data[field.value];
        const fieldClass = isChanged ? 'data-field field-changed' : 'data-field';
        
        html += `
            <div class="${fieldClass}">
                <span class="field-label">${field.label}:</span>
                <span class="field-value">${field.value || 'N/A'}</span>
            </div>
        `;
    });
    
    return html;
}

// Load customer accounts for closure
async function loadCustomerAccounts(cifNumber) {
    const loadingEl = document.getElementById('accounts-loading');
    const accountsListEl = document.getElementById('customer-accounts-list');
    const noAccountsEl = document.getElementById('no-accounts-message');
    
    try {
        showAccountsLoading(true);
        
        const response = await fetch(`/api/customers/${cifNumber}/accounts`);
        if (!response.ok) {
            if (response.status === 404) {
                showNoAccounts();
                return;
            }
            throw new Error('Failed to load accounts');
        }
        
        const accountsData = await response.json();
        displayAccountsForClosure(accountsData.accounts);
        
    } catch (error) {
        console.error('Error loading accounts:', error);
        showAccountsError(error.message);
    } finally {
        showAccountsLoading(false);
    }
}

// Display accounts for closure selection
function displayAccountsForClosure(accounts) {
    const accountsListEl = document.getElementById('customer-accounts-list');
    const noAccountsEl = document.getElementById('no-accounts-message');
    
    if (!accounts || accounts.length === 0) {
        showNoAccounts();
        return;
    }
    
    accountsListEl.innerHTML = '';
    
    // Filter out already closed accounts
    const activeAccounts = accounts.filter(account => account.account_status !== 'Closed');
    
    if (activeAccounts.length === 0) {
        noAccountsEl.innerHTML = '<p>All accounts are already closed.</p>';
        noAccountsEl.style.display = 'block';
        accountsListEl.style.display = 'none';
        return;
    }
    
    activeAccounts.forEach(account => {
        const accountCard = createAccountClosureCard(account);
        accountsListEl.appendChild(accountCard);
    });
    
    accountsListEl.style.display = 'grid';
    noAccountsEl.style.display = 'none';
    
    updateClosureButtonStates();
}

// Create account closure card
function createAccountClosureCard(account) {
    const card = document.createElement('div');
    card.className = 'account-closure-card';
    card.dataset.accountNumber = account.account_number;
    
    const openDate = new Date(account.account_open_date).toLocaleDateString();
    
    card.innerHTML = `
        <input type="checkbox" class="selection-checkbox" onchange="toggleAccountSelection('${account.account_number}')">
        <div class="account-number">${account.account_number}</div>
        <div class="account-type">${account.account_type}</div>
        <div class="account-status ${account.account_status.toLowerCase()}">${account.account_status}</div>
        <div class="account-dates">
            <div>Opened: ${openDate}</div>
            <div>Referral: ${account.referral_type}</div>
        </div>
    `;
    
    return card;
}

// Toggle account selection
function toggleAccountSelection(accountNumber) {
    const checkbox = document.querySelector(`[data-account-number="${accountNumber}"] .selection-checkbox`);
    const card = document.querySelector(`[data-account-number="${accountNumber}"]`);
    
    if (checkbox.checked) {
        selectedAccounts.add(accountNumber);
        card.classList.add('selected');
    } else {
        selectedAccounts.delete(accountNumber);
        card.classList.remove('selected');
    }
    
    updateClosureButtonStates();
}

// Update closure button states
function updateClosureButtonStates() {
    const approveBtn = document.getElementById('approve-account-closure-btn');
    const rejectBtn = document.getElementById('reject-account-closure-btn');
    
    const hasSelection = selectedAccounts.size > 0;
    approveBtn.disabled = !hasSelection;
    rejectBtn.disabled = !hasSelection;
}

// Helper functions
function showAccountsLoading(isLoading) {
    const loadingEl = document.getElementById('accounts-loading');
    const accountsListEl = document.getElementById('customer-accounts-list');
    const noAccountsEl = document.getElementById('no-accounts-message');
    
    if (isLoading) {
        loadingEl.style.display = 'block';
        accountsListEl.style.display = 'none';
        noAccountsEl.style.display = 'none';
    } else {
        loadingEl.style.display = 'none';
    }
}

function showNoAccounts() {
    const accountsListEl = document.getElementById('customer-accounts-list');
    const noAccountsEl = document.getElementById('no-accounts-message');
    
    accountsListEl.style.display = 'none';
    noAccountsEl.style.display = 'block';
}

function showAccountsError(errorMessage) {
    const noAccountsEl = document.getElementById('no-accounts-message');
    noAccountsEl.innerHTML = `<p>Error loading accounts: ${errorMessage}</p>`;
    noAccountsEl.style.display = 'block';
}

// View documents functionality
async function viewDocuments() {
    const modal = document.getElementById('documents-modal');
    const documentsList = document.getElementById('documents-list');
    
    try {
        documentsList.innerHTML = '<p>Loading documents...</p>';
        modal.style.display = 'block';
        
        const response = await fetch(`/api/customer/${currentCustomerData.cif_number}/documents`);
        if (!response.ok) throw new Error('Failed to load documents');
        
        const documents = await response.json();
        
        if (documents.length === 0) {
            documentsList.innerHTML = '<p>No documents found for this customer.</p>';
            return;
        }
        
        let html = '';
        documents.forEach(doc => {
            html += `
                <div class="document-item">
                    <h4>${doc.document_type}</h4>
                    <p><strong>Issue Date:</strong> ${new Date(doc.issue_date).toLocaleDateString()}</p>
                    <p><strong>Expiry Date:</strong> ${doc.expiry_date ? new Date(doc.expiry_date).toLocaleDateString() : 'N/A'}</p>
                    ${doc.document_path ? `<img src="${doc.document_path}" alt="Document" class="document-image">` : '<p>Document file not available</p>'}
                </div>
            `;
        });
        
        documentsList.innerHTML = html;
        
    } catch (error) {
        console.error('Error loading documents:', error);
        documentsList.innerHTML = '<p>Error loading documents.</p>';
    }
}

// Process profile update
async function processProfileUpdate(action) {
    if (!profileUpdateData) {
        alert('No profile update request found');
        return;
    }
    
    const confirmation = confirm(`Are you sure you want to ${action} this profile update request?`);
    if (!confirmation) return;
    
    try {
        const response = await fetch(`/api/customer/${currentCustomerData.cif_number}/profile-update/${action}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                employee_id: localStorage.getItem('employee_id'),
                reason: `Profile update ${action}d by admin`,
                timestamp: new Date().toISOString()
            })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            alert(`Profile update ${action}d successfully`);
            // Reload the profile update request to reflect changes
            await loadProfileUpdateRequest(currentCustomerData.cif_number);
        } else {
            alert('Error: ' + result.message);
        }
    } catch (error) {
        console.error('Error processing profile update:', error);
        alert('Error processing profile update');
    }
}

// Process account closure
async function processAccountClosure(action) {
    if (selectedAccounts.size === 0) {
        alert('Please select at least one account');
        return;
    }
    
    const accountList = Array.from(selectedAccounts).join(', ');
    const confirmation = confirm(`Are you sure you want to ${action} closure for accounts: ${accountList}?`);
    if (!confirmation) return;
    
    try {
        const response = await fetch(`/api/customer/${currentCustomerData.cif_number}/accounts/closure/${action}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                account_numbers: Array.from(selectedAccounts),
                employee_id: localStorage.getItem('employee_id'),
                reason: `Account closure ${action}d by admin`,
                timestamp: new Date().toISOString()
            })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            alert(`Account closure ${action}d successfully`);
            // Reload accounts to reflect changes
            selectedAccounts.clear();
            await loadCustomerAccounts(currentCustomerData.cif_number);
        } else {
            alert('Error: ' + result.message);
        }
    } catch (error) {
        console.error('Error processing account closure:', error);
        alert('Error processing account closure');
    }
}

// Make functions globally accessible
window.switchTab = switchTab;
window.toggleAccountSelection = toggleAccountSelection;
