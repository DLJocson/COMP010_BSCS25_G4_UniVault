document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const employeeId = localStorage.getItem('employee_id');
    const employeeUsername = localStorage.getItem('employee_username');
    
    if (!employeeId || !employeeUsername) {
        window.location.href = 'admin-login.html';
        return;
    }

    // Load closed accounts
    loadClosedAccounts();
    
    // Initialize search functionality
    initializeClosedSearch();
    
    // Logout functionality is handled by logout-fix.js
});

async function loadClosedAccounts() {
    try {
        const response = await fetch('/api/customers/closed-accounts');
        const closedAccounts = await response.json();
        
        if (response.ok) {
            allClosedAccountsData = closedAccounts; // Store for search functionality
            displayClosedAccounts(closedAccounts);
        } else {
            console.error('Failed to load closed accounts:', closedAccounts.message);
        }
    } catch (error) {
        console.error('Error loading closed accounts:', error);
    }
}

function displayClosedAccounts(accounts) {
    const container = document.querySelector('.transaction-info');
    if (!container) return;
    
    // Clear existing account cards (keep the header)
    const existingCards = container.querySelectorAll('.account-info-card');
    existingCards.forEach(card => card.remove());
    
    accounts.forEach(account => {
        const accountCard = createClosedAccountCard(account);
        container.appendChild(accountCard);
    });
}

function createClosedAccountCard(customer) {
    const card = document.createElement('div');
    card.className = 'account-info-card';
    
    // Get the most recent close date from all closed accounts
    const mostRecentCloseDate = customer.closed_accounts
        .map(acc => new Date(acc.close_date))
        .sort((a, b) => b - a)[0];
    
    const formattedDate = mostRecentCloseDate ? mostRecentCloseDate.toLocaleString() : 'N/A';
    
    // Create a tooltip showing all closed accounts
    const closedAccountsInfo = customer.closed_accounts
        .map(acc => `${acc.account_type} (${acc.account_number})`)
        .join(', ');
    
    card.innerHTML = `
        <div class="account">
            <div class="top-label-2">
                <label>${customer.cif_number}</label>
                <label>${formattedDate}</label>
                <label>${customer.customer_type}</label>
                <label>${customer.customer_last_name}</label>
                <label>${customer.customer_first_name}</label>
                <label>${customer.customer_middle_name || 'N/A'}</label>
                <label>${customer.customer_suffix_name || 'N/A'}</label>
                <label class="closed-status" title="${closedAccountsInfo}">
                    ${customer.closed_accounts_count} Closed Account${customer.closed_accounts_count > 1 ? 's' : ''}
                </label>
            </div>
        </div>
    `;
    
    // Add click handler to show more details
    card.addEventListener('click', () => {
        showCustomerAccountDetails(customer);
    });
    
    card.style.cursor = 'pointer';
    
    return card;
}

function showCustomerAccountDetails(customer) {
    const accountsList = customer.closed_accounts
        .map(acc => `
            <div class="closed-account-detail">
                <strong>${acc.account_type}</strong><br>
                Account: ${acc.account_number}<br>
                Closed: ${new Date(acc.close_date).toLocaleDateString()}
            </div>
        `).join('');
    
    const modal = document.createElement('div');
    modal.className = 'customer-details-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    `;
    
    modal.innerHTML = `
        <div class="modal-content" style="
            background: white;
            padding: 30px;
            border-radius: 20px;
            max-width: 500px;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        ">
            <div class="modal-header" style="
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                border-bottom: 2px solid #eee;
                padding-bottom: 10px;
            ">
                <h3 style="margin: 0; color: var(--primary-color);">
                    ${customer.customer_last_name}, ${customer.customer_first_name}
                </h3>
                <button class="close-modal" style="
                    background: none;
                    border: none;
                    font-size: 24px;
                    cursor: pointer;
                    color: #999;
                ">&times;</button>
            </div>
            <div class="modal-body">
                <p><strong>CIF Number:</strong> ${customer.cif_number}</p>
                <p><strong>Customer Type:</strong> ${customer.customer_type}</p>
                <p><strong>Customer Status:</strong> ${customer.customer_status}</p>
                <h4 style="margin-top: 20px; color: var(--primary-color);">Closed Accounts:</h4>
                <div class="closed-accounts-list" style="
                    display: grid;
                    gap: 10px;
                    margin-top: 10px;
                ">
                    ${accountsList}
                </div>
            </div>
        </div>
    `;
    
    // Close modal functionality
    modal.addEventListener('click', (e) => {
        if (e.target === modal || e.target.classList.contains('close-modal')) {
            document.body.removeChild(modal);
        }
    });
    
    document.body.appendChild(modal);
}

let allClosedAccountsData = [];
let closedSearchDebounceTimer;

function initializeClosedSearch() {
    const searchInput = document.getElementById('closedSearchBar');
    if (!searchInput) {
        console.error('Closed search input not found');
        return;
    }
    
    searchInput.addEventListener('input', function(e) {
        const searchTerm = e.target.value.trim();
        
        // Clear previous timer
        clearTimeout(closedSearchDebounceTimer);
        
        // Debounce the search
        closedSearchDebounceTimer = setTimeout(() => {
            if (searchTerm.length === 0) {
                // Show all closed accounts when search is empty
                displayClosedAccounts(allClosedAccountsData);
            } else if (searchTerm.length >= 2) {
                // Perform search
                performClosedSearch(searchTerm);
            }
        }, 300);
    });
    
    // Clear search when input is cleared
    searchInput.addEventListener('keyup', function(e) {
        if (e.target.value === '') {
            displayClosedAccounts(allClosedAccountsData);
        }
    });
}

function performClosedSearch(searchTerm) {
    const searchLower = searchTerm.toLowerCase();
    
    const filteredAccounts = allClosedAccountsData.filter(account => {
        return (
            (account.cif_number && account.cif_number.toString().includes(searchLower)) ||
            (account.customer_first_name && account.customer_first_name.toLowerCase().includes(searchLower)) ||
            (account.customer_last_name && account.customer_last_name.toLowerCase().includes(searchLower)) ||
            (account.customer_middle_name && account.customer_middle_name.toLowerCase().includes(searchLower)) ||
            (account.customer_suffix_name && account.customer_suffix_name.toLowerCase().includes(searchLower)) ||
            (account.customer_type && account.customer_type.toLowerCase().includes(searchLower))
        );
    });
    
    displayClosedAccounts(filteredAccounts);
    
    // Show no results message if needed
    if (filteredAccounts.length === 0) {
        showNoClosedAccountsFound();
    }
}

function showNoClosedAccountsFound() {
    const container = document.querySelector('.transaction-info');
    if (!container) return;
    
    // Clear existing account cards (keep the header)
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
            🔍 No closed accounts found
        </div>
        <div style="color: #adb5bd; font-size: 14px; margin-top: 8px;">
            Try adjusting your search terms
        </div>
    `;
    container.appendChild(noResultsCard);
}


