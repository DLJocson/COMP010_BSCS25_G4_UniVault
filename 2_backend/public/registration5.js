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
        id: "work-email", // <-- fixed typo here
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
      if (input.offsetParent === null) return;
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

  function setupEventListeners() {
    const allSelects = document.querySelectorAll("select");
    allSelects.forEach((select) => {
      select.addEventListener("change", function () {
        if (this.value && this.value.trim() !== "") {
          clearFieldError(this);
        }
      });
    });

    const allInputs = document.querySelectorAll(
      'input[type="text"], input[type="email"]'
    );
    allInputs.forEach((input) => {
      input.addEventListener("input", function () {
        if (this.value.trim()) {
          clearFieldError(this);
        }
      });
    });
  }

  setupEventListeners();

  if (proceedBtn) {
    proceedBtn.onclick = function (e) {
      e.preventDefault();

      if (validateForm()) {
        // Save all form values to localStorage
        const elements = [
          "source-of-funds",
          "remittance-country",
          "remittance-purpose",
          "business-nature",
          "position",
          "gross-income",
          "work",
          "business-number",
          "tin",
          "zip-code",
          "work-email",
          "primary-employer",
          "unit",
          "building",
          "street",
          "subdivision",
          "barangay",
          "city",
          "province",
          "country",
        ];
        elements.forEach((id) => {
          const input = document.getElementById(id);
          if (input && input.value !== undefined) {
            localStorage.setItem(id, input.value.trim());
          }
        });

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

  setTimeout(() => {
    const sourceOfFunds = document.getElementById("source-of-funds");
    const businessNature = document.getElementById("business-nature");

    if (sourceOfFunds) {
      sourceOfFunds.onchange = function () {
        if (this.value && this.value.trim() !== "") {
          clearFieldError(this);
        }
      };
    }
    if (businessNature) {
      businessNature.onchange = function () {
        if (this.value && this.value.trim() !== "") {
          clearFieldError(this);
        }
      };
    }
  }, 500);
});