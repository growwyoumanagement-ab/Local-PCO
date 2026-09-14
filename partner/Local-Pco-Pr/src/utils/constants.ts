// src/utils/constants.ts
// Application-wide constants for the Partner App

/**
 * Job Status Constants
 * Used throughout the app for job state management
 */
export const JOB_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REACHED: 'reached',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

/**
 * Partner Availability Status
 */
export const PARTNER_STATUS = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  BUSY: 'busy',
} as const;

/**
 * KYC Status for Partner Verification
 */
export const KYC_STATUS = {
  PENDING: 'pending',
  UNDER_REVIEW: 'under_review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  ON_HOLD: 'on_hold',
  NEED_INFO: 'need_info',
} as const;

/**
 * Transaction Types for Wallet
 */
export const TRANSACTION_TYPE = {
  CREDIT: 'credit',
  DEBIT: 'debit',
  PAYOUT: 'payout',
  BONUS: 'bonus',
} as const;

/**
 * Job Request Timeout (in seconds)
 * Auto-reject if no action taken
 */
export const JOB_REQUEST_TIMEOUT = 30;

/**
 * Earnings Period Filters
 */
export const EARNINGS_PERIOD = {
  TODAY: 'today',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
} as const;

/**
 * Navigation Route Names
 */
export const ROUTES = {
  // Tab Routes
  DASHBOARD_TAB: 'DashboardTab',
  BOOKINGS_TAB: 'BookingsTab',
  WALLET_TAB: 'WalletTab',
  PROFILE_TAB: 'ProfileTab',

  // Stack Routes
  DASHBOARD: 'Dashboard',
  BOOKINGS: 'Bookings',
  JOB_REQUEST: 'JobRequest',
  JOB_DETAIL: 'JobDetail',
  JOB_EXECUTION: 'JobExecution',
  UPCOMING_APPOINTMENTS: 'UpcomingAppointments',

  WALLET: 'Wallet',
  PROFILE: 'Profile',
  KYC: 'Kyc',
  LOGIN: 'Login',
  BANK_ACCOUNT: 'BankAccount',
  MY_STATS: 'MyStats',
  HELP_SUPPORT: 'HelpSupport',
  TERMS_CONDITIONS: 'TermsConditions',
  SETTINGS: 'Settings',
  EDIT_PROFILE: 'EditProfile',
} as const;

/**
 * Color Palette for the App
 */
export const COLORS = {
  primary: '#16A34A',
  primaryDark: '#0A5C36',
  secondary: '#0F766E',
  accent: '#F59E0B',
  danger: '#EF4444',
  warning: '#F97316',
  success: '#16A34A',

  // Neutrals
  white: '#FFFFFF',
  black: '#000000',
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
  online: '#16A34A',
  offline: '#EF4444',
  busy: '#F59E0B',
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
} as const;
