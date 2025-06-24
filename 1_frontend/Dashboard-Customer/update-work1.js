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

    const elements = [
      { id: "source-of-funds", name: "Source of funds" },
      { id: "remittance-country", name: "Remittance country" },
      { id: "remittance-purpose", name: "Remittance purpose" },
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
        window.location.href = "update-work2.html";
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
