document.addEventListener("DOMContentLoaded", () => {
  const proceedBtn = document.getElementById("proceed");
  const checkboxes = document.querySelectorAll(
    ".second-container input[type='checkbox']"
  );
  const errorMessage = document.getElementById("error-message");

  checkboxes.forEach((cb) => {
    cb.addEventListener("change", () => {
      // Uncheck all others if one is checked
      if (cb.checked) {
        checkboxes.forEach((otherCb) => {
          if (otherCb !== cb) {
            otherCb.checked = false;
          }
        });
      }

      const oneChecked = Array.from(checkboxes).some((box) => box.checked);
      if (oneChecked) {
        errorMessage.textContent = "";
      }
    });
  });

  proceedBtn.addEventListener("click", (e) => {
    const checkedBox = Array.from(checkboxes).find((cb) => cb.checked);

    if (!checkedBox) {
      e.preventDefault();
      errorMessage.textContent = "Please select one option.";
    } else {
      // Save selected value to localStorage
      localStorage.setItem("selected_option", checkedBox.value);
      errorMessage.textContent = "";
      window.location.href = "registration13.html";
    }
  });
});