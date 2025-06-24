document.addEventListener("DOMContentLoaded", () => {
  const username = document.getElementById("username");
  const password = document.getElementById("password");
  const errorMessages = document.querySelectorAll(".error-message");
  const proceedBtn = document.getElementById("proceed");

  function isPasswordValid(pw) {
    const lengthOK = pw.length >= 8 && pw.length <= 30;
    const hasNumber = /\d/.test(pw);
    const hasSpecial = /[-!@#$%^&*_+]/.test(pw);
    const hasUpper = /[A-Z]/.test(pw);
    const hasLower = /[a-z]/.test(pw);
    const noCommonSeq = !/(abc|123|9999|password|qwerty)/i.test(pw);
    return (
      lengthOK && hasNumber && hasSpecial && hasUpper && hasLower && noCommonSeq
    );
  }

  function validate() {
    const uname = username.value.trim();
    const pw = password.value.trim();
    let isValid = true;

    errorMessages.forEach((msg) => (msg.textContent = ""));

    if (uname === "") {
      errorMessages[0].textContent = "Username is required.";
      isValid = false;
    }

    if (pw === "") {
      errorMessages[1].textContent = "Password is required.";
      isValid = false;
    } else if (!isPasswordValid(pw)) {
      errorMessages[1].textContent =
        "Password does not meet the required criteria.";
      isValid = false;
    }

    return isValid;
  }

  username.addEventListener("input", validate);
  password.addEventListener("input", validate);

  proceedBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }

    // Save username and password to localStorage
    localStorage.setItem("customer_username", username.value.trim());
    localStorage.setItem("customer_password", password.value.trim());

    // Collect all registration data from localStorage
    const registrationData = {
      customer_type: localStorage.getItem("customer_type"),
      customer_last_name: localStorage.getItem("customer_last_name"),
      customer_first_name: localStorage.getItem("customer_first_name"),
      customer_middle_name: localStorage.getItem("customer_middle_name"),
      customer_suffix_name: localStorage.getItem("customer_suffix_name"),
      customer_username: localStorage.getItem("customer_username"),
      customer_password: localStorage.getItem("customer_password"),
      birth_date: `${localStorage.getItem("birth_year")}-${localStorage.getItem("birth_month")}-${localStorage.getItem("birth_day")}`,
      gender: localStorage.getItem("gender"),
      civil_status_code: localStorage.getItem("civil_status_code"),
      birth_country: localStorage.getItem("birth_country"),
      citizenship: localStorage.getItem("citizenship"),
      // Add all additional fields from previous steps:
      compliance_answers: JSON.parse(localStorage.getItem("compliance_answers") || "[]"),
      consent: localStorage.getItem("consent"),
      selected_option: localStorage.getItem("selected_option"),
      // Add more fields as needed
    };

    console.log("Sending registrationData:", registrationData);

    // Send registration data to backend
    try {
      const response = await fetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registrationData)
      });
      const result = await response.json();
      if (response.ok && result.cif_number) {
        // Store cif_number for next steps
        localStorage.setItem("cif_number", result.cif_number);
        // Redirect to the next step (e.g., registration14.html)
        window.location.href = "registration14.html";
      } else {
        errorMessages[0].textContent = result.message || "Registration failed.";
      }
    } catch (err) {
      errorMessages[0].textContent = "Server error. Please try again.";
    }
  });
});