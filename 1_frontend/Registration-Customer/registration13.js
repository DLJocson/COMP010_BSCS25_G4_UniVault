document.addEventListener("DOMContentLoaded", () => {
  const username = document.getElementById("username");
  const password = document.getElementById("password");
  const errorMessages = document.querySelectorAll(".error-message");
  const proceedBtn = document.getElementById("proceed");

  function isPasswordValid(pw) {
    const lengthOK = pw.length >= 8 && pw.length <= 30;
    const hasNumber = /\d/.test(pw);
    const hasSpecial = /[-!@#$%^&*_+]/.test(pw);
    const hasUpper = /[A-Z]/.test(pw);
    const hasLower = /[a-z]/.test(pw);
    const noCommonSeq = !/(abc|123|9999|password|qwerty)/i.test(pw);
    return (
      lengthOK && hasNumber && hasSpecial && hasUpper && hasLower && noCommonSeq
    );
  }

  function validate() {
    const uname = username.value.trim();
    const pw = password.value.trim();
    let isValid = true;

    errorMessages.forEach((msg) => (msg.textContent = ""));

    username.classList.remove("error");
    password.classList.remove("error");

    if (uname === "") {
      errorMessages[0].textContent = "Username is required.";
      username.classList.add("error");
      isValid = false;
    }

    if (pw === "") {
      errorMessages[1].textContent = "Password is required.";
      password.classList.add("error");
      isValid = false;
    } else if (!isPasswordValid(pw)) {
      errorMessages[1].textContent =
        "Password does not meet the required criteria.";
      password.classList.add("error");
      isValid = false;
    }

    return isValid;
  }

  username.addEventListener("input", validate);
  password.addEventListener("input", validate);

  function collectRegistrationData() {
    const keyMap = {
      'username': 'customer_username',
      'password': 'customer_password',
      'birth_date': 'birth_date',
      'gender': 'gender',
      'civil_status_code': 'civil_status_code',
      'birth_country': 'birth_country',
      'citizenship': 'citizenship',
      'address_unit': 'address_unit',
      'address_building': 'address_building',
      'address_street': 'address_street',
      'address_subdivision': 'address_subdivision',
      'address_barangay': 'address_barangay',
      'address_city': 'address_city',
      'address_province': 'address_province',
      'address_country': 'address_country',
      'address_zip_code': 'address_zip_code',
      'phoneNumber': 'contact_value_phone',
      'emailAddress': 'contact_value_email',
      'fund_source_code': 'fund_source_code',
      'id1Type': 'id1Type',
      'id1Number': 'id1Number',
      'id1FrontImagePath': 'id1FrontImagePath',
      'id1BackImagePath': 'id1BackImagePath',
      'id2Type': 'id2Type',
      'id2Number': 'id2Number',
      'id2FrontImagePath': 'id2FrontImagePath',
      'id2BackImagePath': 'id2BackImagePath',
      'supporting-doc_path': 'supportingDocPath',
      'currentlyEmployed': 'currentlyEmployed',
      'business-nature': 'business_nature',
      'business-nature-multi': 'business_nature_multi',
      'position': 'position',
      'gross-income': 'gross_income',
      'work': 'work_country_code',
      'work-email': 'work_email',
      'business-number': 'business_number',
      'tin': 'tin',
      'primary-employer': 'primary_employer',
      'unit': 'address_unit',
      'building': 'address_building',
      'street': 'address_street',
      'subdivision': 'address_subdivision',
      'barangay': 'address_barangay',
      'city': 'address_city',
      'province': 'address_province',
      'country': 'address_country',
      'zip-code': 'address_zip_code',
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
      'remittance-country': 'remittance_country',
      'remittance_country': 'remittance_country',
      'remittance-purpose': 'remittance_purpose',
      'remittance_purpose': 'remittance_purpose',
    };
    const registrationData = {};
    let fundSourceCode = null;
    let remittanceCountry = null;
    let remittancePurpose = null;
    let residencyStatusRaw = null;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key === 'cif_number') continue;
      if (key.endsWith('_image')) continue;
      if (key === 'front-id-1_path') registrationData['id1FrontImagePath'] = localStorage.getItem(key);
      else if (key === 'back-id-1_path') registrationData['id1BackImagePath'] = localStorage.getItem(key);
      else if (key === 'front-id-2_path') registrationData['id2FrontImagePath'] = localStorage.getItem(key);
      else if (key === 'back-id-2_path') registrationData['id2BackImagePath'] = localStorage.getItem(key);
      else if (key === 'supporting-doc_path') registrationData['supportingDocPath'] = localStorage.getItem(key);
      else if (key === 'fund_source_code') fundSourceCode = localStorage.getItem(key);
      else if (key === 'remittance-country' || key === 'remittance_country') remittanceCountry = localStorage.getItem(key);
      else if (key === 'remittance-purpose' || key === 'remittance_purpose') remittancePurpose = localStorage.getItem(key);
      else if (key === 'residency_status') residencyStatusRaw = localStorage.getItem(key);
      else if (keyMap[key]) registrationData[keyMap[key]] = localStorage.getItem(key);
      else registrationData[key] = localStorage.getItem(key);
    }
    // Residency status mapping (frontend value to allowed DB value)
    if (residencyStatusRaw) {
      let mappedResidency = null;
      switch (residencyStatusRaw.trim().toLowerCase()) {
        case 'foreign national':
          mappedResidency = 'Non-Resident'; break;
        case 'citizen':
        case 'permanent resident':
        case 'temporary resident':
        case 'dual citizen':
        case 'dual':
        case 'refugee':
        case 'student visa holder':
        case 'work visa holder':
        case 'undocumented':
        case 'other':
        default:
          mappedResidency = 'Resident';
      }
      registrationData['residency_status'] = mappedResidency;
    }

    // Remittance logic: check for 'remittances' in any fund source field
    let hasRemittances = false;
    const fundSources = [
      registrationData['source-of-funds'],
      registrationData['source-of-funds-multi'],
      registrationData['fund_source_code']
    ];
    for (const src of fundSources) {
      if (src && src.toLowerCase().includes('remittances')) {
        hasRemittances = true;
        break;
      }
      // Also check for code 'FS005' if used
      if (src && src.toUpperCase().includes('FS005')) {
        hasRemittances = true;
        break;
      }
    }
    if (hasRemittances) {
      registrationData['remittance_country'] = remittanceCountry || null;
      registrationData['remittance_purpose'] = remittancePurpose || null;
    } else {
      registrationData['remittance_country'] = null;
      registrationData['remittance_purpose'] = null;
    }
    // Add alternate address and checkbox fields
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
    // REMOVE biometric_type from registrationData if present
    if ('biometric_type' in registrationData) delete registrationData['biometric_type'];
    return registrationData;
  }

  if (proceedBtn) {
    proceedBtn.onclick = function (e) {
      // Save username and password to localStorage
      localStorage.setItem("username", username.value);
      localStorage.setItem("password", password.value);
      if (!validate()) {
        e.preventDefault();
      } else {
        // Submit registration data here
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
              window.location.href = 'registration14.html';
            } else {
              alert('Registration failed: ' + (data.message || 'Unknown error'));
            }
          })
          .catch((err) => {
            alert('Registration failed: ' + err.message);
          });
      }
    };
  }
});
