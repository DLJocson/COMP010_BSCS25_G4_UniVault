document.addEventListener("DOMContentLoaded", () => {
  const proceedBtn = document.getElementById("proceed");
  const checkboxes = document.querySelectorAll(
    ".second-container input[type='checkbox']"
  );
  const errorMessage = document.getElementById("error-message");

  checkboxes.forEach((cb) => {
    cb.addEventListener("change", () => {
      if (cb.checked) {
        // Uncheck all others
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

  if (proceedBtn) {
    proceedBtn.onclick = function (e) {
      // Save the user's choice to localStorage
      let consent = null;
      checkboxes.forEach((cb) => {
        if (cb.checked) consent = cb.value || cb.id || "checked";
      });
      if (consent) {
        localStorage.setItem("data-privacy-consent", consent);
      }
      const oneChecked = Array.from(checkboxes).some((cb) => cb.checked);
      if (!oneChecked) {
        e.preventDefault();
        errorMessage.textContent =
          "Please select either 'I give consent' or 'I do not give consent.'";
      } else {
        errorMessage.textContent = "";
        window.location.href = "registration11.html";
      }
    };
  }
});
