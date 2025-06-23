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
    
    // Set up search functionality
    const searchInput = document.getElementById('search');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(function() {
            loadClosedAccounts(this.value);
        }, 300));
    }
    
    // Set up logout functionality
    const logoutBtn = document.getElementById('log-out');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            localStorage.removeItem('employee_id');
            localStorage.removeItem('employee_username');
            localStorage.removeItem('employee_position');
            window.location.href = 'admin-login.html';
        });
    }
});

async function loadClosedAccounts(searchTerm = '') {
    try {
        const response = await fetch('/admin/closed-accounts');
        const closedAccounts = await response.json();
        
        if (response.ok) {
            let filteredAccounts = closedAccounts;
            if (searchTerm) {
                filteredAccounts = closedAccounts.filter(account => 
                    account.customer_first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    account.customer_last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    account.cif_number.toString().includes(searchTerm)
                );
            }
            displayClosedAccounts(filteredAccounts);
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

function createClosedAccountCard(account) {
    const card = document.createElement('div');
    card.className = 'account-info-card';
    
    const formattedDate = account.closed_date ? new Date(account.closed_date).toLocaleString() : 'N/A';
    
    card.innerHTML = `
        <div class="account">
            <div class="top-label-2">
                <label>${account.cif_number}</label>
                <label>${formattedDate}</label>
                <label>${account.customer_type}</label>
                <label>${account.customer_last_name}</label>
                <label>${account.customer_first_name}</label>
                <label>${account.customer_middle_name || 'N/A'}</label>
                <label>${account.customer_suffix_name || 'N/A'}</label>
                <label class="red-text">Closed</label>
            </div>
        </div>
    `;
    
    return card;
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
