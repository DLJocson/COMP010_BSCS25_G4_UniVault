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
      displayDepositAccounts(data.accounts || []);
      displayWelcome(data.customer);
    })
    .catch(err => {
      alert('Failed to load account data: ' + err.message);
      window.location.href = '/1_frontend/Registration-Customer/login.html';
    });
});

function displayDepositAccounts(accounts) {
  // Only show Deposit accounts for this page
  const depositAccounts = accounts.filter(acc => acc.account_type && acc.account_type.toLowerCase().includes('deposit'));
  const accountInfoCard = document.querySelector('.account-info-card');
  accountInfoCard.innerHTML = '';
  if (depositAccounts.length === 0) {
    accountInfoCard.innerHTML = '<div>No deposit accounts found.</div>';
    return;
  }
  depositAccounts.forEach(acc => {
    const div = document.createElement('div');
    div.className = 'account';
    div.innerHTML = `
      <div class="account-icon"><img src="/assets/feature1.png" alt="" style="width:64px;height:64px;" /></div>
      <div class="account-field account-type">${acc.account_type || ''}</div>
      <div class="account-field account-number">${acc.account_number || ''}</div>
      <div class="account-field account-currency">${acc.currency || ''}</div>
      <div class="account-field account-balance">${acc.balance !== undefined ? acc.balance : ''}</div>
      <div class="account-field account-status">${acc.account_status || ''}</div>
    `;
    accountInfoCard.appendChild(div);
  });
  // Fill in account details (first deposit by default)
  const details = depositAccounts[0] || {};
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
    console.warn('No deposit account details found:', details);
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

// Fetch and display all customer data in the dashboard
// Assumes cif_number is stored in localStorage after login/registration

document.addEventListener('DOMContentLoaded', function() {
  const cif = localStorage.getItem('cif_number');
  if (!cif) {
    document.getElementById('customer-info').innerHTML = '<b>Error:</b> No customer ID found.';
    return;
  }
  fetch(`/api/customer/all/${cif}`)
    .then(res => res.json())
    .then(data => {
      if (data.message) {
        document.getElementById('customer-info').innerHTML = `<b>Error:</b> ${data.message}`;
        return;
      }
      // Display main info
      document.getElementById('customer-name').textContent = `${data.customer.customer_first_name} ${data.customer.customer_last_name}`;
      document.getElementById('customer-type').textContent = data.customer.customer_type;
      // Display all data as a table
      const tableDiv = document.createElement('div');
      tableDiv.style.overflowX = 'auto';
      tableDiv.innerHTML = renderAllDataTable(data);
      document.body.appendChild(tableDiv);
    })
    .catch(err => {
      document.getElementById('customer-info').innerHTML = `<b>Error:</b> ${err.message}`;
    });
});

function renderAllDataTable(data) {
  let html = '<h3>All Registration Data</h3>';
  for (const [section, rows] of Object.entries(data)) {
    if (!rows || (Array.isArray(rows) && rows.length === 0)) continue;
    html += `<h4>${section.charAt(0).toUpperCase() + section.slice(1)}</h4>`;
    if (Array.isArray(rows)) {
      html += '<table border="1" cellpadding="4" style="margin-bottom:16px; background:#fff;"><thead><tr>';
      if (rows.length > 0) {
        Object.keys(rows[0]).forEach(key => html += `<th>${key}</th>`);
        html += '</tr></thead><tbody>';
        rows.forEach(row => {
          html += '<tr>';
          Object.values(row).forEach(val => html += `<td>${val === null ? '' : val}</td>`);
          html += '</tr>';
        });
        html += '</tbody></table>';
      }
    } else if (typeof rows === 'object') {
      html += '<table border="1" cellpadding="4" style="margin-bottom:16px; background:#fff;"><tbody>';
      Object.entries(rows).forEach(([k, v]) => {
        html += `<tr><td><b>${k}</b></td><td>${v === null ? '' : v}</td></tr>`;
      });
      html += '</tbody></table>';
    }
  }
  return html;
}

document.addEventListener('DOMContentLoaded', function () {
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
});
