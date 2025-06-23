# UniVault Customer Registration System

## 🎯 Overview

A complete, fully functional customer registration frontend for the UniVault Banking System. This is a multi-step registration flow that guides users through the entire account creation process with modern UI/UX design and comprehensive form validation.

## ✨ Features

### ✅ Complete Registration Flow
- **15-Step Registration Process**: Comprehensive data collection following banking industry standards
- **Progress Tracking**: Visual progress bar showing current step and completion percentage
- **Data Persistence**: All form data is saved locally as users progress through steps
- **Navigation Controls**: Seamless back/forward navigation between steps

### ✅ Modern UI/UX Design
- **Responsive Design**: Works perfectly on desktop and mobile devices
- **Consistent Styling**: Unified design system across all pages
- **Interactive Elements**: Smooth animations and hover effects
- **Professional Layout**: Banking-grade interface design

### ✅ Form Validation & Error Handling
- **Real-time Validation**: Instant feedback as users fill out forms
- **Comprehensive Checks**: Email format, phone numbers, age verification, required fields
- **Error Messages**: Clear, helpful error messages for all validation failures
- **Success States**: Visual confirmation when forms are completed correctly

### ✅ Local Development Ready
- **Built-in Server**: Express.js server for local testing
- **Static File Serving**: All assets served locally
- **Hot Reload**: Easy development and testing

## 🗂️ Registration Steps

| Step | Title | Description |
|------|-------|-------------|
| 1 | Customer Type | Account Owner vs Business Owner selection |
| 2 | Account Type | Banking product selection (multiple choice) |
| 3 | Personal Information | Basic personal details and demographics |
| 4 | Contact Details | Phone numbers and email addresses |
| 5 | Employment | Employment status and work information |
| 6 | Address | Home and alternate address information |
| 7 | Emergency Contact | Emergency contact person details |
| 8 | Identity Documents | Government ID upload and verification |
| 9 | Fund Source | Source of funds for banking activities |
| 10 | Data Privacy | Data privacy consent and agreements |
| 11 | Regulatory Info | Regulatory compliance information |
| 12 | Work Nature | Detailed work and business nature |
| 13 | Alias Information | Alternative names and aliases |
| 14 | Additional Details | Supplementary customer information |
| 15 | Biometric Setup | Biometric authentication preferences |
| 16 | Review & Submit | Final review and application submission |
| 17 | Confirmation | Success confirmation and next steps |

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation & Setup

1. **Navigate to the registration directory:**
   ```bash
   cd 1_frontend/Registration-Customer
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```

4. **Open your browser:**
   ```
   http://localhost:3001
   ```

### Alternative Setup (Static Files)
If you prefer to test without Node.js:
1. Open `index.html` directly in your browser
2. Or use any static file server (Live Server, Python HTTP server, etc.)

## 📁 File Structure

```
1_frontend/Registration-Customer/
├── index.html              # Main landing page
├── shared.css              # Unified styling system
├── shared.js               # Common JavaScript functions
├── server.js               # Local development server
├── package.json            # Project dependencies
├── README.md               # This file
│
├── registration1.html      # Step 1: Customer Type
├── registration2.html      # Step 2: Account Type
├── registration3.html      # Step 3: Personal Information
├── registration4.html      # Step 4: Contact Details
├── registration5.html      # Step 5: Employment
├── registration6.html      # Step 6: Address
├── registration7.html      # Step 7: Emergency Contact
├── registration8.html      # Step 8: Identity Documents
├── registration9.html      # Step 9: Fund Source
├── registration10.html     # Step 10: Data Privacy
├── registration11.html     # Step 11: Regulatory Info
├── registration12.html     # Step 12: Work Nature
├── registration13.html     # Step 13: Alias Information
├── registration14.html     # Step 14: Additional Details
├── registration15.html     # Step 15: Biometric Setup
│
├── review.html             # Step 16: Review & Submit
├── confirmation.html       # Step 17: Confirmation
├── login.html              # Login page (integrated with backend)
│
└── [legacy files...]       # Original implementation files
```

## 🎨 Design System

### Color Scheme
- **Primary**: `#667eea` (Purple Blue)
- **Secondary**: `#764ba2` (Purple)
- **Success**: `#28a745` (Green)
- **Error**: `#dc3545` (Red)
- **Background**: Linear gradients and white containers

### Typography
- **Font Family**: Manjari (Google Fonts)
- **Weights**: 100, 400, 700
- **Responsive sizing**: rem-based scaling

### Components
- **Form Groups**: Consistent spacing and validation states
- **Buttons**: Primary, secondary, and outline variants
- **Progress Bar**: Dynamic completion tracking
- **Error Messages**: Inline validation feedback

## 💾 Data Management

### Local Storage Structure
```javascript
// Registration progress data
localStorage.setItem('univault_registration', JSON.stringify({
  step_1: { customer_type: "Account Owner" },
  step_2: { account_types: ["Deposit Account", "Card Account"] },
  step_3: { customer_first_name: "John", ... },
  // ... other steps
}));

// Final submission data
localStorage.setItem('univault_submission', JSON.stringify({
  reference_number: "UV-2025-123456",
  submission_timestamp: "2025-01-20T10:30:00.000Z",
  // ... all form data
}));

// User login session
localStorage.setItem('univault_user', JSON.stringify({
  cif_number: "1000000000",
  username: "johndoe",
  login_time: "2025-01-20T10:30:00.000Z"
}));
```

## 🔧 Customization

### Adding New Steps
1. Create new HTML file following the pattern: `registration{N}.html`
2. Update `REGISTRATION_STEPS` array in `shared.js`
3. Implement step-specific validation and data saving
4. Update progress bar calculations

### Styling Changes
- Modify `shared.css` for global changes
- Add step-specific styles in individual HTML files
- Use CSS custom properties for theme changes

### Validation Rules
- Add new validation functions to `shared.js`
- Implement step-specific validation in individual pages
- Update error messages for better UX

## 🔗 Backend Integration

The registration system is designed to integrate with the UniVault backend:

### API Endpoints
- `POST /register` - Submit complete registration data
- `POST /login` - User authentication
- `GET /api/customer/:id` - Retrieve customer information

### Data Format
The system collects data in the format expected by the backend API, including:
- Customer personal information
- Address details
- Employment information
- Identity documents
- Regulatory compliance data

## 🧪 Testing

### Manual Testing Checklist
- [ ] Complete registration flow from start to finish
- [ ] Back/forward navigation between steps
- [ ] Form validation on all input fields
- [ ] Data persistence across page refreshes
- [ ] Responsive design on different screen sizes
- [ ] Error handling for network issues
- [ ] Login integration with backend

### Test Data
Use these sample values for testing:
- **Name**: John Doe
- **Email**: john.doe@example.com
- **Phone**: +63 912 345 6789
- **Birth Date**: 1990-01-01
- **TIN**: 123-456-789-000

## 🔒 Security Considerations

- **Client-side Only**: No sensitive data processing on frontend
- **Data Validation**: Input sanitization and format validation
- **Local Storage**: Temporary data storage (cleared after submission)
- **HTTPS Ready**: Designed for secure HTTPS deployment
- **No Secrets**: No API keys or sensitive information in frontend code

## 📱 Browser Compatibility

### Supported Browsers
- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Safari 13+
- ✅ Edge 80+

### Features Used
- ES6+ JavaScript features
- CSS Grid and Flexbox
- Fetch API for HTTP requests
- Local Storage API
- File API for uploads

## 🚀 Deployment

### Production Deployment
1. Build static assets (no build process required)
2. Deploy to web server or CDN
3. Configure backend API endpoints
4. Set up HTTPS certificates
5. Configure domain and routing

### Environment Variables
```javascript
// Update API endpoints for production
const API_BASE_URL = 'https://api.univault.com';
```

## 📞 Support

For issues or questions about the registration system:

- **Email**: support@univault.com
- **Phone**: +63 912 345 6789
- **Hours**: Monday to Friday, 9:00 AM – 5:00 PM

## 📄 License

This project is part of the COMP010_BSCS25_G4_UniVault academic project.

---

**Happy Banking! 🏦✨**
