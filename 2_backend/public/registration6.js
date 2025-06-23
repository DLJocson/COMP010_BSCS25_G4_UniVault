document.addEventListener("DOMContentLoaded", () => {
  const containers = document.getElementById("containers");
  const yesCheckbox = document.getElementById("yes-alias");
  const noCheckbox = document.getElementById("no-alias");

<<<<<<< HEAD:2_backend/public/registration6.js
  if (checkbox && containers) {
    checkbox.addEventListener("change", () => {
      containers.style.display = checkbox.checked ? "none" : "block";
    });
  }
=======
  // Hide the alias form by default
  if (containers) containers.style.display = "none";

  function updateAliasForm() {
    if (yesCheckbox && yesCheckbox.checked) {
      if (noCheckbox) noCheckbox.checked = false;
      if (containers) containers.style.display = "block";
      localStorage.removeItem("alias"); // User will fill alias fields
    } else if (noCheckbox && noCheckbox.checked) {
      if (yesCheckbox) yesCheckbox.checked = false;
      if (containers) containers.style.display = "none";
      localStorage.setItem("alias", "No");
      clearAllErrorsInContainers();
    } else {
      // If neither is checked, hide the form
      if (containers) containers.style.display = "none";
      localStorage.removeItem("alias");
      clearAllErrorsInContainers();
    }
  }

  if (yesCheckbox) yesCheckbox.addEventListener("change", updateAliasForm);
  if (noCheckbox) noCheckbox.addEventListener("change", updateAliasForm);

  // On load, ensure correct state
  updateAliasForm();
  handleProceedClick(); // <-- Attach the Proceed button logic on page load
>>>>>>> main:1_frontend/Registration-Customer/registration6.js
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
    if (!input) return;

    // Check if input element exists before adding event listener
    if (input) {
        input.addEventListener("change", () => {
        const file = input.files[0];
        const errorElement = document.getElementById(`error-${id}`);
        const uploadBox = input.closest(".upload-box");

        if (!file) return;

<<<<<<< HEAD:2_backend/public/registration6.js
      if (!validTypes.includes(file.type)) {
        if (errorElement) errorElement.textContent = "Only JPG and PNG files are allowed.";
        input.value = "";
        if (uploadBox) uploadBox.classList.add("error");
      } else {
        if (errorElement) errorElement.textContent = "";
        if (uploadBox) uploadBox.classList.remove("error");

        const direction = uploadBox ? uploadBox.querySelector(".direction") : null;
        if (direction) {
          direction.textContent = `✓ ${file.name} uploaded`;
          direction.style.color = "green";
        }
      }
    });
=======
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
>>>>>>> main:1_frontend/Registration-Customer/registration6.js
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
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

<<<<<<< HEAD:2_backend/public/registration6.js
=======
  // Only populate if elements exist
>>>>>>> main:1_frontend/Registration-Customer/registration6.js
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
<<<<<<< HEAD:2_backend/public/registration6.js
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
=======
>>>>>>> main:1_frontend/Registration-Customer/registration6.js
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
<<<<<<< HEAD:2_backend/public/registration6.js
    if (!monthSelect || !yearSelect || !daySelect) return;
    const month = parseInt(monthSelect.value);
    const year = parseInt(yearSelect.value);
    if (!month || !year) return;
=======
    if (!monthSelect || !yearSelect || !daySelect) return; // Ensure elements exist

    const month = parseInt(monthSelect.value);
    const year = parseInt(yearSelect.value);
    // Handle cases where month/year might not be selected yet (value is NaN)
    if (isNaN(month) || isNaN(year) || month === 0) { // month === 0 if "Select Month" is chosen after initial load
        daySelect.innerHTML = '<option value="" disabled selected>Select Day</option>';
        return;
    }

>>>>>>> main:1_frontend/Registration-Customer/registration6.js
    const daysInMonth = new Date(year, month, 0).getDate();

    daySelect.innerHTML = '<option value="" disabled selected>Select Day</option>';
    for (let d = 1; d <= daysInMonth; d++) {
      const option = document.createElement("option");
      option.value = d;
      option.textContent = d;
      daySelect.appendChild(option);
    }
  }

<<<<<<< HEAD:2_backend/public/registration6.js
  if (monthSelect1 && yearSelect1 && daySelect1) {
    monthSelect1.addEventListener("change", () => updateDays(monthSelect1, yearSelect1, daySelect1));
    yearSelect1.addEventListener("change", () => updateDays(monthSelect1, yearSelect1, daySelect1));
  }
  if (monthSelect2 && yearSelect2 && daySelect2) {
    monthSelect2.addEventListener("change", () => updateDays(monthSelect2, yearSelect2, daySelect2));
    yearSelect2.addEventListener("change", () => updateDays(monthSelect2, yearSelect2, daySelect2));
=======
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
>>>>>>> main:1_frontend/Registration-Customer/registration6.js
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
  const yesCheckbox = document.getElementById("yes-alias");
  const noCheckbox = document.getElementById("no-alias");

  if (!proceedBtn || proceedBtn.dataset.listenerAttached) {
      return;
  }
  proceedBtn.dataset.listenerAttached = "true";

  proceedBtn.addEventListener("click", () => {
    if (yesCheckbox && yesCheckbox.checked) {
      // Validate alias and ID fields if Yes
      if (validateAliasAndIDs()) {
        // Save all alias fields to localStorage
        localStorage.setItem("alias_first_name", document.getElementById("first-name").value);
        localStorage.setItem("alias_middle_name", document.getElementById("middle-name").value);
        localStorage.setItem("alias_last_name", document.getElementById("last-name").value);
        window.location.href = "registration7.html";
      }
    } else if (noCheckbox && noCheckbox.checked) {
      // Allow direct proceed if No
      localStorage.setItem("alias", "No");
      window.location.href = "registration7.html";
    }
  });
}


function validateAliasAndIDs() {
  let isValid = true;
  const containers = document.getElementById("containers"); // Get the container to limit validation to visible fields

  // Required alias fields - only First and Last name
  const aliasFields = [
    { id: "first-name", msg: "Alias first name is required" },
    { id: "last-name", msg: "Alias last name is required" }
    // Removed middle-name as it's not required
  ];

  aliasFields.forEach(({ id, msg }) => {
    const el = document.getElementById(id);
<<<<<<< HEAD:2_backend/public/registration6.js
    if (!el || el.value === "" || (el.tagName === "SELECT" && !el.value)) {
      showError(id, msg);
      isValid = false;
=======
    // Only validate if the element exists and is inside the visible 'containers'
    if (el && containers.contains(el)) {
        if (el.value.trim() === "") {
            showError(id, msg);
            isValid = false;
        }
>>>>>>> main:1_frontend/Registration-Customer/registration6.js
    }
  });

  // Required ID 1 fields - only ID Type, ID Number, and Issue Date (Month and Year)
  const id1Fields = [
    { id: "select-id1", msg: "ID 1 type is required" },
    { id: "id1-num", msg: "ID 1 number is required" },
    { id: "issue-month-id1", msg: "Issue month is required" },
    { id: "issue-year-id1", msg: "Issue year is required" }
    // Removed expiration date fields and day field as they're not required
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

  // ID 1 file fields - front and back uploads are required
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

  // Required ID 2 fields - only ID Type, ID Number, and Issue Date (Month and Year)
  const id2Fields = [
    { id: "select-id2", msg: "ID 2 type is required" },
    { id: "id2-num", msg: "ID 2 number is required" },
    { id: "issue-month-id2", msg: "Issue month is required" },
    { id: "issue-year-id2", msg: "Issue year is required" }
    // Removed expiration date fields and day field as they're not required
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

  // ID 2 file fields - front and back uploads are required
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

function populateDays(daySelectId, monthSelectId, yearSelectId) {
  const daySelect = document.getElementById(daySelectId);
  const monthSelect = document.getElementById(monthSelectId);
  const yearSelect = document.getElementById(yearSelectId);

<<<<<<< HEAD:2_backend/public/registration6.js
  if (!proceedBtn) return;

  proceedBtn.addEventListener("click", () => {
    const checkbox = document.getElementById("yes");
    const aliasSkipped = checkbox && checkbox.checked;

    if (aliasSkipped || validateForm()) {
      // Save form data to localStorage
      const fieldsToSave = [
        "first-name", "middle-name", "last-name",
        "month", "day", "year",
        "select-id1", "id1-num", "front-id-1", "back-id-1",
        "month-id2", "day-id2", "year-id2",
        "select-id2", "id2-num", "front-id-2", "back-id-2"
      ];
      fieldsToSave.forEach((id) => {
        const el = document.getElementById(id);
        if (el && el.value !== undefined) {
          localStorage.setItem(id, el.value);
        }
      });
      window.location.href = "registration7.html";
    }
  });
}
=======
  function updateDays() {
    const month = parseInt(monthSelect.value, 10);
    let daysInMonth;
    if (isNaN(month)) {
      daySelect.innerHTML = '<option value="" disabled selected>Select Day</option>';
      return;
    }
    if (month === 2) {
      daysInMonth = 29;
    } else if ([4, 6, 9, 11].includes(month)) {
      daysInMonth = 30;
    } else {
      daysInMonth = 31;
    }
    daySelect.innerHTML = '<option value="" disabled selected>Select Day</option>';
    for (let d = 1; d <= daysInMonth; d++) {
      const option = document.createElement("option");
      option.value = d;
      option.textContent = d;
      daySelect.appendChild(option);
    }
  }

  monthSelect.addEventListener("change", updateDays);
}

document.addEventListener("DOMContentLoaded", function() {
  populateDays("issue-day-id1", "issue-month-id1", "issue-year-id1");
  populateDays("day", "month", "year");
  populateDays("issue-day-id2", "issue-month-id2", "issue-year-id2");
  populateDays("day-id2", "month-id2", "year-id2");
});
>>>>>>> main:1_frontend/Registration-Customer/registration6.js
