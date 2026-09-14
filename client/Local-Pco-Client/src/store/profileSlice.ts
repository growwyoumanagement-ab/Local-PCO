// src/store/profileSlice.ts
// Profile state management for Client App

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authService, UpdateProfilePayload } from '../services/authService';
import { User } from './authSlice';

/**
 * Profile state interface
 */
interface ProfileState {
    profile: User | null;
    isLoading: boolean;
    isUpdating: boolean;
    error: string | null;
    updateSuccess: boolean;
}

/**
 * Initial state
 */
const initialState: ProfileState = {
    profile: null,
    isLoading: false,
    isUpdating: false,
    error: null,
    updateSuccess: false,
};

/**
 * Fetch user profile
 */
export const fetchProfile = createAsyncThunk<
    User,
    void,
    { rejectValue: string }
>('profile/fetch', async (_, { rejectWithValue }) => {
    try {
        return await authService.getProfile();
    } catch (error: any) {
        return rejectWithValue(error.message || 'Failed to fetch profile');
    }
});

/**
 * Update user profile
 */
export const updateProfile = createAsyncThunk<
    User,
    UpdateProfilePayload,
    { rejectValue: string }
>('profile/update', async (payload, { rejectWithValue }) => {
    try {
        return await authService.updateProfile(payload);
    } catch (error: any) {
        return rejectWithValue(error.message || 'Failed to update profile');
    }
});

/**
 * Profile slice
 */
const profileSlice = createSlice({
    name: 'profile',
    initialState,
    reducers: {
        // Clear error
        clearError: (state) => {
            state.error = null;
        },
        // Clear update success flag
        clearUpdateSuccess: (state) => {
            state.updateSuccess = false;
        },
        // Set profile directly
        setProfile: (state, action: PayloadAction<User>) => {
            state.profile = action.payload;
        },
        // Reset profile state
        resetProfile: () => initialState,
    },
    extraReducers: (builder) => {
        // Fetch profile
        builder
            .addCase(fetchProfile.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchProfile.fulfilled, (state, action) => {
                state.isLoading = false;
                state.profile = action.payload;
            })
            .addCase(fetchProfile.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || 'Failed to fetch profile';
            });

        // Update profile
        builder
            .addCase(updateProfile.pending, (state) => {
                state.isUpdating = true;
                state.error = null;
                state.updateSuccess = false;
            })
            .addCase(updateProfile.fulfilled, (state, action) => {
                state.isUpdating = false;
                state.profile = action.payload;
                state.updateSuccess = true;
            })
            .addCase(updateProfile.rejected, (state, action) => {
                state.isUpdating = false;
                state.error = action.payload || 'Failed to update profile';
            });
    },
});

export const { clearError, clearUpdateSuccess, setProfile, resetProfile } = profileSlice.actions;
export default profileSlice.reducer;
