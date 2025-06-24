document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const employeeId = localStorage.getItem('employee_id');
    const employeeUsername = localStorage.getItem('employee_username');
    
    if (!employeeId || !employeeUsername) {
        window.location.href = 'admin-login.html';
        return;
    }

    // Load employees
    loadEmployees();
    
    // Initialize search functionality
    initializeEmployeeSearch();
    
    // Logout functionality is handled by logout-fix.js
});

async function loadEmployees() {
    try {
        const response = await fetch('/admin/employees');
        const employees = await response.json();
        
        if (response.ok) {
            allEmployeesData = employees; // Store for search functionality
            displayEmployees(employees);
        } else {
            console.error('Failed to load employees:', employees.message);
        }
    } catch (error) {
        console.error('Error loading employees:', error);
    }
}

function displayEmployees(employees) {
    const container = document.querySelector('.transaction-info');
    if (!container) return;
    
    // Clear existing employee cards (keep the header)
    const existingCards = container.querySelectorAll('.account-info-card');
    existingCards.forEach(card => card.remove());
    
    employees.forEach(employee => {
        const employeeCard = createEmployeeCard(employee);
        container.appendChild(employeeCard);
    });
}

function createEmployeeCard(employee) {
    const card = document.createElement('div');
    card.className = 'account-info-card';
    
    card.innerHTML = `
        <div class="account">
            <div class="top-label-2">
                <label>E${employee.employee_id.toString().padStart(6, '0')}</label>
                <label>${employee.employee_last_name}</label>
                <label>${employee.employee_first_name}</label>
                <label>${employee.employee_middle_name || 'N/A'}</label>
                <label>${employee.employee_suffix_name || 'N/A'}</label>
                <label>${employee.employee_position}</label>
                <label class="blue-text">Active</label>
            </div>
        </div>
    `;
    
    return card;
}

function getStatusClass(status) {
    switch(status) {
        case 'Active': return 'blue-text';
        case 'Inactive': return 'orange-text';
        case 'Suspended': return 'red-text';
        default: return 'blue-text';
    }
}

let allEmployeesData = [];
let employeeSearchDebounceTimer;

function initializeEmployeeSearch() {
    const searchInput = document.getElementById('employeeSearchBar');
    if (!searchInput) {
        console.error('Employee search input not found');
        return;
    }
    
    searchInput.addEventListener('input', function(e) {
        const searchTerm = e.target.value.trim();
        
        // Clear previous timer
        clearTimeout(employeeSearchDebounceTimer);
        
        // Debounce the search
        employeeSearchDebounceTimer = setTimeout(() => {
            if (searchTerm.length === 0) {
                // Show all employees when search is empty
                displayEmployees(allEmployeesData);
            } else if (searchTerm.length >= 2) {
                // Perform search
                performEmployeeSearch(searchTerm);
            }
        }, 300);
    });
    
    // Clear search when input is cleared
    searchInput.addEventListener('keyup', function(e) {
        if (e.target.value === '') {
            displayEmployees(allEmployeesData);
        }
    });
}

function performEmployeeSearch(searchTerm) {
    const searchLower = searchTerm.toLowerCase();
    
    const filteredEmployees = allEmployeesData.filter(employee => {
        return (
            (employee.employee_id && employee.employee_id.toString().includes(searchLower)) ||
            (employee.employee_first_name && employee.employee_first_name.toLowerCase().includes(searchLower)) ||
            (employee.employee_last_name && employee.employee_last_name.toLowerCase().includes(searchLower)) ||
            (employee.employee_middle_name && employee.employee_middle_name.toLowerCase().includes(searchLower)) ||
            (employee.employee_suffix_name && employee.employee_suffix_name.toLowerCase().includes(searchLower)) ||
            (employee.employee_position && employee.employee_position.toLowerCase().includes(searchLower)) ||
            (employee.employee_username && employee.employee_username.toLowerCase().includes(searchLower))
        );
    });
    
    displayEmployees(filteredEmployees);
    
    // Show no results message if needed
    if (filteredEmployees.length === 0) {
        showNoEmployeesFound();
    }
}

function showNoEmployeesFound() {
    const container = document.querySelector('.transaction-info');
    if (!container) return;
    
    // Clear existing employee cards (keep the header)
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
            🔍 No employees found
        </div>
        <div style="color: #adb5bd; font-size: 14px; margin-top: 8px;">
            Try adjusting your search terms
        </div>
    `;
    container.appendChild(noResultsCard);
}


