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
        loadCustomerDocuments(cifNumber);
        setupBackButton(cifNumber);
        setupVerifyButtons(cifNumber);
    } else {
        console.error('No CIF number provided');
        window.location.href = 'admin-review-queue.html';
    }
});

async function loadCustomerDocuments(cifNumber) {
    try {
        console.log('Loading customer documents for CIF:', cifNumber);
        
        // Load customer basic info to update the name
        const response = await fetch(`/admin/customer/${cifNumber}/details`);
        const customerData = await response.json();
        
        if (response.ok) {
            updateCustomerInfo(customerData.customer);
            loadCustomerIDs(customerData.ids || []);
            loadSupportingDocuments(cifNumber);
        } else {
            console.error('Failed to load customer details:', customerData.message);
            alert('Customer not found');
            window.location.href = 'admin-customer-verification.html?cif=' + cifNumber;
        }
    } catch (error) {
        console.error('Error loading customer documents:', error);
        alert('Error loading customer documents');
        window.location.href = 'admin-customer-verification.html?cif=' + cifNumber;
    }
}

function updateCustomerInfo(customer) {
    // Update page title with customer name
    const nameTitle = document.querySelector('.blue-text');
    if (nameTitle && customer) {
        nameTitle.textContent = `${customer.customer_last_name}, ${customer.customer_first_name} ${customer.customer_middle_name || ''}`.trim();
    }
}

function loadCustomerIDs(ids) {
    console.log('Loading customer IDs:', ids);
    
    // If we have ID data, populate the forms
    if (ids && ids.length > 0) {
        // ID 1
        if (ids[0]) {
            const id1Select = document.querySelector('#select-id1');
            const id1Number = document.querySelector('#id1-num');
            
            if (id1Select && ids[0].id_type_code) {
                // You might need to map id_type_code to display values
                id1Select.value = ids[0].id_type_code;
            }
            if (id1Number && ids[0].id_number) {
                id1Number.value = ids[0].id_number;
            }
        }
        
        // ID 2 would be handled similarly if there's a second ID
    }
    
    // Make all inputs readonly since this is a view page
    const inputs = document.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.readOnly = true;
        input.disabled = true;
    });
}

async function loadSupportingDocuments(cifNumber) {
    try {
        // This would call an endpoint to get uploaded documents
        // For now, we'll create mock data since the backend doesn't have this yet
        const mockDocuments = [
            { filename: `employment_cert_${cifNumber}.pdf`, type: 'PDF', size: '120 KB' },
            { filename: `bank_statement_${cifNumber}.pdf`, type: 'PDF', size: '245 KB' },
            { filename: `utility_bill_${cifNumber}.jpg`, type: 'IMAGE', size: '89 KB' }
        ];
        
        displaySupportingDocuments(mockDocuments);
    } catch (error) {
        console.error('Error loading supporting documents:', error);
    }
}

function displaySupportingDocuments(documents) {
    const container = document.querySelector('.transaction-info');
    if (!container) return;
    
    // Clear existing document cards (keep the header)
    const existingCards = container.querySelectorAll('.account-info-card');
    existingCards.forEach(card => card.remove());
    
    if (!documents || documents.length === 0) {
        const noDocsCard = document.createElement('div');
        noDocsCard.className = 'account-info-card';
        noDocsCard.innerHTML = `
            <div class="account">
                <div class="top-label-2" style="text-align: center; padding: 20px;">
                    <label style="font-size: 16px; color: #666;">No supporting documents found</label>
                </div>
            </div>
        `;
        container.appendChild(noDocsCard);
        return;
    }
    
    documents.forEach((doc, index) => {
        const docCard = createDocumentCard(doc, index);
        container.appendChild(docCard);
    });
}

function createDocumentCard(document, index) {
    const card = document.createElement('div');
    card.className = 'account-info-card';
    
    card.innerHTML = `
        <div class="account">
            <div class="top-label-2">
                <label>${document.filename}</label>
                <label>${document.type}</label>
                <label>${document.size}</label>
                <button onclick="viewDocument('${document.filename}')">View</button>
            </div>
        </div>
    `;
    
    return card;
}

function viewDocument(filename) {
    // In a real implementation, this would open the document
    alert(`Viewing document: ${filename}\n\nIn a real implementation, this would open the document for review.`);
}

function setupBackButton(cifNumber) {
    const backBtn = document.getElementById('back');
    if (backBtn) {
        backBtn.onclick = () => {
            window.location.href = `admin-customer-verification.html?cif=${cifNumber}`;
        };
    }
}

function setupVerifyButtons(cifNumber) {
    const verifyButtons = document.querySelectorAll(".verify");
    
    verifyButtons.forEach((button, index) => {
        button.addEventListener("click", () => {
            // Toggle verification state
            button.classList.toggle("clicked");
            
            // Update button text based on state
            if (button.classList.contains("clicked")) {
                button.textContent = "Verified ✓";
                button.style.backgroundColor = "#28a745";
                console.log(`Document section ${index + 1} verified for CIF ${cifNumber}`);
            } else {
                button.textContent = "Verify";
                button.style.backgroundColor = "";
                console.log(`Document section ${index + 1} verification removed for CIF ${cifNumber}`);
            }
        });
    });
}
