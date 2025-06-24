// Universal login check and redirect for dashboard pages
function requireLogin() {
  const cif = localStorage.getItem('cif_number');
  if (!cif) {
    alert('Session expired or not logged in. Redirecting to login page.');
    window.location.href = '/1_frontend/Registration-Customer/login.html';
    return false;
  }
  return true;
}

document.addEventListener('DOMContentLoaded', function() {
  const logoutBtn = document.getElementById('log-out');
  const logoutTextBtn = document.getElementById('logout-text-btn');
  function doLogout() {
    localStorage.clear();
    window.location.href = '../Registration-Customer/login.html';
  }
  if (logoutBtn) {
    logoutBtn.addEventListener('click', doLogout);
  }
  if (logoutTextBtn) {
    logoutTextBtn.addEventListener('click', doLogout);
  }

  if (!requireLogin()) return;
  // Only use cif_number from localStorage (set after login)
  const cif = localStorage.getItem('cif_number');
  if (!cif) {
    alert('No customer ID found. Please log in again.');
    return;
  }
  fetch(`/api/customer/${cif}`)
    .then(res => res.json())
    .then(data => {
      if (data.message) {
        alert(data.message);
        window.location.href = '/1_frontend/Registration-Customer/login.html';
        return;
      }
      displayWealthAccounts(data.accounts || []);
      displayWelcome(data.customer);
    })
    .catch(err => {
      alert('Failed to load account data: ' + err.message);
      window.location.href = '/1_frontend/Registration-Customer/login.html';
    });
});

function displayWealthAccounts(accounts) {
  // Only show Wealth Management accounts for this page
  const wealthAccounts = accounts.filter(acc => acc.account_type && acc.account_type.toLowerCase().includes('wealth'));
  const wealthInfoCard = document.querySelector('.account-info-card');
  wealthInfoCard.innerHTML = '';
  if (wealthAccounts.length === 0) {
    wealthInfoCard.innerHTML = '<div>No wealth management accounts found.</div>';
    return;
  }
  wealthAccounts.forEach(acc => {
    const div = document.createElement('div');
    div.className = 'account';
    div.innerHTML = `
      <div class="account-icon"><img src="/assets/feature3.png" alt="" style="width:64px;height:64px;" /></div>
      <div class="account-field account-type">${acc.account_type || ''}</div>
      <div class="account-field account-number">${acc.account_number || ''}</div>
      <div class="account-field account-currency">${acc.currency || ''}</div>
      <div class="account-field account-balance">${acc.balance !== undefined ? acc.balance : ''}</div>
      <div class="account-field account-status">${acc.account_status || ''}</div>
    `;
    wealthInfoCard.appendChild(div);
  });
  // Fill in account details (first wealth account by default)
  const details = wealthAccounts[0] || {};
  if (document.querySelector('.account-nickname textarea'))
    document.querySelector('.account-nickname textarea').value = details.nickname || '';
  if (document.querySelector('.account-number textarea'))
    document.querySelector('.account-number textarea').value = details.account_number || '';
  if (document.querySelector('.open-date textarea'))
    document.querySelector('.open-date textarea').value = details.open_date || '';
  if (document.querySelector('.close-date textarea'))
    document.querySelector('.close-date textarea').value = details.close_date || '';
  if (document.querySelector('.current-balance textarea'))
    document.querySelector('.current-balance textarea').value = details.balance ? details.balance.toLocaleString() : '';
  if (document.querySelector('.biometrics-type textarea'))
    document.querySelector('.biometrics-type textarea').value = details.biometrics_type || '';
  // Debugging logs
  if (!details.nickname && !details.account_number) {
    console.warn('No wealth management account details found:', details);
  }
}

function displayWelcome(customer) {
  // Defensive: fallback to default if missing
  let name = 'Customer';
  if (customer && customer.customer_first_name) {
    name = customer.customer_first_name;
  } else {
    console.warn('Customer data missing or no first name:', customer);
  }
  const welcome = document.querySelector('.welcome .blue-text');
  if (welcome) welcome.textContent = name + '!';
  // Show last login time if available
  const lastLoginSpan = document.querySelector('.welcome-message p span');
  if (lastLoginSpan) {
    let lastLogin = localStorage.getItem('last_login');
    if (!lastLogin) {
      lastLogin = new Date().toLocaleString();
      localStorage.setItem('last_login', lastLogin);
    }
    lastLoginSpan.textContent = lastLogin;
  }
}
