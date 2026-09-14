import api, { saveAuthTokens, clearAuthTokens } from './api';
import { User } from '../store/authSlice';

/**
 * Update profile payload interface
 */
export interface UpdateProfilePayload {
    name?: string;
    email?: string;
    phone?: string;
    avatar?: string;
}

/**
 * Helper to normalize phone numbers (strip non-digits, ensure 10-digit standard format)
 */
export const normalizePhone = (phone: string): string => {
    const digitsOnly = phone.replace(/\D/g, '');
    if (digitsOnly.length > 10) {
        return digitsOnly.slice(-10);
    }
    return digitsOnly;
};

/**
 * Auth service with API methods
 */
export const authService = {
    /**
     * Register new client
     */
    register: async (data: { name: string; phone: string; email?: string; password?: string }): Promise<User & { token: string }> => {
        const normalizedData = { ...data, phone: normalizePhone(data.phone) };
        const response = await api.post('/auth/client/register', normalizedData);

        if (response.data.success) {
            const { accessToken, refreshToken, token, ...userData } = response.data.data;
            const finalAccessToken = accessToken || token || '';
            await saveAuthTokens(finalAccessToken, refreshToken || '');
            return { ...userData, id: userData._id || userData.id, token: finalAccessToken };
        }
        throw new Error(response.data.message || 'Registration failed');
    },

    /**
     * Request OTP for phone verification
     */
    requestOTP: async (phone: string): Promise<{ success: boolean; message: string; otp?: string }> => {
        const response = await api.post('/auth/client/request-otp', { phone: normalizePhone(phone) });
        return response.data;
    },

    /**
     * Verify OTP and login
     */
    verifyOTP: async (phone: string, otp: string): Promise<User & { token: string }> => {
        const response = await api.post('/auth/client/verify-otp', { phone: normalizePhone(phone), otp });

        if (response.data.success) {
            const { accessToken, refreshToken, token, ...userData } = response.data.data;
            const finalAccessToken = accessToken || token || '';
            await saveAuthTokens(finalAccessToken, refreshToken || '');
            return { ...userData, id: userData._id || userData.id, token: finalAccessToken };
        }
        throw new Error(response.data.message || 'OTP verification failed');
    },

    /**
     * Login client via phone and password
     */
    login: async (phone: string, password?: string): Promise<User & { token: string }> => {
        const response = await api.post('/auth/client/login', { phone: normalizePhone(phone), password });

        if (response.data.success) {
            const { accessToken, refreshToken, token, ...userData } = response.data.data;
            const finalAccessToken = accessToken || token || '';
            await saveAuthTokens(finalAccessToken, refreshToken || '');
            return { ...userData, id: userData._id || userData.id, token: finalAccessToken };
        }
        throw new Error(response.data.message || 'Login failed');
    },

    /**
     * Get current user profile
     */
    getProfile: async (): Promise<User> => {
        const response = await api.get('/auth/client/profile');
        if (response.data.success) {
            const data = response.data.data;
            return {
                id: data._id || data.id,
                name: data.name,
                phone: data.phone,
                email: data.email,
                avatar: data.avatar || data.photo || undefined,
            };
        }
        throw new Error(response.data.message || 'Failed to fetch profile');
    },

    /**
     * Update user profile
     */
    updateProfile: async (payload: UpdateProfilePayload): Promise<User> => {
        const formattedPayload = payload.phone ? { ...payload, phone: normalizePhone(payload.phone) } : payload;
        const response = await api.put('/auth/client/profile', formattedPayload);
        if (response.data.success) {
            const data = response.data.data;
            return {
                id: data._id || data.id,
                name: data.name,
                phone: data.phone,
                email: data.email,
                avatar: data.avatar || data.photo || undefined,
            };
        }
        throw new Error(response.data.message || 'Failed to update profile');
    },

    /**
     * Logout user
     */
    logout: async (): Promise<void> => {
        await clearAuthTokens();
    },

    /**
     * Request forgot password OTP to email
     */
    forgotPassword: async (email: string, userType = 'client'): Promise<{ success: boolean; message: string }> => {
        const response = await api.post('/auth/forgot-password', { email, userType });
        return response.data;
    },

    /**
     * Reset password using email, OTP and new password
     */
    resetPassword: async (email: string, otp: string, newPassword: string, userType = 'client'): Promise<{ success: boolean; message: string }> => {
        const response = await api.post('/auth/reset-password', { email, otp, newPassword, userType });
        return response.data;
    },
};

export default authService;
