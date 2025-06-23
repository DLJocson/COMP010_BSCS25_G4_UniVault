# Customer Registration API Guide

## Overview

The UniVault customer registration system implements a 15-step registration process that allows customers to complete their registration across multiple sessions. The system uses temporary storage to maintain registration progress and ensures data consistency through transaction handling.

## API Endpoints

### 1. Start Registration
**POST** `/api/customers/register/start`

Initiates a new registration session.

**Response:**
```json
{
  "message": "Registration started successfully",
  "registration_id": "uuid-v4-string",
  "current_step": 1,
  "total_steps": 15,
  "expires_at": "2024-12-24T10:30:00.000Z"
}
```

### 2. Step-by-Step Registration

#### Step 1: Basic Customer Information
**POST** `/api/customers/register/step1`

**Required Fields:**
- `registration_id` (string): Registration session ID
- `customer_type` (string): "Account Owner" or "Business Owner"
- `customer_last_name` (string): Customer's last name
- `customer_first_name` (string): Customer's first name
- `customer_username` (string): Unique username (3-50 characters)
- `customer_password` (string): Password (minimum 8 characters)
- `birth_date` (date): ISO 8601 format, must be 18+ years old
- `gender` (string): "Male", "Female", "Non-Binary/Third Gender", "Prefer not to say", "Other"
- `civil_status_code` (string): Format "CS##" (e.g., "CS01")
- `birth_country` (string): Country of birth
- `residency_status` (string): "Resident" or "Non-Resident"
- `citizenship` (string): Citizenship country
- `tax_identification_number` (string): 12-digit TIN

**Optional Fields:**
- `customer_middle_name` (string): Middle name
- `customer_suffix_name` (string): Suffix (Jr., Sr., etc.)

#### Step 2: Address Information
**POST** `/api/customers/register/step2`

**Required Fields:**
- `registration_id` (string): Registration session ID
- `address_type_code` (string): Format "AD##" (e.g., "AD01" for home)
- `address_barangay` (string): Barangay/District
- `address_city` (string): City
- `address_province` (string): Province/State
- `address_country` (string): Country
- `address_zip_code` (string): 4-character ZIP code

**Optional Fields:**
- `address_unit` (string): Unit number
- `address_building` (string): Building name
- `address_street` (string): Street address
- `address_subdivision` (string): Subdivision

#### Step 3-4: Contact Information
**POST** `/api/customers/register/step3`
**POST** `/api/customers/register/step4`

**Required Fields:**
- `registration_id` (string): Registration session ID
- `contact_type_code` (string): Format "CT##" (e.g., "CT01" for mobile)
- `contact_value` (string): Contact information (phone/email)

#### Step 5: Employment Information
**POST** `/api/customers/register/step5`

**Required Fields:**
- `registration_id` (string): Registration session ID
- `employer_business_name` (string): Employer name
- `employment_start_date` (date): ISO 8601 format
- `position_code` (string): Format "EP##"
- `income_monthly_gross` (number): Monthly gross income

**Optional Fields:**
- `employment_end_date` (date): End date if not current

#### Step 6: Fund Source Information
**POST** `/api/customers/register/step6`

**Required Fields:**
- `registration_id` (string): Registration session ID
- `fund_source_code` (string): Format "FS###"

**Optional Fields (required if fund source is remittances):**
- `remittance_country` (string): Source country for remittances
- `remittance_purpose` (string): Purpose of remittances

#### Step 7-8: ID Information
**POST** `/api/customers/register/step7`
**POST** `/api/customers/register/step8`

**Required Fields:**
- `registration_id` (string): Registration session ID
- `id_type_code` (string): Format "AAA" (3 uppercase letters)
- `id_number` (string): ID number (1-20 characters)
- `id_storage` (string): File path or URL to ID image
- `id_issue_date` (date): ISO 8601 format

**Optional Fields:**
- `id_expiry_date` (date): Expiry date (must be in future)

#### Steps 9-15: Additional Information
**POST** `/api/customers/register/step9` through `/api/customers/register/step15`

**Required Fields:**
- `registration_id` (string): Registration session ID
- `data` (object): Step-specific data object

### 3. Progress Tracking

#### Get Registration Progress
**GET** `/api/customers/register/progress/:registrationId`

**Response:**
```json
{
  "registration_id": "uuid-string",
  "current_step": 3,
  "total_steps": 15,
  "is_completed": false,
  "step_progress": {
    "step1": true,
    "step2": true
  },
  "created_at": "2024-12-23T10:00:00.000Z",
  "updated_at": "2024-12-23T10:15:00.000Z",
  "expires_at": "2024-12-24T10:00:00.000Z"
}
```

#### Get Registration Data
**GET** `/api/customers/register/data/:registrationId`

Returns all saved registration data (excluding sensitive information like passwords).

### 4. Finalize Registration

#### Complete Registration
**POST** `/api/customers/register/finalize`

**Required Fields:**
- `registration_id` (string): Registration session ID

**Response:**
```json
{
  "message": "Customer registration completed successfully",
  "cif_number": 1000000000,
  "customer_username": "testuser123",
  "customer_status": "Pending Verification"
}
```

## Data Flow

1. **Start Registration**: Creates a registration session with 24-hour expiry
2. **Step Completion**: Each step saves data to temporary storage and updates progress
3. **Progress Tracking**: Clients can check progress and resume from any completed step
4. **Data Retrieval**: Saved data can be retrieved for form pre-population
5. **Finalization**: Creates actual customer records using database transactions
6. **Cleanup**: Expired registration sessions are automatically cleaned up

## Error Handling

All endpoints return standardized error responses:

```json
{
  "error": "Error message description",
  "errors": [
    {
      "field": "field_name",
      "message": "Validation error message"
    }
  ]
}
```

## Database Schema

### CUSTOMER_REGISTRATION_PROGRESS Table
- `registration_id`: Primary key (UUID)
- `cif_number`: Customer ID (assigned after finalization)
- `session_id`: Session identifier
- `current_step`: Current registration step (1-15)
- `total_steps`: Total number of steps (15)
- `is_completed`: Registration completion status
- `registration_data`: JSON data for all steps
- `step_progress`: JSON tracking completed steps
- `created_at`, `updated_at`: Timestamps
- `expires_at`: Session expiration time

## Security Features

1. **Input Validation**: All inputs are validated using express-validator
2. **SQL Injection Prevention**: Parameterized queries used throughout
3. **Password Hashing**: bcrypt with 12 salt rounds
4. **Input Sanitization**: XSS prevention through input sanitization
5. **Session Expiry**: 24-hour session timeout
6. **Transaction Safety**: Database transactions ensure data consistency

## Usage Examples

### Frontend Integration
```javascript
// Start registration
const startResponse = await fetch('/api/customers/register/start', {
  method: 'POST'
});
const { registration_id } = await startResponse.json();

// Complete step 1
const step1Response = await fetch('/api/customers/register/step1', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    registration_id,
    customer_type: 'Account Owner',
    customer_first_name: 'John',
    customer_last_name: 'Doe',
    // ... other required fields
  })
});

// Check progress
const progressResponse = await fetch(`/api/customers/register/progress/${registration_id}`);
const progress = await progressResponse.json();
```

## Best Practices

1. **Session Management**: Store registration_id securely on client-side
2. **Progress Saving**: Save progress after each successful step
3. **Error Handling**: Implement proper error handling for network failures
4. **Form Validation**: Implement client-side validation matching server rules
5. **Data Persistence**: Allow users to resume registration across sessions
6. **User Experience**: Show progress indicators and clear next steps

## Validation Rules

All validation rules follow the database schema constraints and business logic requirements. Key patterns include:

- Customer ID: Letters and numbers, 6-12 characters
- Phone: International format with country codes
- Email: Standard email validation
- Names: Letters, spaces, hyphens, apostrophes only
- Dates: ISO 8601 format with business logic validation
- Codes: Specific format patterns (CS##, AD##, CT##, etc.)

## Testing

Use the provided test script to verify the registration system:

```bash
cd 2_backend
node test_registration.js
```

This will test the complete registration flow and verify all endpoints are working correctly.
