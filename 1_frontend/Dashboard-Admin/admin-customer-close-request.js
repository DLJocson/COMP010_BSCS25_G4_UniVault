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
        setupCloseRequestButtons(cifNumber);
    } else {
        console.error('No CIF number provided');
        window.location.href = 'admin-review-queue2.html';
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

async function loadCustomerDetails(cifNumber) {
    try {
        const response = await fetch(`/admin/customer/${cifNumber}/details`);
        const customerData = await response.json();
        
        if (response.ok) {
            populateCustomerDetails(customerData);
        } else {
            console.error('Failed to load customer details:', customerData.message);
            alert('Customer not found');
            window.location.href = 'admin-review-queue2.html';
        }
    } catch (error) {
        console.error('Error loading customer details:', error);
        alert('Error loading customer details');
        window.location.href = 'admin-review-queue2.html';
    }
}

function populateCustomerDetails(data) {
    const { customer, addresses, contacts } = data;
    
    // Update page title with customer name
    const nameTitle = document.querySelector('.blue-text');
    if (nameTitle) {
        nameTitle.textContent = `${customer.customer_last_name}, ${customer.customer_first_name} ${customer.customer_middle_name || ''}`.trim();
    }
    
    // Account Information
    document.getElementById('cif-number').value = customer.cif_number || '';
    document.getElementById('customer-type').value = customer.customer_type || '';
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
    
    // Contact Details
    if (contacts && contacts.length > 0) {
        const email = contacts.find(c => c.contact_type_code === 'CT01');
        const mobile = contacts.find(c => c.contact_type_code === 'CT02');
        
        document.getElementById('email-address').value = email ? email.contact_value : '';
        document.getElementById('mobile-number').value = mobile ? mobile.contact_value : '';
    }
    
    // Address Information
    if (addresses && addresses.length > 0) {
        const homeAddress = addresses.find(a => a.address_type_code === 'AD01');
        
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
    }
    
    // Make all inputs readonly since this is a verification page
    const inputs = document.querySelectorAll('input[type="text"], input[type="date"], select');
    inputs.forEach(input => {
        input.readOnly = true;
        input.disabled = true;
    });
}

function setupCloseRequestButtons(cifNumber) {
    const employeeId = localStorage.getItem('employee_id');
    
    // Find the confirm button
    const confirmBtn = document.getElementById('view');
    if (confirmBtn) {
        confirmBtn.onclick = () => processCloseRequest(cifNumber, 'approve', employeeId);
        confirmBtn.textContent = 'Approve Close Request';
        confirmBtn.style.backgroundColor = '#28a745';
        confirmBtn.style.color = 'white';
    }
    
    // Add reject button
    const buttonContainer = document.querySelector('.button');
    if (buttonContainer) {
        const rejectBtn = document.createElement('button');
        rejectBtn.textContent = 'Reject Close Request';
        rejectBtn.style.backgroundColor = '#dc3545';
        rejectBtn.style.color = 'white';
        rejectBtn.style.margin = '5px';
        rejectBtn.onclick = () => processCloseRequest(cifNumber, 'reject', employeeId);
        buttonContainer.appendChild(rejectBtn);
    }
}

async function processCloseRequest(cifNumber, action, employeeId) {
    const confirmation = confirm(`Are you sure you want to ${action} this close request?`);
    if (!confirmation) return;
    
    try {
        const response = await fetch(`/admin/close-request/${cifNumber}/process`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                employee_id: employeeId,
                action: action,
                reason: `Close request ${action}d by admin`
            })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            alert(result.message);
            window.location.href = 'admin-review-queue2.html';
        } else {
            alert('Error: ' + result.message);
        }
    } catch (error) {
        console.error('Error processing close request:', error);
        alert('Error processing close request');
    }
}

async function loadCloseRequests(searchTerm = '') {
    try {
        const response = await fetch('/admin/close-requests');
        const closeRequests = await response.json();
        
        if (response.ok) {
            let filteredRequests = closeRequests;
            if (searchTerm) {
                filteredRequests = closeRequests.filter(request => 
                    request.customer_first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    request.customer_last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    request.cif_number.toString().includes(searchTerm)
                );
            }
            displayCloseRequests(filteredRequests);
        } else {
            console.error('Failed to load close requests:', closeRequests.message);
        }
    } catch (error) {
        console.error('Error loading close requests:', error);
    }
}

function displayCloseRequests(requests) {
    const container = document.querySelector('.transaction-info');
    if (!container) return;
    
    // Clear existing request cards (keep the header)
    const existingCards = container.querySelectorAll('.account-info-card');
    existingCards.forEach(card => card.remove());
    
    if (requests.length === 0) {
        const noRequestsCard = document.createElement('div');
        noRequestsCard.className = 'account-info-card';
        noRequestsCard.innerHTML = `
            <div class="account">
                <div class="top-label-2">
                    <label colspan="8" style="text-align: center; padding: 20px;">No close requests found</label>
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
    card.onclick = () => {
        processCloseRequest(request.cif_number, request.customer_first_name + ' ' + request.customer_last_name);
    };
    
    const formattedDate = new Date(request.request_date).toLocaleString();
    
    card.innerHTML = `
        <div class="account">
            <div class="top-label-2">
                <label>${request.cif_number}</label>
                <label>${formattedDate}</label>
                <label>${request.customer_type}</label>
                <label>${request.customer_last_name}</label>
                <label>${request.customer_first_name}</label>
                <label>${request.customer_middle_name || 'N/A'}</label>
                <label>${request.customer_suffix_name || 'N/A'}</label>
                <label class="orange-text">${request.request_status}</label>
            </div>
        </div>
    `;
    
    return card;
}

function processCloseRequest(cifNumber, customerName) {
    const employeeId = localStorage.getItem('employee_id');
    
    const action = confirm(
        `Process close request for ${customerName} (CIF: ${cifNumber})?\n\n` +
        `Click OK to APPROVE the request and close the account.\n` +
        `Click Cancel to REJECT the request.`
    );
    
    if (action !== null) {
        const actionType = action ? 'approve' : 'reject';
        submitCloseRequestDecision(cifNumber, actionType, employeeId);
    }
}

async function submitCloseRequestDecision(cifNumber, action, employeeId) {
    try {
        const response = await fetch(`/admin/close-request/${cifNumber}/process`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                employee_id: employeeId,
                action: action,
                reason: `Close request ${action}d by admin`
            })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            alert(result.message);
            loadCloseRequests(); // Reload the list
        } else {
            alert('Error: ' + result.message);
        }
    } catch (error) {
        console.error('Error processing close request:', error);
        alert('Error processing close request');
    }
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
