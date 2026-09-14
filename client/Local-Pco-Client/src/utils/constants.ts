// src/utils/constants.ts
// Application-wide constants for the Client App

/**
 * Request Status Constants
 * Used throughout the app for request state management
 */
export const REQUEST_STATUS = {
    PENDING: 'pending',
    ACCEPTED: 'accepted',
    ON_THE_WAY: 'on_the_way',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
} as const;

/**
 * Service Categories matching Figma design
 */
export const SERVICE_CATEGORIES = [
    { id: 'doctor', name: 'Doctor', icon: 'medical', color: '#E0E7FF', iconColor: '#3949AB' },
    { id: 'plumber', name: 'Plumber', icon: 'construct', color: '#FFEBEE', iconColor: '#E53935' },
    { id: 'medical', name: 'Medical', icon: 'business', color: '#E8F5E9', iconColor: '#43A047' },
    { id: 'travel', name: 'Travel', icon: 'car', color: '#FFF3E0', iconColor: '#FB8C00' },
    { id: 'beauty', name: 'Beauty', icon: 'person', color: '#F3E5F5', iconColor: '#8E24AA' },
    { id: 'labour', name: 'Labour', icon: 'build', color: '#E1F5FE', iconColor: '#039BE5' },
    { id: 'gym', name: 'Gym', icon: 'fitness', color: '#FCE4EC', iconColor: '#D81B60' },
    { id: 'tuition', name: 'Tuition', icon: 'book', color: '#F4F1FF', iconColor: '#5E35B1' },
    { id: 'courier', name: 'Courier', icon: 'cube', color: '#E0F2F1', iconColor: '#00897B' },
    { id: 'mechanic', name: 'Mechanic', icon: 'settings-outline', color: '#FFF8E1', iconColor: '#F57F17' },
    { id: 'hostel', name: 'Hostel', icon: 'business', color: '#EFEBE9', iconColor: '#6D4C41' },
    { id: 'job', name: 'Job', icon: 'briefcase', color: '#FFF0F5', iconColor: '#C2185B' },
];

/**
 * Sub-categories for Medical services
 */
export const MEDICAL_SUBCATEGORIES = [
    { id: 'fever', name: 'Fever', icon: 'thermometer', color: '#EDE7F6' },
    { id: 'dust_allergy', name: 'Dust Allergy', icon: 'cloudy', color: '#E8EAF6' },
    { id: 'body_aches', name: 'Body Aches', icon: 'sad-outline', color: '#E0F7FA' },
    { id: 'gastric', name: 'Gastric', icon: 'medical-outline', color: '#FBE9E7' },
    { id: 'migraine', name: 'Migraine', icon: 'alert-circle-outline', color: '#FFEBEE' },
    { id: 'cough', name: 'Cough', icon: 'sparkles', color: '#E0E7FF' },
    { id: 'skin_allergy', name: 'Skin Allergy', icon: 'ellipsis-horizontal-circle-outline', color: '#E8F5E9' },
    { id: 'eye', name: 'Eye', icon: 'eye-outline', color: '#FFF3E0' },
];

/**
 * Medicine types
 */
export const MEDICINE_TYPES = [
    { id: 'allopathy', name: 'Allopathy', icon: 'medkit' },
    { id: 'homeopathy', name: 'Homeopathy', icon: 'leaf' },
    { id: 'naturopathy', name: 'Naturopathy', icon: 'leaf' },
    { id: 'ayurvedic', name: 'Ayurvedic', icon: 'flask-outline' },
];

/**
 * Address Types
 */
export const ADDRESS_TYPE = {
    HOME: 'home',
    WORK: 'work',
    OTHER: 'other',
} as const;

/**
 * Navigation Route Names
 */
export const ROUTES = {
    // Tab Routes
    HOME_TAB: 'HomeTab',
    HISTORY_TAB: 'HistoryTab',
    ADDRESSES_TAB: 'AddressesTab',
    PROFILE_TAB: 'ProfileTab',
 
    // Stack Routes
    DASHBOARD: 'Dashboard',
    CATEGORY_DETAIL: 'CategoryDetail',
    SERVICE_PROVIDERS: 'ServiceProviders',
    PROVIDER_DETAIL: 'ProviderDetail',
    CREATE_REQUEST: 'CreateRequest',
    ADDRESS_PICKER: 'AddressPicker',
    TRACKING: 'Tracking',
    REQUEST_HISTORY: 'RequestHistory',
    REQUEST_DETAIL: 'RequestDetail',
    RATING: 'Rating',
    PROFILE: 'Profile',
    SAVED_ADDRESSES: 'SavedAddresses',
    HELP_SUPPORT: 'HelpSupport',
    TERMS_CONDITIONS: 'TermsConditions',
    ABOUT: 'About',
    LOGIN: 'Login',
    OTP_LOGIN: 'OTPLogin',
    REGISTER: 'Register',
    FORGOT_PASSWORD: 'ForgotPassword',
    ONBOARDING: 'Onboarding',
} as const;

/**
 * Color Palette for the App
 * Modern professional teal/orange theme
 */
export const COLORS = {
    primary: '#0D9488',
    primaryDark: '#0F766E',
    primaryLight: '#5EEAD4',
    primaryBg: '#F0FDFA',
    secondary: '#F97316',
    secondaryLight: '#FFF7ED',
    accent: '#EC4899',
    danger: '#EF4444',
    warning: '#F59E0B',
    success: '#22C55E',
    info: '#0EA5E9',
    error: '#EF4444',

    // Neutrals
    white: '#FFFFFF',
    black: '#000000',
    background: '#F8FAFC',
    surface: '#F1F5F9',
    surface2: '#E2E8F0',
    gray50: '#F8FAFC',
    gray100: '#F1F5F9',
    gray200: '#E2E8F0',
    gray300: '#CBD5E1',
    gray400: '#94A3B8',
    gray500: '#64748B',
    gray600: '#475569',
    gray700: '#334155',
    gray800: '#1E293B',
    gray900: '#0F172A',

    // Status Colors
    completed: '#22C55E',
    pending: '#F59E0B',
    cancelled: '#EF4444',
} as const;

/**
 * Typography Sizes
 */
export const FONT_SIZE = {
    xs: 10,
    sm: 12,
    base: 14,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
} as const;

/**
 * Spacing Scale
 */
export const SPACING = {
    xs: 4,
    sm: 8,
    md: 12,
    base: 16,
    lg: 20,
    xl: 24,
    '2xl': 32,
    '3xl': 40,
    '4xl': 48,
    page: 20,
} as const;

/**
 * Border Radius Scale
 */
export const RADIUS = {
    sm: 6,
    md: 10,
    lg: 16,
    xl: 20,
    '2xl': 24,
    full: 9999,
} as const;

/**
 * Shadow Styles — Soft elevated modern shadows
 */
export const SHADOWS = {
    sm: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 3,
        elevation: 1,
    },
    md: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
    },
    lg: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 6,
    },
    xl: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.1,
        shadowRadius: 24,
        elevation: 8,
    },
} as const;

/**
 * Status Timeline Steps
 */
export const STATUS_TIMELINE = [
    { key: 'pending', label: 'Request Placed', icon: 'receipt' },
    { key: 'accepted', label: 'Accepted', icon: 'person-add' },
    { key: 'on_the_way', label: 'On The Way', icon: 'navigate' },
    { key: 'in_progress', label: 'In Progress', icon: 'construct' },
    { key: 'completed', label: 'Completed', icon: 'checkmark-circle' },
];

