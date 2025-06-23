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

    username.classList.remove("error");
    password.classList.remove("error");

    if (uname === "") {
      errorMessages[0].textContent = "Username is required.";
      username.classList.add("error");
      isValid = false;
    }

    if (pw === "") {
      errorMessages[1].textContent = "Password is required.";
      password.classList.add("error");
      isValid = false;
    } else if (!isPasswordValid(pw)) {
      errorMessages[1].textContent =
        "Password does not meet the required criteria.";
      password.classList.add("error");
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

    const uname = username.value.trim();
    const pw = password.value.trim();

    // Show loading state
    proceedBtn.disabled = true;
    proceedBtn.textContent = "Logging In...";

    try {
      const response = await fetch('/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employee_username: uname,
          employee_password: pw
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Store admin session data
        localStorage.setItem('employee_id', data.employee_id);
        localStorage.setItem('employee_username', uname);
        localStorage.setItem('employee_position', data.employee_position);

        // Redirect to dashboard
        window.location.href = "admin-dashboard.html";
      } else {
        // Show error message
        errorMessages[1].textContent = data.message || 'Login failed';
        password.classList.add("error");
      }
    } catch (error) {
      console.error('Admin login error:', error);
      errorMessages[1].textContent = 'Connection error. Please try again.';
      password.classList.add("error");
    } finally {
      proceedBtn.disabled = false;
      proceedBtn.textContent = "Log In";
    }
  });
});
