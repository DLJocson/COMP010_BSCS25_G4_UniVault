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

  // Add default option for month
  monthSelect.innerHTML =
    '<option value="" disabled selected>Select Month</option>';
  months.forEach((month, index) => {
    const option = document.createElement("option");
    option.value = index + 1;
    option.textContent = month;
    monthSelect.appendChild(option);
  });

  function populateDays(totalDays = 31) {
    const previousDay = parseInt(daySelect.value);
    daySelect.innerHTML =
      '<option value="" disabled selected>Select Day</option>';

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

  // Add default option for year
  yearSelect.innerHTML =
    '<option value="" disabled selected>Select Year</option>';
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
  const selectId1 = document.getElementById("select-id1");
  const idNum1 = document.getElementById("id1-num");

  const resetToDefault = (element) => {
    let inputControl;
    let errorDisplay;

    if (element.type === "file") {
      inputControl = element.closest(".upload-box");
      errorDisplay = document.getElementById(`error-${element.id}`);
    } else {
      inputControl =
        element.closest(".checkbox-container") ||
        element.closest(".date") ||
        element.closest(".select-id") ||
        element.closest(".id-num") ||
        element.parentElement;
      errorDisplay = inputControl
        ? inputControl.querySelector(".error-message")
        : null;
    }

    if (inputControl) {
      inputControl.classList.remove("error", "success");
    }

    if (errorDisplay) {
      errorDisplay.innerText = "";
      errorDisplay.style.display = "none";
    }
  };

  [firstName, middleName, lastName, suffix, idNum1].forEach((input) => {
    if (input) {
      input.addEventListener("input", () => resetToDefault(input));
    }
  });

  [monthSelect, daySelect, yearSelect, selectId1].forEach((select) => {
    if (select) {
      select.addEventListener("change", () => resetToDefault(select));
    }
  });

  addPurposeListeners();

  addUploadListeners();
}

function addPurposeListeners() {
  const checkboxes = [
    document.getElementById("purpose-political"),
    document.getElementById("purpose-fatca"),
    document.getElementById("purpose-dnfbp"),
  ];

  checkboxes.forEach((checkbox) => {
    if (checkbox) {
      checkbox.addEventListener("change", () => {
        const isAnyChecked = checkboxes.some((cb) => cb && cb.checked);
        const errorElement = document.getElementById("error-purpose");
        if (isAnyChecked && errorElement) {
          errorElement.textContent = "";
          errorElement.style.display = "none";
        }
      });
    }
  });
}

function addUploadListeners() {
  const fileInputs = ["front-id-1", "back-id-1"];

  fileInputs.forEach((id) => {
    const input = document.getElementById(id);

    if (!input) {
      console.error(`File input with id '${id}' not found`);
      return;
    }

    input.addEventListener("change", (e) => {
      const file = e.target.files[0];
      const errorElement = document.getElementById(`error-${id}`);
      const uploadBox = input.closest(".upload-box");
      const direction = uploadBox
        ? uploadBox.querySelector(".direction")
        : null;

      // Reset previous states
      if (uploadBox) {
        uploadBox.classList.remove("error", "success");
      }

      if (errorElement) {
        errorElement.textContent = "";
        errorElement.style.display = "none";
      }

      if (!file) {
        // No file selected
        if (direction) {
          const originalText =
            id === "front-id-1"
              ? "Upload Front of ID 1"
              : "Upload Back of ID 1";
          direction.textContent = originalText;
          direction.style.color = "";
        }
        return;
      }

      const validTypes = ["image/jpeg", "image/jpg", "image/png"];
      const fileType = file.type.toLowerCase();

      if (!validTypes.includes(fileType)) {
        if (errorElement) {
          errorElement.textContent = "Only JPG and PNG files are allowed.";
          errorElement.style.display = "block";
          errorElement.style.textAlign = "center";
        }
        if (uploadBox) {
          uploadBox.classList.add("error");
        }
        input.value = ""; // Clear the invalid file
        return;
      }

      if (direction) {
        direction.textContent = `✓ ${file.name} uploaded`;
        direction.style.color = "green";
        direction.style.textAlign = "center";
      }

      if (uploadBox) {
        uploadBox.classList.add("success");
      }
    });
  });
}

function clearError(id) {
  const errorElement = document.getElementById(`error-${id}`);
  const inputElement = document.getElementById(id);

  if (errorElement) {
    errorElement.textContent = "";
    errorElement.style.display = "none";
  }

  if (inputElement) {
    const uploadBox = inputElement.closest(".upload-box");
    if (uploadBox) {
      uploadBox.classList.remove("error");
    } else {
      inputElement.classList.remove("error");
    }
  }
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
  const selectId1 = document.getElementById("select-id1");
  const idNum1 = document.getElementById("id1-num");
  const proceedButton = document.getElementById("proceed");

  console.log("Proceed button found:", !!proceedButton);

  if (!proceedButton) {
    console.error("Proceed button not found!");
    return;
  }

  const setError = (element, message) => {
    let inputControl;
    let errorDisplay;

    if (element.type === "file") {
      // For file inputs, target the upload box
      inputControl = element.closest(".upload-box");
      errorDisplay = document.getElementById(`error-${element.id}`);
    } else {
      // For regular inputs and selects - match your actual HTML structure
      inputControl =
        element.closest(".checkbox-container") ||
        element.closest(".date") ||
        element.closest(".select-id") ||
        element.closest(".id-num") ||
        element.parentElement;
      errorDisplay = inputControl
        ? inputControl.querySelector(".error-message")
        : null;
    }

    if (errorDisplay) {
      errorDisplay.innerText = message;
      errorDisplay.style.display = "block";
    }
    if (inputControl) {
      inputControl.classList.add("error");
      inputControl.classList.remove("success");
    }
  };

  const setSuccess = (element) => {
    let inputControl;
    let errorDisplay;

    if (element.type === "file") {
      // For file inputs, target the upload box
      inputControl = element.closest(".upload-box");
      errorDisplay = document.getElementById(`error-${element.id}`);
    } else {
      // For regular inputs and selects - match your actual HTML structure
      inputControl =
        element.closest(".checkbox-container") ||
        element.closest(".date") ||
        element.closest(".select-id") ||
        element.closest(".id-num") ||
        element.parentElement;
      errorDisplay = inputControl
        ? inputControl.querySelector(".error-message")
        : null;
    }

    if (errorDisplay) {
      errorDisplay.innerText = "";
      errorDisplay.style.display = "none";
    }
    if (inputControl) {
      inputControl.classList.add("success");
      inputControl.classList.remove("error");
    }
  };

  const validateInputs = () => {
    let isValid = true;

    // Validate required text fields
    if (!firstName || !firstName.value.trim()) {
      if (firstName) setError(firstName, "First Name is required");
      isValid = false;
    } else if (firstName) {
      setSuccess(firstName);
    }

    if (!middleName || !middleName.value.trim()) {
      if (middleName) setError(middleName, "Middle Name is required");
      isValid = false;
    } else if (middleName) {
      setSuccess(middleName);
    }

    if (!lastName || !lastName.value.trim()) {
      if (lastName) setError(lastName, "Last Name is required");
      isValid = false;
    } else if (lastName) {
      setSuccess(lastName);
    }

    // Suffix is optional, but validate if it exists
    if (suffix) {
      if (suffix.value.trim() && suffix.value.trim() !== "0") {
        setSuccess(suffix);
      } else if (suffix.value.trim() === "") {
        setError(suffix, "Enter suffix or press 0 if not applicable");
        isValid = false;
      } else {
        setSuccess(suffix);
      }
    }

    // Validate date fields
    if (!monthSelect || !monthSelect.value) {
      if (monthSelect) setError(monthSelect, "Month is required");
      isValid = false;
    } else if (monthSelect) {
      setSuccess(monthSelect);
    }

    if (!daySelect || !daySelect.value) {
      if (daySelect) setError(daySelect, "Day is required");
      isValid = false;
    } else if (daySelect) {
      setSuccess(daySelect);
    }

    if (!yearSelect || !yearSelect.value) {
      if (yearSelect) setError(yearSelect, "Year is required");
      isValid = false;
    } else if (yearSelect) {
      setSuccess(yearSelect);
    }

    if (!selectId1 || !selectId1.value) {
      if (selectId1) setError(selectId1, "ID type is required");
      isValid = false;
    } else if (selectId1) {
      setSuccess(selectId1);
    }

    if (!idNum1 || !idNum1.value.trim()) {
      if (idNum1) setError(idNum1, "ID number is required");
      isValid = false;
    } else if (idNum1) {
      setSuccess(idNum1);
    }

    return isValid;
  };

  function validatePurposeSection() {
    const purposePolitical = document.getElementById("purpose-political");
    const purposeFatca = document.getElementById("purpose-fatca");
    const purposeDnfbp = document.getElementById("purpose-dnfbp");
    const purposeError = document.getElementById("error-purpose");

    const isChecked =
      (purposePolitical && purposePolitical.checked) ||
      (purposeFatca && purposeFatca.checked) ||
      (purposeDnfbp && purposeDnfbp.checked);

    if (!isChecked) {
      if (purposeError) {
        purposeError.textContent = "Please select at least one purpose.";
        purposeError.style.display = "block";
      }
      return false;
    } else {
      if (purposeError) {
        purposeError.textContent = "";
        purposeError.style.display = "none";
      }
      return true;
    }
  }

  function validateUploadSection() {
    let isValid = true;

    // Match the actual file input IDs in your HTML
    const uploads = [
      { id: "front-id-1", name: "Front of ID 1" },
      { id: "back-id-1", name: "Back of ID 1" },
    ];

    uploads.forEach(({ id, name }) => {
      const input = document.getElementById(id);
      const errorElement = document.getElementById(`error-${id}`);
      const uploadBox = input ? input.closest(".upload-box") : null;

      if (!input) {
        console.error(`Upload input with id '${id}' not found`);
        return;
      }

      if (!input.files || !input.files[0]) {
        // Show error message
        if (errorElement) {
          errorElement.textContent = `${name} is required`;
          errorElement.style.display = "block";
        }

        // Add error styling to upload box
        if (uploadBox) {
          uploadBox.classList.add("error");
          uploadBox.classList.remove("success");
        }

        isValid = false;
      } else {
        // Clear error message
        if (errorElement) {
          errorElement.textContent = "";
          errorElement.style.display = "none";
        }

        // Add success styling to upload box
        if (uploadBox) {
          uploadBox.classList.remove("error");
          uploadBox.classList.add("success");
        }
      }
    });

    return isValid;
  }

  proceedButton.addEventListener("click", (e) => {
    e.preventDefault();
    console.log("Proceed button clicked!");

    const isFormValid = validateInputs();
    const isPurposeValid = validatePurposeSection();
    const isUploadValid = validateUploadSection();

    console.log("Form valid:", isFormValid);
    console.log("Purpose valid:", isPurposeValid);
    console.log("Upload valid:", isUploadValid);

    if (isFormValid && isPurposeValid && isUploadValid) {
      // Remove any existing success message
      const existingMessage = document.querySelector(".success-message");
      if (existingMessage) {
        existingMessage.remove();
      }

      // Create success message
      const successMessage = document.createElement("div");
      successMessage.className = "success-message";
      successMessage.style.cssText = `
        color: green;
        font-size: 20px;
        text-align: center;
        margin: 20px 0;
        padding: 10px;
        background-color: #f8fff9;
        border: 1px solid #28a745;
        border-radius: 5px;
      `;
      successMessage.textContent =
        "✓ Form is valid! Ready to proceed to the next step.";

      // Insert success message before the button container
      const buttonContainer = document.querySelector(".button");
      const compliancePage = document.querySelector(".compliance-page");
      if (buttonContainer && compliancePage) {
        compliancePage.insertBefore(successMessage, buttonContainer);
      }

      // Navigate to next page after delay
      setTimeout(() => {
        // window.location.href = "registration10.html";
        console.log("Would navigate to registration10.html");
      }, 1500);
    } else {
      console.log("Form has validation errors.");
    }
  });

  addInputListeners();
}

function attachInputListeners() {
  const inputs = document.querySelectorAll("input, select");
  inputs.forEach((input) => {
    input.addEventListener("input", () => clearError(input.id));
    input.addEventListener("change", () => clearError(input.id));
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initializeDateDropdowns();
  initializeFormValidation();
  addUploadListeners();
  attachInputListeners();
});
