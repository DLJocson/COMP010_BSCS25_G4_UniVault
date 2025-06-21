document.addEventListener("DOMContentLoaded", function () {
  const checkbox = document.getElementById("yes");
  const containers = document.querySelector(".containers");
  const containers2 = document.querySelector(".containers2");

  if (checkbox) {
    checkbox.addEventListener("change", () => {
      if (containers && containers2) {
        containers.style.display = checkbox.checked ? "block" : "none";
        containers2.style.display = checkbox.checked ? "block" : "none";
      }
    });
  }

  const employmentPage = document.querySelector(".employment-page");
  if (employmentPage) {
    employmentPage.classList.add("error");
  }

  const proceedBtn = document.getElementById("proceed");

  function clearFieldError(field) {
    if (!field) return;

    // Remove error styling
    field.style.borderColor = "#0072d8";
    field.classList.remove("error");

    // Find and hide error message - try multiple approaches
    const parent = field.parentNode;
    if (parent) {
      // Method 1: Look for error-message class in parent
      const errorMsg = parent.querySelector(".error-message");
      if (errorMsg) {
        errorMsg.textContent = "";
        errorMsg.style.display = "none";
      }

      // Method 2: Look for next sibling
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

  function clearErrors() {
    const inputs = document.querySelectorAll(
      'input[type="text"], input[type="email"], select'
    );
    inputs.forEach((input) => clearFieldError(input));
  }

  function isSelectInvalid(selectElement) {
    if (!selectElement) return true;
    const value = selectElement.value;
    return !value || value.trim() === "";
  }

  function validateForm() {
    let isValid = true;
    clearErrors();

    // Get the value(s) of source-of-funds (could be select or multi-select)
    let sourceOfFundsInput = document.getElementById("source-of-funds");
    let sourceOfFundsMulti = document.getElementById("source-of-funds-multi");
    let sourceOfFundsValues = [];

    if (sourceOfFundsMulti && sourceOfFundsMulti.offsetParent !== null) {
      // Multi-select (native <select multiple>)
      sourceOfFundsValues = Array.from(sourceOfFundsMulti.selectedOptions).map(opt => opt.value);
    } else if (sourceOfFundsInput && sourceOfFundsInput.offsetParent !== null) {
      // Single select
      sourceOfFundsValues = [sourceOfFundsInput.value];
    } else {
      // Custom multi-checkbox dropdown
      const dropdownMenu = document.getElementById("dropdownMenu");
      if (dropdownMenu && dropdownMenu.offsetParent !== null) {
        const checked = Array.from(dropdownMenu.querySelectorAll('input[type="checkbox"]:checked'));
        sourceOfFundsValues = checked.map(cb => cb.value);
      }
    }

    // Helper: check if "Remittances" is selected
    const hasRemittances = sourceOfFundsValues.some(val =>
      val.trim().toLowerCase() === "remittances"
    );

    const elements = [
      { id: "source-of-funds", name: "Source of funds" },
      // Remittance fields will be conditionally validated below
      { id: "business-nature", name: "Nature of work" },
      { id: "position", name: "Position" },
      {
        id: "gross-income",
        name: "Gross income",
        regex: /^\d+(\.\d{1,2})?$/,
        regexMessage: "Please enter a valid amount",
      },
      { id: "work", name: "Country code" },
      {
        id: "business-number",
        name: "Business number",
        regex: /^\d{10,15}$/,
        regexMessage: "Business number must be 10-15 digits",
      },
      { id: "tin", name: "TIN" },
      { id: "zip-code", name: "Zip code" },
      {
        id: "work-emai",
        name: "Work email",
        regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        regexMessage: "Please enter a valid email address",
      },
      { id: "primary-employer", name: "Primary employer" },
      { id: "unit", name: "Unit" },
      { id: "building", name: "Building" },
      { id: "street", name: "Street" },
      { id: "subdivision", name: "Subdivision" },
      { id: "barangay", name: "Barangay" },
      { id: "city", name: "City" },
      { id: "province", name: "Province" },
      { id: "country", name: "Country" },
    ];

    elements.forEach(({ id, name, regex, regexMessage }) => {
      const input = document.getElementById(id);
      if (!input) return;

      // ✅ Skip fields not visible on screen
      if (input.offsetParent === null) {
        return;
      }

      const isEmpty =
        input.tagName === "SELECT"
          ? isSelectInvalid(input)
          : !input.value.trim();

      if (isEmpty) {
        showError(input, `${name} is required`);
        isValid = false;
      } else if (regex && !regex.test(input.value.trim())) {
        showError(input, regexMessage);
        isValid = false;
      }
    });

    // Conditionally validate Remittance Country and Purpose
    if (hasRemittances) {
      const remittanceCountry = document.getElementById("remittance-country");
      const remittancePurpose = document.getElementById("remittance-purpose");

      if (
        remittanceCountry &&
        remittanceCountry.offsetParent !== null &&
        isSelectInvalid(remittanceCountry)
      ) {
        showError(remittanceCountry, "Remittance country is required");
        isValid = false;
      }
      if (
        remittancePurpose &&
        remittancePurpose.offsetParent !== null &&
        isSelectInvalid(remittancePurpose)
      ) {
        showError(remittancePurpose, "Remittance purpose is required");
        isValid = false;
      }
    }

    return isValid;
  }

  // SIMPLE EVENT LISTENERS - This should work!
  function setupEventListeners() {
    // Get ALL select elements on the page
    const allSelects = document.querySelectorAll("select");
    console.log("Found selects:", allSelects.length);

    allSelects.forEach((select, index) => {
      console.log(`Select ${index}: id="${select.id}"`);

      // Add change event listener
      select.addEventListener("change", function () {
        console.log(`SELECT CHANGED: ${this.id} = "${this.value}"`);

        // Clear error if valid value selected
        if (this.value && this.value.trim() !== "") {
          console.log(`Clearing error for ${this.id}`);
          clearFieldError(this);
        }
      });
    });

    // Get ALL text/email inputs
    const allInputs = document.querySelectorAll(
      'input[type="text"], input[type="email"]'
    );
    console.log("Found inputs:", allInputs.length);

    allInputs.forEach((input, index) => {
      console.log(`Input ${index}: id="${input.id}"`);

      input.addEventListener("input", function () {
        console.log(`INPUT CHANGED: ${this.id} = "${this.value}"`);

        if (this.value.trim()) {
          console.log(`Clearing error for ${this.id}`);
          clearFieldError(this);
        }
      });
    });
  }

  // Setup event listeners
  setupEventListeners();

  // Proceed button
  if (proceedBtn) {
    proceedBtn.onclick = function (e) {
      e.preventDefault();
      console.log("Validating form...");

      if (validateForm()) {
        console.log("Form valid - redirecting");
        window.location.href = "registration6.html";
      } else {
        console.log("Form invalid - showing errors");
        const firstError = document.querySelector(".error");
        if (firstError) {
          firstError.scrollIntoView({ behavior: "smooth", block: "center" });
          firstError.focus();
        }
      }
      return false;
    };
  }

  // DIRECT FIX - Manually setup the problematic elements
  setTimeout(() => {
    const sourceOfFunds = document.getElementById("source-of-funds");
    const businessNature = document.getElementById("business-nature");

    if (sourceOfFunds) {
      console.log("MANUAL SETUP: source-of-funds found");
      sourceOfFunds.onchange = function () {
        console.log("MANUAL: source-of-funds changed to:", this.value);
        if (this.value && this.value.trim() !== "") {
          clearFieldError(this);
        }
      };
    } else {
      console.log("ERROR: source-of-funds NOT FOUND");
    }

    if (businessNature) {
      console.log("MANUAL SETUP: business-nature found");
      businessNature.onchange = function () {
        console.log("MANUAL: business-nature changed to:", this.value);
        if (this.value && this.value.trim() !== "") {
          clearFieldError(this);
        }
      };
    } else {
      console.log("ERROR: business-nature NOT FOUND");
    }
  }, 500);
});


function validateMultiSelect() {
  const multiSelect = document.getElementById("source-of-funds-multi");
  if (!multiSelect) return true;

  if (multiSelect.offsetParent === null) return true;

  const selected = Array.from(multiSelect.options).filter(opt => opt.selected);
  if (selected.length === 0) {
    showError(multiSelect, "Please select at least one source of funds");
    return false;
  } else {
    clearFieldError(multiSelect);
    return true;
  }
}

const originalValidateForm = validateForm;
function enhancedValidateForm() {
  let isValid = originalValidateForm();
  if (!validateMultiSelect()) isValid = false;
  return isValid;
}

if (proceedBtn) {
  proceedBtn.onclick = function (e) {
    e.preventDefault();
    if (enhancedValidateForm()) {
      window.location.href = "registration6.html";
    } else {
      const firstError = document.querySelector(".error");
      if (firstError) {
        firstError.scrollIntoView({ behavior: "smooth", block: "center" });
        firstError.focus();
      }
    }
    return false;
  };
}

const multiSelect = document.getElementById("source-of-funds-multi");
if (multiSelect) {
  multiSelect.addEventListener("change", function () {
    if (Array.from(this.options).some(opt => opt.selected)) {
      clearFieldError(this);
    }

    let summary = document.getElementById("source-of-funds-multi-summary");
    if (!summary) {
      summary = document.createElement("div");
      summary.id = "source-of-funds-multi-summary";
      summary.style.fontSize = "14px";
      summary.style.marginTop = "4px";
      this.parentNode.appendChild(summary);
    }
    const selected = Array.from(this.selectedOptions).map(opt => opt.text);
    summary.textContent = selected.length
      ? `Selected: ${selected.join(", ")}`
      : "";
  });
}

(function () {
  const dropdownBtn = document.getElementById("dropdownBtn");
  const dropdownMenu = document.getElementById("dropdownMenu");
  const hiddenInput = document.getElementById("source-of-funds-multi");
  const errorDiv = document.querySelector("#source-of .error-message");

  // Utility: Get all checked values and labels
  function getCheckedOptions() {
    const checkboxes = dropdownMenu.querySelectorAll('input[type="checkbox"]');
    const checked = Array.from(checkboxes).filter(cb => cb.checked);
    return {
      values: checked.map(cb => cb.value),
      labels: checked.map(cb => cb.parentNode.textContent.trim())
    };
  }

  // Update hidden input and button label
  function updateSelectionDisplay() {
    const { values, labels } = getCheckedOptions();
    hiddenInput.value = values.join(",");
    dropdownBtn.textContent = labels.length
      ? `Selected: ${labels.join(", ")}`
      : "Select Source(s) of Funds";
    // Remove error if at least one selected
    if (labels.length) {
      clearFieldError(hiddenInput);
      if (errorDiv) {
        errorDiv.textContent = "";
        errorDiv.style.display = "none";
      }
    }
  }

  // Show/hide dropdown menu
  if (dropdownBtn && dropdownMenu) {
    dropdownBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      dropdownMenu.style.display =
        dropdownMenu.style.display === "block" ? "none" : "block";
    });

    // Hide dropdown when clicking outside
    document.addEventListener("click", function (e) {
      if (!dropdownMenu.contains(e.target) && e.target !== dropdownBtn) {
        dropdownMenu.style.display = "none";
      }
    });
  }

  // Checkbox change events
  if (dropdownMenu) {
    dropdownMenu.addEventListener("change", function (e) {
      if (e.target.type === "checkbox") {
        updateSelectionDisplay();
      }
    });
  }

  // Validation: override validateMultiSelect to use checkboxes
  function validateMultiSelectEnhanced() {
    const { values } = getCheckedOptions();
    if (dropdownMenu.offsetParent === null) return true;
    if (values.length === 0) {
      showError(hiddenInput, "Please select at least one source of funds");
      // Also show error visually on dropdown
      dropdownBtn.style.borderColor = "#ff3860";
      if (errorDiv) {
        errorDiv.textContent = "Please select at least one source of funds";
        errorDiv.style.display = "block";
        errorDiv.style.color = "#ff3860";
        errorDiv.style.fontSize = "20px";
        errorDiv.style.marginTop = "5px";
        errorDiv.style.marginBottom = "10px";
      }
      return false;
    } else {
      clearFieldError(hiddenInput);
      dropdownBtn.style.borderColor = "";
      if (errorDiv) {
        errorDiv.textContent = "";
        errorDiv.style.display = "none";
      }
      return true;
    }
  }

  // Patch enhancedValidateForm to use enhanced multi-select validation
  if (typeof enhancedValidateForm === "function") {
    const origEnhancedValidateForm = enhancedValidateForm;
    window.enhancedValidateForm = function () {
      let isValid = origEnhancedValidateForm();
      if (!validateMultiSelectEnhanced()) isValid = false;
      return isValid;
    };
  }

  // Clear error on manual interaction
  if (dropdownMenu) {
    dropdownMenu.addEventListener("click", function () {
      if (getCheckedOptions().values.length) {
        clearFieldError(hiddenInput);
        dropdownBtn.style.borderColor = "";
        if (errorDiv) {
          errorDiv.textContent = "";
          errorDiv.style.display = "none";
        }
      }
    });
  }

  // Keyboard accessibility: close on Escape
  if (dropdownMenu) {
    dropdownMenu.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        dropdownMenu.style.display = "none";
        dropdownBtn.focus();
      }
    });
  }

  // Initial display update
  updateSelectionDisplay();
})();

(function () {
  const dropdownBtn = document.getElementById("businessNatureDropdownBtn");
  const dropdownMenu = document.getElementById("businessNatureDropdownMenu");
  const hiddenInput = document.getElementById("business-nature-multi");
  const errorDiv = document.querySelector(".business-nature .error-message");

  function getCheckedOptions() {
    if (!dropdownMenu) return { values: [], labels: [] };
    const checkboxes = dropdownMenu.querySelectorAll('input[type="checkbox"]');
    const checked = Array.from(checkboxes).filter(cb => cb.checked);
    return {
      values: checked.map(cb => cb.value),
      labels: checked.map(cb => cb.parentNode.textContent.trim())
    };
  }

  function updateSelectionDisplay() {
    if (!hiddenInput || !dropdownBtn) return;
    const { values, labels } = getCheckedOptions();
    hiddenInput.value = values.join(",");
    dropdownBtn.textContent = labels.length
      ? `Selected: ${labels.join(", ")}`
      : "Select Work/Business Nature";
    if (labels.length) {
      clearFieldError(hiddenInput);
      dropdownBtn.style.borderColor = "";
      if (errorDiv) {
        errorDiv.textContent = "";
        errorDiv.style.display = "none";
      }
    }
  }

  if (dropdownBtn && dropdownMenu) {
    dropdownBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      dropdownMenu.style.display =
        dropdownMenu.style.display === "block" ? "none" : "block";
    });

    document.addEventListener("click", function (e) {
      if (!dropdownMenu.contains(e.target) && e.target !== dropdownBtn) {
        dropdownMenu.style.display = "none";
      }
    });
  }

  if (dropdownMenu && dropdownBtn && hiddenInput) {
    dropdownMenu.addEventListener("change", function (e) {
      if (e.target.type === "checkbox") {
        updateSelectionDisplay();
      }
    });
    dropdownMenu.addEventListener("click", function () {
      if (getCheckedOptions().values.length) {
        clearFieldError(hiddenInput);
        dropdownBtn.style.borderColor = "";
        if (errorDiv) {
          errorDiv.textContent = "";
          errorDiv.style.display = "none";
        }
      }
    });
    dropdownMenu.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        dropdownMenu.style.display = "none";
        dropdownBtn.focus();
      }
    });
  }

  function validateBusinessNatureMultiSelect() {
    if (!dropdownMenu || !dropdownBtn || !hiddenInput) return true;
    const { values } = getCheckedOptions();
    if (dropdownMenu.offsetParent === null) return true;
    if (values.length === 0) {
      showError(hiddenInput, "Please select at least one work/business nature");
      dropdownBtn.style.borderColor = "#ff3860";
      if (errorDiv) {
        errorDiv.textContent = "Please select at least one work/business nature";
        errorDiv.style.display = "block";
        errorDiv.style.color = "#ff3860";
        errorDiv.style.fontSize = "20px";
        errorDiv.style.marginTop = "5px";
        errorDiv.style.marginBottom = "10px";
      }
      return false;
    } else {
      clearFieldError(hiddenInput);
      dropdownBtn.style.borderColor = "";
      if (errorDiv) {
        errorDiv.textContent = "";
        errorDiv.style.display = "none";
      }
      return true;
    }
  }

  // Patch enhancedValidateForm to include business-nature-multi validation
  if (typeof enhancedValidateForm === "function") {
    const origEnhancedValidateForm = enhancedValidateForm;
    window.enhancedValidateForm = function () {
      let isValid = origEnhancedValidateForm();
      if (!validateBusinessNatureMultiSelect()) isValid = false;
      return isValid;
    };
  }

  // Initial display update
  updateSelectionDisplay();
})();