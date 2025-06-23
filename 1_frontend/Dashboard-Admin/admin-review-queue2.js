document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const employeeId = localStorage.getItem('employee_id');
    const employeeUsername = localStorage.getItem('employee_username');
    
    if (!employeeId || !employeeUsername) {
        window.location.href = 'admin-login.html';
        return;
    }

    // Load close requests (this would be for account closure requests)
    loadCloseRequests();
    
    // Set up search functionality
    const searchInput = document.getElementById('search');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(function() {
            loadCloseRequests(this.value);
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

async function loadCloseRequests(searchTerm = '') {
    try {
        console.log('Loading close requests...');
        const response = await fetch('/admin/close-requests');
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const closeRequests = await response.json();
        console.log('API Response:', closeRequests);
        
        let filteredRequests = closeRequests;
        if (searchTerm) {
            filteredRequests = closeRequests.filter(request => 
                request.customer_first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                request.customer_last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                request.cif_number.toString().includes(searchTerm)
            );
        }
        
        displayCloseRequests(filteredRequests);
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
                <label class="orange-text">${request.request_status || 'Pending'}</label>
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
