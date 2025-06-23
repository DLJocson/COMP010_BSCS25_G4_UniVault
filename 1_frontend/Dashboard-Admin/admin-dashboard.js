document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const employeeId = localStorage.getItem('employee_id');
    const employeeUsername = localStorage.getItem('employee_username');
    
    if (!employeeId || !employeeUsername) {
        window.location.href = 'admin-login.html';
        return;
    }

    // Load dashboard statistics
    loadDashboardStats();
    
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

async function loadDashboardStats() {
    try {
        const response = await fetch('/admin/dashboard-stats');
        const stats = await response.json();
        
        if (response.ok) {
            // Update the statistics cards
            updateStatCard('rejected', stats.rejectedApplications);
            updateStatCard('pending-applications', stats.pendingVerifications);
            updateStatCard('pending-approvals', stats.pendingApprovals);
            updateStatCard('new-accounts', stats.newAccounts);
            updateStatCard('verified', stats.verifiedCustomers);
            updateStatCard('total-customers', stats.totalCustomers);
            
            // Create chart if data is available
            if (stats.monthlyStats && stats.monthlyStats.length > 0) {
                createMonthlyChart(stats.monthlyStats);
            }
        } else {
            console.error('Failed to load dashboard stats:', stats.message);
        }
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
    }
}

function updateStatCard(cardClass, value) {
    const card = document.querySelector(`.${cardClass} .number`);
    if (card) {
        card.textContent = value || '0';
    }
}

function createMonthlyChart(monthlyData) {
    const ctx = document.getElementById('myChart');
    if (!ctx) return;
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const data = new Array(12).fill(0);
    
    // Fill data array with actual values
    monthlyData.forEach(item => {
        if (item.month >= 1 && item.month <= 12) {
            data[item.month - 1] = item.registrations;
        }
    });
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: months,
            datasets: [{
                label: 'New Registrations',
                data: data,
                borderColor: 'rgb(54, 162, 235)',
                backgroundColor: 'rgba(54, 162, 235, 0.1)',
                tension: 0.1
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
                }
            }
        }
    });
}
