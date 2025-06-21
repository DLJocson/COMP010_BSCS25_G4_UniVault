const accountOwner = document.getElementById("account-owner");
const businessOwner = document.getElementById("business-owner");
const form = document.querySelector("form");
const errorMessage = document.getElementById("error-message");

function handleExclusiveSelection(clickedCheckbox) {
  [accountOwner, businessOwner].forEach((checkbox) => {
    if (checkbox !== clickedCheckbox) {
      checkbox.checked = false;
    }
  });

  // Clear error message when a selection is made
  errorMessage.textContent = "";
}

[accountOwner, businessOwner].forEach((checkbox) => {
  checkbox.addEventListener("change", () => handleExclusiveSelection(checkbox));
});

form.addEventListener("submit", function (event) {
  event.preventDefault();

  if (!accountOwner.checked && !businessOwner.checked) {
    errorMessage.textContent =
      "Please select a customer type before proceeding.";
    return; // Stop here, do not proceed
  }

  // Only proceed if a selection is made
  window.location.href = "registration2.html";
});

document.getElementById("back").addEventListener("click", () => {
  window.location.href = "entry.html";
});
