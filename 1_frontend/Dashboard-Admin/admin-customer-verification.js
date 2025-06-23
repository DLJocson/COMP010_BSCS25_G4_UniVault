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
    } else {
        console.error('No CIF number provided');
        window.location.href = 'admin-review-queue.html';
    }
    
    // Set up verification buttons
    setupVerificationButtons(cifNumber);
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
            window.location.href = 'admin-review-queue.html';
        }
    } catch (error) {
        console.error('Error loading customer details:', error);
        alert('Error loading customer details');
        window.location.href = 'admin-review-queue.html';
    }
}

function populateCustomerDetails(data) {
    const { customer, addresses, contacts, employment, ids } = data;
    
    // Update page title with customer name
    const nameTitle = document.querySelector('.blue-text');
    if (nameTitle) {
        nameTitle.textContent = `${customer.customer_last_name}, ${customer.customer_first_name} ${customer.customer_middle_name || ''}`.trim();
    }
    
    // Account Information
    document.getElementById('cif-number').value = customer.cif_number || '';
    document.getElementById('customer-type').value = customer.customer_type || '';
    document.getElementById('account-type').value = customer.customer_type || ''; // Using customer_type as account type
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
    document.getElementById('residency').value = customer.residency_status || '';
    
    // Contact Details
    if (contacts && contacts.length > 0) {
        const personalMobile = contacts.find(c => c.contact_type_description === 'Mobile' || c.contact_type_code === 'CT02');
        const landline = contacts.find(c => c.contact_type_description === 'Landline' || c.contact_type_code === 'CT03');
        const email = contacts.find(c => c.contact_type_description === 'Email' || c.contact_type_code === 'CT01');
        
        document.getElementById('mobile-number').value = personalMobile ? personalMobile.contact_value : '';
        document.getElementById('landline-number').value = landline ? landline.contact_value : '';
        document.getElementById('email-address').value = email ? email.contact_value : '';
    }
    
    // Address Information
    if (addresses && addresses.length > 0) {
        const homeAddress = addresses.find(a => a.address_type_code === 'AD01');
        const altAddress = addresses.find(a => a.address_type_code === 'AD02');
        
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
        
        if (altAddress) {
            document.getElementById('alt-unit').value = altAddress.address_unit || '';
            document.getElementById('alt-building').value = altAddress.address_building || '';
            document.getElementById('alt-street').value = altAddress.address_street || '';
            document.getElementById('alt-subdivision').value = altAddress.address_subdivision || '';
            document.getElementById('alt-barangay').value = altAddress.address_barangay || '';
            document.getElementById('alt-city').value = altAddress.address_city || '';
            document.getElementById('alt-province').value = altAddress.address_province || '';
            document.getElementById('alt-country').value = altAddress.address_country || '';
            document.getElementById('alt-zip-code').value = altAddress.address_zip_code || '';
        }
    }
    
    // Employment Information
    if (employment && employment.length > 0) {
        const primaryEmployment = employment[0];
        document.getElementById('primary-employer').value = primaryEmployment.employer_business_name || '';
        document.getElementById('position').value = primaryEmployment.job_title || '';
        document.getElementById('monthly-income').value = primaryEmployment.income_monthly_gross || '';
        
        // Work address (if available)
        // Note: The current schema doesn't seem to have work address in employment table
        // This would need to be added to the database schema
    }
    
    // TIN Number
    document.getElementById('tin-number').value = customer.tax_identification_number || '';
    
    // Fund Source
    if (data.fundSources && data.fundSources.length > 0) {
        document.getElementById('source-of-fund').value = data.fundSources[0].fund_source || '';
    }
    
    // Aliases
    if (data.aliases && data.aliases.length > 0) {
        const alias = data.aliases[0];
        document.getElementById('alias-first-name').value = alias.alias_first_name || '';
        document.getElementById('alias-middle-name').value = alias.alias_middle_name || '';
        document.getElementById('alias-last-name').value = alias.alias_last_name || '';
    }
    
    // Make all inputs readonly since this is a verification page
    const inputs = document.querySelectorAll('input[type="text"], input[type="date"], select');
    inputs.forEach(input => {
        input.readOnly = true;
        input.disabled = true;
    });
}

function setupVerificationButtons(cifNumber) {
    const employeeId = localStorage.getItem('employee_id');
    
    // Create verification buttons container
    const container = document.querySelector('.profile-name-page .button');
    if (container) {
        // Clear existing buttons except back button
        const backButton = container.querySelector('#back');
        container.innerHTML = '';
        if (backButton) {
            container.appendChild(backButton);
        }
        
        // Create view documents button
        const viewDocsBtn = document.createElement('button');
        viewDocsBtn.textContent = 'View Attached Documents';
        viewDocsBtn.id = 'view';
        viewDocsBtn.onclick = () => {
            window.location.href = `admin-customer-verification2.html?cif=${cifNumber}`;
        };
        
        // Add verification buttons
        const approveBtn = document.createElement('button');
        approveBtn.textContent = 'Approve Verification';
        approveBtn.className = 'approve-btn';
        approveBtn.style.backgroundColor = '#28a745';
        approveBtn.style.color = 'white';
        approveBtn.style.margin = '5px';
        approveBtn.onclick = () => verifyCustomer(cifNumber, 'approve', employeeId);
        
        const rejectBtn = document.createElement('button');
        rejectBtn.textContent = 'Reject Verification';
        rejectBtn.className = 'reject-btn';
        rejectBtn.style.backgroundColor = '#dc3545';
        rejectBtn.style.color = 'white';
        rejectBtn.style.margin = '5px';
        rejectBtn.onclick = () => verifyCustomer(cifNumber, 'reject', employeeId);
        
        container.appendChild(viewDocsBtn);
        container.appendChild(approveBtn);
        container.appendChild(rejectBtn);
    }
}

async function verifyCustomer(cifNumber, action, employeeId) {
    const confirmation = confirm(`Are you sure you want to ${action} this customer verification?`);
    if (!confirmation) return;
    
    try {
        const response = await fetch(`/admin/customer/${cifNumber}/verify`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                employee_id: employeeId,
                action: action
            })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            alert(result.message);
            window.location.href = 'admin-review-queue.html';
        } else {
            alert('Error: ' + result.message);
        }
    } catch (error) {
        console.error('Error verifying customer:', error);
        alert('Error processing verification');
    }
}
