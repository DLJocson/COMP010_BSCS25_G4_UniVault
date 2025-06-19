document.addEventListener("DOMContentLoaded", () => {
  const proceedBtn = document.getElementById("proceed");

  const checkboxGroups = [
    { container: ".first-container", checkbox: ".checkbox" },
    { container: ".second-container", checkbox: ".checkbox" },
    { container: ".third-container", checkbox: ".third-checkbox" },
    { container: ".third-container", checkbox: ".checkbox:nth-of-type(2)" }, // 2nd question in third
    { container: ".fourth-container", checkbox: ".fourth-checkbox" },
  ];

  checkboxGroups.forEach(({ container, checkbox }) => {
    const containerEl = document.querySelector(container);
    if (!containerEl) return;
    const group = containerEl.querySelector(checkbox);
    if (!group) return;
    const yes = group.querySelector(".yes input[type='checkbox']");
    const no = group.querySelector(".no input[type='checkbox']");
    if (!yes || !no) return;

    yes.addEventListener("change", () => {
      if (yes.checked) no.checked = false;
    });
    no.addEventListener("change", () => {
      if (no.checked) yes.checked = false;
    });

    // Only add error message if not already present
    if (!containerEl.nextElementSibling || !containerEl.nextElementSibling.classList.contains("error-message")) {
      const error = document.createElement("div");
      error.classList.add("error-message");
      error.style.display = "none";
      error.textContent = "Please select either Yes or No.";
      containerEl.insertAdjacentElement("afterend", error);
    }
  });

  proceedBtn.addEventListener("click", (e) => {
    e.preventDefault();
    let allValid = true;
    const answers = [];

    checkboxGroups.forEach(({ container, checkbox }, idx) => {
      const containerEl = document.querySelector(container);
      if (!containerEl) return;
      const group = containerEl.querySelector(checkbox);
      if (!group) return;
      const yes = group.querySelector(".yes input[type='checkbox']");
      const no = group.querySelector(".no input[type='checkbox']");
      const errorMsg = containerEl.nextElementSibling;
      if (!yes || !no || !errorMsg) return;

      let answer = null;
      if (yes.checked) answer = "Yes";
      else if (no.checked) answer = "No";
      answers[idx] = answer;

      if (!yes.checked && !no.checked) {
        errorMsg.style.display = "block";
        allValid = false;
      } else {
        errorMsg.style.display = "none";
      }
    });

    if (!allValid) {
      return;
    }

    // Save answers to localStorage for use in registration13
    localStorage.setItem("compliance_answers", JSON.stringify(answers));
    window.location.href = "registration9.html";
  });
});