// src/utils/helpers.ts
// Utility helper functions for the Partner App

import { EARNINGS_PERIOD, JOB_STATUS, KYC_STATUS, PARTNER_STATUS } from './constants';

/**
 * Format currency to Indian Rupees
 * @param amount - Number to format
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(amount);
};

/**
 * Format distance in kilometers
 * @param meters - Distance in meters
 * @returns Formatted distance string
 */
export const formatDistance = (meters: number): string => {
    if (meters < 1000) {
        return `${Math.round(meters)} m`;
    }
    return `${(meters / 1000).toFixed(1)} km`;
};

/**
 * Format date to readable string
 * @param date - Date string or Date object
 * @returns Formatted date string
 */
export const formatDate = (date: string | Date): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
};

/**
 * Format time to readable string
 * @param date - Date string or Date object
 * @returns Formatted time string
 */
export const formatTime = (date: string | Date): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });
};

/**
 * Format date and time together
 * @param date - Date string or Date object
 * @returns Formatted datetime string
 */
export const formatDateTime = (date: string | Date): string => {
    return `${formatDate(date)} at ${formatTime(date)}`;
};

/**
 * Get greeting based on time of day
 * @returns Greeting string
 */
export const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
};

/**
 * Calculate time ago from date
 * @param date - Date string or Date object
 * @returns Time ago string (e.g., "2 hours ago")
 */
export const timeAgo = (date: string | Date): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const seconds = Math.floor((new Date().getTime() - dateObj.getTime()) / 1000);

    const intervals: { [key: string]: number } = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60,
    };

    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
        const interval = Math.floor(seconds / secondsInUnit);
        if (interval >= 1) {
            return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
        }
    }

    return 'Just now';
};

/**
 * Get human-readable job status label
 * @param status - Job status constant
 * @returns Readable status label
 */
export const getJobStatusLabel = (status: string): string => {
    const labels: { [key: string]: string } = {
        [JOB_STATUS.PENDING]: 'Pending',
        [JOB_STATUS.COMPLETED]: 'Completed',
    };
    return labels[status] || status;
};

/**
 * Get human-readable KYC status label
 * @param status - KYC status constant
 * @returns Readable status label
 */
export const getKycStatusLabel = (status: string): string => {
    const labels: { [key: string]: string } = {
        [KYC_STATUS.PENDING]: 'Pending Submission',
        [KYC_STATUS.UNDER_REVIEW]: 'Under Review',
        [KYC_STATUS.APPROVED]: 'Approved',
        [KYC_STATUS.REJECTED]: 'Rejected',
        [KYC_STATUS.ON_HOLD]: 'On Hold',
        [KYC_STATUS.NEED_INFO]: 'More Info Required',
    };
    return labels[status] || status;
};

/**
 * Get human-readable partner status label
 * @param status - Partner status constant
 * @returns Readable status label
 */
export const getPartnerStatusLabel = (status: string): string => {
    const labels: { [key: string]: string } = {
        [PARTNER_STATUS.ONLINE]: 'Online',
        [PARTNER_STATUS.OFFLINE]: 'Offline',
        [PARTNER_STATUS.BUSY]: 'Busy',
    };
    return labels[status] || status;
};

/**
 * Validate phone number (Indian format)
 * @param phone - Phone number string
 * @returns Boolean indicating validity
 */
export const isValidPhone = (phone: string): boolean => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
};

/**
 * Validate email format
 * @param email - Email string
 * @returns Boolean indicating validity
 */
export const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Truncate text with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text
 */
export const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return `${text.substring(0, maxLength)}...`;
};

/**
 * Get date range for earnings period
 * @param period - Earnings period constant
 * @returns Object with start and end dates
 */
export const getDateRangeForPeriod = (period: string): { start: Date; end: Date } => {
    const now = new Date();
    const end = new Date(now);
    let start = new Date(now);

    switch (period) {
        case EARNINGS_PERIOD.TODAY:
            start.setHours(0, 0, 0, 0);
            break;
        case EARNINGS_PERIOD.WEEKLY:
            start.setDate(now.getDate() - 7);
            break;
        case EARNINGS_PERIOD.MONTHLY:
            start.setMonth(now.getMonth() - 1);
            break;
        default:
            start.setHours(0, 0, 0, 0);
    }

    return { start, end };
};

/**
 * Generate unique ID for local operations
 * @returns Unique ID string
 */
export const generateUniqueId = (): string => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Debounce function for optimizing API calls
 * @param func - Function to debounce
 * @param wait - Wait time in milliseconds
 * @returns Debounced function
 */
export const debounce = <T extends (...args: any[]) => any>(
    func: T,
    wait: number
): ((...args: Parameters<T>) => void) => {
    let timeoutId: NodeJS.Timeout | null = null;

    return (...args: Parameters<T>) => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => func(...args), wait);
    };
};
