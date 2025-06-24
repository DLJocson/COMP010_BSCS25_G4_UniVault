// profile.js
// Handles edit/save logic for the profile page and dynamic name

document.addEventListener('DOMContentLoaded', function () {
  const editBtn = document.getElementById('edit-profile-btn');
  const editTextBtn = document.getElementById('edit-profile-text-btn');
  const saveBtn = document.getElementById('save-profile-btn');
  const cancelBtn = document.getElementById('cancel-profile-btn');
  const actionBtns = document.getElementById('profile-action-btns');
  const inputs = document.querySelectorAll('input[type="text"]');
  const welcomeName = document.getElementById('profile-first-name');
  const logoutBtn = document.getElementById('logout-btn');
  const logoutTextBtn = document.getElementById('logout-text-btn');

  // Helper to set input values
  function setValue(id, value) {
    const el = document.getElementById(id);
    if (el) el.value = value || '';
  }

  // Helper function to format date as YYYY-MM-DD
  function formatDateToYMD(dateString) {
    if (!dateString) return '';
    const d = new Date(dateString);
    if (isNaN(d)) return dateString;
    return d.toISOString().split('T')[0];
  }

  // Populate all profile fields with customer data
  function populateProfile(data) {
    // Main customer info (using your provided field names)
    const c = data.customer || {};
    setValue('first-name', c.customer_first_name);
    setValue('middle-name', c.customer_middle_name);
    setValue('last-name', c.customer_last_name);
    setValue('suffix-name', c.customer_suffix_name);
    setValue('date', c.birth_date);
    setValue('country-of-birth', c.birth_country);
    setValue('citizenship', c.citizenship);
    setValue('gender', c.gender);
    setValue('civil-status', c.civil_status_code);
    setValue('residency', c.residency_status);
    setValue('mobile-number', c.mobile_number); // If available
    setValue('landline-number', c.landline_number); // If available
    setValue('email-address', c.email_address); // If available

    // Set profile header first name
    const welcomeName = document.getElementById('profile-first-name');
    if (welcomeName && c.customer_first_name) {
      welcomeName.textContent = c.customer_first_name;
    }

    // Home Address (from CUSTOMER_ADDRESS table, type AD01)
    let homeAddress = (Array.isArray(data.addresses) ? data.addresses.find(a => a.address_type_code === 'AD01') : null) || {};
    setValue('unit', homeAddress.address_unit);
    setValue('building', homeAddress.address_building);
    setValue('street', homeAddress.address_street);
    setValue('subdivision', homeAddress.address_subdivision);
    setValue('barangay', homeAddress.address_barangay);
    setValue('city', homeAddress.address_city);
    setValue('province', homeAddress.address_province);
    setValue('country', homeAddress.address_country);
    setValue('zip-code', homeAddress.address_zip_code);
    // Alternate Address (from CUSTOMER_ADDRESS table, type AD02)
    let altAddress = (Array.isArray(data.addresses) ? data.addresses.find(a => a.address_type_code === 'AD02') : null) || {};
    setValue('alt-unit', altAddress.address_unit);
    setValue('alt-building', altAddress.address_building);
    setValue('alt-street', altAddress.address_street);
    setValue('alt-subdivision', altAddress.address_subdivision);
    setValue('alt-barangay', altAddress.address_barangay);
    setValue('alt-city', altAddress.address_city);
    setValue('alt-province', altAddress.address_province);
    setValue('alt-country', altAddress.address_country);
    setValue('alt-zip-code', altAddress.address_zip_code);
    // TIN
    setValue('tin-number', c.tax_identification_number);
    // Employment & Financial Data (from customer table)
    setValue('primary-employer', c.employer_business_name);
    setValue('work-email-address', c.work_email_address);
    setValue('work-landline-number', c.work_landline_number);
    setValue('position', c.position_code);
    setValue('monthly-income', c.income_monthly_gross);
    // Work/Business Address (from customer table)
    setValue('work-unit', c.address_unit);
    setValue('work-building', c.address_building);
    setValue('work-street', c.address_street);
    setValue('work-subdivision', c.address_subdivision);
    setValue('work-barangay', c.address_barangay);
    setValue('work-city', c.address_city);
    setValue('work-province', c.address_province);
    setValue('work-country', c.address_country);
    setValue('work-zip-code', c.address_zip_code);
    // Work/Business Nature
    setValue('work-business-nature', c.business_nature_multi || '');
    // Fund Source
    setValue('source-of-fund', c.source_of_funds_multi || '');
    // Aliases (array)
    const aliasCheckbox = document.getElementById('has-alias-checkbox');
    if (Array.isArray(data.aliases) && data.aliases.length > 0) {
      const alias = data.aliases[0] || {};
      setValue('alias-first-name', alias.alias_first_name);
      setValue('alias-middle-name', alias.alias_middle_name);
      setValue('alias-last-name', alias.alias_last_name);
      if (aliasCheckbox) aliasCheckbox.checked = false;
    } else {
      setValue('alias-first-name', '');
      setValue('alias-middle-name', '');
      setValue('alias-last-name', '');
      if (aliasCheckbox) aliasCheckbox.checked = true;
    }
    // --- ID Section ---
    // Remove ID Section rendering
    // const idSection = document.getElementById('profile-id-section');
    // if (idSection) {
    //   idSection.innerHTML = '';
    //   (data.ids || []).forEach((id, idx) => {
    //     const div = document.createElement('div');
    //     div.className = 'profile-id-card';
    //     div.style = 'margin-bottom: 16px; padding: 12px; border: 1px solid #e0e0e0; border-radius: 8px; background: #f9f9f9;';
    //     div.innerHTML = `
    //       <div><b>ID Type:</b> ${id.id_type_code || ''}</div>
    //       <div><b>ID Number:</b> ${id.id_number || ''}</div>
    //       <div><b>Issue Date:</b> ${id.id_issue_date || ''}</div>
    //       <div><b>Expiry Date:</b> ${id.id_expiry_date || ''}</div>
    //       <div style="display: flex; gap: 16px; margin-top: 8px;">
    //         ${id.id_front_image ? `<div><b>Front Image:</b><br><img src="${id.id_front_image}" alt="Front ID" style="max-width:120px;max-height:80px;border:1px solid #ccc;" /></div>` : ''}
    //         ${id.id_back_image ? `<div><b>Back Image:</b><br><img src="${id.id_back_image}" alt="Back ID" style="max-width:120px;max-height:80px;border:1px solid #ccc;" /></div>` : ''}
    //       </div>
    //     `;
    //     idSection.appendChild(div);
    //   });
    // }
  }

  // Get cif_number from localStorage or URL
  function getCifNumber() {
    let cif = localStorage.getItem('cif_number');
    if (!cif) {
      // Try to get from URL if needed
      const match = window.location.href.match(/cif_number=(\d+)/);
      if (match) cif = match[1];
    }
    return cif;
  }

  // Try to get customer data from localStorage
  let customerData = null;
  try {
    customerData = JSON.parse(localStorage.getItem('customerData'));
  } catch (e) {}

  if (customerData) {
    populateProfile(customerData);
  } else {
    // Fetch from backend if not in localStorage
    const cif_number = getCifNumber();
    if (cif_number) {
      fetch(`/api/customer/${cif_number}`)
        .then(res => res.json())
        .then(data => {
          localStorage.setItem('customerData', JSON.stringify(data));
          populateProfile(data);
        })
        .catch(() => {
          // Optionally show error
        });
    }
  }

  // Enable edit mode
  if (editBtn) {
    editBtn.addEventListener('click', function () {
      inputs.forEach(input => input.disabled = false);
      editBtn.style.display = 'none';
      if (editTextBtn) editTextBtn.style.display = 'none';
      if (saveBtn) {
        saveBtn.style.display = 'block';
        saveBtn.style.position = 'absolute';
        saveBtn.style.right = '0';
      }
      if (cancelBtn) {
        cancelBtn.style.display = 'block';
        cancelBtn.style.position = 'absolute';
        cancelBtn.style.right = '130px';
      }
      // Store original values for cancel
      window._originalProfileValues = {};
      inputs.forEach(input => {
        window._originalProfileValues[input.id] = input.value;
      });
    });
  }
  if (editTextBtn) {
    editTextBtn.addEventListener('click', function () {
      if (editBtn) editBtn.click();
    });
  }
  if (saveBtn) {
    saveBtn.addEventListener('click', function () {
      // Collect edited data
      const updatedData = {};
      inputs.forEach(input => {
        let value = input.value;
        // Format date field to YYYY-MM-DD if it's a date
        if (input.id === 'date' && value) {
          // Accept ISO or date string, output YYYY-MM-DD
          const d = new Date(value);
          if (!isNaN(d)) {
            value = d.toISOString().slice(0, 10);
          }
        }
        // Convert empty strings to null
        if (value === '') value = null;
        updatedData[input.id] = value;
      });
      // Send to backend
      const cif_number = localStorage.getItem('cif_number');
      saveBtn.disabled = true;
      saveBtn.textContent = 'Saving...';
      fetch(`/api/customer/${cif_number}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      })
        .then(res => res.json())
        .then((result) => {
          saveBtn.disabled = false;
          saveBtn.textContent = 'Save';
          if (result && result.message && result.message.toLowerCase().includes('updated')) {
            // Fetch latest data and update UI
            fetch(`/api/customer/${cif_number}`)
              .then(res => res.json())
              .then(data => {
                localStorage.setItem('customerData', JSON.stringify(data));
                populateProfile(data);
                inputs.forEach(input => input.disabled = true);
                if (editBtn) editBtn.style.display = 'flex';
                if (editTextBtn) editTextBtn.style.display = 'inline-block';
                if (saveBtn) saveBtn.style.display = 'none';
                if (cancelBtn) cancelBtn.style.display = 'none';
                // --- REDIRECT TO CONSENT FORM ---
                window.location.href = 'update-profile4.html?cif_number=' + cif_number;
              });
          } else if (result && result.message && result.message.toLowerCase().includes('no changes')) {
            alert('No changes detected.');
            inputs.forEach(input => input.disabled = true);
            if (editBtn) editBtn.style.display = 'flex';
            if (editTextBtn) editTextBtn.style.display = 'inline-block';
            if (saveBtn) saveBtn.style.display = 'none';
            if (cancelBtn) cancelBtn.style.display = 'none';
          } else {
            alert('Failed to update profile.');
          }
        })
        .catch(() => {
          saveBtn.disabled = false;
          saveBtn.textContent = 'Save';
          alert('Error updating profile.');
        });
    });
  }
  if (cancelBtn) {
    cancelBtn.addEventListener('click', function () {
      // Restore original values
      if (window._originalProfileValues) {
        inputs.forEach(input => {
          input.value = window._originalProfileValues[input.id] || '';
        });
      }
      // Disable fields and restore buttons
      inputs.forEach(input => input.disabled = true);
      if (editBtn) editBtn.style.display = 'flex';
      if (editTextBtn) editTextBtn.style.display = 'inline-block';
      if (saveBtn) saveBtn.style.display = 'none';
      if (cancelBtn) cancelBtn.style.display = 'none';
    });
  }
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function () {
      localStorage.clear();
      window.location.href = '../Registration-Customer/login.html';
    });
  }
  if (logoutTextBtn) {
    logoutTextBtn.addEventListener('click', function () {
      if (logoutBtn) logoutBtn.click();
    });
  }

  // --- ACCOUNTS SECTION ---
  function renderAccounts(accounts) {
    const list = document.getElementById('profile-accounts-list');
    if (!list) return;
    list.innerHTML = '';
    (accounts || []).forEach((acc, idx) => {
      const div = document.createElement('div');
      div.className = 'profile-account-card';
      div.style = 'display: flex; align-items: center; gap: 12px; margin-bottom: 10px; background: #f5faff; border-radius: 10px; padding: 12px 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.04);';
      div.innerHTML = `
        <input type="text" value="${acc.account_name || ''}" data-field="account_name" style="width: 160px; margin-right: 8px;" ${acc.editing ? '' : 'disabled'} />
        <input type="text" value="${acc.account_number || ''}" data-field="account_number" style="width: 120px; margin-right: 8px;" ${acc.editing ? '' : 'disabled'} />
        <input type="text" value="${acc.currency || ''}" data-field="currency" style="width: 60px; margin-right: 8px;" ${acc.editing ? '' : 'disabled'} />
        <input type="text" value="${acc.balance || ''}" data-field="balance" style="width: 80px; margin-right: 8px;" ${acc.editing ? '' : 'disabled'} />
        <input type="text" value="${acc.status || ''}" data-field="status" style="width: 80px; margin-right: 8px;" ${acc.editing ? '' : 'disabled'} />
        <button class="edit-account-btn" data-idx="${idx}" style="margin-right: 4px;">${acc.editing ? 'Save' : 'Edit'}</button>
        <button class="delete-account-btn" data-idx="${idx}" style="color: #b41f1f;">Delete</button>
      `;
      list.appendChild(div);
    });
  }

  // Load and render accounts on page load
  function loadAndRenderAccounts() {
    let customerData = null;
    try {
      customerData = JSON.parse(localStorage.getItem('customerData'));
    } catch (e) {}
    const accounts = (customerData && customerData.accounts) || [];
    renderAccounts(accounts);
  }
  loadAndRenderAccounts();

  // Edit, Save, Delete logic for accounts
  document.addEventListener('click', function (e) {
    if (e.target.classList.contains('edit-account-btn')) {
      const idx = +e.target.getAttribute('data-idx');
      let customerData = JSON.parse(localStorage.getItem('customerData'));
      if (!customerData.accounts[idx].editing) {
        customerData.accounts[idx].editing = true;
        localStorage.setItem('customerData', JSON.stringify(customerData));
        renderAccounts(customerData.accounts);
      } else {
        // Save changes
        const card = e.target.closest('.profile-account-card');
        ['account_name','account_number','currency','balance','status'].forEach(field => {
          customerData.accounts[idx][field] = card.querySelector(`[data-field="${field}"]`).value;
        });
        customerData.accounts[idx].editing = false;
        // TODO: Send update to backend here if needed
        localStorage.setItem('customerData', JSON.stringify(customerData));
        renderAccounts(customerData.accounts);
      }
    }
    if (e.target.classList.contains('delete-account-btn')) {
      const idx = +e.target.getAttribute('data-idx');
      let customerData = JSON.parse(localStorage.getItem('customerData'));
      customerData.accounts.splice(idx, 1);
      // TODO: Send delete to backend here if needed
      localStorage.setItem('customerData', JSON.stringify(customerData));
      renderAccounts(customerData.accounts);
    }
  });

  // Add account logic
  const addAccountBtn = document.getElementById('add-account-btn');
  if (addAccountBtn) {
    addAccountBtn.addEventListener('click', function () {
      let customerData = JSON.parse(localStorage.getItem('customerData'));
      customerData.accounts = customerData.accounts || [];
      customerData.accounts.push({ account_name: '', account_number: '', currency: '', balance: '', status: '', editing: true });
      localStorage.setItem('customerData', JSON.stringify(customerData));
      renderAccounts(customerData.accounts);
    });
  }
});
