document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const employeeId = localStorage.getItem('employee_id');
    const employeeUsername = localStorage.getItem('employee_username');
    
    if (!employeeId || !employeeUsername) {
        window.location.href = 'admin-login.html';
        return;
    }

    // Initialize progress bar highlighting
    initializeProgressBar();

    // Load close requests (this would be for account closure requests)
    loadCloseRequests();
    
    // Initialize search functionality
    initializeApproveSearch();
    
    // Logout functionality is handled by logout-fix.js
});

async function loadCloseRequests() {
    try {
        console.log('Loading close requests...');
        const response = await fetch('/admin/close-requests');
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const closeRequests = await response.json();
        console.log('API Response:', closeRequests);
        
        // Load account information for each customer
        const requestsWithAccounts = await Promise.all(
            closeRequests.map(async (request) => {
                try {
                    const accountsResponse = await fetch(`/api/customers/${request.cif_number}/accounts`);
                    if (accountsResponse.ok) {
                        const accountsData = await accountsResponse.json();
                        return {
                            ...request,
                            accounts: accountsData.accounts || [],
                            accountsMessage: accountsData.message || ''
                        };
                    } else {
                        console.warn(`No accounts found for CIF ${request.cif_number}: ${accountsResponse.status}`);
                        return {
                            ...request,
                            accounts: [],
                            accountsMessage: 'No accounts found for this customer'
                        };
                    }
                } catch (error) {
                    console.error(`Error loading accounts for CIF ${request.cif_number}:`, error);
                    return {
                        ...request,
                        accounts: [],
                        accountsMessage: 'Error loading account information'
                    };
                }
            })
        );
        
        allCloseRequestsData = requestsWithAccounts; // Store for search functionality
        displayCloseRequests(requestsWithAccounts);
    } catch (error) {
        console.error('Error loading close requests:', error);
        
        // Show error message to user
        const container = document.querySelector('.transaction-info');
        if (container) {
            const existingCards = container.querySelectorAll('.account-info-card');
            existingCards.forEach(card => card.remove());
            
            const errorCard = document.createElement('div');
            errorCard.className = 'account-info-card';
            errorCard.innerHTML = `
                <div class="account">
                    <div class="top-label-2" style="text-align: center; padding: 20px;">
                        <label style="font-size: 16px; color: #e74c3c;">Error loading close requests: ${error.message}</label>
                    </div>
                </div>
            `;
            container.appendChild(errorCard);
        }
    }
}

function displayCloseRequests(requests) {
    const container = document.querySelector('.transaction-info');
    if (!container) {
        console.error('Transaction info container not found');
        return;
    }
    
    // Clear existing request cards (keep the header)
    const existingCards = container.querySelectorAll('.account-info-card');
    existingCards.forEach(card => card.remove());
    
    console.log('Displaying close requests:', requests);
    
    if (!requests || requests.length === 0) {
        // Show message when no requests are found
        const noRequestsCard = document.createElement('div');
        noRequestsCard.className = 'account-info-card';
        noRequestsCard.innerHTML = `
            <div class="account">
                <div class="top-label-2" style="text-align: center; padding: 20px;">
                    <label style="font-size: 16px; color: #666;">No close requests found</label>
                </div>
            </div>
        `;
        container.appendChild(noRequestsCard);
        return;
    }
    
    requests.forEach(request => {
        const requestCard = createCloseRequestCard(request);
        container.appendChild(requestCard);
    });
}

function createCloseRequestCard(request) {
    const card = document.createElement('div');
    card.className = 'account-info-card';
    
    // Add debugging and better error handling
    card.onclick = (event) => {
        event.preventDefault();
        event.stopPropagation();
        
        console.log('Card clicked for close request:', request);
        
        if (!request.cif_number) {
            console.error('No CIF number found in request object:', request);
            alert('Error: Customer CIF number not found');
            return;
        }
        
        const targetUrl = `admin-customer-close-request.html?cif=${request.cif_number}`;
        console.log('Navigating to:', targetUrl);
        
        window.location.href = targetUrl;
    };
    
    // Add visual feedback
    card.style.cursor = 'pointer';
    card.addEventListener('mouseenter', () => {
        card.style.backgroundColor = '#f0f0f0';
    });
    card.addEventListener('mouseleave', () => {
        card.style.backgroundColor = '';
    });
    
    const formattedDate = new Date(request.request_date).toLocaleString();
    
    // Create account summary for display
    const accountSummary = request.accounts && request.accounts.length > 0 
        ? `${request.accounts.length} Account${request.accounts.length > 1 ? 's' : ''} (${request.accounts.map(acc => acc.account_type).join(', ')})`
        : (request.accountsMessage || 'No accounts found');
    
    card.innerHTML = `
        <div class="account">
            <div class="top-label-2">
                <label>${request.cif_number || 'N/A'}</label>
                <label>${formattedDate}</label>
                <label>${request.customer_type || 'N/A'}</label>
                <label>${request.customer_last_name || 'N/A'}</label>
                <label>${request.customer_first_name || 'N/A'}</label>
                <label>${request.customer_middle_name || 'N/A'}</label>
                <label>${request.customer_suffix_name || 'N/A'}</label>
                <label>${request.email || 'N/A'}</label>
                <label>${request.phone || 'N/A'}</label>
                <label class="blue-text">${request.request_status || 'Pending'}</label>
            </div>
            <div class="account-summary" style="margin-top: 10px; padding: 0 20px;">
                <small style="color: var(--primary-color); font-weight: 500;">
                    Accounts: ${accountSummary}
                </small>
            </div>
        </div>
    `;
    
    return card;
}



// Initialize progress bar highlighting
function initializeProgressBar() {
  const steps = document.querySelectorAll(".progress-step");
  const currentPage = window.location.pathname;
  const filename = currentPage.split('/').pop() || currentPage.split('\\').pop(); // Handle both Unix and Windows paths
  
  // Remove any existing active classes
  steps.forEach(step => step.classList.remove("active"));
  
  // Set active step based on current page filename
  if (filename === "admin-review-queue2.html") {
    steps[1]?.classList.add("active"); // Approve Requests
  } else if (filename === "admin-review-queue.html") {
    steps[0]?.classList.add("active"); // Verify Accounts
  }
}

let allCloseRequestsData = [];
let approveSearchDebounceTimer;

function initializeApproveSearch() {
    const searchInput = document.getElementById('approveSearchBar');
    if (!searchInput) {
        console.error('Approve search input not found');
        return;
    }
    
    searchInput.addEventListener('input', function(e) {
        const searchTerm = e.target.value.trim();
        
        // Clear previous timer
        clearTimeout(approveSearchDebounceTimer);
        
        // Debounce the search
        approveSearchDebounceTimer = setTimeout(() => {
            if (searchTerm.length === 0) {
                // Show all close requests when search is empty
                displayCloseRequests(allCloseRequestsData);
            } else if (searchTerm.length >= 2) {
                // Perform search
                performApproveSearch(searchTerm);
            }
        }, 300);
    });
    
    // Clear search when input is cleared
    searchInput.addEventListener('keyup', function(e) {
        if (e.target.value === '') {
            displayCloseRequests(allCloseRequestsData);
        }
    });
}

function performApproveSearch(searchTerm) {
    const searchLower = searchTerm.toLowerCase();
    
    const filteredRequests = allCloseRequestsData.filter(request => {
        return (
            (request.cif_number && request.cif_number.toString().includes(searchLower)) ||
            (request.customer_first_name && request.customer_first_name.toLowerCase().includes(searchLower)) ||
            (request.customer_last_name && request.customer_last_name.toLowerCase().includes(searchLower)) ||
            (request.customer_middle_name && request.customer_middle_name.toLowerCase().includes(searchLower)) ||
            (request.customer_suffix_name && request.customer_suffix_name.toLowerCase().includes(searchLower)) ||
            (request.email && request.email.toLowerCase().includes(searchLower)) ||
            (request.phone && request.phone.includes(searchLower)) ||
            (request.customer_type && request.customer_type.toLowerCase().includes(searchLower))
        );
    });
    
    displayCloseRequests(filteredRequests);
    
    // Show no results message if needed
    if (filteredRequests.length === 0) {
        showNoCloseRequestsFound();
    }
}

function showNoCloseRequestsFound() {
    const container = document.querySelector('.transaction-info');
    if (!container) return;
    
    // Clear existing request cards (keep the header)
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
            🔍 No close requests found
        </div>
        <div style="color: #adb5bd; font-size: 14px; margin-top: 8px;">
            Try adjusting your search terms
        </div>
    `;
    container.appendChild(noResultsCard);
}
