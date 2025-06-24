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

    // Load pending verifications
    loadPendingVerifications();
    
    // Initialize search functionality
    initializeQueueSearch();
    
    // Logout functionality is handled by logout-fix.js
});

async function loadPendingVerifications() {
    try {
        console.log('Loading pending verifications...');
        const response = await fetch('/admin/pending-verifications');
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const verifications = await response.json();
        console.log('API Response:', verifications);
        
        allVerificationsData = verifications; // Store for search functionality
        displayVerifications(verifications);
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
        
        // Navigate directly to verification page
        const targetUrl = `admin-customer-verification.html?cif=${verification.cif_number}`;
            
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



// Initialize progress bar highlighting
function initializeProgressBar() {
  const steps = document.querySelectorAll(".progress-step");
  const currentPage = window.location.pathname;
  const filename = currentPage.split('/').pop() || currentPage.split('\\').pop(); // Handle both Unix and Windows paths
  
  // Debug logging
  console.log('Current page pathname:', currentPage);
  console.log('Extracted filename:', filename);
  console.log('Found steps:', steps.length);
  
  // Remove any existing active classes
  steps.forEach(step => step.classList.remove("active"));
  
  // Set active step based on current page filename
  if (filename === "admin-review-queue2.html") {
    console.log('Setting step 2 (Approve Requests) as active');
    steps[1]?.classList.add("active"); // Approve Requests
  } else if (filename === "admin-review-queue.html") {
    console.log('Setting step 1 (Verify Accounts) as active');
    steps[0]?.classList.add("active"); // Verify Accounts
  } else {
    console.log('No matching filename found for:', filename);
  }
  
  // Verify which steps are active
  steps.forEach((step, index) => {
    console.log(`Step ${index + 1} active:`, step.classList.contains("active"));
  });
}

let allVerificationsData = [];
let queueSearchDebounceTimer;

function initializeQueueSearch() {
    const searchInput = document.getElementById('queueSearchBar');
    if (!searchInput) {
        console.error('Queue search input not found');
        return;
    }
    
    searchInput.addEventListener('input', function(e) {
        const searchTerm = e.target.value.trim();
        
        // Clear previous timer
        clearTimeout(queueSearchDebounceTimer);
        
        // Debounce the search
        queueSearchDebounceTimer = setTimeout(() => {
            if (searchTerm.length === 0) {
                // Show all verifications when search is empty
                displayVerifications(allVerificationsData);
            } else if (searchTerm.length >= 2) {
                // Perform search
                performQueueSearch(searchTerm);
            }
        }, 300);
    });
    
    // Clear search when input is cleared
    searchInput.addEventListener('keyup', function(e) {
        if (e.target.value === '') {
            displayVerifications(allVerificationsData);
        }
    });
}

function performQueueSearch(searchTerm) {
    const searchLower = searchTerm.toLowerCase();
    
    const filteredVerifications = allVerificationsData.filter(verification => {
        return (
            (verification.cif_number && verification.cif_number.toString().includes(searchLower)) ||
            (verification.customer_first_name && verification.customer_first_name.toLowerCase().includes(searchLower)) ||
            (verification.customer_last_name && verification.customer_last_name.toLowerCase().includes(searchLower)) ||
            (verification.customer_middle_name && verification.customer_middle_name.toLowerCase().includes(searchLower)) ||
            (verification.customer_suffix_name && verification.customer_suffix_name.toLowerCase().includes(searchLower)) ||
            (verification.email && verification.email.toLowerCase().includes(searchLower)) ||
            (verification.phone && verification.phone.includes(searchLower)) ||
            (verification.customer_type && verification.customer_type.toLowerCase().includes(searchLower))
        );
    });
    
    displayVerifications(filteredVerifications);
    
    // Show no results message if needed
    if (filteredVerifications.length === 0) {
        showNoVerificationsFound();
    }
}

function showNoVerificationsFound() {
    const container = document.querySelector('.transaction-info');
    if (!container) return;
    
    // Clear existing verification cards (keep the header)
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
            🔍 No pending verifications found
        </div>
        <div style="color: #adb5bd; font-size: 14px; margin-top: 8px;">
            Try adjusting your search terms
        </div>
    `;
    container.appendChild(noResultsCard);
}
