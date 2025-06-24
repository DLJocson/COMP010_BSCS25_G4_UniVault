document.addEventListener("DOMContentLoaded", () => {
  populateDateDropdowns();
  attachInputListeners();
  handleProceedClick();
  handleFileUploadValidation();

  const checkbox = document.getElementById("yes");
  const containers = document.getElementById("containers");

  checkbox.addEventListener("change", () => {
    containers.style.display = checkbox.checked ? "none" : "block";
  });
});

function handleFileUploadValidation() {
  const validTypes = ["image/jpeg", "image/png", "application/pdf"];
  const fileInputs = [
    "front-id-1",
    "back-id-1",
    "front-id-2",
    "back-id-2",
    "supporting-doc",
  ];

  fileInputs.forEach((id) => {
    const input = document.getElementById(id);

    input.addEventListener("change", () => {
      const file = input.files[0];
      const errorElement = document.getElementById(`error-${id}`);
      const uploadBox = input.closest(".upload-box");

      if (!file) return;

      if (!validTypes.includes(file.type)) {
        errorElement.textContent = "Only JPG and PNG files are allowed.";
        input.value = "";
        uploadBox.classList.add("error");
      } else {
        errorElement.textContent = "";
        uploadBox.classList.remove("error");

        const direction = uploadBox.querySelector(".direction");
        direction.textContent = `✓ ${file.name} uploaded`;
        direction.style.color = "green";
      }
    });
  });
}

function populateDateDropdowns() {
  // Main Date
  const monthSelect1 = document.getElementById("month");
  const daySelect1 = document.getElementById("day");
  const yearSelect1 = document.getElementById("year");

  // Second Date
  const monthSelect2 = document.getElementById("month-id2");
  const daySelect2 = document.getElementById("day-id2");
  const yearSelect2 = document.getElementById("year-id2");

  // Issue Date 1
  const monthIssue1 = document.getElementById("issue-month-id1");
  const dayIssue1 = document.getElementById("issue-day-id1");
  const yearIssue1 = document.getElementById("issue-year-id1");

  // Issue Date 2
  const monthIssue2 = document.getElementById("issue-month-id2");
  const dayIssue2 = document.getElementById("issue-day-id2");
  const yearIssue2 = document.getElementById("issue-year-id2");

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
    // Main Date
    const option1 = new Option(month, index + 1);
    const option2 = new Option(month, index + 1);
    monthSelect1.appendChild(option1);
    monthSelect2.appendChild(option2);

    // Issue Dates
    const optionIssue1 = new Option(month, index + 1);
    const optionIssue2 = new Option(month, index + 1);
    monthIssue1.appendChild(optionIssue1);
    monthIssue2.appendChild(optionIssue2);
  });

  for (let y = new Date().getFullYear(); y >= 1900; y--) {
    // Main Date
    yearSelect1.appendChild(new Option(y, y));
    yearSelect2.appendChild(new Option(y, y));

    // Issue Dates
    yearIssue1.appendChild(new Option(y, y));
    yearIssue2.appendChild(new Option(y, y));
  }

  function updateDays(monthSelect, yearSelect, daySelect) {
    const month = parseInt(monthSelect.value);
    const year = parseInt(yearSelect.value);
    const daysInMonth = new Date(year, month, 0).getDate();

    daySelect.innerHTML =
      '<option value="" disabled selected>Select Day</option>';
    for (let d = 1; d <= daysInMonth; d++) {
      const option = new Option(d, d);
      daySelect.appendChild(option);
    }
  }

  // Main Date Event Listeners
  monthSelect1.addEventListener("change", () =>
    updateDays(monthSelect1, yearSelect1, daySelect1)
  );
  yearSelect1.addEventListener("change", () =>
    updateDays(monthSelect1, yearSelect1, daySelect1)
  );
  monthSelect2.addEventListener("change", () =>
    updateDays(monthSelect2, yearSelect2, daySelect2)
  );
  yearSelect2.addEventListener("change", () =>
    updateDays(monthSelect2, yearSelect2, daySelect2)
  );

  // Issue Date Event Listeners
  monthIssue1.addEventListener("change", () =>
    updateDays(monthIssue1, yearIssue1, dayIssue1)
  );
  yearIssue1.addEventListener("change", () =>
    updateDays(monthIssue1, yearIssue1, dayIssue1)
  );
  monthIssue2.addEventListener("change", () =>
    updateDays(monthIssue2, yearIssue2, dayIssue2)
  );
  yearIssue2.addEventListener("change", () =>
    updateDays(monthIssue2, yearIssue2, dayIssue2)
  );
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
    { id: "select-id1", msg: "ID 1 type is required" },
    { id: "select-id2", msg: "ID 2 type is required" },
    { id: "id1-num", msg: "ID 1 number is required" },
    { id: "id2-num", msg: "ID 2 number is required" },
    { id: "issue-month-id1", msg: "ID 1 issue month is required" },
    { id: "issue-year-id1", msg: "ID 1 issue year is required" },
    { id: "issue-month-id2", msg: "ID 2 issue month is required" },
    { id: "issue-year-id2", msg: "ID 2 issue year is required" },
  ];

  requiredFields.forEach(({ id, msg }) => {
    const el = document.getElementById(id);
    if (!el || el.value.trim() === "") {
      showError(id, msg);
      isValid = false;
    }
  });

  const fileFields = [
    "front-id-1",
    "back-id-1",
    "front-id-2",
    "back-id-2",
    "supporting-doc",
  ];
  fileFields.forEach((id) => {
    const fileInput = document.getElementById(id);
    if (!fileInput || !fileInput.files.length) {
      showError(id, "File is required.");
      isValid = false;
    }
  });

  return isValid;
}

function handleProceedClick() {
  const proceedBtn = document.getElementById("proceed");

  proceedBtn.addEventListener("click", () => {
    const checkbox = document.getElementById("yes");
    const aliasSkipped = checkbox && checkbox.checked;

    if (aliasSkipped || validateForm()) {
      window.location.href = "registration8.html";
    }
  });
}
