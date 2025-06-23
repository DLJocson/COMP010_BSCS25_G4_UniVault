document.getElementById('adminLoginForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('error-message');
    const loginBtn = document.getElementById('loginBtn');

    errorDiv.style.display = 'none';
    loginBtn.disabled = true;
    loginBtn.textContent = 'Logging In...';

    try {
        const response = await fetch('/admin/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                employee_username: username,
                employee_password: password
            })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('employee_id', data.employee_id);
            localStorage.setItem('employee_username', username);
            localStorage.setItem('employee_position', data.employee_position);

            window.location.href = 'admin-dashboard.html';
        } else {
            errorDiv.textContent = data.message || 'Login failed';
            errorDiv.style.display = 'block';
        }
    } catch (error) {
        console.error('Admin login error:', error);
        errorDiv.textContent = 'Connection error. Please try again.';
        errorDiv.style.display = 'block';
    } finally {
        loginBtn.disabled = false;
        loginBtn.textContent = 'Login';
    }
});
