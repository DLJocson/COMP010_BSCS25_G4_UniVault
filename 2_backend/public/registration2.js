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

  // Store selected account type in localStorage
  localStorage.setItem("account_type", checkedBox.value);

  window.location.href = "registration3.html";
});

document.getElementById("back").addEventListener("click", () => {
  window.location.href = "registration1.html";
});