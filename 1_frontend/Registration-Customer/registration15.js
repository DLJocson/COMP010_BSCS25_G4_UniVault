document.addEventListener("DOMContentLoaded", function () {
  function clearFieldError(field) {
    if (!field) return;
    field.style.borderColor = "#0072d8";
    field.classList.remove("error");
    const parent = field.parentNode;
    if (parent) {
      const errorMsg = parent.querySelector(".error-message");
      if (errorMsg) {
        errorMsg.textContent = "";
        errorMsg.style.display = "none";
      }
      let next = field.nextElementSibling;
      if (next && next.classList && next.classList.contains("error-message")) {
        next.textContent = "";
        next.style.display = "none";
      }
    }
  }

  function showError(input, message) {
    if (!input) return;
    input.style.borderColor = "#ff3860";
    input.classList.add("error");
    const parent = input.parentNode;
    let errorDiv = parent.querySelector(".error-message");
    if (!errorDiv) {
      errorDiv = document.createElement("div");
      errorDiv.className = "error-message";
      parent.appendChild(errorDiv);
    }
    errorDiv.textContent = message;
    errorDiv.style.display = "block";
    errorDiv.style.color = "#ff3860";
    errorDiv.style.fontSize = "20px";
    errorDiv.style.marginTop = "5px";
    errorDiv.style.marginBottom = "10px";
  }

  function validateForm() {
    let isValid = true;
    const biometricType = document.getElementById("biometric-type");
    if (biometricType && biometricType.value.trim() === "") {
      showError(biometricType, "Please select a biometric type.");
      isValid = false;
    } else {
      clearFieldError(biometricType);
    }
    return isValid;
  }

  // Collect all registration data from localStorage
  function collectRegistrationData() {
    // Key mapping from frontend localStorage to backend expected keys
    const keyMap = {
      // User info
      'username': 'customer_username',
      'password': 'customer_password',
      'birth_date': 'birth_date',
      'gender': 'gender',
      'civil_status_code': 'civil_status_code',
      'birth_country': 'birth_country',
      'citizenship': 'citizenship',
      // Address
      'address_unit': 'address_unit',
      'address_building': 'address_building',
      'address_street': 'address_street',
      'address_subdivision': 'address_subdivision',
      'address_barangay': 'address_barangay',
      'address_city': 'address_city',
      'address_province': 'address_province',
      'address_country': 'address_country',
      'address_zip_code': 'address_zip_code',
      // Contact
      'phoneNumber': 'contact_value_phone',
      'emailAddress': 'contact_value_email',
      // Fund source
      'fund_source_code': 'fund_source_code',
      // IDs
      'id1Type': 'id1Type',
      'id1Number': 'id1Number',
      'id1FrontImagePath': 'id1FrontImagePath',
      'id2Type': 'id2Type',
      'id2Number': 'id2Number',
      'id2FrontImagePath': 'id2FrontImagePath',
      // Regulatory
      'purpose-political': 'reg_political_affiliation',
      'purpose_fatca': 'reg_fatca',
      'purpose-dnfbp': 'reg_dnfbp',
      'purpose_online_gaming': 'reg_online_gaming',
      'purpose_beneficial_owner': 'reg_beneficial_owner',
      'reg_political_affiliation': 'reg_political_affiliation',
      'reg_fatca': 'reg_fatca',
      'reg_dnfbp': 'reg_dnfbp',
      'reg_online_gaming': 'reg_online_gaming',
      'reg_beneficial_owner': 'reg_beneficial_owner',
      // Remittance
      'remittance-country': 'remittance_country',
      'remittance-purpose': 'remittance_purpose',
      // Biometrics
      'biometric_type': 'biometric_type',
    };
    const registrationData = {};
    let fundSourceCode = null;
    let remittanceCountry = null;
    let remittancePurpose = null;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key === 'cif_number') continue;
      if (key.endsWith('_image')) continue;
      // File path keys
      if (key === 'front-id-1_path') registrationData['id1FrontImagePath'] = localStorage.getItem(key);
      else if (key === 'back-id-1_path') registrationData['id1BackImagePath'] = localStorage.getItem(key);
      else if (key === 'front-id-2_path') registrationData['id2FrontImagePath'] = localStorage.getItem(key);
      else if (key === 'back-id-2_path') registrationData['id2BackImagePath'] = localStorage.getItem(key);
      else if (key === 'supporting-doc_path') registrationData['supportingDocPath'] = localStorage.getItem(key);
      // Remittance logic
      else if (key === 'fund_source_code') fundSourceCode = localStorage.getItem(key);
      else if (key === 'remittance-country' || key === 'remittance_country') remittanceCountry = localStorage.getItem(key);
      else if (key === 'remittance-purpose' || key === 'remittance_purpose') remittancePurpose = localStorage.getItem(key);
      // Map all other keys
      else if (keyMap[key]) registrationData[keyMap[key]] = localStorage.getItem(key);
      else registrationData[key] = localStorage.getItem(key);
    }
    // Remittance logic: only include if fund source is FS005
    if (fundSourceCode === 'FS005') {
      registrationData['remittance_country'] = remittanceCountry || null;
      registrationData['remittance_purpose'] = remittancePurpose || null;
    } else {
      registrationData['remittance_country'] = null;
      registrationData['remittance_purpose'] = null;
    }
    // Add biometric_type from the current page (if present)
    const biometricTypeInput = document.getElementById('biometric-type');
    if (biometricTypeInput) {
      registrationData['biometric_type'] = biometricTypeInput.value;
    }
    // --- PATCH: Map customer_type to backend value ---
    if (registrationData.customer_type === 'account_owner') {
      registrationData.customer_type = 'Account Owner';
    } else if (registrationData.customer_type === 'business_owner') {
      registrationData.customer_type = 'Business Owner';
    }
    // --- END PATCH ---
    // --- PATCH: Ensure all regulatory fields are present ---
    const regulatoryFields = [
      'reg_political_affiliation',
      'reg_fatca',
      'reg_dnfbp',
      'reg_online_gaming',
      'reg_beneficial_owner'
    ];
    regulatoryFields.forEach(field => {
      if (!registrationData[field]) {
        registrationData[field] = 'No';
      }
    });
    // --- END PATCH ---
    // --- PATCH: Add alternate address and checkbox fields ---
    registrationData['alternateAddressSameAsHome'] = localStorage.getItem('alternateAddressSameAsHome') || 'No';
    registrationData['altUnit'] = localStorage.getItem('altUnit') || '';
    registrationData['altBuilding'] = localStorage.getItem('altBuilding') || '';
    registrationData['altStreet'] = localStorage.getItem('altStreet') || '';
    registrationData['altSubdivision'] = localStorage.getItem('altSubdivision') || '';
    registrationData['altBarangay'] = localStorage.getItem('altBarangay') || '';
    registrationData['altCity'] = localStorage.getItem('altCity') || '';
    registrationData['altProvince'] = localStorage.getItem('altProvince') || '';
    registrationData['altCountry'] = localStorage.getItem('altCountry') || '';
    registrationData['altZip'] = localStorage.getItem('altZip') || '';
    // --- END PATCH ---
    return registrationData;
  }

  const biometricType = document.getElementById("biometric-type");
  if (biometricType) {
    biometricType.addEventListener("change", function () {
      clearFieldError(biometricType);
    });
  }

  const proceedBtn = document.getElementById("proceed");
  if (proceedBtn) {
    proceedBtn.onclick = function (e) {
      e.preventDefault();
      if (!validateForm()) return;
      const registrationData = collectRegistrationData();
      fetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registrationData),
      })
        .then(async (res) => {
          let data;
          try {
            data = await res.json();
          } catch (e) {
            data = { message: 'Invalid server response' };
          }
          if (!res.ok) {
            alert('Registration failed: ' + (data.message || res.statusText));
            return;
          }
          if (data.cif_number) {
            localStorage.setItem('cif_number', data.cif_number);
            window.location.href = '/Dashboard-Customer/account1.html';
          } else {
            alert('Registration failed: ' + (data.message || 'Unknown error'));
          }
        })
        .catch((err) => {
          alert('Registration failed: ' + err.message);
        });
    };
  }
});
