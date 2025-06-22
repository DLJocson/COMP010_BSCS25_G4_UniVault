document.addEventListener("DOMContentLoaded", () => {
  populateDateDropdowns();
  attachInputListeners();
  handleFileUploadValidation();
  handleProceedClick();
});

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
  // Get all month selects
  const monthSelects = [
    document.getElementById("issue-month-id1"),
    document.getElementById("month"),
    document.getElementById("issue-month-id2"),
    document.getElementById("month-id2")
  ];

  // Get all year selects
  const yearSelects = [
    document.getElementById("issue-year-id1"),
    document.getElementById("year"),
    document.getElementById("issue-year-id2"),
    document.getElementById("year-id2")
  ];

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Populate months
  monthSelects.forEach(monthSelect => {
    if (monthSelect) {
      months.forEach((month, index) => {
        const option = document.createElement("option");
        option.value = index + 1;
        option.textContent = month;
        monthSelect.appendChild(option);
      });
    }
  });

  // Populate years
  yearSelects.forEach(yearSelect => {
    if (yearSelect) {
      for (let y = new Date().getFullYear(); y >= 1900; y--) {
        const option = document.createElement("option");
        option.value = y;
        option.textContent = y;
        yearSelect.appendChild(option);
      }
    }
  });

  // Set up day population for each date set
  setupDayPopulation("issue-month-id1", "issue-year-id1", "issue-day-id1");
  setupDayPopulation("month", "year", "day");
  setupDayPopulation("issue-month-id2", "issue-year-id2", "issue-day-id2");
  setupDayPopulation("month-id2", "year-id2", "day-id2");
}

function setupDayPopulation(monthId, yearId, dayId) {
  const monthSelect = document.getElementById(monthId);
  const yearSelect = document.getElementById(yearId);
  const daySelect = document.getElementById(dayId);

  if (!monthSelect || !yearSelect || !daySelect) return;

  function updateDays() {
    const month = parseInt(monthSelect.value);
    const year = parseInt(yearSelect.value);
    
    if (isNaN(month) || isNaN(year)) {
      daySelect.innerHTML = '<option value="" disabled selected>Select Day</option>';
      return;
    }

    const daysInMonth = new Date(year, month, 0).getDate();
    daySelect.innerHTML = '<option value="" disabled selected>Select Day</option>';
    
    for (let d = 1; d <= daysInMonth; d++) {
      const option = document.createElement("option");
      option.value = d;
      option.textContent = d;
      daySelect.appendChild(option);
    }
  }

  monthSelect.addEventListener("change", updateDays);
  yearSelect.addEventListener("change", updateDays);
}

function attachInputListeners() {
  const inputs = document.querySelectorAll("input, select");
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

function validateForm() {
  let isValid = true;

  // Required ID 1 fields - Type, Number, Issue Date (Month and Year)
  const id1Fields = [
    { id: "select-id1", msg: "ID 1 type is required" },
    { id: "id1-num", msg: "ID 1 number is required" },
    { id: "issue-month-id1", msg: "ID 1 issue month is required" },
    { id: "issue-year-id1", msg: "ID 1 issue year is required" }
  ];

  id1Fields.forEach(({ id, msg }) => {
    const el = document.getElementById(id);
    if (!el || el.value.trim() === "") {
      showError(id, msg);
      isValid = false;
    }
  });

  // Required ID 1 file uploads - Front and Back
  const id1FileFields = [
    { id: "front-id-1", msg: "Front image of ID 1 is required" },
    { id: "back-id-1", msg: "Back image of ID 1 is required" }
  ];

  id1FileFields.forEach(({ id, msg }) => {
    const fileInput = document.getElementById(id);
    if (!fileInput || !fileInput.files.length) {
      showError(id, msg);
      isValid = false;
    }
  });

  // Required ID 2 fields - Type, Number, Issue Date (Month and Year)
  const id2Fields = [
    { id: "select-id2", msg: "ID 2 type is required" },
    { id: "id2-num", msg: "ID 2 number is required" },
    { id: "issue-month-id2", msg: "ID 2 issue month is required" },
    { id: "issue-year-id2", msg: "ID 2 issue year is required" }
  ];

  id2Fields.forEach(({ id, msg }) => {
    const el = document.getElementById(id);
    if (!el || el.value.trim() === "") {
      showError(id, msg);
      isValid = false;
    }
  });

  // Required ID 2 file uploads - Front and Back
  const id2FileFields = [
    { id: "front-id-2", msg: "Front image of ID 2 is required" },
    { id: "back-id-2", msg: "Back image of ID 2 is required" }
  ];

  id2FileFields.forEach(({ id, msg }) => {
    const fileInput = document.getElementById(id);
    if (!fileInput || !fileInput.files.length) {
      showError(id, msg);
      isValid = false;
    }
  });

  return isValid;
}

function handleProceedClick() {
  const proceedBtn = document.getElementById("proceed");

  proceedBtn.addEventListener("click", () => {
    if (validateForm()) {
      window.location.href = "registration8.html";
    }
  });
}

function populateDays(daySelectId, monthSelectId, yearSelectId) {
  const daySelect = document.getElementById(daySelectId);
  const monthSelect = document.getElementById(monthSelectId);
  const yearSelect = document.getElementById(yearSelectId);

  if (!daySelect || !monthSelect || !yearSelect) return;

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
