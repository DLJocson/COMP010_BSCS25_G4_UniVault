document.addEventListener("DOMContentLoaded", () => {
  populateDateDropdowns();
  attachInputListeners();
  handleProceedClick();
  handleFileUploadValidation();

  const checkbox = document.getElementById("yes");
  const containers = document.getElementById("containers");

  if (checkbox && containers) {
    checkbox.addEventListener("change", () => {
      containers.style.display = checkbox.checked ? "none" : "block";
    });
  }
});

function handleFileUploadValidation() {
  const validTypes = ["image/jpeg", "image/png"];
  const fileInputs = ["front-id-1", "back-id-1", "front-id-2", "back-id-2"];

  fileInputs.forEach((id) => {
    const input = document.getElementById(id);
    if (!input) return;

    input.addEventListener("change", () => {
      const file = input.files[0];
      const errorElement = document.getElementById(`error-${id}`);
      const uploadBox = input.closest(".upload-box");

      if (!file) return;

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

  function populateDays(daySelect) {
    if (!daySelect) return;
    daySelect.innerHTML = '<option value="" disabled selected>Select Day</option>';
    for (let d = 1; d <= 31; d++) {
      const option = document.createElement("option");
      option.value = d;
      option.textContent = d;
      daySelect.appendChild(option);
    }
  }

  populateDays(daySelect1);
  populateDays(daySelect2);

  function updateDays(monthSelect, yearSelect, daySelect) {
    if (!monthSelect || !yearSelect || !daySelect) return;
    const month = parseInt(monthSelect.value);
    const year = parseInt(yearSelect.value);
    if (!month || !year) {
      populateDays(daySelect);
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

  if (monthSelect1 && yearSelect1 && daySelect1) {
    monthSelect1.addEventListener("change", () => updateDays(monthSelect1, yearSelect1, daySelect1));
    yearSelect1.addEventListener("change", () => updateDays(monthSelect1, yearSelect1, daySelect1));
  }
  if (monthSelect2 && yearSelect2 && daySelect2) {
    monthSelect2.addEventListener("change", () => updateDays(monthSelect2, yearSelect2, daySelect2));
    yearSelect2.addEventListener("change", () => updateDays(monthSelect2, yearSelect2, daySelect2));
  }
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

  const requiredFields = [
    { id: "month", msg: "Month is required" },
    { id: "day", msg: "Day is required" },
    { id: "year", msg: "Year is required" },
    { id: "month-id2", msg: "Month is required" },
    { id: "day-id2", msg: "Day is required" },
    { id: "year-id2", msg: "Year is required" },
    { id: "select-id1", msg: "ID 1 type is required" },
    { id: "select-id2", msg: "ID 2 type is required" },
    { id: "id1-num", msg: "ID 1 number is required" },
    { id: "id2-num", msg: "ID 2 number is required" },
  ];

  requiredFields.forEach(({ id, msg }) => {
    const el = document.getElementById(id);
    if (!el || el.value.trim() === "") {
      showError(id, msg);
      isValid = false;
    }
  });

  const fileFields = ["front-id-1", "back-id-1", "front-id-2", "back-id-2"];
  fileFields.forEach((id) => {
    const fileInput = document.getElementById(id);
    if (!fileInput || !fileInput.files.length) {
      showError(id);
      isValid = false;
    }
  });

  return isValid;
}

function handleProceedClick() {
  const proceedBtn = document.getElementById("proceed");
  if (!proceedBtn) return;

  proceedBtn.addEventListener("click", () => {
    const checkbox = document.getElementById("yes");
    const aliasSkipped = checkbox && checkbox.checked;

    if (aliasSkipped || validateForm()) {
      // Save form data to localStorage
      const fieldsToSave = [
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
      window.location.href = "registration8.html";
    }
  });
}