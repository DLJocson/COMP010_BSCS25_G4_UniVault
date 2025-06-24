document.addEventListener("DOMContentLoaded", function () {
  const loginBtn = document.querySelector(".button button");
  const accountInput = document.querySelector('.text-box input[type="text"]');
  const passwordInput = document.querySelector('.text-box input[type="password"]');

  loginBtn.addEventListener("click", async function (e) {
    e.preventDefault();
    const username = accountInput.value.trim();
    const password = passwordInput.value;

    // Simple validation
    if (!username || !password) {
      alert("Please enter both account number and password.");
      return;
    }

    try {
      const res = await fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customer_username: username, customer_password: password })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Login failed.");
        return;
      }
      // Save session info if needed
      localStorage.setItem("cif_number", data.cif_number || "");
      // Redirect to dashboard (no cif_number in URL)
      window.location.href = "../Dashboard-Customer/account1.html";
    } catch (err) {
      alert("Login failed: " + err.message);
    }
  });
});
