// UniVault Registration - Shared JavaScript Functions

// Registration flow configuration
const REGISTRATION_STEPS = [
    { id: 1, title: "Customer Type", page: "registration1.html" },
    { id: 2, title: "Account Type", page: "registration2.html" },
    { id: 3, title: "Personal Info", page: "registration3.html" },
    { id: 4, title: "Contact Details", page: "registration4.html" },
    { id: 5, title: "Employment", page: "registration5.html" },
    { id: 6, title: "Address", page: "registration6.html" },
    { id: 7, title: "Emergency Contact", page: "registration7.html" },
    { id: 8, title: "Identity Documents", page: "registration8.html" },
    { id: 9, title: "Fund Source", page: "registration9.html" },
    { id: 10, title: "Data Privacy", page: "registration10.html" },
    { id: 11, title: "Regulatory Info", page: "registration11.html" },
    { id: 12, title: "Work Nature", page: "registration12.html" },
    { id: 13, title: "Alias Information", page: "registration13.html" },
    { id: 14, title: "Additional Details", page: "registration14.html" },
    { id: 15, title: "Biometric Setup", page: "registration15.html" },
    { id: 16, title: "Review & Submit", page: "review.html" },
    { id: 17, title: "Confirmation", page: "confirmation.html" }
];

// Progress bar management
function updateProgressBar(currentStep) {
    const totalSteps = REGISTRATION_STEPS.length - 2; // Exclude review and confirmation
    const progressPercentage = ((currentStep - 1) / totalSteps) * 100;
    
    const progressFill = document.querySelector('.progress-fill');
    const stepIndicator = document.querySelector('.step-indicator');
    
    if (progressFill) {
        progressFill.style.width = `${progressPercentage}%`;
    }
    
    if (stepIndicator) {
        const stepInfo = REGISTRATION_STEPS.find(step => step.id === currentStep);
        stepIndicator.textContent = stepInfo ? `Step ${currentStep} of ${totalSteps}: ${stepInfo.title}` : '';
    }
}

// Data persistence utilities
function saveFormData(stepId, data) {
    const existingData = getRegistrationData();
    existingData[`step_${stepId}`] = data;
    localStorage.setItem('univault_registration', JSON.stringify(existingData));
}

function getRegistrationData() {
    const data = localStorage.getItem('univault_registration');
    return data ? JSON.parse(data) : {};
}

function getStepData(stepId) {
    const allData = getRegistrationData();
    return allData[`step_${stepId}`] || {};
}

function clearRegistrationData() {
    localStorage.removeItem('univault_registration');
}

// Form validation utilities
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePhone(phone) {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
}

function validateRequired(value) {
    return value && value.toString().trim() !== '';
}

function validateDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    return date instanceof Date && !isNaN(date) && date < now;
}

// Form validation and error display
function showError(elementId, message) {
    const element = document.getElementById(elementId);
    const formGroup = element?.closest('.form-group');
    const errorElement = formGroup?.querySelector('.error-message');
    
    if (formGroup) {
        formGroup.classList.add('error');
    }
    
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.add('show');
    }
}

function clearError(elementId) {
    const element = document.getElementById(elementId);
    const formGroup = element?.closest('.form-group');
    const errorElement = formGroup?.querySelector('.error-message');
    
    if (formGroup) {
        formGroup.classList.remove('error');
    }
    
    if (errorElement) {
        errorElement.classList.remove('show');
    }
}

function clearAllErrors() {
    document.querySelectorAll('.form-group.error').forEach(group => {
        group.classList.remove('error');
    });
    document.querySelectorAll('.error-message.show').forEach(error => {
        error.classList.remove('show');
    });
}

// Navigation utilities
function goToNextStep(currentStep) {
    const nextStep = REGISTRATION_STEPS.find(step => step.id === currentStep + 1);
    if (nextStep) {
        window.location.href = nextStep.page;
    }
}

function goToPreviousStep(currentStep) {
    const prevStep = REGISTRATION_STEPS.find(step => step.id === currentStep - 1);
    if (prevStep) {
        window.location.href = prevStep.page;
    } else {
        window.location.href = 'index.html';
    }
}

// Form auto-population
function populateForm(stepId) {
    const stepData = getStepData(stepId);
    
    Object.keys(stepData).forEach(key => {
        const element = document.getElementById(key) || document.querySelector(`[name="${key}"]`);
        if (element) {
            if (element.type === 'checkbox' || element.type === 'radio') {
                element.checked = stepData[key] === element.value || stepData[key] === true;
            } else {
                element.value = stepData[key];
            }
        }
    });
}

// File upload utilities
function setupFileUpload(uploadElementId, inputElementId, maxSize = 5 * 1024 * 1024) { // 5MB default
    const uploadElement = document.getElementById(uploadElementId);
    const inputElement = document.getElementById(inputElementId);
    
    if (!uploadElement || !inputElement) return;
    
    uploadElement.addEventListener('click', () => inputElement.click());
    
    uploadElement.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadElement.classList.add('dragover');
    });
    
    uploadElement.addEventListener('dragleave', () => {
        uploadElement.classList.remove('dragover');
    });
    
    uploadElement.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadElement.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileUpload(files[0], uploadElement, maxSize);
        }
    });
    
    inputElement.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileUpload(e.target.files[0], uploadElement, maxSize);
        }
    });
}

function handleFileUpload(file, uploadElement, maxSize) {
    if (file.size > maxSize) {
        alert(`File size must be less than ${(maxSize / 1024 / 1024).toFixed(1)}MB`);
        return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
        const uploadText = uploadElement.querySelector('.upload-text');
        if (uploadText) {
            uploadText.textContent = `Selected: ${file.name}`;
            uploadElement.style.borderColor = '#28a745';
        }
    };
    reader.readAsDataURL(file);
}

// Checkbox/Radio group management
function setupExclusiveCheckboxes(containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) return;
    
    const checkboxes = container.querySelectorAll('input[type="checkbox"]');
    
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            if (checkbox.checked) {
                checkboxes.forEach(other => {
                    if (other !== checkbox) {
                        other.checked = false;
                        other.closest('.checkbox-item')?.classList.remove('selected');
                    }
                });
                checkbox.closest('.checkbox-item')?.classList.add('selected');
            } else {
                checkbox.closest('.checkbox-item')?.classList.remove('selected');
            }
        });
    });
}

// Initialize common functionality
function initializeStep(stepId) {
    // Update progress bar
    updateProgressBar(stepId);
    
    // Populate form with saved data
    populateForm(stepId);
    
    // Add fade-in animation
    document.body.classList.add('fade-in');
    
    // Setup form submission prevention
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
        });
    });
}

// Export functions for use in individual step files
window.UniVaultRegistration = {
    updateProgressBar,
    saveFormData,
    getRegistrationData,
    getStepData,
    clearRegistrationData,
    validateEmail,
    validatePhone,
    validateRequired,
    validateDate,
    showError,
    clearError,
    clearAllErrors,
    goToNextStep,
    goToPreviousStep,
    populateForm,
    setupFileUpload,
    setupExclusiveCheckboxes,
    initializeStep,
    REGISTRATION_STEPS
};
