document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const employeeId = localStorage.getItem('employee_id');
    const employeeUsername = localStorage.getItem('employee_username');
    
    if (!employeeId || !employeeUsername) {
        window.location.href = 'admin-login.html';
        return;
    }

    // Load customers
    loadCustomers();
    
    // Initialize search functionality
    initializeCustomerSearch();
    
    // Initialize status filter
    initializeStatusFilter();
    
    // Logout functionality is handled by logout-fix.js
});

async function loadCustomers(statusFilter = 'all', searchTerm = '') {
    try {
        const params = new URLSearchParams();
        
        if (statusFilter && statusFilter !== 'all') {
            params.append('status', statusFilter);
        }
        
        if (searchTerm) {
            params.append('search', searchTerm);
        }
        
        // Include validation information for better admin visibility
        params.append('includeValidation', 'true');
        
        const url = '/admin/customers' + (params.toString() ? '?' + params.toString() : '');
        const response = await fetch(url);
        const customers = await response.json();
        
        if (response.ok) {
            allCustomersData = customers; // Store for search functionality
            displayCustomers(customers);
        } else {
            console.error('Failed to load customers:', customers.message);
            showNoCustomersFound();
        }
    } catch (error) {
        console.error('Error loading customers:', error);
        showNoCustomersFound();
    }
}

function displayCustomers(customers) {
    const container = document.querySelector('.transaction-info');
    if (!container) return;
    
    // Clear existing customer cards (keep the header)
    const existingCards = container.querySelectorAll('.account-info-card');
    existingCards.forEach(card => card.remove());
    
    customers.forEach(customer => {
        const customerCard = createCustomerCard(customer);
        container.appendChild(customerCard);
    });
}

function createCustomerCard(customer) {
    const card = document.createElement('div');
    card.className = 'account-info-card';
    card.onclick = () => {
        window.location.href = `admin-customer-profile.html?cif=${customer.cif_number}`;
    };
    
    const statusClass = getStatusClass(customer.customer_status);
    
    // Create validation indicator
    let validationIndicator = '';
    if (customer.profileValidation) {
        const validation = customer.profileValidation;
        const validationClass = validation.isComplete ? 'complete' : 'incomplete';
        const validationIcon = validation.isComplete ? '✓' : '⚠️';
        const warningText = validation.warnings && validation.warnings.length > 0 ? ' (Warnings)' : '';
        
        validationIndicator = `
            <div class="validation-indicator ${validationClass}" title="Profile ${validation.completionPercentage}% complete${warningText}">
                <span class="validation-icon">${validationIcon}</span>
                <span class="validation-percentage">${validation.completionPercentage}%</span>
            </div>
        `;
    }
    
    card.innerHTML = `
        <div class="account">
            <div class="top-label-2">
                <label>${customer.cif_number}</label>
                <label>${customer.customer_type}</label>
                <label>${customer.customer_last_name}</label>
                <label>${customer.customer_first_name}</label>
                <label>${customer.customer_middle_name || 'N/A'}</label>
                <label>${customer.customer_suffix_name || 'N/A'}</label>
                <label>${customer.email || 'N/A'}</label>
                <label>${customer.phone || 'N/A'}</label>
                <label class="${statusClass}">${customer.customer_status}</label>
                ${validationIndicator}
            </div>
        </div>
    `;
    
    return card;
}

function getStatusClass(status) {
    switch(status) {
        case 'Active': return 'blue-text';
        case 'Pending Verification': return 'orange-text';
        case 'Suspended': return 'red-text';
        case 'Inactive': return 'gray-text';
        default: return '';
    }
}

let allCustomersData = [];
let searchDebounceTimer;
let currentStatusFilter = 'all';

function initializeCustomerSearch() {
    const searchInput = document.getElementById('customerSearchBar');
    if (!searchInput) {
        console.error('Search input not found');
        return;
    }
    
    searchInput.addEventListener('input', function(e) {
        const searchTerm = e.target.value.trim();
        
        // Clear previous timer
        clearTimeout(searchDebounceTimer);
        
        // Debounce the search
        searchDebounceTimer = setTimeout(() => {
            performFilteredSearch(searchTerm, currentStatusFilter);
        }, 300);
    });
    
    // Clear search when input is cleared
    searchInput.addEventListener('keyup', function(e) {
        if (e.target.value === '') {
            performFilteredSearch('', currentStatusFilter);
        }
    });
}

function initializeStatusFilter() {
    const statusFilter = document.getElementById('statusFilter');
    if (!statusFilter) {
        console.error('Status filter not found');
        return;
    }
    
    statusFilter.addEventListener('change', function(e) {
        currentStatusFilter = e.target.value;
        const searchTerm = document.getElementById('customerSearchBar').value.trim();
        performFilteredSearch(searchTerm, currentStatusFilter);
    });
}

function performFilteredSearch(searchTerm, statusFilter) {
    // Show loading state
    showLoadingState();
    loadCustomers(statusFilter, searchTerm);
}

function showLoadingState() {
    const container = document.querySelector('.transaction-info');
    if (!container) return;
    
    // Clear existing customer cards (keep the header)
    const existingCards = container.querySelectorAll('.account-info-card');
    existingCards.forEach(card => card.remove());
    
    // Add loading message
    const loadingCard = document.createElement('div');
    loadingCard.className = 'account-info-card loading-card';
    loadingCard.style.cssText = `
        padding: 40px 20px;
        text-align: center;
        background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
        border: 2px solid #e9ecef;
        margin: 20px 0;
        animation: pulse 1.5s ease-in-out infinite alternate;
    `;
    loadingCard.innerHTML = `
        <div style="color: var(--primary-color); font-size: 18px; font-weight: 500;">
            🔄 Loading customers...
        </div>
        <div style="color: #6c757d; font-size: 14px; margin-top: 8px;">
            Please wait while we fetch the data
        </div>
    `;
    container.appendChild(loadingCard);
}



function showNoCustomersFound() {
    const container = document.querySelector('.transaction-info');
    if (!container) return;
    
    // Clear existing customer cards (keep the header)
    const existingCards = container.querySelectorAll('.account-info-card');
    existingCards.forEach(card => card.remove());
    
    // Add no results message
    const noResultsCard = document.createElement('div');
    noResultsCard.className = 'account-info-card no-results-card';
    noResultsCard.style.cssText = `
        padding: 40px 20px;
        text-align: center;
        background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
        border: 2px dashed #dee2e6;
        margin: 20px 0;
    `;
    noResultsCard.innerHTML = `
        <div style="color: #6c757d; font-size: 18px; font-weight: 500;">
            🔍 No customers found
        </div>
        <div style="color: #adb5bd; font-size: 14px; margin-top: 8px;">
            Try adjusting your search terms
        </div>
    `;
    container.appendChild(noResultsCard);
}


