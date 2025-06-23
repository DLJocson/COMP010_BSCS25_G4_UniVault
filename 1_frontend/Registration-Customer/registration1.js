/**
 * Registration Step 1: Customer Type Selection
 * Connects to the UniVault registration API
 */

document.addEventListener('DOMContentLoaded', async function() {
  const accountOwner = document.getElementById("account-owner");
  const businessOwner = document.getElementById("business-owner");
  const form = document.querySelector("form");
  const errorMessage = document.getElementById("error-message");
  const proceedButton = document.getElementById("proceed");

  let registrationSessionId = null;

  // Initialize registration session
  async function initializeRegistration() {
    try {
      const response = await APIClient.post('/customers/register/start', {
        step: 1,
        timestamp: new Date().toISOString()
      });
      
      registrationSessionId = response.session_id;
      sessionStorage.setItem('registrationSessionId', registrationSessionId);
      
      // Update progress
      await updateProgress();
    } catch (error) {
      console.error('Failed to initialize registration:', error);
      UINotifications.error('Failed to start registration. Please try again.');
    }
  }

  // Update progress indicator
  async function updateProgress() {
    try {
      if (registrationSessionId) {
        const response = await APIClient.get(`/customers/register/progress/${registrationSessionId}`);
        RegistrationManager.updateProgressIndicator(response.current_step || 1);
      }
    } catch (error) {
      console.error('Failed to update progress:', error);
    }
  }

  // Handle exclusive checkbox selection
  function handleExclusiveSelection(clickedCheckbox) {
    [accountOwner, businessOwner].forEach((checkbox) => {
      if (checkbox !== clickedCheckbox) {
        checkbox.checked = false;
      }
    });
    errorMessage.textContent = "";
  }

  // Restore saved data if available
  async function restoreData() {
    const savedSessionId = sessionStorage.getItem('registrationSessionId');
    if (savedSessionId) {
      registrationSessionId = savedSessionId;
      
      try {
        const response = await APIClient.get(`/customers/register/progress/${registrationSessionId}`);
        if (response.step_data && response.step_data.customerType) {
          const customerType = response.step_data.customerType;
          if (customerType === 'account_owner') {
            accountOwner.checked = true;
          } else if (customerType === 'business_owner') {
            businessOwner.checked = true;
          }
        }
      } catch (error) {
        console.error('Failed to restore data:', error);
        // If session is invalid, start new registration
        await initializeRegistration();
      }
    } else {
      await initializeRegistration();
    }
  }

  // Submit step data to API
  async function submitStep(customerType) {
    try {
      LoadingManager.show(proceedButton, 'Processing...');
      
      const stepData = {
        customerType: customerType,
        timestamp: new Date().toISOString()
      };

      const response = await APIClient.post('/customers/register/step1', {
        session_id: registrationSessionId,
        data: stepData
      });

      // Store data locally as backup
      RegistrationManager.saveStepData(1, stepData);
      
      UINotifications.success('Customer type selected successfully!');
      
      // Navigate to next step
      setTimeout(() => {
        Navigation.goto('registration2');
      }, 1000);

    } catch (error) {
      console.error('Failed to submit step:', error);
      LoadingManager.hide(proceedButton);
      
      if (error.status === 400) {
        UINotifications.error(error.details?.message || 'Invalid data. Please check your selection.');
      } else {
        UINotifications.error('Failed to save your selection. Please try again.');
      }
    }
  }

  // Event listeners
  [accountOwner, businessOwner].forEach((checkbox) => {
    checkbox.addEventListener("change", () => handleExclusiveSelection(checkbox));
  });

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    if (!accountOwner.checked && !businessOwner.checked) {
      errorMessage.textContent = "Please select a customer type before proceeding.";
      return;
    }

    const customerType = accountOwner.checked ? 'account_owner' : 'business_owner';
    await submitStep(customerType);
  });

  document.getElementById("back").addEventListener("click", () => {
    Navigation.goto('entry');
  });

  // Initialize the form
  await restoreData();
});
