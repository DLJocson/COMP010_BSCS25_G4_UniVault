document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const employeeId = localStorage.getItem('employee_id');
    const employeeUsername = localStorage.getItem('employee_username');
    
    if (!employeeId || !employeeUsername) {
        window.location.href = 'admin-login.html';
        return;
    }

    // Load pending verifications
    loadPendingVerifications();
    
    // Set up search functionality
    const searchInput = document.getElementById('search');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(function() {
            loadPendingVerifications(this.value);
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

async function loadPendingVerifications(searchTerm = '') {
    try {
        console.log('Loading pending verifications...');
        const response = await fetch('/admin/pending-verifications');
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const verifications = await response.json();
        console.log('API Response:', verifications);
        
        let filteredVerifications = verifications;
        if (searchTerm) {
            filteredVerifications = verifications.filter(verification => 
                verification.customer_first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                verification.customer_last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                verification.cif_number.toString().includes(searchTerm) ||
                (verification.email && verification.email.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }
        
        displayVerifications(filteredVerifications);
    } catch (error) {
        console.error('Error loading pending verifications:', error);
        
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
                        <label style="font-size: 16px; color: #e74c3c;">Error loading verifications: ${error.message}</label>
                    </div>
                </div>
            `;
            container.appendChild(errorCard);
        }
    }
}

function displayVerifications(verifications) {
    const container = document.querySelector('.transaction-info');
    if (!container) {
        console.error('Transaction info container not found');
        return;
    }
    
    // Clear existing verification cards (keep the header)
    const existingCards = container.querySelectorAll('.account-info-card');
    existingCards.forEach(card => card.remove());
    
    console.log('Displaying verifications:', verifications);
    
    if (!verifications || verifications.length === 0) {
        // Show message when no verifications are found
        const noVerificationsCard = document.createElement('div');
        noVerificationsCard.className = 'account-info-card';
        noVerificationsCard.innerHTML = `
            <div class="account">
                <div class="top-label-2" style="text-align: center; padding: 20px;">
                    <label style="font-size: 16px; color: #666;">No pending verifications found</label>
                </div>
            </div>
        `;
        container.appendChild(noVerificationsCard);
        return;
    }
    
    verifications.forEach(verification => {
        const verificationCard = createVerificationCard(verification);
        container.appendChild(verificationCard);
    });
}

function createVerificationCard(verification) {
    const card = document.createElement('div');
    card.className = 'account-info-card';
    
    // Add debugging and better error handling
    card.onclick = (event) => {
        event.preventDefault();
        event.stopPropagation();
        
        console.log('Card clicked for verification:', verification);
        
        if (!verification.cif_number) {
            console.error('No CIF number found in verification object:', verification);
            alert('Error: Customer CIF number not found');
            return;
        }
        
        // Show options for what to do with this customer
        const action = confirm(
            `Customer: ${verification.customer_first_name} ${verification.customer_last_name} (CIF: ${verification.cif_number})\n\n` +
            `Click OK to go to VERIFICATION page (approve/reject)\n` +
            `Click Cancel to go to PROFILE page (view only)`
        );
        
        const targetUrl = action 
            ? `admin-customer-verification.html?cif=${verification.cif_number}`
            : `admin-customer-profile.html?cif=${verification.cif_number}`;
            
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
    
    const formattedDate = new Date(verification.created_at).toLocaleString();
    
    card.innerHTML = `
        <div class="account">
            <div class="top-label-2">
                <label>${verification.cif_number || 'N/A'}</label>
                <label>${formattedDate}</label>
                <label>${verification.customer_type || 'N/A'}</label>
                <label>${verification.customer_last_name || 'N/A'}</label>
                <label>${verification.customer_first_name || 'N/A'}</label>
                <label>${verification.customer_middle_name || 'N/A'}</label>
                <label>${verification.customer_suffix_name || 'N/A'}</label>
                <label>${verification.email || 'N/A'}</label>
                <label>${verification.phone || 'N/A'}</label>
                <label class="blue-text">${verification.customer_status || 'Unknown'}</label>
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
