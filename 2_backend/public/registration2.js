const checkboxes = document.querySelectorAll('input[type="checkbox"]');
const errorMessage = document.getElementById("error-message");

checkboxes.forEach((checkbox) => {
  checkbox.addEventListener("change", () => {
    if (checkbox.checked) {
      checkboxes.forEach((cb) => {
        if (cb !== checkbox) cb.checked = false;
      });
      errorMessage.textContent = "";
    }
  });
});

document.getElementById("proceed").addEventListener("click", () => {
  const checkedBox = Array.from(checkboxes).find((cb) => cb.checked);

  if (!checkedBox) {
    errorMessage.textContent =
      "Please select an account type before proceeding.";
    return;
  }

  errorMessage.textContent = "";

<<<<<<< HEAD:2_backend/public/registration2.js
  // Store selected account type in localStorage
  localStorage.setItem("account_type", checkedBox.value);
=======
  // Save account_type to localStorage (do not overwrite customer_type)
  const accountTypeInput = document.querySelector('input[name="customer_type"]:checked');
  localStorage.setItem('account_type', accountTypeInput.value.trim());
>>>>>>> main:1_frontend/Registration-Customer/registration2.js

  window.location.href = "registration3.html";
});

document.getElementById("back").addEventListener("click", () => {
  window.location.href = "registration1.html";
});