/**
 * Registration Step 15: Biometric Setup (Final Step)
 * Connects to the UniVault registration API and finalizes registration
 */

document.addEventListener("DOMContentLoaded", async function () {
  const biometricType = document.getElementById("biometric-type");
  const proceedBtn = document.getElementById("proceed");
  const cancelBtn = document.getElementById("cancel");

  let registrationSessionId = sessionStorage.getItem('registrationSessionId');

  // Update progress indicator
  async function updateProgress() {
    try {
      if (registrationSessionId) {
        const response = await APIClient.get(`/customers/register/progress/${registrationSessionId}`);
        RegistrationManager.updateProgressIndicator(response.current_step || 15);
      }
    } catch (error) {
      console.error('Failed to update progress:', error);
    }
  }

  // Restore saved data if available
  async function restoreData() {
    if (!registrationSessionId) {
      UINotifications.error('Session expired. Please start over.');
      Navigation.goto('registration1');
      return;
    }

    try {
      const response = await APIClient.get(`/customers/register/progress/${registrationSessionId}`);
      if (response.step_data && response.step_data.biometricType) {
        biometricType.value = response.step_data.biometricType;
      }
      await updateProgress();
    } catch (error) {
      console.error('Failed to restore data:', error);
      UINotifications.error('Failed to load previous data. Please try again.');
    }
  }

  // Finalize registration
  async function finalizeRegistration(biometricData) {
    try {
      LoadingManager.show(proceedBtn, 'Finalizing Registration...');
      
      // Submit final step data
      const stepData = {
        biometricType: biometricData.biometricType,
        timestamp: new Date().toISOString()
      };

      await APIClient.post('/customers/register/step15', {
        session_id: registrationSessionId,
        data: stepData
      });

      // Finalize the entire registration
      const finalResponse = await APIClient.post('/customers/register/finalize', {
        session_id: registrationSessionId
      });

      // Store data locally as backup
      RegistrationManager.saveStepData(15, stepData);
      
      UINotifications.success('Registration completed successfully!');
      
      // Clear registration session
      sessionStorage.removeItem('registrationSessionId');
      RegistrationManager.clearSession();
      
      // Show success message and redirect
      setTimeout(() => {
        UINotifications.success('Welcome to UniVault! Please login to continue.');
        Navigation.goto('login');
      }, 2000);

    } catch (error) {
      console.error('Failed to finalize registration:', error);
      LoadingManager.hide(proceedBtn);
      
      if (error.status === 400) {
        UINotifications.error(error.details?.message || 'Registration failed. Please check your information.');
      } else {
        UINotifications.error('Failed to complete registration. Please try again.');
      }
    }
  }

  // Field validation utilities
  function clearFieldError(field) {
    if (!field) return;
    field.style.borderColor = "#0072d8";
    field.classList.remove("error");
    const parent = field.parentNode;
    if (parent) {
      const errorMsg = parent.querySelector(".error-message");
      if (errorMsg) {
        errorMsg.textContent = "";
        errorMsg.style.display = "none";
      }
    }
  }

  function showError(input, message) {
    if (!input) return;
    input.style.borderColor = "#ff3860";
    input.classList.add("error");
    const parent = input.parentNode;
    let errorDiv = parent.querySelector(".error-message");
    if (!errorDiv) {
      errorDiv = document.createElement("div");
      errorDiv.className = "error-message";
      parent.appendChild(errorDiv);
    }
    errorDiv.textContent = message;
    errorDiv.style.display = "block";
    errorDiv.style.color = "#ff3860";
    errorDiv.style.fontSize = "20px";
    errorDiv.style.marginTop = "5px";
    errorDiv.style.marginBottom = "10px";
  }

  function validateForm() {
    let isValid = true;
    
    if (!biometricType || biometricType.value.trim() === "") {
      showError(biometricType, "Biometric type is required");
      isValid = false;
    } else {
      clearFieldError(biometricType);
    }
    
    return isValid;
  }

  // Event listeners
  if (biometricType) {
    biometricType.addEventListener("change", function () {
      if (this.value.trim() !== "") {
        clearFieldError(this);
      }
    });
  }

  if (proceedBtn) {
    proceedBtn.onclick = async function (e) {
      e.preventDefault();
      
      if (!validateForm()) {
        const firstError = document.querySelector(".error");
        if (firstError) {
          firstError.scrollIntoView({ behavior: "smooth", block: "center" });
          firstError.focus();
        }
        return false;
      }

      // Finalize registration
      const biometricData = {
        biometricType: biometricType.value
      };
      
      await finalizeRegistration(biometricData);
      return false;
    };
  }

  if (cancelBtn) {
    cancelBtn.addEventListener("click", (e) => {
      e.preventDefault();
      Navigation.goto('registration14');
    });
  }

  // Initialize the form
  await restoreData();
});
