document.addEventListener("DOMContentLoaded", () => {
  const proceedBtn = document.getElementById("proceed");
  const checkboxes = document.querySelectorAll(
    ".second-container input[type='checkbox']"
  );
  const errorMessage = document.getElementById("error-message"); // Div in your HTML

  // Ensure only one can be checked
  checkboxes.forEach((cb) => {
    cb.addEventListener("change", () => {
      if (cb.checked) {
        checkboxes.forEach((otherCb) => {
          if (otherCb !== cb) {
            otherCb.checked = false;
          }
        });
      }
      // Clear error when a checkbox is selected
      errorMessage.textContent = "";
    });
  });

  proceedBtn.addEventListener("click", (e) => {
    const checkedBoxes = Array.from(checkboxes).filter((cb) => cb.checked);

    if (checkedBoxes.length === 0) {
      e.preventDefault();
      errorMessage.textContent = "Please select an option.";
      return;
    }

    const selectedIndex = Array.from(checkboxes).indexOf(checkedBoxes[0]);
    if (selectedIndex === 1) {
      e.preventDefault();
      errorMessage.textContent =
        "You cannot proceed if you select the second option.";
      return;
    }

    // Proceed if first checkbox is selected
    errorMessage.textContent = "";
    window.location.href = "update-fund-source6.html";
  });
});
