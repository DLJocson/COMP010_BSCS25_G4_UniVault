/**
 * Registration Step 4: Contact Information and Address
 * Connects to the UniVault registration API
 */

document.addEventListener("DOMContentLoaded", async function () {
  const proceedBtn = document.getElementById("proceed");
  const backBtn = document.getElementById("back");
  const isAlternativeCheckbox = document.getElementById("is-alternative");
  const thirdContainer = document.getElementById("third-container");

  let registrationSessionId = sessionStorage.getItem('registrationSessionId');

  thirdContainer.style.display = "flex";

  isAlternativeCheckbox.addEventListener("change", function () {
    if (this.checked) {
      thirdContainer.style.display = "none";
    } else {
      thirdContainer.style.display = "flex";
    }
  });

  // Update progress indicator
  async function updateProgress() {
    try {
      if (registrationSessionId) {
        const response = await APIClient.get(`/customers/register/progress/${registrationSessionId}`);
        RegistrationManager.updateProgressIndicator(response.current_step || 4);
      }
    } catch (error) {
      console.error('Failed to update progress:', error);
    }
  }

  // Load address types from API
  async function loadAddressTypes() {
    try {
      // This would populate any address type dropdowns if they exist
      const addressTypeSelects = document.querySelectorAll('[name="address_type"]');
      for (const select of addressTypeSelects) {
        await DropdownManager.populateSelect(select, '/address-types', 'address_type_code', 'description');
      }
    } catch (error) {
      console.error('Failed to load address types:', error);
    }
  }

  // Restore saved data if available
  async function restoreData() {
    if (!registrationSessionId) {
      UINotifications.error('Session expired. Please start over.');
      Navigation.goto('registration1');
      return;
    }

    try {
      const response = await APIClient.get(`/customers/register/progress/${registrationSessionId}`);
      if (response.step_data) {
        const data = response.step_data;
        
        // Populate contact fields
        const personalInput = document.querySelector(".phone-number-text #personal");
        const phoneInput = document.querySelector(".phone-number-text #phone-num");
        const homeInput = document.querySelector(".home-landline-text #home");
        const landlineInput = document.querySelector(".home-landline-text #landline");
        const emailInput = document.querySelector(".personal-email #email");

        if (data.personal_code && personalInput) personalInput.value = data.personal_code;
        if (data.phone && phoneInput) phoneInput.value = data.phone;
        if (data.home_code && homeInput) homeInput.value = data.home_code;
        if (data.landline && landlineInput) landlineInput.value = data.landline;
        if (data.email && emailInput) emailInput.value = data.email;

        // Populate address fields
        const unitInput = document.querySelector(".unit-building-text #unit");
        const buildingInput = document.querySelector(".unit-building-text #building");
        const streetInput = document.querySelector(".street-subdivision-text #street");
        const subdivisionInput = document.querySelector(".street-subdivision-text #subdivision");
        const barangayInput = document.querySelector(".barangay-city-text #barangay");
        const cityInput = document.querySelector(".barangay-city-text #city");
        const provinceInput = document.querySelector(".province-country-text #province");
        const countryInput = document.querySelector(".province-country-text #country");
        const zipCode = document.querySelector(".zip-code #zip-code");

        if (data.unit && unitInput) unitInput.value = data.unit;
        if (data.building && buildingInput) buildingInput.value = data.building;
        if (data.street && streetInput) streetInput.value = data.street;
        if (data.subdivision && subdivisionInput) subdivisionInput.value = data.subdivision;
        if (data.barangay && barangayInput) barangayInput.value = data.barangay;
        if (data.city && cityInput) cityInput.value = data.city;
        if (data.province && provinceInput) provinceInput.value = data.province;
        if (data.country && countryInput) countryInput.value = data.country;
        if (data.zip_code && zipCode) zipCode.value = data.zip_code;

        // Handle alternative address checkbox
        if (data.is_alternative_same !== undefined && isAlternativeCheckbox) {
          isAlternativeCheckbox.checked = data.is_alternative_same;
          if (data.is_alternative_same) {
            thirdContainer.style.display = "none";
          }
        }
      }
      await updateProgress();
    } catch (error) {
      console.error('Failed to restore data:', error);
      UINotifications.error('Failed to load previous data. Please try again.');
    }
  }

  function validateForm() {
    let isValid = true;
    clearErrors();

    const personalInput = document.querySelector(
      ".phone-number-text #personal"
    );
    const phoneInput = document.querySelector(".phone-number-text #phone-num");
    const homeInput = document.querySelector(".home-landline-text #home");
    const landlineInput = document.querySelector(
      ".home-landline-text #landline"
    );
    const emailInput = document.querySelector(".personal-email #email");

    const unitInput = document.querySelector(".unit-building-text #unit");
    const buildingInput = document.querySelector(
      ".unit-building-text #building"
    );
    const streetInput = document.querySelector(
      ".street-subdivision-text #street"
    );
    const subdivisionInput = document.querySelector(
      ".street-subdivision-text #subdivision"
    );
    const barangayInput = document.querySelector(
      ".barangay-city-text #barangay"
    );
    const cityInput = document.querySelector(".barangay-city-text #city");
    const provinceInput = document.querySelector(
      ".province-country-text #province"
    );
    const countryInput = document.querySelector(
      ".province-country-text #country"
    );
    const zipCode = document.querySelector(".zip-code #zip-code");

    if (!personalInput.value.trim()) {
      showError(personalInput, "Personal code is required");
      isValid = false;
    } else if (!/^\d{2,3}$/.test(personalInput.value.trim())) {
      showError(personalInput, "Personal code must be 2-3 digits");
      isValid = false;
    }

    if (!phoneInput.value.trim()) {
      showError(phoneInput, "Phone number is required");
      isValid = false;
    } else if (!/^\d{10}$/.test(phoneInput.value.trim())) {
      showError(phoneInput, "Phone number must be 10 digits");
      isValid = false;
    }

    if (!homeInput.value.trim()) {
      showError(homeInput, "Home code is required");
      isValid = false;
    } else if (!/^\d{2,3}$/.test(homeInput.value.trim())) {
      showError(homeInput, "Home code must be 2-3 digits");
      isValid = false;
    }

    if (!landlineInput.value.trim()) {
      showError(landlineInput, "Landline number is required");
      isValid = false;
    } else if (!/^\d{4}-\d{4}$/.test(landlineInput.value.trim())) {
      showError(landlineInput, "Landline must be in format: 1234-1234");
      isValid = false;
    }

    if (!emailInput.value.trim()) {
      showError(emailInput, "Email address is required");
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value.trim())) {
      showError(emailInput, "Please enter a valid email address");
      isValid = false;
    }

    // Address: at least one of unit, building, street, subdivision required
    if (
      !unitInput.value.trim() &&
      !buildingInput.value.trim() &&
      !streetInput.value.trim() &&
      !subdivisionInput.value.trim()
    ) {
      showError(unitInput, "At least one of Unit, Building, Street, or Subdivision is required");
      showError(buildingInput, "");
      showError(streetInput, "");
      showError(subdivisionInput, "");
      isValid = false;
    }

    // City, Province, Country, Zip Code are always required
    if (!cityInput.value.trim()) {
      showError(cityInput, "City is required");
      isValid = false;
    }
    if (!provinceInput.value.trim()) {
      showError(provinceInput, "Province is required");
      isValid = false;
    }
    if (!countryInput.value.trim()) {
      showError(countryInput, "Country is required");
      isValid = false;
    }
    if (!zipCode.value.trim()) {
      showError(zipCode, "Zip code is required");
      isValid = false;
    }

    // Alternative address
    if (!isAlternativeCheckbox.checked) {
      const altUnitInput = document.querySelector(
        "#third-container .unit-building-text #unit"
      );
      const altBuildingInput = document.querySelector(
        "#third-container .unit-building-text #building"
      );
      const altStreetInput = document.querySelector(
        "#third-container .street-subdivision-text #street"
      );
      const altSubdivisionInput = document.querySelector(
        "#third-container .street-subdivision-text #subdivision"
      );
      const altBarangayInput = document.querySelector(
        "#third-container .barangay-city-text #barangay"
      );
      const altCityInput = document.querySelector(
        "#third-container .barangay-city-text #city"
      );
      const altProvinceInput = document.querySelector(
        "#third-container .province-country-text #province"
      );
      const altCountryInput = document.querySelector(
        "#third-container .province-country-text #country"
      );
      const altZipCode = document.querySelector(
        "#third-container .zip-code #zip-code"
      );

      // At least one of alt unit, building, street, subdivision required
      if (
        (!altUnitInput || !altUnitInput.value.trim()) &&
        (!altBuildingInput || !altBuildingInput.value.trim()) &&
        (!altStreetInput || !altStreetInput.value.trim()) &&
        (!altSubdivisionInput || !altSubdivisionInput.value.trim())
      ) {
        if (altUnitInput) showError(altUnitInput, "At least one of Unit, Building, Street, or Subdivision is required");
        if (altBuildingInput) showError(altBuildingInput, "");
        if (altStreetInput) showError(altStreetInput, "");
        if (altSubdivisionInput) showError(altSubdivisionInput, "");
        isValid = false;
      }

      // City, Province, Country, Zip Code are always required for alt address
      if (altCityInput && !altCityInput.value.trim()) {
        showError(altCityInput, "Alternate city is required");
        isValid = false;
      }
      if (altProvinceInput && !altProvinceInput.value.trim()) {
        showError(altProvinceInput, "Alternate province is required");
        isValid = false;
      }
      if (altCountryInput && !altCountryInput.value.trim()) {
        showError(altCountryInput, "Alternate country is required");
        isValid = false;
      }
      if (altZipCode && !altZipCode.value.trim()) {
        showError(altZipCode, "Alternate zip code is required");
        isValid = false;
      }
    }

    return isValid;
  }

  function showError(input, message) {
    input.style.borderColor = "#ff3860";
    input.classList.add("error");

    let errorDiv = input.nextElementSibling;

    if (!errorDiv || !errorDiv.classList.contains("error-message")) {
      const parentContainer = input.parentNode;
      errorDiv = parentContainer.querySelector(".error-message");

      if (!errorDiv) {
        errorDiv = document.createElement("div");
        errorDiv.className = "error-message";
        input.parentNode.insertBefore(errorDiv, input.nextSibling);
      }
    }

    if (errorDiv) {
      errorDiv.textContent = message;
      errorDiv.style.display = message ? "block" : "none";
      errorDiv.style.color = "#ff3860";
      errorDiv.style.fontSize = "20px";
      errorDiv.style.marginTop = "5px";
      errorDiv.style.marginBottom = "10px";
    }
  }

  function clearErrors() {
    const inputs = document.querySelectorAll('input[type="text"]');
    inputs.forEach((input) => {
      input.style.borderColor = "#0072d8";
      input.classList.remove("error");

      let errorDiv = input.nextElementSibling;
      if (errorDiv && errorDiv.classList.contains("error-message")) {
        errorDiv.textContent = "";
        errorDiv.style.display = "none";
      } else {
        const parentContainer = input.parentNode;
        errorDiv = parentContainer.querySelector(".error-message");
        if (errorDiv) {
          errorDiv.textContent = "";
          errorDiv.style.display = "none";
        }
      }
    });
  }

  const allInputs = document.querySelectorAll('input[type="text"]');
  allInputs.forEach((input) => {
    input.addEventListener("input", function () {
      if (this.value.trim()) {
        this.style.borderColor = "#0072d8";
        this.classList.remove("error");

        const parentContainer = this.parentNode;
        const errorDiv = parentContainer.querySelector(".error-message");
        if (errorDiv) {
          errorDiv.textContent = "";
          errorDiv.style.display = "none";
        }
      }
    });
  });

  proceedBtn.onclick = async function (e) {
    e.preventDefault();

    if (validateForm()) {
      await submitStepData();
    } else {
      const firstError = document.querySelector(".error");
      if (firstError) {
        firstError.scrollIntoView({ behavior: "smooth", block: "center" });
        firstError.focus();
      }
    }

    return false;
  };

  // Submit step data to API
  async function submitStepData() {
    try {
      LoadingManager.show(proceedBtn, 'Processing...');
      
      // Collect contact information
      const personalInput = document.querySelector(".phone-number-text #personal");
      const phoneInput = document.querySelector(".phone-number-text #phone-num");
      const homeInput = document.querySelector(".home-landline-text #home");
      const landlineInput = document.querySelector(".home-landline-text #landline");
      const emailInput = document.querySelector(".personal-email #email");

      // Collect address information
      const unitInput = document.querySelector(".unit-building-text #unit");
      const buildingInput = document.querySelector(".unit-building-text #building");
      const streetInput = document.querySelector(".street-subdivision-text #street");
      const subdivisionInput = document.querySelector(".street-subdivision-text #subdivision");
      const barangayInput = document.querySelector(".barangay-city-text #barangay");
      const cityInput = document.querySelector(".barangay-city-text #city");
      const provinceInput = document.querySelector(".province-country-text #province");
      const countryInput = document.querySelector(".province-country-text #country");
      const zipCode = document.querySelector(".zip-code #zip-code");

      const stepData = {
        // Contact information
        personal_code: personalInput?.value.trim() || '',
        phone: `${personalInput?.value.trim() || ''}${phoneInput?.value.trim() || ''}`,
        home_code: homeInput?.value.trim() || '',
        landline: `${homeInput?.value.trim() || ''}-${landlineInput?.value.trim() || ''}`,
        email: emailInput?.value.trim() || '',
        
        // Primary address
        unit: unitInput?.value.trim() || '',
        building: buildingInput?.value.trim() || '',
        street: streetInput?.value.trim() || '',
        subdivision: subdivisionInput?.value.trim() || '',
        barangay: barangayInput?.value.trim() || '',
        city: cityInput?.value.trim() || '',
        province: provinceInput?.value.trim() || '',
        country: countryInput?.value.trim() || '',
        zip_code: zipCode?.value.trim() || '',
        
        // Alternative address flag
        is_alternative_same: isAlternativeCheckbox?.checked || false,
        
        timestamp: new Date().toISOString()
      };

      // If alternative address is not the same, collect alternative address data
      if (!isAlternativeCheckbox.checked) {
        const altUnitInput = document.querySelector("#third-container .unit-building-text #unit");
        const altBuildingInput = document.querySelector("#third-container .unit-building-text #building");
        const altStreetInput = document.querySelector("#third-container .street-subdivision-text #street");
        const altSubdivisionInput = document.querySelector("#third-container .street-subdivision-text #subdivision");
        const altBarangayInput = document.querySelector("#third-container .barangay-city-text #barangay");
        const altCityInput = document.querySelector("#third-container .barangay-city-text #city");
        const altProvinceInput = document.querySelector("#third-container .province-country-text #province");
        const altCountryInput = document.querySelector("#third-container .province-country-text #country");
        const altZipCode = document.querySelector("#third-container .zip-code #zip-code");

        stepData.alt_unit = altUnitInput?.value.trim() || '';
        stepData.alt_building = altBuildingInput?.value.trim() || '';
        stepData.alt_street = altStreetInput?.value.trim() || '';
        stepData.alt_subdivision = altSubdivisionInput?.value.trim() || '';
        stepData.alt_barangay = altBarangayInput?.value.trim() || '';
        stepData.alt_city = altCityInput?.value.trim() || '';
        stepData.alt_province = altProvinceInput?.value.trim() || '';
        stepData.alt_country = altCountryInput?.value.trim() || '';
        stepData.alt_zip_code = altZipCode?.value.trim() || '';
      }

      const response = await APIClient.post('/customers/register/step4', {
        session_id: registrationSessionId,
        data: stepData
      });

      // Store data locally as backup
      RegistrationManager.saveStepData(4, stepData);
      
      UINotifications.success('Contact and address information saved successfully!');
      
      // Navigate to next step
      setTimeout(() => {
        Navigation.goto('registration5');
      }, 1000);

    } catch (error) {
      console.error('Failed to submit step:', error);
      LoadingManager.hide(proceedBtn);
      
      if (error.status === 400) {
        UINotifications.error(error.details?.message || 'Invalid data. Please check your information.');
      } else {
        UINotifications.error('Failed to save your information. Please try again.');
      }
    }
  }

  // Add back button functionality
  if (backBtn) {
    backBtn.addEventListener("click", (e) => {
      e.preventDefault();
      Navigation.goto('registration3');
    });
  }

  // Initialize the form
  await loadAddressTypes();
  await restoreData();
});
