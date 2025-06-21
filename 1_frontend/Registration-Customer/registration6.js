document.addEventListener("DOMContentLoaded", () => {
  const containers = document.getElementById("containers");
  const checkbox = document.getElementById("yes");

  // Initial state: Hide the 'containers' div by default
  if (containers) containers.style.display = "none";

  if (checkbox) {
    function showHideMainContent() {
      if (checkbox.checked) {
        // If "Yes" is checked, show the 'containers' div
        if (containers) containers.style.display = "block";

        // Initialize the rest of the form only once
        if (!containers.dataset.initialized) {
          populateDateDropdowns();
          attachInputListeners();
          handleProceedClick(); // Re-attach listener after content is potentially shown
          handleFileUploadValidation();
          containers.dataset.initialized = "true";
        }
      } else {
        // If "Yes" is NOT checked, hide the 'containers' div
        if (containers) containers.style.display = "none";
        // Optionally, clear any error messages if the user unchecks "Yes" after seeing errors
        clearAllErrorsInContainers(); // New helper function
      }
    }
    // Run on load in case checkbox is already checked (e.g., after a page refresh preserving state)
    showHideMainContent();
    checkbox.addEventListener("change", showHideMainContent);
  }
});

// New helper function to clear errors when hiding the form
function clearAllErrorsInContainers() {
    const containers = document.getElementById("containers");
    if (containers) {
        const errorMessages = containers.querySelectorAll(".error-message");
        errorMessages.forEach(errorEl => {
            errorEl.textContent = "";
        });
        const errorInputs = containers.querySelectorAll("input.error, select.error, .upload-box.error");
        errorInputs.forEach(inputEl => {
            inputEl.classList.remove("error");
        });
        // Also reset file upload text if needed
        const fileUploadDirections = containers.querySelectorAll(".upload-box .direction");
        fileUploadDirections.forEach(directionEl => {
            // You might need to adjust this to your default text
            if (directionEl.textContent.startsWith("✓")) { // Only reset if it shows an uploaded file
                const inputId = directionEl.closest(".upload-box").querySelector("input[type='file']").id;
                if (inputId === "front-id-1") directionEl.textContent = "Upload Front of ID 1";
                else if (inputId === "back-id-1") directionEl.textContent = "Upload Back of ID 1";
                else if (inputId === "front-id-2") directionEl.textContent = "Upload Front of ID 2";
                else if (inputId === "back-id-2") directionEl.textContent = "Upload Back of ID 2";
                directionEl.style.color = ""; // Remove green color
            }
        });
    }
}


function handleFileUploadValidation() {
  const validTypes = ["image/jpeg", "image/png"];
  const fileInputs = ["front-id-1", "back-id-1", "front-id-2", "back-id-2"];

  fileInputs.forEach((id) => {
    const input = document.getElementById(id);

    // Check if input element exists before adding event listener
    if (input) {
        input.addEventListener("change", () => {
        const file = input.files[0];
        const errorElement = document.getElementById(`error-${id}`);
        const uploadBox = input.closest(".upload-box");

        if (!file) return;

        if (!validTypes.includes(file.type)) {
            errorElement.textContent = "Only JPG and PNG files are allowed.";
            input.value = ""; // Clear the selected file
            uploadBox.classList.add("error");
        } else {
            errorElement.textContent = "";
            uploadBox.classList.remove("error");

            const direction = uploadBox.querySelector(".direction");
            direction.textContent = `✓ ${file.name} uploaded`;
            direction.style.color = "green";
        }
        });
    }
  });
}

function populateDateDropdowns() {
  const monthSelect1 = document.getElementById("month");
  const daySelect1 = document.getElementById("day");
  const yearSelect1 = document.getElementById("year");

  const monthSelect2 = document.getElementById("month-id2");
  const daySelect2 = document.getElementById("day-id2");
  const yearSelect2 = document.getElementById("year-id2");

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

  // Only populate if elements exist
  if (monthSelect1 && monthSelect2) {
    months.forEach((month, index) => {
      const option1 = document.createElement("option");
      option1.value = index + 1;
      option1.textContent = month;
      monthSelect1.appendChild(option1);

      const option2 = document.createElement("option");
      option2.value = index + 1;
      option2.textContent = month;
      monthSelect2.appendChild(option2);
    });
  }


  if (yearSelect1 && yearSelect2) {
    for (let y = new Date().getFullYear(); y >= 1900; y--) {
      const option1 = document.createElement("option");
      option1.value = y;
      option1.textContent = y;
      yearSelect1.appendChild(option1);

      const option2 = document.createElement("option");
      option2.value = y;
      option2.textContent = y;
      yearSelect2.appendChild(option2);
    }
  }


  function updateDays(monthSelect, yearSelect, daySelect) {
    if (!monthSelect || !yearSelect || !daySelect) return; // Ensure elements exist

    const month = parseInt(monthSelect.value);
    const year = parseInt(yearSelect.value);
    // Handle cases where month/year might not be selected yet (value is NaN)
    if (isNaN(month) || isNaN(year) || month === 0) { // month === 0 if "Select Month" is chosen after initial load
        daySelect.innerHTML = '<option value="" disabled selected>Select Day</option>';
        return;
    }

    const daysInMonth = new Date(year, month, 0).getDate();

    daySelect.innerHTML =
      '<option value="" disabled selected>Select Day</option>';
    for (let d = 1; d <= daysInMonth; d++) {
      const option = document.createElement("option");
      option.value = d;
      option.textContent = d;
      daySelect.appendChild(option);
    }
  }

  // Attach listeners only if elements exist
  if (monthSelect1 && yearSelect1 && daySelect1) {
    monthSelect1.addEventListener("change", () =>
      updateDays(monthSelect1, yearSelect1, daySelect1)
    );
    yearSelect1.addEventListener("change", () =>
      updateDays(monthSelect1, yearSelect1, daySelect1)
    );
  }


  if (monthSelect2 && yearSelect2 && daySelect2) {
    monthSelect2.addEventListener("change", () =>
      updateDays(monthSelect2, yearSelect2, daySelect2)
    );
    yearSelect2.addEventListener("change", () =>
      updateDays(monthSelect2, yearSelect2, daySelect2)
    );
  }
}

function attachInputListeners() {
  const inputs = document.querySelectorAll("#containers input, #containers select"); // Target inputs only within #containers
  inputs.forEach((input) => {
    input.addEventListener("input", () => clearError(input.id));
    input.addEventListener("change", () => clearError(input.id));
  });
}

function showError(id, message = "This field is required!") {
  const errorElement = document.getElementById(`error-${id}`);
  const inputElement = document.getElementById(id);

  if (errorElement) {
    errorElement.textContent = message;
    errorElement.style.color = "red";
  }

  if (inputElement) {
    const uploadBox = inputElement.closest(".upload-box");
    if (uploadBox) {
      uploadBox.classList.add("error");
    } else {
      inputElement.classList.add("error");
    }
  }
}

function clearError(id) {
  const errorElement = document.getElementById(`error-${id}`);
  const inputElement = document.getElementById(id);

  if (errorElement) errorElement.textContent = "";
  if (inputElement) {
    const uploadBox = inputElement.closest(".upload-box");
    if (uploadBox) {
      uploadBox.classList.remove("error");
    } else {
      inputElement.classList.remove("error");
    }
  }
}

// Removed the old validateForm() as validateAliasAndIDs() is more comprehensive for this page.
/*
function validateForm() {
  // ... (old validateForm content)
}
*/

function handleProceedClick() {
  const proceedBtn = document.getElementById("proceed");

  // Ensure the event listener is only attached once
  // This check is important because handleProceedClick is called inside showHideMainContent
  // which might be called multiple times if the checkbox is toggled.
  if (proceedBtn.dataset.listenerAttached) {
      return;
  }
  proceedBtn.dataset.listenerAttached = "true"; // Mark as attached

  proceedBtn.addEventListener("click", () => {
    const checkbox = document.getElementById("yes");

    if (checkbox.checked) {
      // If "Yes" is checked, validate ALL alias and ID fields
      if (validateAliasAndIDs()) {
        window.location.href = "registration7.html";
      }
    } else {
      // If "Yes" is NOT checked, proceed without validating alias/ID fields
      window.location.href = "registration7.html";
    }
  });
}


function validateAliasAndIDs() {
  let isValid = true;
  const containers = document.getElementById("containers"); // Get the container to limit validation to visible fields

  // Alias fields
  const aliasFields = [
    { id: "first-name", msg: "Alias first name is required" },
    { id: "middle-name", msg: "Alias middle name is required" },
    { id: "last-name", msg: "Alias last name is required" }
  ];

  aliasFields.forEach(({ id, msg }) => {
    const el = document.getElementById(id);
    // Only validate if the element exists and is inside the visible 'containers'
    if (el && containers.contains(el)) {
        if (el.value.trim() === "") {
            showError(id, msg);
            isValid = false;
        }
    }
  });

  // ID 1 fields
  const id1Fields = [
    { id: "select-id1", msg: "ID 1 type is required" },
    { id: "id1-num", msg: "ID 1 number is required" },
    { id: "month", msg: "Month is required" },
    { id: "day", msg: "Day is required" },
    { id: "year", msg: "Year is required" }
  ];

  id1Fields.forEach(({ id, msg }) => {
    const el = document.getElementById(id);
    if (el && containers.contains(el)) {
        // For select dropdowns, check if a valid option is selected (value is not empty)
        if (!el.value || el.value === "" || el.value === null) {
            showError(id, msg);
            isValid = false;
        }
    }
  });

  // ID 1 file fields
  const id1FileFields = [
    { id: "front-id-1", msg: "Front image of ID 1 is required" },
    { id: "back-id-1", msg: "Back image of ID 1 is required" }
  ];

  id1FileFields.forEach(({ id, msg }) => {
    const el = document.getElementById(id);
    if (el && containers.contains(el)) {
        if (!el.files || !el.files.length) {
            showError(id, msg);
            isValid = false;
        }
    }
  });

  // ID 2 fields
  const id2Fields = [
    { id: "select-id2", msg: "ID 2 type is required" },
    { id: "id2-num", msg: "ID 2 number is required" },
    { id: "month-id2", msg: "Month is required" },
    { id: "day-id2", msg: "Day is required" },
    { id: "year-id2", msg: "Year is required" }
  ];

  id2Fields.forEach(({ id, msg }) => {
    const el = document.getElementById(id);
    if (el && containers.contains(el)) {
        if (!el.value || el.value === "" || el.value === null) {
            showError(id, msg);
            isValid = false;
        }
    }
  });

  // ID 2 file fields
  const id2FileFields = [
    { id: "front-id-2", msg: "Front image of ID 2 is required" },
    { id: "back-id-2", msg: "Back image of ID 2 is required" }
  ];

  id2FileFields.forEach(({ id, msg }) => {
    const el = document.getElementById(id);
    if (el && containers.contains(el)) {
        if (!el.files || !el.files.length) {
            showError(id, msg);
            isValid = false;
        }
    }
  });

  return isValid;
}