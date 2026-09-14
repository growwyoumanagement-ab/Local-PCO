// src/services/authService.ts
// Authentication service for partner login, logout, and token management

import api, { saveAuthTokens, clearAuthTokens } from './api';

/**
 * Login credentials interface
 */
interface LoginCredentials {
    phone: string;
    password: string;
}

/**
 * OTP verification interface
 */
interface OTPVerification {
    phone: string;
    otp: string;
}

/**
 * Auth response from server
 */
interface AuthResponse {
    success: boolean;
    data: {
        accessToken: string;
        refreshToken: string;
        partner: PartnerInfo;
    };
    message?: string;
}

/**
 * Partner info from auth response
 */
export interface PartnerInfo {
    id: string;
    name: string;
    phone: string;
    email?: string;
    avatar?: string;
    serviceCategory: string;
    kycStatus: string;
    isVerified: boolean;
}

/**
 * Authentication Service
 * Handles all auth-related API calls
 */
const authService = {
    /**
     * Login partner with phone and password
     * @param credentials - Phone and password
     * @returns Auth response with tokens and partner info
     */
    login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
        try {
            // API Placeholder - Replace with actual endpoint when backend is ready
            const response = await api.post<AuthResponse>('/auth/partner/login', credentials);

            if (response.data.success) {
                const { accessToken, refreshToken, token } = response.data.data as any;
                const finalAccessToken = accessToken || token || '';
                await saveAuthTokens(finalAccessToken, refreshToken || '');
            }

            return response.data;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    },

    /**
     * Request OTP for phone verification
     */
    requestOTP: async (phone: string): Promise<{ success: boolean; message: string; otp?: string }> => {
        try {
            const response = await api.post('/auth/partner/request-otp', { phone });
            return response.data;
        } catch (error) {
            console.error('Request OTP error:', error);
            throw error;
        }
    },

    /**
     * Verify OTP and login
     */
    verifyOTP: async (phone: string, otp: string): Promise<AuthResponse> => {
        try {
            const response = await api.post<AuthResponse>('/auth/partner/verify-otp', { phone, otp });

            if (response.data.success) {
                const { accessToken, refreshToken, token } = response.data.data as any;
                const finalAccessToken = accessToken || token || '';
                await saveAuthTokens(finalAccessToken, refreshToken || '');
            }

            return response.data;
        } catch (error) {
            console.error('Verify OTP error:', error);
            throw error;
        }
    },

    /**
     * Logout partner - clear tokens and notify server
     * @returns Success status
     */
    logout: async (): Promise<{ success: boolean }> => {
        try {
            // API Placeholder - Notify server about logout
            await api.post('/auth/partner/logout');
        } catch (error) {
            // Continue with local logout even if server call fails
            console.warn('Server logout failed, continuing with local logout:', error);
        } finally {
            await clearAuthTokens();
        }
        return { success: true };
    },

    /**
     * Check if partner is authenticated (has valid token)
     * @returns Boolean indicating auth status
     */
    isAuthenticated: async (): Promise<boolean> => {
        try {
            // API Placeholder - Validate token with server
            const response = await api.get('/auth/partner/validate');
            return response.data.valid === true;
        } catch (error) {
            return false;
        }
    },

    /**
     * Get current partner profile
     * @returns Partner info
     */
    getCurrentPartner: async (): Promise<PartnerInfo> => {
        try {
            // API Placeholder
            const response = await api.get<{ success: boolean; data: PartnerInfo }>('/partner/profile');
            return response.data.data;
        } catch (error) {
            console.error('Get current partner error:', error);
            throw error;
        }
    },

    /**
     * Register new partner
     * @param partnerData - Partner registration data
     * @returns Auth response
     */
    register: async (partnerData: {
        name: string;
        phone: string;
        password: string;
        email?: string;
        serviceCategory: string;
        serviceSubcategory?: string;
    }): Promise<AuthResponse> => {
        try {
            const response = await api.post<AuthResponse>('/auth/partner/register', partnerData);
            if (response.data.success && response.data.data) {
                const { accessToken, refreshToken, token } = response.data.data as any;
                const finalAccessToken = accessToken || token || '';
                if (finalAccessToken) {
                    await saveAuthTokens(finalAccessToken, refreshToken || '');
                }
            }
            return response.data;
        } catch (error) {
            console.error('Register error:', error);
            throw error;
        }
    },

    /**
     * Forgot password request via email
     */
    forgotPassword: async (email: string, userType = 'partner'): Promise<{ success: boolean; message: string }> => {
        try {
            const response = await api.post('/auth/forgot-password', { email, userType });
            return response.data;
        } catch (error) {
            console.error('Forgot password error:', error);
            throw error;
        }
    },

    /**
     * Reset password using email, OTP and new password
     */
    resetPasswordWithEmail: async (email: string, otp: string, newPassword: string, userType = 'partner'): Promise<{ success: boolean; message: string }> => {
        try {
            const response = await api.post('/auth/reset-password', { email, otp, newPassword, userType });
            return response.data;
        } catch (error) {
            console.error('Reset password error:', error);
            throw error;
        }
    },
};

export default authService;
