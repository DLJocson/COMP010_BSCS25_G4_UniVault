const deleteButton = document.getElementById("delete-account");
const pageBody = document.querySelector(".page-body");

deleteButton.addEventListener("click", () => {
  pageBody.classList.toggle("hover-enabled");
});

// Render accounts dynamically in Close Accounts page
function renderCloseAccounts(accounts) {
  const list = document.getElementById('close-accounts-list');
  if (!list) return;
  list.innerHTML = '';
  (accounts || []).forEach((acc, idx) => {
    const div = document.createElement('div');
    div.className = 'close-account-card';
    div.style = 'display: flex; align-items: center; gap: 12px; margin-bottom: 10px; background: #f5faff; border-radius: 10px; padding: 12px 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.04);';
    div.innerHTML = `
      <input type="text" value="${acc.account_name || ''}" data-field="account_name" style="width: 160px; margin-right: 8px;" ${acc.editing ? '' : 'disabled'} />
      <input type="text" value="${acc.account_number || ''}" data-field="account_number" style="width: 120px; margin-right: 8px;" ${acc.editing ? '' : 'disabled'} />
      <input type="text" value="${acc.currency || ''}" data-field="currency" style="width: 60px; margin-right: 8px;" ${acc.editing ? '' : 'disabled'} />
      <input type="text" value="${acc.balance || ''}" data-field="balance" style="width: 80px; margin-right: 8px;" ${acc.editing ? '' : 'disabled'} />
      <input type="text" value="${acc.status || ''}" data-field="status" style="width: 80px; margin-right: 8px;" ${acc.editing ? '' : 'disabled'} />
      <button class="edit-close-account-btn" data-idx="${idx}" style="margin-right: 4px;">${acc.editing ? 'Save' : 'Edit'}</button>
      <button class="delete-close-account-btn" data-idx="${idx}" style="color: #b41f1f;">Delete</button>
    `;
    list.appendChild(div);
  });
}

function renderCloseAccountStatus(accounts) {
  const statusList = document.getElementById('close-account-status-list');
  if (!statusList) return;
  statusList.innerHTML = '';
  (accounts || []).forEach(acc => {
    const div = document.createElement('div');
    div.className = 'account-status-card';
    div.innerHTML = `
      <div class="account-status-name">
        <h2 class="account-title">${acc.account_name || ''}</h2>
        <h4>${acc.account_number || ''}</h4>
      </div>
      <label class="${acc.status === 'Pending' ? 'red-text' : ''}">${acc.status || ''}</label>
    `;
    statusList.appendChild(div);
  });
}

function loadAndRenderCloseAccounts() {
  let customerData = null;
  try {
    customerData = JSON.parse(localStorage.getItem('customerData'));
  } catch (e) {}
  const accounts = (customerData && customerData.accounts) || [];
  renderCloseAccounts(accounts);
  renderCloseAccountStatus(accounts.filter(acc => acc.status === 'Pending'));
}
loadAndRenderCloseAccounts();

// Edit, Save, Delete logic for close accounts
// Use event delegation

document.addEventListener('click', function (e) {
  if (e.target.classList.contains('edit-close-account-btn')) {
    const idx = +e.target.getAttribute('data-idx');
    let customerData = JSON.parse(localStorage.getItem('customerData'));
    if (!customerData.accounts[idx].editing) {
      customerData.accounts[idx].editing = true;
      localStorage.setItem('customerData', JSON.stringify(customerData));
      loadAndRenderCloseAccounts();
    } else {
      // Save changes
      const card = e.target.closest('.close-account-card');
      ['account_name','account_number','currency','balance','status'].forEach(field => {
        customerData.accounts[idx][field] = card.querySelector(`[data-field="${field}"]`).value;
      });
      customerData.accounts[idx].editing = false;
      // TODO: Send update to backend here if needed
      localStorage.setItem('customerData', JSON.stringify(customerData));
      loadAndRenderCloseAccounts();
    }
  }
  if (e.target.classList.contains('delete-close-account-btn')) {
    const idx = +e.target.getAttribute('data-idx');
    let customerData = JSON.parse(localStorage.getItem('customerData'));
    customerData.accounts.splice(idx, 1);
    // TODO: Send delete to backend here if needed
    localStorage.setItem('customerData', JSON.stringify(customerData));
    loadAndRenderCloseAccounts();
  }
});

// LOGOUT BUTTON LOGIC (same as profile.js)
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
