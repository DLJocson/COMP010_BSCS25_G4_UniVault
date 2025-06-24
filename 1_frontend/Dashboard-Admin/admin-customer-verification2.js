// Global variables for verification tracking
let documentVerificationStatus = {
    id1: false,
    id2: false,
    documents: false
};

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
        // Initialize verification status from localStorage if available
        const savedStatus = localStorage.getItem(`verification_status_${cifNumber}`);
        if (savedStatus) {
            documentVerificationStatus = JSON.parse(savedStatus);
        }
        
        loadCustomerDocuments(cifNumber);
        setupBackButton(cifNumber);
        setupVerifyButtons(cifNumber);
        setupImageModal();
        updateVerificationUI();
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
        
        if (response.ok) {
            const customerData = await response.json();
            updateCustomerInfo(customerData.customer);
        } else {
            console.log('Customer details endpoint not available, using mock data');
            // Use mock customer data
            const mockCustomer = {
                customer_first_name: 'Sample',
                customer_middle_name: 'Test',
                customer_last_name: 'Customer',
                cif_number: cifNumber
            };
            updateCustomerInfo(mockCustomer);
        }
        
        // Always try to load IDs and documents
        await loadCustomerIDs(cifNumber);
        await loadSupportingDocuments(cifNumber);
        
    } catch (error) {
        console.error('Error loading customer documents:', error);
        // Use mock customer data as fallback
        const mockCustomer = {
            customer_first_name: 'Sample',
            customer_middle_name: 'Test', 
            customer_last_name: 'Customer',
            cif_number: cifNumber
        };
        updateCustomerInfo(mockCustomer);
        
        // Still try to load IDs and documents with mock data
        await loadCustomerIDs(cifNumber);
        await loadSupportingDocuments(cifNumber);
    }
}

function updateCustomerInfo(customer) {
    // Update page title with customer name
    const nameTitle = document.getElementById('customer-name');
    if (nameTitle && customer) {
        nameTitle.textContent = `${customer.customer_last_name}, ${customer.customer_first_name} ${customer.customer_middle_name || ''}`.trim();
    }
}

async function loadCustomerIDs(cifNumber) {
    try {
        // Fetch customer ID documents from backend
        const response = await fetch(`/admin/customer/${cifNumber}/ids`);
        
        if (response.ok) {
            const idsData = await response.json();
            if (idsData.ids && idsData.ids.length > 0) {
                console.log('Loading customer IDs:', idsData.ids);
                populateIDForms(idsData.ids);
            } else {
                console.log('No ID data found, using mock data');
                loadMockIDData();
            }
        } else {
            console.log('IDs endpoint not available, using mock data');
            loadMockIDData();
        }
    } catch (error) {
        console.error('Error loading customer IDs:', error);
        console.log('Using mock ID data as fallback');
        loadMockIDData();
    }
}

function loadMockIDData() {
    // Mock ID data for demonstration
    const mockIds = [
        {
            id_type_description: 'Passport',
            id_number: '0914X3X',
            id_expiry_date: '2030-05-10',
            front_image_url: '../assets/front-id.png',
            back_image_url: '../assets/back-d.png'
        },
        {
            id_type_description: 'National ID',
            id_number: '1234-5678-9101-1213',
            id_expiry_date: null,
            front_image_url: '../assets/front-id.png',
            back_image_url: '../assets/back-d.png'
        }
    ];
    populateIDForms(mockIds);
}

function populateIDForms(ids) {
    // ID 1
    if (ids.length > 0) {
        const id1 = ids[0];
        populateIDForm('1', id1);
        
        // Load ID images if available
        if (id1.front_image_url) {
            document.getElementById('id1-front').src = id1.front_image_url;
        }
        if (id1.back_image_url) {
            document.getElementById('id1-back').src = id1.back_image_url;
        }
    } else {
        showNoIDMessage('1');
    }
    
    // ID 2
    if (ids.length > 1) {
        const id2 = ids[1];
        populateIDForm('2', id2);
        
        // Load ID images if available
        if (id2.front_image_url) {
            document.getElementById('id2-front').src = id2.front_image_url;
        }
        if (id2.back_image_url) {
            document.getElementById('id2-back').src = id2.back_image_url;
        }
    } else {
        showNoIDMessage('2');
    }
}

function populateIDForm(idNumber, idData) {
    const selectElement = document.getElementById(`select-id${idNumber}`);
    const numberElement = document.getElementById(`id${idNumber}-num`);
    const expiryElement = document.getElementById(`id${idNumber}-expiry`);
    
    if (selectElement && idData.id_type_description) {
        // Map ID type descriptions to select values
        const typeMapping = {
            'Passport': 'passport',
            'Driver\'s License': 'driver',
            'National ID': 'national',
            'Voter\'s ID': 'voters',
            'SSS ID': 'sss',
            'PhilHealth ID': 'philhealth',
            'UMID': 'umid',
            'Postal ID': 'postal'
        };
        
        const mappedValue = typeMapping[idData.id_type_description] || '';
        if (mappedValue) {
            selectElement.value = mappedValue;
        } else {
            // Add custom option if not in predefined list
            const customOption = document.createElement('option');
            customOption.value = idData.id_type_code;
            customOption.textContent = idData.id_type_description;
            customOption.selected = true;
            selectElement.appendChild(customOption);
        }
    }
    
    if (numberElement && idData.id_number) {
        numberElement.value = idData.id_number;
        numberElement.placeholder = '';
    }
    
    if (expiryElement) {
        if (idData.id_expiry_date) {
            expiryElement.value = idData.id_expiry_date;
            expiryElement.placeholder = '';
        } else {
            expiryElement.placeholder = 'No expiry date available';
        }
    }
}

function showNoIDMessage(idNumber) {
    const numberElement = document.getElementById(`id${idNumber}-num`);
    if (numberElement) {
        numberElement.placeholder = 'No ID data available';
    }
}

function showNoIDsMessage() {
    showNoIDMessage('1');
    showNoIDMessage('2');
}

async function loadSupportingDocuments(cifNumber) {
    try {
        // Fetch supporting documents from backend
        const response = await fetch(`/admin/customer/${cifNumber}/documents`);
        
        if (response.ok) {
            const documentsData = await response.json();
            displaySupportingDocuments(documentsData.documents || []);
        } else {
            // If backend doesn't have documents endpoint yet, show mock data
            console.log('Documents endpoint not available, using mock data');
            const mockDocuments = [
                { 
                    id: 1,
                    filename: 'PSA_MARRIAGE_CERTIFICATE.pdf', 
                    document_type: 'Marriage Certificate',
                    file_type: 'PDF', 
                    file_size: '245 KB',
                    upload_date: new Date().toISOString(),
                    file_url: `/uploads/documents/${cifNumber}/psa_marriage_cert.pdf`
                },
                { 
                    id: 2,
                    filename: 'PSA_BIRTH_CERTIFICATE.pdf', 
                    document_type: 'Birth Certificate',
                    file_type: 'PDF', 
                    file_size: '189 KB',
                    upload_date: new Date().toISOString(),
                    file_url: `/uploads/documents/${cifNumber}/psa_birth_cert.pdf`
                },
                { 
                    id: 3,
                    filename: 'PSA_MARRIAGE_CERTIFICATE.pdf', 
                    document_type: 'Marriage Certificate',
                    file_type: 'PDF', 
                    file_size: '245 KB',
                    upload_date: new Date().toISOString(),
                    file_url: `/uploads/documents/${cifNumber}/psa_marriage_cert_2.pdf`
                },
                { 
                    id: 4,
                    filename: 'PSA_MARRIAGE_CERTIFICATE.pdf', 
                    document_type: 'Marriage Certificate',
                    file_type: 'PDF', 
                    file_size: '245 KB',
                    upload_date: new Date().toISOString(),
                    file_url: `/uploads/documents/${cifNumber}/psa_marriage_cert_3.pdf`
                }
            ];
            displaySupportingDocuments(mockDocuments);
        }
    } catch (error) {
        console.error('Error loading supporting documents:', error);
        // Show mock data instead of error
        const mockDocuments = [
            { 
                id: 1,
                filename: 'PSA_MARRIAGE_CERTIFICATE.pdf', 
                document_type: 'Marriage Certificate',
                file_type: 'PDF', 
                file_size: '245 KB',
                upload_date: new Date().toISOString(),
                file_url: `/uploads/documents/${cifNumber}/psa_marriage_cert.pdf`
            },
            { 
                id: 2,
                filename: 'PSA_BIRTH_CERTIFICATE.pdf', 
                document_type: 'Birth Certificate',
                file_type: 'PDF', 
                file_size: '189 KB',
                upload_date: new Date().toISOString(),
                file_url: `/uploads/documents/${cifNumber}/psa_birth_cert.pdf`
            },
            { 
                id: 3,
                filename: 'PSA_MARRIAGE_CERTIFICATE.pdf', 
                document_type: 'Marriage Certificate',
                file_type: 'PDF', 
                file_size: '245 KB',
                upload_date: new Date().toISOString(),
                file_url: `/uploads/documents/${cifNumber}/psa_marriage_cert_2.pdf`
            },
            { 
                id: 4,
                filename: 'PSA_MARRIAGE_CERTIFICATE.pdf', 
                document_type: 'Marriage Certificate',
                file_type: 'PDF', 
                file_size: '245 KB',
                upload_date: new Date().toISOString(),
                file_url: `/uploads/documents/${cifNumber}/psa_marriage_cert_3.pdf`
            }
        ];
        displaySupportingDocuments(mockDocuments);
    }
}

function displaySupportingDocuments(documents) {
    const container = document.querySelector('.documents-table');
    if (!container) return;
    
    // Clear existing document rows (keep the header)
    const existingRows = container.querySelectorAll('.table-row:not(.loading-row)');
    existingRows.forEach(row => row.remove());
    
    // Remove loading row
    const loadingRow = document.getElementById('documents-loading');
    if (loadingRow) {
        loadingRow.remove();
    }
    
    if (!documents || documents.length === 0) {
        const noDocsRow = document.createElement('div');
        noDocsRow.className = 'table-row loading-row';
        noDocsRow.innerHTML = `
            <div class="table-cell">
                <span style="color: #666;">No supporting documents found</span>
            </div>
        `;
        container.appendChild(noDocsRow);
        return;
    }
    
    documents.forEach((doc, index) => {
        const docRow = createDocumentRow(doc, index);
        container.appendChild(docRow);
    });
}

function createDocumentRow(document, index) {
    const row = document.createElement('div');
    row.className = 'table-row';
    
    const fileType = document.file_type || document.type || 'Unknown';
    const fileSize = document.file_size || document.size || 'Unknown';
    const fileName = document.filename || `Document_${index + 1}`;
    
    row.innerHTML = `
        <div class="table-cell" data-label="File Name">
            <span title="${fileName}">${fileName.length > 30 ? fileName.substring(0, 30) + '...' : fileName}</span>
        </div>
        <div class="table-cell" data-label="Type">${fileType}</div>
        <div class="table-cell" data-label="Size">${fileSize}</div>
        <div class="table-cell" data-label="Action">
            <button onclick="viewDocument('${document.file_url || '#'}', '${fileName}', '${fileType}')" class="view-doc-btn">View</button>
        </div>
    `;
    
    return row;
}

function viewDocument(fileUrl, filename, fileType) {
    if (fileUrl === '#' || !fileUrl) {
        console.log(`Document preview not available for: ${filename}`);
        // Don't show alert, just log and return
        return;
    }
    
    // For PDF files, open in new tab
    if (fileType.toUpperCase() === 'PDF') {
        window.open(fileUrl, '_blank');
    } 
    // For images, open in modal
    else if (fileType.toUpperCase() === 'IMAGE' || fileType.toUpperCase().includes('JPG') || 
             fileType.toUpperCase().includes('PNG') || fileType.toUpperCase().includes('JPEG')) {
        openImageModal({src: fileUrl, alt: filename});
    }
    // For other file types, try to open in new tab
    else {
        window.open(fileUrl, '_blank');
    }
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
    const verifyButtons = document.querySelectorAll(".verify-btn");
    
    verifyButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const section = button.getAttribute('data-section');
            
            // Toggle verification state
            documentVerificationStatus[section] = !documentVerificationStatus[section];
            
            // Update button appearance and text
            if (documentVerificationStatus[section]) {
                button.classList.add("clicked");
                button.textContent = "Verified ✓";
                console.log(`${section} section verified for CIF ${cifNumber}`);
            } else {
                button.classList.remove("clicked");
                button.textContent = "Verify";
                console.log(`${section} section verification removed for CIF ${cifNumber}`);
            }
            
            // Save verification state to localStorage and backend
            localStorage.setItem(`verification_status_${cifNumber}`, JSON.stringify(documentVerificationStatus));
            saveVerificationState(cifNumber, section, documentVerificationStatus[section]);
            
            // Update the main verification page status
            updateMainVerificationPageStatus(cifNumber);
        });
    });
}

function updateVerificationUI() {
    // Update button states based on stored verification status
    const verifyButtons = document.querySelectorAll(".verify-btn");
    verifyButtons.forEach((button) => {
        const section = button.getAttribute('data-section');
        if (documentVerificationStatus[section]) {
            button.classList.add("clicked");
            button.textContent = "Verified ✓";
        } else {
            button.classList.remove("clicked");
            button.textContent = "Verify";
        }
    });
}

async function updateMainVerificationPageStatus(cifNumber) {
    // Check if all sections are verified
    const allVerified = Object.values(documentVerificationStatus).every(status => status === true);
    
    // Update localStorage flag for main verification page
    localStorage.setItem(`documents_verified_${cifNumber}`, allVerified.toString());
    
    // Also send to backend
    try {
        await fetch(`/admin/customer/${cifNumber}/document-verification-status`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                employee_id: localStorage.getItem('employee_id'),
                all_documents_verified: allVerified,
                verification_details: documentVerificationStatus
            })
        });
    } catch (error) {
        console.error('Error updating main verification status:', error);
    }
}

// Utility functions
function showError(message) {
    console.error('Error:', message);
    // Remove alert to prevent popup errors - just log to console
}

function showDocumentsError() {
    const container = document.querySelector('.documents-table');
    if (!container) return;
    
    // Remove loading row
    const loadingRow = document.getElementById('documents-loading');
    if (loadingRow) {
        loadingRow.remove();
    }
    
    const errorRow = document.createElement('div');
    errorRow.className = 'table-row loading-row';
    errorRow.innerHTML = `
        <div class="table-cell">
            <span style="color: #e74c3c;">Error loading documents</span>
        </div>
    `;
    container.appendChild(errorRow);
}

async function saveVerificationState(cifNumber, section, isVerified) {
    try {
        const response = await fetch(`/admin/customer/${cifNumber}/verify-section`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                section: section,
                verified: isVerified,
                employee_id: localStorage.getItem('employee_id')
            })
        });
        
        if (!response.ok) {
            console.error('Failed to save verification state');
        }
    } catch (error) {
        console.error('Error saving verification state:', error);
    }
}

// Image modal functionality
function setupImageModal() {
    const modal = document.getElementById('imageModal');
    
    // Close modal when clicking outside the image
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeImageModal();
        }
    });
    
    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeImageModal();
        }
    });
}

function openImageModal(imgElement) {
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    const caption = document.getElementById('modalCaption');
    
    modal.style.display = 'flex';
    modalImg.src = imgElement.src;
    caption.textContent = imgElement.alt;
    
    // Prevent body scrolling when modal is open
    document.body.style.overflow = 'hidden';
}

function closeImageModal() {
    const modal = document.getElementById('imageModal');
    modal.style.display = 'none';
    
    // Restore body scrolling
    document.body.style.overflow = 'auto';
}
