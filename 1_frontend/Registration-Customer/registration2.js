/**
 * Registration Step 2: Account Type Selection
 * Connects to the UniVault registration API
 */

document.addEventListener('DOMContentLoaded', async function() {
  const checkboxes = document.querySelectorAll('input[type="checkbox"]');
  const errorMessage = document.getElementById("error-message");
  const proceedButton = document.getElementById("proceed");
  const backButton = document.getElementById("back");

  let registrationSessionId = sessionStorage.getItem('registrationSessionId');

  // Account type mapping
  const accountTypeMap = {
    'deposit': 'deposit_account',
    'card': 'card_account', 
    'loan': 'loan_account',
    'wealth-management': 'wealth_management_account',
    'insurance': 'insurance_account'
  };

  // Update progress indicator
  async function updateProgress() {
    try {
      if (registrationSessionId) {
        const response = await APIClient.get(`/customers/register/progress/${registrationSessionId}`);
        RegistrationManager.updateProgressIndicator(response.current_step || 2);
      }
    } catch (error) {
      console.error('Failed to update progress:', error);
    }
  }

  // Handle exclusive checkbox selection
  function handleExclusiveSelection(clickedCheckbox) {
    checkboxes.forEach((checkbox) => {
      if (checkbox !== clickedCheckbox) {
        checkbox.checked = false;
      }
    });
    errorMessage.textContent = "";
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
      if (response.step_data && response.step_data.accountType) {
        const savedAccountType = response.step_data.accountType;
        // Find the corresponding checkbox and check it
        const checkbox = document.getElementById(Object.keys(accountTypeMap).find(key => 
          accountTypeMap[key] === savedAccountType
        ));
        if (checkbox) {
          checkbox.checked = true;
        }
      }
      await updateProgress();
    } catch (error) {
      console.error('Failed to restore data:', error);
      UINotifications.error('Failed to load previous data. Please try again.');
    }
  }

  // Submit step data to API
  async function submitStep(accountType) {
    try {
      LoadingManager.show(proceedButton, 'Processing...');
      
      const stepData = {
        accountType: accountType,
        timestamp: new Date().toISOString()
      };

      const response = await APIClient.post('/customers/register/step2', {
        session_id: registrationSessionId,
        data: stepData
      });

      // Store data locally as backup
      RegistrationManager.saveStepData(2, stepData);
      
      UINotifications.success('Account type selected successfully!');
      
      // Navigate to next step
      setTimeout(() => {
        Navigation.goto('registration3');
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
  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      if (checkbox.checked) {
        handleExclusiveSelection(checkbox);
      }
    });
  });

  proceedButton.addEventListener("click", async (e) => {
    e.preventDefault();
    
    const selectedCheckbox = Array.from(checkboxes).find((cb) => cb.checked);

    if (!selectedCheckbox) {
      errorMessage.textContent = "Please select an account type before proceeding.";
      return;
    }

    const accountType = accountTypeMap[selectedCheckbox.id];
    await submitStep(accountType);
  });

  backButton.addEventListener("click", (e) => {
    e.preventDefault();
    Navigation.goto('registration1');
  });

  // Initialize the form
  await restoreData();
});
