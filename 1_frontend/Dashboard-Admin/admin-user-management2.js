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
    
    // Set up search functionality
    const searchInput = document.getElementById('search');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(function() {
            loadEmployees(this.value);
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

async function loadEmployees(searchTerm = '') {
    try {
        let url = '/admin/employees';
        if (searchTerm) {
            url += `?search=${encodeURIComponent(searchTerm)}`;
        }
        
        const response = await fetch(url);
        const employees = await response.json();
        
        if (response.ok) {
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
    
    const statusClass = getStatusClass(employee.employee_status);
    
    card.innerHTML = `
        <div class="account">
            <div class="top-label-2">
                <label>E${employee.employee_id.toString().padStart(6, '0')}</label>
                <label>${employee.employee_last_name}</label>
                <label>${employee.employee_first_name}</label>
                <label>N/A</label>
                <label>N/A</label>
                <label class="${statusClass}">${employee.employee_status || 'Active'}</label>
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
