/**
 * Customer Profile Completeness Validation Utility
 * Enforces business rules for complete customer profiles and account requirements
 */

const { pool } = require('../config/database');

/**
 * Validates customer profile completeness based on business requirements
 * @param {number} cifNumber - Customer CIF number
 * @returns {Object} Validation result with completeness status and missing sections
 */
async function validateCustomerProfileCompleteness(cifNumber) {
    try {
        const validation = {
            isComplete: false,
            completionPercentage: 0,
            missingSections: [],
            warnings: [],
            sections: {
                personalInformation: { complete: false, details: [] },
                contactDetails: { complete: false, details: [] },
                employmentFinancial: { complete: false, details: [] },
                workNature: { complete: false, details: [] },
                fundSources: { complete: false, details: [] },
                aliases: { complete: true, details: [] }, // Optional
                regulatoryRequirements: { complete: false, details: [] },
                accounts: { complete: false, details: [] }
            }
        };

        // 1. Personal Information Validation
        await validatePersonalInformation(cifNumber, validation);
        
        // 2. Contact Details Validation
        await validateContactDetails(cifNumber, validation);
        
        // 3. Employment & Financial Information Validation
        await validateEmploymentFinancial(cifNumber, validation);
        
        // 4. Work/Business Nature Validation
        await validateWorkNature(cifNumber, validation);
        
        // 5. Fund Sources Validation
        await validateFundSources(cifNumber, validation);
        
        // 6. Aliases Validation (optional)
        await validateAliases(cifNumber, validation);
        
        // 7. Regulatory Requirements Validation
        await validateRegulatoryRequirements(cifNumber, validation);
        
        // 8. Account Requirements Validation
        await validateAccountRequirements(cifNumber, validation);

        // Calculate overall completion
        const requiredSections = Object.keys(validation.sections).filter(key => key !== 'aliases');
        const completeSections = requiredSections.filter(key => validation.sections[key].complete);
        
        validation.completionPercentage = Math.round((completeSections.length / requiredSections.length) * 100);
        validation.isComplete = validation.completionPercentage === 100;
        
        // Add missing sections to the main array
        validation.missingSections = requiredSections.filter(key => !validation.sections[key].complete);

        return validation;
        
    } catch (error) {
        console.error('Error validating customer profile:', error);
        throw error;
    }
}

/**
 * Validates personal information completeness
 */
async function validatePersonalInformation(cifNumber, validation) {
    const [customer] = await pool.query(`
        SELECT customer_last_name, customer_first_name, customer_middle_name, 
               birth_date, gender, civil_status_code, birth_country, citizenship
        FROM CUSTOMER 
        WHERE cif_number = ? AND is_deleted = FALSE
    `, [cifNumber]);
    
    if (customer.length === 0) {
        validation.sections.personalInformation.details.push('Customer not found');
        return;
    }
    
    const data = customer[0];
    const required = ['customer_last_name', 'customer_first_name', 'birth_date', 'gender', 'civil_status_code', 'birth_country', 'citizenship'];
    const missing = required.filter(field => !data[field] || data[field].toString().trim() === '');
    
    if (missing.length === 0) {
        validation.sections.personalInformation.complete = true;
        validation.sections.personalInformation.details.push('All required personal information provided');
    } else {
        validation.sections.personalInformation.details.push(`Missing: ${missing.join(', ')}`);
    }
}

/**
 * Validates contact details completeness
 */
async function validateContactDetails(cifNumber, validation) {
    const [contacts] = await pool.query(`
        SELECT contact_type_code, contact_value 
        FROM CUSTOMER_CONTACT_DETAILS 
        WHERE cif_number = ?
    `, [cifNumber]);
    
    const [addresses] = await pool.query(`
        SELECT address_type_code, address_barangay, address_city, address_province, address_country, address_zip_code
        FROM CUSTOMER_ADDRESS 
        WHERE cif_number = ?
    `, [cifNumber]);
    
    // Check for required contact types (email and phone)
    const hasEmail = contacts.some(c => c.contact_type_code === 'CT01' && c.contact_value);
    const hasPhone = contacts.some(c => c.contact_type_code === 'CT02' && c.contact_value);
    
    // Check for required address (home address)
    const hasHomeAddress = addresses.some(a => 
        a.address_type_code === 'AD01' && 
        a.address_barangay && a.address_city && a.address_province && a.address_country && a.address_zip_code
    );
    
    const missing = [];
    if (!hasEmail) missing.push('Email address');
    if (!hasPhone) missing.push('Phone number');
    if (!hasHomeAddress) missing.push('Complete home address');
    
    if (missing.length === 0) {
        validation.sections.contactDetails.complete = true;
        validation.sections.contactDetails.details.push('All required contact details provided');
    } else {
        validation.sections.contactDetails.details.push(`Missing: ${missing.join(', ')}`);
    }
}

/**
 * Validates employment and financial information
 */
async function validateEmploymentFinancial(cifNumber, validation) {
    const [employment] = await pool.query(`
        SELECT employer_business_name, position_code, income_monthly_gross
        FROM CUSTOMER_EMPLOYMENT_INFORMATION 
        WHERE cif_number = ? AND employment_status = 'Current'
    `, [cifNumber]);
    
    if (employment.length === 0) {
        validation.sections.employmentFinancial.details.push('Missing: Current employment information');
        return;
    }
    
    const data = employment[0];
    const missing = [];
    
    if (!data.employer_business_name) missing.push('Employer/Business name');
    if (!data.position_code) missing.push('Position/Job title');
    if (!data.income_monthly_gross || data.income_monthly_gross <= 0) missing.push('Monthly income');
    
    if (missing.length === 0) {
        validation.sections.employmentFinancial.complete = true;
        validation.sections.employmentFinancial.details.push('Employment and financial information complete');
    } else {
        validation.sections.employmentFinancial.details.push(`Missing: ${missing.join(', ')}`);
    }
}

/**
 * Validates work/business nature information
 */
async function validateWorkNature(cifNumber, validation) {
    const [workNature] = await pool.query(`
        SELECT cwn.work_nature_code, wnt.nature_description
        FROM CUSTOMER_WORK_NATURE cwn
        JOIN CUSTOMER_EMPLOYMENT_INFORMATION cei ON cwn.customer_employment_id = cei.customer_employment_id
        JOIN WORK_NATURE_TYPE wnt ON cwn.work_nature_code = wnt.work_nature_code
        WHERE cei.cif_number = ? AND cei.employment_status = 'Current'
    `, [cifNumber]);
    
    if (workNature.length === 0) {
        validation.sections.workNature.details.push('Missing: Work/Business nature information');
    } else {
        validation.sections.workNature.complete = true;
        validation.sections.workNature.details.push(`Work nature: ${workNature[0].nature_description}`);
    }
}

/**
 * Validates fund sources information
 */
async function validateFundSources(cifNumber, validation) {
    const [fundSources] = await pool.query(`
        SELECT cfs.fund_source_code, fst.fund_source
        FROM CUSTOMER_FUND_SOURCE cfs
        JOIN FUND_SOURCE_TYPE fst ON cfs.fund_source_code = fst.fund_source_code
        WHERE cfs.cif_number = ?
    `, [cifNumber]);
    
    if (fundSources.length === 0) {
        validation.sections.fundSources.details.push('Missing: At least one fund source required');
    } else {
        validation.sections.fundSources.complete = true;
        validation.sections.fundSources.details.push(`Fund sources: ${fundSources.map(fs => fs.fund_source).join(', ')}`);
    }
}

/**
 * Validates aliases information (optional)
 */
async function validateAliases(cifNumber, validation) {
    const [aliases] = await pool.query(`
        SELECT alias_first_name, alias_last_name, alias_middle_name
        FROM CUSTOMER_ALIAS 
        WHERE cif_number = ?
    `, [cifNumber]);
    
    // Aliases are optional, so this section is always considered complete
    validation.sections.aliases.complete = true;
    if (aliases.length > 0) {
        validation.sections.aliases.details.push(`${aliases.length} alias(es) on file`);
    } else {
        validation.sections.aliases.details.push('No aliases (optional)');
    }
}

/**
 * Validates regulatory requirements
 */
async function validateRegulatoryRequirements(cifNumber, validation) {
    const [customer] = await pool.query(`
        SELECT reg_political_affiliation, reg_fatca, reg_dnfbp, reg_online_gaming, reg_beneficial_owner
        FROM CUSTOMER 
        WHERE cif_number = ? AND is_deleted = FALSE
    `, [cifNumber]);
    
    if (customer.length === 0) {
        validation.sections.regulatoryRequirements.details.push('Customer not found');
        return;
    }
    
    const data = customer[0];
    const missing = [];
    
    if (!data.reg_political_affiliation) missing.push('Political relations & affiliations');
    if (!data.reg_fatca) missing.push('Foreign Account Tax Compliance');
    if (!data.reg_dnfbp) missing.push('CNFBPs');
    if (!data.reg_beneficial_owner) missing.push('Beneficial Ownership');
    
    if (missing.length === 0) {
        validation.sections.regulatoryRequirements.complete = true;
        validation.sections.regulatoryRequirements.details.push('All regulatory requirements completed');
    } else {
        validation.sections.regulatoryRequirements.details.push(`Missing: ${missing.join(', ')}`);
    }
}

/**
 * Validates account requirements based on customer status
 */
async function validateAccountRequirements(cifNumber, validation) {
    const [customer] = await pool.query(`
        SELECT customer_status FROM CUSTOMER WHERE cif_number = ? AND is_deleted = FALSE
    `, [cifNumber]);
    
    if (customer.length === 0) {
        validation.sections.accounts.details.push('Customer not found');
        return;
    }
    
    const customerStatus = customer[0].customer_status;
    
    const [accounts] = await pool.query(`
        SELECT ca.account_number, ad.account_status, pt.product_type_name
        FROM CUSTOMER_ACCOUNT ca
        JOIN ACCOUNT_DETAILS ad ON ca.account_number = ad.account_number
        JOIN CUSTOMER_PRODUCT_TYPE pt ON ad.product_type_code = pt.product_type_code
        WHERE ca.cif_number = ?
    `, [cifNumber]);
    
    // Business rules for account requirements
    if (customerStatus === 'Pending Verification') {
        // During registration, customers should be applying for at least one account
        validation.sections.accounts.complete = accounts.length > 0;
        if (accounts.length === 0) {
            validation.sections.accounts.details.push('Missing: Account application during registration');
        } else {
            validation.sections.accounts.details.push(`${accounts.length} account application(s) in progress`);
        }
    } else if (['Active', 'Inactive'].includes(customerStatus)) {
        // Verified/approved customers must have at least one active or pending account
        const activeAccounts = accounts.filter(acc => ['Active', 'Inactive'].includes(acc.account_status));
        validation.sections.accounts.complete = activeAccounts.length > 0;
        
        if (activeAccounts.length === 0) {
            validation.sections.accounts.details.push('Missing: At least one active or pending account required for verified customers');
            validation.warnings.push('Verified customer without active accounts');
        } else {
            validation.sections.accounts.details.push(`${activeAccounts.length} active/pending account(s)`);
        }
    } else {
        // For other statuses, just report current state
        validation.sections.accounts.complete = accounts.length > 0;
        validation.sections.accounts.details.push(`${accounts.length} account(s) associated`);
    }
}

/**
 * Validates if a customer can be advanced to a specific status
 */
async function validateStatusTransition(cifNumber, newStatus) {
    const validation = await validateCustomerProfileCompleteness(cifNumber);
    
    const result = {
        canTransition: false,
        reasons: [],
        warnings: validation.warnings
    };
    
    switch (newStatus) {
        case 'Active':
            // To be marked as Active (verified), profile must be complete and have accounts
            if (!validation.isComplete) {
                result.reasons.push(`Profile is only ${validation.completionPercentage}% complete`);
                result.reasons.push(...validation.missingSections.map(section => `Missing: ${section}`));
            }
            if (!validation.sections.accounts.complete) {
                result.reasons.push('Customer must have at least one account');
            }
            result.canTransition = validation.isComplete && validation.sections.accounts.complete;
            break;
            
        case 'Inactive':
            // Similar to Active but for pending approval
            if (!validation.isComplete) {
                result.reasons.push(`Profile is only ${validation.completionPercentage}% complete`);
            }
            result.canTransition = validation.isComplete;
            break;
            
        case 'Suspended':
        case 'Closed':
            // Can always suspend or close regardless of completeness
            result.canTransition = true;
            break;
            
        default:
            result.reasons.push('Invalid status transition');
    }
    
    return result;
}

module.exports = {
    validateCustomerProfileCompleteness,
    validateStatusTransition
};
