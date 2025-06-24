document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const employeeId = localStorage.getItem('employee_id');
    const employeeUsername = localStorage.getItem('employee_username');
    
    if (!employeeId || !employeeUsername) {
        window.location.href = 'admin-login.html';
        return;
    }

    // Update all date labels with current date
    updateDateLabels();
    
    // Load dashboard statistics
    loadDashboardStats();
    
    // Logout functionality is handled by logout-fix.js
});

function updateDateLabels() {
    const today = new Date();
    const formattedDate = `${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}/${today.getFullYear()}`;
    
    const dateElements = [
        'rejected-date',
        'pending-applications-date', 
        'pending-approvals-date',
        'monthly-stats-date',
        'new-accounts-date',
        'verified-date',
        'total-customers-date'
    ];
    
    dateElements.forEach(elementId => {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = `as of ${formattedDate}`;
        }
    });
}

async function loadDashboardStats() {
    try {
        // Show loading state
        showLoadingState();
        
        const response = await fetch('/admin/dashboard-stats');
        const stats = await response.json();
        
        if (response.ok) {
            // Update the statistics cards with proper IDs
            updateStatById('rejected-count', stats.rejectedApplications || 0);
            updateStatById('pending-applications-count', stats.pendingVerifications || 0);
            updateStatById('pending-approvals-count', stats.pendingApprovals || 0);
            updateStatById('new-accounts-count', stats.newAccounts || 0);
            updateStatById('verified-count', stats.verifiedCustomers || 0);
            updateStatById('total-customers-count', stats.totalCustomers || 0);
            
            // Create chart if data is available
            if (stats.monthlyStats && stats.monthlyStats.length > 0) {
                createMonthlyChart(stats.monthlyStats);
            } else {
                // Show empty chart with message
                createEmptyChart();
            }
            
            console.log('✅ Dashboard stats loaded successfully:', stats);
        } else {
            console.error('Failed to load dashboard stats:', stats.message);
            showErrorState(stats.message || 'Failed to load dashboard statistics');
        }
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
        showErrorState('Unable to connect to server. Please try again later.');
    }
}

function showLoadingState() {
    const countElements = [
        'rejected-count',
        'pending-applications-count', 
        'pending-approvals-count',
        'new-accounts-count',
        'verified-count',
        'total-customers-count'
    ];
    
    countElements.forEach(elementId => {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = '...';
        }
    });
}

function showErrorState(message) {
    const countElements = [
        'rejected-count',
        'pending-applications-count', 
        'pending-approvals-count',
        'new-accounts-count',
        'verified-count',
        'total-customers-count'
    ];
    
    countElements.forEach(elementId => {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = 'Error';
            element.style.color = '#dc3545';
        }
    });
    
    // Show error message to user
    console.error('Dashboard Error:', message);
    // Optionally show a user-friendly notification
}

function updateStatById(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = value || '0';
        element.style.color = ''; // Reset any error styling
    }
}

function createMonthlyChart(monthlyData) {
    const ctx = document.getElementById('myChart');
    if (!ctx) return;
    
    // Clear any existing chart
    if (window.dashboardChart && typeof window.dashboardChart.destroy === 'function') {
        window.dashboardChart.destroy();
    }
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const data = new Array(12).fill(0);
    
    // Fill data array with actual values
    monthlyData.forEach(item => {
        if (item.month >= 1 && item.month <= 12) {
            data[item.month - 1] = item.registrations;
        }
    });
    
    console.log('📊 Creating chart with data:', data);
    
    window.dashboardChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: months,
            datasets: [{
                label: 'New Registrations',
                data: data,
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                title: {
                    display: true,
                    text: 'Monthly Customer Registrations'
                }
            }
        }
    });
}

function createEmptyChart() {
    const ctx = document.getElementById('myChart');
    if (!ctx) return;
    
    // Clear any existing chart
    if (window.dashboardChart && typeof window.dashboardChart.destroy === 'function') {
        window.dashboardChart.destroy();
    }
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const data = new Array(12).fill(0);
    
    console.log('📊 Creating empty chart');
    
    window.dashboardChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: months,
            datasets: [{
                label: 'New Registrations',
                data: data,
                backgroundColor: 'rgba(200, 200, 200, 0.3)',
                borderColor: 'rgba(200, 200, 200, 0.5)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                title: {
                    display: true,
                    text: 'No registration data available'
                }
            }
        }
    });
}
