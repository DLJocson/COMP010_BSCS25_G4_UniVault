document.addEventListener("DOMContentLoaded", () => {
  const proceedBtn = document.getElementById("proceed");
  const checkboxes = document.querySelectorAll(
    ".second-container input[type='checkbox']"
  );
  const errorMessage = document.getElementById("error-message");

  if (!proceedBtn || !checkboxes.length || !errorMessage) return;

  checkboxes.forEach((cb) => {
    cb.addEventListener("change", () => {
      if (cb.checked) {
        // Uncheck all others
        checkboxes.forEach((otherCb) => {
          if (otherCb !== cb) {
            otherCb.checked = false;
          }
        });
        errorMessage.textContent = ""; // Clear error if one is selected
      }
    });
  });

  proceedBtn.addEventListener("click", (e) => {
    const checkedBox = Array.from(checkboxes).find((cb) => cb.checked);

    if (!checkedBox) {
      e.preventDefault();
      errorMessage.textContent =
        "Please select either 'I give consent' or 'I do not give consent.'";
    } else {
      // Save selected value to localStorage
      localStorage.setItem("consent", checkedBox.value);
      errorMessage.textContent = "";
      window.location.href = "registration11.html";
    }
  });
});