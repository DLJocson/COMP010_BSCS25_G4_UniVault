document.addEventListener("DOMContentLoaded", () => {
  const proceedBtn = document.getElementById("proceed");

  // Define keys for localStorage for each question
  const checkboxGroups = [
    { container: ".first-container", checkbox: ".checkbox", key: "reg_political_affiliation" },
    { container: ".second-container", checkbox: ".checkbox", key: "reg_fatca" },
    { container: ".third-container", checkbox: ".third-checkbox", key: "reg_dnfbp" },
    { container: ".third-container", checkbox: ".checkbox:nth-of-type(2)", key: "reg_online_gaming" },
    { container: ".fourth-container", checkbox: ".fourth-checkbox", key: "reg_beneficial_owner" },
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

<<<<<<< HEAD:2_backend/public/registration8.js
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
=======
  if (proceedBtn) {
    proceedBtn.onclick = function (e) {
      let allValid = true;
      checkboxGroups.forEach(({ container, checkbox, key }) => {
        const group = document.querySelector(container).querySelector(checkbox);
        const yes = group.querySelector(".yes input[type='checkbox']");
        const no = group.querySelector(".no input[type='checkbox']");
        const errorMsg = document.querySelector(container).nextElementSibling;
        // Save answer to localStorage
        if (yes.checked) {
          localStorage.setItem(key, "Yes");
        } else if (no.checked) {
          localStorage.setItem(key, "No");
        } else {
          errorMsg.style.display = "block";
          allValid = false;
        }
        if (yes.checked || no.checked) {
          errorMsg.style.display = "none";
        }
      });
      if (allValid) {
        window.location.href = "registration9.html";
      } else {
        e.preventDefault();
>>>>>>> main:1_frontend/Registration-Customer/registration8.js
      }
    };
  }

<<<<<<< HEAD:2_backend/public/registration8.js
    if (!allValid) {
      return;
    }

    // Save answers to localStorage for use in registration13
    localStorage.setItem("compliance_answers", JSON.stringify(answers));
    window.location.href = "registration9.html";
  });
});
=======
  // AUTO-FILL TEST DATA (remove/comment out for production)
  // Simulate all checkboxes as 'yes' for demo
  document
    .querySelectorAll(
      '.checkbox input[type="checkbox"], .third-checkbox input[type="checkbox"], .fourth-checkbox input[type="checkbox"]'
    )
    .forEach((cb, i) => {
      if (cb.classList.contains("yes")) cb.checked = true;
      else cb.checked = false;
    });
});
>>>>>>> main:1_frontend/Registration-Customer/registration8.js
