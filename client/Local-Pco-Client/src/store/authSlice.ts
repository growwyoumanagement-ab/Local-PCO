// src/store/authSlice.ts
// Authentication slice for Client App

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import authService from '../services/authService';

/**
 * User interface for client app
 */
export interface User {
    id: string;
    name: string;
    phone: string;
    email?: string;
    avatar?: string;
}

/**
 * Auth state interface
 */
interface AuthState {
    isAuthenticated: boolean;
    isLoading: boolean;
    user: User | null;
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
 * Login thunk
 */
export const loginClient = createAsyncThunk(
    'auth/loginClient',
    async (credentials: { phone: string; password: string }, { rejectWithValue }) => {
        try {
            const data = await authService.login(credentials.phone, credentials.password);
            return data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message || 'Login failed');
        }
    }
);

/**
 * Auth slice
 */
const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setAuthenticated: (state, action: PayloadAction<boolean>) => {
            state.isAuthenticated = action.payload;
        },
        setToken: (state, action: PayloadAction<string | null>) => {
            state.token = action.payload;
        },
        updateUser: (state, action: PayloadAction<Partial<User>>) => {
            if (state.user) {
                state.user = { ...state.user, ...action.payload };
            } else {
                state.user = action.payload as User;
            }
        },
        logout: (state) => {
            state.isAuthenticated = false;
            state.user = null;
            state.token = null;
            state.refreshToken = null;
            state.error = null;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginClient.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(loginClient.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isAuthenticated = true;
                state.user = action.payload;
                state.token = action.payload.token;
            })
            .addCase(loginClient.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase('profile/fetch/fulfilled', (state, action: any) => {
                if (state.user && action.payload) {
                    state.user = { ...state.user, ...action.payload };
                }
            })
            .addCase('profile/update/fulfilled', (state, action: any) => {
                if (state.user && action.payload) {
                    state.user = { ...state.user, ...action.payload };
                }
            });
    },
});

export const { setAuthenticated, setToken, updateUser, logout, clearError } = authSlice.actions;
export default authSlice.reducer;

