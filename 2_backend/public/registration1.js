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
    return;
  }

  // Store customer type in localStorage
  if (accountOwner.checked) {
    localStorage.setItem("customer_type", "Account Owner");
    window.location.href = "registration2.html";
  } else if (businessOwner.checked) {
    localStorage.setItem("customer_type", "Business Owner");
    window.location.href = "registration2.html";
  }
});

document.getElementById("back").addEventListener("click", () => {
  window.location.href = "entry.html";
});
