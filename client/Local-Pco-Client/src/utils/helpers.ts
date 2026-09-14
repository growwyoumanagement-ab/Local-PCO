// src/utils/helpers.ts
// Utility helper functions for the Client App

import { REQUEST_STATUS } from './constants';

/**
 * Format date to readable string
 */
export const formatDate = (date: string | Date): string => {
    const d = new Date(date);
    return d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
};

/**
 * Format time to readable string
 */
export const formatTime = (date: string | Date): string => {
    const d = new Date(date);
    return d.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
    });
};

/**
 * Format date and time together
 */
export const formatDateTime = (date: string | Date): string => {
    return `${formatDate(date)} at ${formatTime(date)}`;
};

/**
 * Get relative time string (e.g., "2 hours ago")
 */
export const getRelativeTime = (date: string | Date): string => {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return formatDate(date);
};

/**
 * Format currency (INR)
 */
export const formatCurrency = (amount: number): string => {
    return `₹${amount.toLocaleString('en-IN')}`;
};

/**
 * Format phone number
 */
export const formatPhone = (phone: string): string => {
    if (phone.length === 10) {
        return `+91 ${phone.slice(0, 5)} ${phone.slice(5)}`;
    }
    return phone;
};

/**
 * Get status display label
 */
export const getStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
        [REQUEST_STATUS.PENDING]: 'Pending',
        [REQUEST_STATUS.COMPLETED]: 'Completed',
    };
    return labels[status] || status;
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return `${text.slice(0, maxLength)}...`;
};

/**
 * Capitalize first letter
 */
export const capitalizeFirst = (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Generate unique ID
 */
export const generateId = (): string => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Debounce function
 */
export const debounce = <T extends (...args: unknown[]) => unknown>(
    func: T,
    wait: number
): ((...args: Parameters<T>) => void) => {
    let timeout: ReturnType<typeof setTimeout>;
    return (...args: Parameters<T>) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
};

/**
 * Check if request can be cancelled (Fix #23)
 * Client can cancel during pending or accepted states (before partner reaches location)
 */
export const canCancelRequest = (status: string): boolean => {
    return status === REQUEST_STATUS.PENDING || status === REQUEST_STATUS.ACCEPTED || status === 'accepted';
};

/**
 * Check if request is active
 */
export const isRequestActive = (status: string): boolean => {
    return ['pending', 'accepted', 'reached', 'on_the_way', 'in_progress'].includes(status);
};

