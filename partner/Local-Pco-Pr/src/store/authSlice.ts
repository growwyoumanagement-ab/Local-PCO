// src/store/authSlice.ts
// Redux slice for authentication state management

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import authService, { PartnerInfo } from '../services/authService';
import { socketService } from '../services/socketService';
import { fcmService } from '../services/fcmService';

/**
 * Auth state interface
 */
interface AuthState {
    isAuthenticated: boolean;
    isLoading: boolean;
    user: PartnerInfo | null;
    token: string | null;
    refreshToken: string | null;
    error: string | null;
}

/**
 * Initial auth state
 */
const initialState: AuthState = {
    isAuthenticated: false,
    isLoading: false,
    user: null,
    token: null,
    refreshToken: null,
    error: null,
};

/**
 * Async thunk for partner login
 */
export const loginPartner = createAsyncThunk(
    'auth/login',
    async (credentials: { phone: string; password: string }, { rejectWithValue }) => {
        try {
            const response = await authService.login(credentials);
            if (response.success) {
                return response.data;
            }
            return rejectWithValue(response.message || 'Login failed');
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Login failed');
        }
    }
);

/**
 * Async thunk for OTP verification
 */
export const verifyOTP = createAsyncThunk(
    'auth/verifyOTP',
    async (verification: { phone: string; otp: string }, { rejectWithValue }) => {
        try {
            const response = await authService.verifyOTP(verification.phone, verification.otp);
            if (response.success) {
                return response.data;
            }
            return rejectWithValue(response.message || 'OTP verification failed');
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'OTP verification failed');
        }
    }
);

/**
 * Async thunk for logout
 */
export const logoutPartner = createAsyncThunk(
    'auth/logout',
    async (_, { rejectWithValue }) => {
        try {
            socketService.disconnect();
            await fcmService.clearFcmToken();
            await authService.logout();
            return true;
        } catch (error: any) {
            return rejectWithValue('Logout failed');
        }
    }
);

/**
 * Async thunk to fetch current partner profile
 */
export const fetchCurrentPartner = createAsyncThunk(
    'auth/fetchCurrentPartner',
    async (_, { rejectWithValue }) => {
        try {
            const partner = await authService.getCurrentPartner();
            return partner;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch profile');
        }
    }
);

/**
 * Auth slice with reducers and extra reducers
 */
const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        // Clear any auth errors
        clearError: (state) => {
            state.error = null;
        },
        // Set authentication state manually (e.g., on app load)
        setAuthenticated: (state, action: PayloadAction<boolean>) => {
            state.isAuthenticated = action.payload;
        },
        // Set full auth credentials upon login / registration
        setCredentials: (state, action: PayloadAction<{ user: PartnerInfo; token?: string; refreshToken?: string }>) => {
            state.isAuthenticated = true;
            state.user = action.payload.user;
            if (action.payload.token) state.token = action.payload.token;
            if (action.payload.refreshToken) state.refreshToken = action.payload.refreshToken;
            state.error = null;
        },
        // Update user info
        updateUser: (state, action: PayloadAction<Partial<PartnerInfo>>) => {
            if (state.user) {
                state.user = { ...state.user, ...action.payload } as PartnerInfo;
            } else {
                state.user = action.payload as PartnerInfo;
            }
        },
        // Reset auth state
        resetAuth: () => initialState,
    },
    extraReducers: (builder) => {
        // Login
        builder
            .addCase(loginPartner.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(loginPartner.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isAuthenticated = true;
                state.user = action.payload.partner;
                state.token = action.payload.accessToken;
                state.refreshToken = action.payload.refreshToken;
                state.error = null;
            })
            .addCase(loginPartner.rejected, (state, action) => {
                state.isLoading = false;
                state.isAuthenticated = false;
                state.error = action.payload as string;
            });

        // OTP Verification
        builder
            .addCase(verifyOTP.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(verifyOTP.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isAuthenticated = true;
                state.user = action.payload.partner;
                state.token = action.payload.accessToken;
                state.refreshToken = action.payload.refreshToken;
                state.error = null;
            })
            .addCase(verifyOTP.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Logout
        builder
            .addCase(logoutPartner.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(logoutPartner.fulfilled, () => {
                return initialState;
            })
            .addCase(logoutPartner.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Fetch Current Partner
        builder
            .addCase(fetchCurrentPartner.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchCurrentPartner.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload;
                state.isAuthenticated = true;
            })
            .addCase(fetchCurrentPartner.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase('partner/fetchProfile/fulfilled', (state, action: any) => {
                if (state.user && action.payload?.profile) {
                    state.user = { ...state.user, ...action.payload.profile };
                }
            })
            .addCase('partner/updateProfile/fulfilled', (state, action: any) => {
                if (state.user && action.payload) {
                    state.user = { ...state.user, ...action.payload };
                }
            });
    },
});

export const { clearError, setAuthenticated, setCredentials, updateUser, resetAuth } = authSlice.actions;
export default authSlice.reducer;
