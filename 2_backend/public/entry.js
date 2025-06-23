document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const usernameInput = document.getElementById('usernameInput');
    const passwordInput = document.getElementById('passwordInput');

    fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            customer_username: usernameInput.value,
            customer_password: passwordInput.value
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.cif_number) {
            window.location.href = `/Dashboard-Customer/account1.html?cif_number=${data.cif_number}`;
        } else {
            alert(data.message || 'Login failed');
        }
    });
});