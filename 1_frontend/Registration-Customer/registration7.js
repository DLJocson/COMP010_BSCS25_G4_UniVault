document.addEventListener("DOMContentLoaded", () => {
  populateDateDropdowns();
  attachInputListeners();
  handleFileUploadValidation();
  handleProceedClick();
  setupImagePreviews();
});

function handleFileUploadValidation() {
  const validTypes = ["image/jpeg", "image/png"];
  const fileInputs = ["front-id-1", "back-id-1", "front-id-2", "back-id-2", "supporting-doc"];

  fileInputs.forEach((id) => {
    const input = document.getElementById(id);
    if (input) {
      input.addEventListener("change", async () => {
        const file = input.files[0];
        const errorElement = document.getElementById(`error-${id}`);
        const uploadBox = input.closest(".upload-box");
        if (!file) return;
        // For supporting-doc, allow PDF too
        if (id === "supporting-doc") {
          if (!["image/jpeg", "image/png", "application/pdf"].includes(file.type)) {
            errorElement.textContent = "Only JPG, PNG, or PDF files are allowed.";
            input.value = "";
            uploadBox.classList.add("error");
            return;
          }
        } else {
          if (!validTypes.includes(file.type)) {
            errorElement.textContent = "Only JPG and PNG files are allowed.";
            input.value = "";
            uploadBox.classList.add("error");
            return;
          }
        }
        errorElement.textContent = "";
        uploadBox.classList.remove("error");
        const direction = uploadBox.querySelector(".direction");
        direction.textContent = `Uploading ${file.name}...`;
        direction.style.color = "#007bff";
        // Upload file to backend
        const formData = new FormData();
        formData.append("file", file);
        formData.append("field", id); // Optional: send field name
        try {
          const response = await fetch("/upload", {
            method: "POST",
            body: formData
          });
          if (!response.ok) throw new Error("Upload failed");
          const data = await response.json();
          if (data && data.filePath) {
            localStorage.setItem(id + '_path', data.filePath);
            direction.textContent = `✓ ${file.name} uploaded`;
            direction.style.color = "green";
          } else {
            throw new Error("No file path returned");
          }
        } catch (err) {
          errorElement.textContent = "Upload failed. Please try again.";
          direction.textContent = "Upload failed.";
          direction.style.color = "red";
          localStorage.setItem(id + '_path', null);
        }
        // Save file name for reference (not uploaded)
        localStorage.setItem(id + '_filename', file.name);
        // Show preview for images
        if (id !== "supporting-doc" && file.type.startsWith('image/')) {
          const preview = document.getElementById('preview-' + id) || (() => {
            const img = document.createElement('img');
            img.id = 'preview-' + id;
            img.style.display = 'none';
            img.style.maxWidth = '200px';
            img.style.marginTop = '10px';
            input.parentNode.insertBefore(img, input.nextSibling);
            return img;
          })();
          preview.src = URL.createObjectURL(file);
          preview.style.display = 'block';
        }
      });
    }
  });
}

function setupImagePreviews() {
  ["front-id-1", "back-id-1", "front-id-2", "back-id-2"].forEach(id => {
    const input = document.getElementById(id);
    if (input) {
      let preview = document.getElementById('preview-' + id);
      if (!preview) {
        preview = document.createElement('img');
        preview.id = 'preview-' + id;
        preview.style.display = 'none';
        preview.style.maxWidth = '200px';
        preview.style.marginTop = '10px';
        input.parentNode.insertBefore(preview, input.nextSibling);
      }
      // No preview from localStorage, only show after upload
      preview.style.display = 'none';
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
  const issueYearSelects = [
    document.getElementById("issue-year-id1"),
    document.getElementById("issue-year-id2")
  ];
  const expiryYearSelects = [
    document.getElementById("year"),
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

  // Populate issue years (1900–2025)
  issueYearSelects.forEach(yearSelect => {
    if (yearSelect) {
      for (let y = 2025; y >= 1900; y--) {
        const option = document.createElement("option");
        option.value = y;
        option.textContent = y;
        yearSelect.appendChild(option);
      }
    }
  });

  // Populate expiry years (2025 and up, 20 years ahead)
  expiryYearSelects.forEach(yearSelect => {
    if (yearSelect) {
      const currentYear = new Date().getFullYear();
      for (let y = 2025; y <= currentYear + 20; y++) {
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
  // Required ID 1 fields - Type, Number, Issue Date (Month, Day, Year)
  const id1Fields = [
    { id: "select-id1", msg: "ID 1 type is required" },
    { id: "id1-num", msg: "ID 1 number is required" },
    { id: "issue-month-id1", msg: "ID 1 issue month is required" },
    { id: "issue-day-id1", msg: "ID 1 issue day is required" },
    { id: "issue-year-id1", msg: "ID 1 issue year is required" },
    { id: "month", msg: "ID 1 expiry month is required" },
    { id: "day", msg: "ID 1 expiry day is required" },
    { id: "year", msg: "ID 1 expiry year is required" }
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
    const filePath = localStorage.getItem(id + '_path');
    if (!fileInput || !fileInput.files.length || !filePath || filePath === 'null' || filePath === '') {
      showError(id, msg + ' (Please upload and wait for confirmation)');
      isValid = false;
    }
  });
  // Required ID 2 fields - Type, Number, Issue Date (Month, Day, Year)
  const id2Fields = [
    { id: "select-id2", msg: "ID 2 type is required" },
    { id: "id2-num", msg: "ID 2 number is required" },
    { id: "issue-month-id2", msg: "ID 2 issue month is required" },
    { id: "issue-day-id2", msg: "ID 2 issue day is required" },
    { id: "issue-year-id2", msg: "ID 2 issue year is required" },
    { id: "month-id2", msg: "ID 2 expiry month is required" },
    { id: "day-id2", msg: "ID 2 expiry day is required" },
    { id: "year-id2", msg: "ID 2 expiry year is required" }
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

function getIdTypeCode(displayName) {
  // Normalize input
  const key = displayName.trim().toLowerCase();
  const map = {
    "new philippine passport": "PAS",
    "old philippine passport": "PAS",
    "passport": "PAS",
    "driver's license": "DRV",
    "prc id": "PRC",
    "umid": "UMI",
    "sss id": "SSS",
    "postal id": "POS",
    "tin id": "TIN",
    "barangay id": "BRG",
    "gsis id": "GSI",
    "philhealth id": "PHI",
    "owwa id": "OWW",
    "ofw id": "OFW",
    "ibp id": "IBP",
    "company id": "COM",
    "marina id": "MAR",
    "voter's id": "VOT",
    "senior citizen id": "SEN",
    "seaman's book": "SEA",
    "gov't / gocc id": "GOV",
    "dswd certification": "DSW",
    "ncwdp certification": "NCW",
    "pwd id": "PWD"
  };
  return map[key] || key.substring(0,3).toUpperCase();
}

function handleProceedClick() {
  const proceedBtn = document.getElementById("proceed");
  if (proceedBtn) {
    proceedBtn.onclick = function (e) {
      // Save all relevant fields to localStorage here
      // ID 1
      const id1TypeRaw = document.getElementById("select-id1").value;
      let id1Type = id1TypeRaw ? getIdTypeCode(id1TypeRaw) : "";
      localStorage.setItem("id1Type", id1Type);
      localStorage.setItem("id1Number", document.getElementById("id1-num").value);
      localStorage.setItem("id1IssueMonth", document.getElementById("issue-month-id1").value);
      localStorage.setItem("id1IssueDay", document.getElementById("issue-day-id1").value);
      localStorage.setItem("id1IssueYear", document.getElementById("issue-year-id1").value);
      localStorage.setItem("id1ExpiryMonth", document.getElementById("month").value);
      localStorage.setItem("id1ExpiryDay", document.getElementById("day").value);
      localStorage.setItem("id1ExpiryYear", document.getElementById("year").value);
      // ID 2
      const id2TypeRaw = document.getElementById("select-id2").value;
      let id2Type = id2TypeRaw ? getIdTypeCode(id2TypeRaw) : "";
      localStorage.setItem("id2Type", id2Type);
      localStorage.setItem("id2Number", document.getElementById("id2-num").value);
      localStorage.setItem("id2IssueMonth", document.getElementById("issue-month-id2").value);
      localStorage.setItem("id2IssueDay", document.getElementById("issue-day-id2").value);
      localStorage.setItem("id2IssueYear", document.getElementById("issue-year-id2").value);
      localStorage.setItem("id2ExpiryMonth", document.getElementById("month-id2").value);
      localStorage.setItem("id2ExpiryDay", document.getElementById("day-id2").value);
      localStorage.setItem("id2ExpiryYear", document.getElementById("year-id2").value);
      // Images: only save file paths (from upload)
      ["front-id-1", "back-id-1", "front-id-2", "back-id-2", "supporting-doc"].forEach(id => {
        // Save the uploaded file path, not the input value
        const uploadedPath = localStorage.getItem(id + '_path') || null;
        localStorage.setItem(id + '_path', uploadedPath);
      });
      // If any required ID image path is missing, set to null
      if (!localStorage.getItem("front-id-1_path")) localStorage.setItem("front-id-1_path", null);
      if (!localStorage.getItem("back-id-1_path")) localStorage.setItem("back-id-1_path", null);
      if (!localStorage.getItem("front-id-2_path")) localStorage.setItem("front-id-2_path", null);
      if (!localStorage.getItem("back-id-2_path")) localStorage.setItem("back-id-2_path", null);
      if (!localStorage.getItem("supporting-doc_path")) localStorage.setItem("supporting-doc_path", null);
      if (validateForm()) {
        window.location.href = "registration8.html";
      }
    };
  }
}
