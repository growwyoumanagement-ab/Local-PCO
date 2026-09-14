// src/utils/validators.ts
// Input validation utilities for the Client App

/**
 * Validate phone number (10 digits)
 */
export const isValidPhone = (phone: string): boolean => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
};

/**
 * Validate email address
 */
export const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Validate name (at least 2 characters, letters and spaces only)
 */
export const isValidName = (name: string): boolean => {
    const nameRegex = /^[a-zA-Z\s]{2,50}$/;
    return nameRegex.test(name.trim());
};

/**
 * Validate pincode (6 digits)
 */
export const isValidPincode = (pincode: string): boolean => {
    const pincodeRegex = /^[1-9]\d{5}$/;
    return pincodeRegex.test(pincode);
};

/**
 * Validate address (minimum length)
 */
export const isValidAddress = (address: string): boolean => {
    return address.trim().length >= 10;
};

/**
 * Validate OTP (4-6 digits)
 */
export const isValidOTP = (otp: string): boolean => {
    const otpRegex = /^\d{4,6}$/;
    return otpRegex.test(otp);
};

/**
 * Check if string is empty or whitespace
 */
export const isEmpty = (str: string | null | undefined): boolean => {
    return !str || str.trim().length === 0;
};

/**
 * Get validation error message
 */
export const getValidationError = (field: string, value: string): string | null => {
    switch (field) {
        case 'phone':
            if (isEmpty(value)) return 'Phone number is required';
            if (!isValidPhone(value)) return 'Please enter a valid 10-digit Indian phone number starting with 6, 7, 8, or 9';
            break;
        case 'email':
            if (isEmpty(value)) return 'Email address is required';
            if (!isValidEmail(value)) return 'Please enter a valid email address';
            break;
        case 'name':
            if (isEmpty(value)) return 'Name is required';
            if (!isValidName(value)) return 'Please enter a valid name (2-50 characters)';
            break;
        case 'pincode':
            if (isEmpty(value)) return 'Pincode is required';
            if (!isValidPincode(value)) return 'Please enter a valid 6-digit pincode';
            break;
        case 'address':
            if (isEmpty(value)) return 'Address is required';
            if (!isValidAddress(value)) return 'Please enter a complete address (min 10 characters)';
            break;
        case 'otp':
            if (isEmpty(value)) return 'OTP is required';
            if (!isValidOTP(value)) return 'Please enter a valid OTP';
            break;
        default:
            return null;
    }
    return null;
};

/**
 * Validate entire form
 */
export const validateForm = (fields: Record<string, string>): Record<string, string | null> => {
    const errors: Record<string, string | null> = {};
    Object.keys(fields).forEach((key) => {
        errors[key] = getValidationError(key, fields[key]);
    });
    return errors;
};

/**
 * Check if form has any errors
 */
export const hasErrors = (errors: Record<string, string | null>): boolean => {
    return Object.values(errors).some((error) => error !== null);
};
