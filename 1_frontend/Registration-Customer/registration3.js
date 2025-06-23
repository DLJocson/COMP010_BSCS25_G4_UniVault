/**
 * Registration Step 3: Customer Details
 * Connects to the UniVault registration API
 */

const config = {
  cUrl: "https://api.countrystatecity.in/v1/countries",
  ckey: "NHhvOEcyWk50N2Vna3VFTE00bFp3MjFKR0ZEOUhkZlg4RTk1MlJlaA==",
};

let registrationSessionId = null;

async function populateCountryDropdown(selectId) {
  const selectElement = document.getElementById(selectId);
  if (!selectElement) {
    console.error(`Dropdown with ID '${selectId}' not found.`);
    return;
  }

  try {
    const response = await fetch(config.cUrl, {
      headers: { "X-CSCAPI-KEY": config.ckey },
    });
    const data = await response.json();
    
    data.forEach((country) => {
      const option = document.createElement("option");
      option.value = country.iso2;
      option.textContent = country.name;
      selectElement.appendChild(option);
    });
  } catch (error) {
    console.error(`Error loading countries for ${selectId}:`, error);
    UINotifications.error('Failed to load country data. Please refresh the page.');
  }
}

// Load civil status options from API
async function populateCivilStatusDropdown() {
  const civilStatusSelect = document.getElementById("civil-status");
  if (!civilStatusSelect) return;

  try {
    await DropdownManager.populateSelect(civilStatusSelect, '/civil-status', 'civil_status_code', 'description');
  } catch (error) {
    console.error('Failed to load civil status options:', error);
    // Fallback to static options
    const fallbackOptions = [
      { code: 'single', description: 'Single' },
      { code: 'married', description: 'Married' },
      { code: 'divorced', description: 'Divorced' },
      { code: 'widowed', description: 'Widowed' },
      { code: 'separated', description: 'Separated' }
    ];
    
    fallbackOptions.forEach(option => {
      const optionElement = document.createElement("option");
      optionElement.value = option.code;
      optionElement.textContent = option.description;
      civilStatusSelect.appendChild(optionElement);
    });
  }
}

function populateCitizenshipDropdown() {
  const citizenshipSelect = document.getElementById("citizenship");
  if (!citizenshipSelect) {
    console.error("Citizenship dropdown not found.");
    return;
  }

  const citizenshipList = [
    "Afghan",
    "Albanian",
    "Algerian",
    "American",
    "Andorran",
    "Angolan",
    "Argentine",
    "Armenian",
    "Australian",
    "Austrian",
    "Azerbaijani",
    "Bahamian",
    "Bahraini",
    "Bangladeshi",
    "Barbadian",
    "Belarusian",
    "Belgian",
    "Belizean",
    "Beninese",
    "Bhutanese",
    "Bolivian",
    "Bosnian",
    "Botswanan",
    "Brazilian",
    "British",
    "Bruneian",
    "Bulgarian",
    "Burkinabe",
    "Burmese",
    "Burundian",
    "Cambodian",
    "Cameroonian",
    "Canadian",
    "Cape Verdean",
    "Central African",
    "Chadian",
    "Chilean",
    "Chinese",
    "Colombian",
    "Comorian",
    "Congolese",
    "Costa Rican",
    "Croatian",
    "Cuban",
    "Cypriot",
    "Czech",
    "Danish",
    "Djiboutian",
    "Dominican",
    "Dutch",
    "East Timorese",
    "Ecuadorean",
    "Egyptian",
    "Emirati",
    "English",
    "Equatorial Guinean",
    "Eritrean",
    "Estonian",
    "Ethiopian",
    "Fijian",
    "Finnish",
    "Filipino",
    "French",
    "Gabonese",
    "Gambian",
    "Georgian",
    "German",
    "Ghanaian",
    "Greek",
    "Grenadian",
    "Guatemalan",
    "Guinean",
    "Guyanese",
    "Haitian",
    "Honduran",
    "Hungarian",
    "Icelandic",
    "Indian",
    "Indonesian",
    "Iranian",
    "Iraqi",
    "Irish",
    "Israeli",
    "Italian",
    "Ivorian",
    "Jamaican",
    "Japanese",
    "Jordanian",
    "Kazakh",
    "Kenyan",
    "Kiribati",
    "Korean",
    "Kuwaiti",
    "Kyrgyz",
    "Lao",
    "Latvian",
    "Lebanese",
    "Liberian",
    "Libyan",
    "Liechtensteiner",
    "Lithuanian",
    "Luxembourger",
    "Macedonian",
    "Malagasy",
    "Malawian",
    "Malaysian",
    "Maldivian",
    "Malian",
    "Maltese",
    "Marshallese",
    "Mauritanian",
    "Mauritian",
    "Mexican",
    "Micronesian",
    "Moldovan",
    "Monacan",
    "Mongolian",
    "Montenegrin",
    "Moroccan",
    "Mozambican",
    "Namibian",
    "Nauruan",
    "Nepalese",
    "New Zealander",
    "Nicaraguan",
    "Nigerien",
    "Nigerian",
    "Norwegian",
    "Omani",
    "Pakistani",
    "Palauan",
    "Palestinian",
    "Panamanian",
    "Papua New Guinean",
    "Paraguayan",
    "Peruvian",
    "Polish",
    "Portuguese",
    "Qatari",
    "Romanian",
    "Russian",
    "Rwandan",
    "Saint Lucian",
    "Salvadoran",
    "Samoan",
    "San Marinese",
    "Saudi",
    "Scottish",
    "Senegalese",
    "Serbian",
    "Seychellois",
    "Sierra Leonean",
    "Singaporean",
    "Slovak",
    "Slovenian",
    "Solomon Islander",
    "Somali",
    "South African",
    "South Sudanese",
    "Spanish",
    "Sri Lankan",
    "Sudanese",
    "Surinamese",
    "Swazi",
    "Swedish",
    "Swiss",
    "Syrian",
    "Taiwanese",
    "Tajik",
    "Tanzanian",
    "Thai",
    "Togolese",
    "Tongan",
    "Trinidadian",
    "Tunisian",
    "Turkish",
    "Turkmen",
    "Tuvaluan",
    "Ugandan",
    "Ukrainian",
    "Uruguayan",
    "Uzbek",
    "Vanuatuan",
    "Vatican Citizen",
    "Venezuelan",
    "Vietnamese",
    "Welsh",
    "Yemeni",
    "Zambian",
    "Zimbabwean",
  ];

  citizenshipList.forEach((citizen) => {
    const option = document.createElement("option");
    option.value = citizen;
    option.textContent = citizen;
    citizenshipSelect.appendChild(option);
  });
}

function initializeDateDropdowns() {
  const monthSelect = document.getElementById("month");
  const daySelect = document.getElementById("day");
  const yearSelect = document.getElementById("year");

  if (!monthSelect || !daySelect || !yearSelect) {
    console.error("Date dropdown elements not found.");
    return;
  }

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  months.forEach((month, index) => {
    const option = document.createElement("option");
    option.value = index + 1;
    option.textContent = month;
    monthSelect.appendChild(option);
  });

  function populateDays(totalDays = 31) {
    const previousDay = parseInt(daySelect.value);
    daySelect.innerHTML = '<option value="">Select Day</option>';

    for (let i = 1; i <= totalDays; i++) {
      const option = document.createElement("option");
      option.value = i;
      option.textContent = i;
      if (i === previousDay) {
        option.selected = true;
      }
      daySelect.appendChild(option);
    }
  }

  const currentYear = new Date().getFullYear();
  for (let y = currentYear; y >= 1900; y--) {
    const option = document.createElement("option");
    option.value = y;
    option.textContent = y;
    yearSelect.appendChild(option);
  }

  function updateDays() {
    const month = parseInt(monthSelect.value);
    const year = parseInt(yearSelect.value);
    if (!month || !year) return;

    const daysInMonth = new Date(year, month, 0).getDate();
    populateDays(daysInMonth);
  }

  monthSelect.addEventListener("change", updateDays);
  yearSelect.addEventListener("change", updateDays);

  populateDays();
}

function addInputListeners() {
  const firstName = document.getElementById("first-name");
  const middleName = document.getElementById("middle-name");
  const lastName = document.getElementById("last-name");
  const suffix = document.getElementById("suffix-name");
  const monthSelect = document.getElementById("month");
  const daySelect = document.getElementById("day");
  const yearSelect = document.getElementById("year");
  const countrySelect = document.getElementById("country");
  const citizenshipSelect = document.getElementById("citizenship");
  const genderSelect = document.getElementById("gender");
  const civilStatusSelect = document.getElementById("civil-status");
  const residencyStatusSelect = document.getElementById("residency-status");

  const resetToDefault = (element) => {
    const inputControl =
      element.closest(".checkbox-container") ||
      element.closest(".date") ||
      element.parentElement;

    inputControl.classList.remove("error", "success");

    const errorDisplay = inputControl.querySelector(".error-message");
    if (errorDisplay) {
      errorDisplay.innerText = "";
    }
  };

  [firstName, middleName, lastName, suffix].forEach((input) => {
    if (input) {
      input.addEventListener("input", () => resetToDefault(input));
    }
  });

  [
    monthSelect,
    daySelect,
    yearSelect,
    countrySelect,
    citizenshipSelect,
    genderSelect,
    civilStatusSelect,
    residencyStatusSelect,
  ].forEach((select) => {
    if (select) {
      select.addEventListener("change", () => resetToDefault(select));
    }
  });
}

function initializeFormValidation() {
  console.log("Initializing form validation...");

  const firstName = document.getElementById("first-name");
  const middleName = document.getElementById("middle-name");
  const lastName = document.getElementById("last-name");
  const suffix = document.getElementById("suffix-name");
  const monthSelect = document.getElementById("month");
  const daySelect = document.getElementById("day");
  const yearSelect = document.getElementById("year");
  const countrySelect = document.getElementById("country");
  const citizenshipSelect = document.getElementById("citizenship");
  const genderSelect = document.getElementById("gender");
  const civilStatusSelect = document.getElementById("civil-status");
  const proceedButton = document.getElementById("proceed");
  const residencyStatusSelect = document.getElementById("residency-status");

  console.log("Proceed button found:", !!proceedButton);

  if (!proceedButton) {
    console.error("Proceed button not found!");
    return;
  }

  const setError = (element, message) => {
    const inputControl =
      element.closest(".checkbox-container") ||
      element.closest(".date") ||
      element.parentElement;
    const errorDisplay = inputControl.querySelector(".error-message");

    if (errorDisplay) {
      errorDisplay.innerText = message;
    }
    inputControl.classList.add("error");
    inputControl.classList.remove("success");
  };

  const setSuccess = (element) => {
    const inputControl =
      element.closest(".checkbox-container") ||
      element.closest(".date") ||
      element.parentElement;
    const errorDisplay = inputControl.querySelector(".error-message");

    if (errorDisplay) {
      errorDisplay.innerText = "";
    }
    inputControl.classList.add("success");
    inputControl.classList.remove("error");
  };

  const validateInputs = () => {
    let isValid = true;

    if (!firstName.value.trim()) {
      setError(firstName, "First Name is required");
      isValid = false;
    } else {
      setSuccess(firstName);
    }

    if (!middleName.value.trim()) {
      setError(middleName, "Middle Name is required");
      isValid = false;
    } else {
      setSuccess(middleName);
    }

    if (!lastName.value.trim()) {
      setError(lastName, "Last Name is required");
      isValid = false;
    } else {
      setSuccess(lastName);
    }

    if (!monthSelect.value) {
      setError(monthSelect, "Month is required");
      isValid = false;
    } else {
      setSuccess(monthSelect);
    }

    if (!daySelect.value) {
      setError(daySelect, "Day is required");
      isValid = false;
    } else {
      setSuccess(daySelect);
    }

    if (!yearSelect.value) {
      setError(yearSelect, "Year is required");
      isValid = false;
    } else {
      setSuccess(yearSelect);
    }

    if (!countrySelect.value) {
      setError(countrySelect, "Country is required");
      isValid = false;
    } else {
      setSuccess(countrySelect);
    }

    if (!citizenshipSelect.value) {
      setError(citizenshipSelect, "Citizenship is required");
      isValid = false;
    } else {
      setSuccess(citizenshipSelect);
    }

    if (!genderSelect.value) {
      setError(genderSelect, "Gender is required");
      isValid = false;
    } else {
      setSuccess(genderSelect);
    }

    if (!civilStatusSelect.value) {
      setError(civilStatusSelect, "Civil Status is required");
      isValid = false;
    } else {
      setSuccess(civilStatusSelect);
    }

    if (!residencyStatusSelect.value) {
      setError(residencyStatusSelect, "Civil Status is required");
      isValid = false;
    } else {
      setSuccess(residencyStatusSelect);
    }

    return isValid;
  };

  proceedButton.addEventListener("click", async (e) => {
    e.preventDefault();
    console.log("Proceed button clicked!");

    const isFormValid = validateInputs();

    if (isFormValid) {
      await submitStepData();
    } else {
      console.log("Form has validation errors.");
    }
  });
  addInputListeners();

  // Submit step data to API
  async function submitStepData() {
    try {
      LoadingManager.show(proceedButton, 'Processing...');
      
      const stepData = {
        first_name: firstName.value.trim(),
        middle_name: middleName.value.trim(),
        last_name: lastName.value.trim(),
        suffix: suffix.value.trim(),
        date_of_birth: `${yearSelect.value}-${monthSelect.value.padStart(2, '0')}-${daySelect.value.padStart(2, '0')}`,
        place_of_birth: countrySelect.value,
        nationality: citizenshipSelect.value,
        gender: genderSelect.value,
        civil_status_code: civilStatusSelect.value,
        residency_status: residencyStatusSelect.value,
        timestamp: new Date().toISOString()
      };

      const response = await APIClient.post('/customers/register/step3', {
        session_id: registrationSessionId,
        data: stepData
      });

      // Store data locally as backup
      RegistrationManager.saveStepData(3, stepData);
      
      UINotifications.success('Personal information saved successfully!');
      
      // Navigate to next step
      setTimeout(() => {
        Navigation.goto('registration4');
      }, 1000);

    } catch (error) {
      console.error('Failed to submit step:', error);
      LoadingManager.hide(proceedButton);
      
      if (error.status === 400) {
        UINotifications.error(error.details?.message || 'Invalid data. Please check your information.');
      } else {
        UINotifications.error('Failed to save your information. Please try again.');
      }
    }
  }

  // Update progress indicator
  async function updateProgress() {
    try {
      if (registrationSessionId) {
        const response = await APIClient.get(`/customers/register/progress/${registrationSessionId}`);
        RegistrationManager.updateProgressIndicator(response.current_step || 3);
      }
    } catch (error) {
      console.error('Failed to update progress:', error);
    }
  }

  // Restore saved data if available
  async function restoreData() {
    registrationSessionId = sessionStorage.getItem('registrationSessionId');
    
    if (!registrationSessionId) {
      UINotifications.error('Session expired. Please start over.');
      Navigation.goto('registration1');
      return;
    }

    try {
      const response = await APIClient.get(`/customers/register/progress/${registrationSessionId}`);
      if (response.step_data) {
        const data = response.step_data;
        
        // Populate form fields with saved data
        if (data.first_name) firstName.value = data.first_name;
        if (data.middle_name) middleName.value = data.middle_name;
        if (data.last_name) lastName.value = data.last_name;
        if (data.suffix) suffix.value = data.suffix;
        if (data.gender) genderSelect.value = data.gender;
        if (data.civil_status_code) civilStatusSelect.value = data.civil_status_code;
        if (data.residency_status) residencyStatusSelect.value = data.residency_status;
        if (data.place_of_birth) countrySelect.value = data.place_of_birth;
        if (data.nationality) citizenshipSelect.value = data.nationality;
        
        // Handle date of birth
        if (data.date_of_birth) {
          const date = new Date(data.date_of_birth);
          yearSelect.value = date.getFullYear();
          monthSelect.value = date.getMonth() + 1;
          daySelect.value = date.getDate();
          updateDays(); // Update days dropdown
        }
      }
      await updateProgress();
    } catch (error) {
      console.error('Failed to restore data:', error);
      UINotifications.error('Failed to load previous data. Please try again.');
    }
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  console.log("DOM loaded, initializing...");
  
  // Initialize dropdowns
  await populateCountryDropdown("country");
  populateCitizenshipDropdown();
  await populateCivilStatusDropdown();
  initializeDateDropdowns();
  initializeFormValidation();
  
  // Restore data and update progress
  await restoreData();
});

document.getElementById("month").addEventListener("change", function () {
  const month = parseInt(this.value);
  const year = parseInt(document.getElementById("year").value) || new Date().getFullYear();
  const daysInMonth = new Date(year, month, 0).getDate();
  const daySelect = document.getElementById("day");
  const previousDay = parseInt(daySelect.value);
  daySelect.innerHTML = '<option value="">Select Day</option>';
  for (let i = 1; i <= daysInMonth; i++) {
    const option = document.createElement("option");
    option.value = i;
    option.textContent = i;
    if (i === previousDay) option.selected = true;
    daySelect.appendChild(option);
  }
});

document.getElementById("year").addEventListener("change", function () {
  const month = parseInt(document.getElementById("month").value);
  if (!month) return;
  const year = parseInt(this.value);
  const daysInMonth = new Date(year, month, 0).getDate();
  const daySelect = document.getElementById("day");
  const previousDay = parseInt(daySelect.value);
  daySelect.innerHTML = '<option value="">Select Day</option>';
  for (let i = 1; i <= daysInMonth; i++) {
    const option = document.createElement("option");
    option.value = i;
    option.textContent = i;
    if (i === previousDay) option.selected = true;
    daySelect.appendChild(option);
  }
});