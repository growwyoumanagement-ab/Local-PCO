// src/store/locationSlice.ts
// Location and address state management for Client App

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { locationService, SavedAddress, AddAddressPayload } from '../services/locationService';

/**
 * Current location interface
 */
export interface CurrentLocation {
    lat: number;
    lng: number;
    address?: string;
    city?: string;
    pincode?: string;
}

/**
 * Location state interface
 */
interface LocationState {
    currentLocation: CurrentLocation | null;
    savedAddresses: SavedAddress[];
    isLoading: boolean;
    isLoadingLocation: boolean;
    error: string | null;
    locationPermission: 'granted' | 'denied' | 'undetermined';
}

/**
 * Initial state
 */
const initialState: LocationState = {
    currentLocation: null,
    savedAddresses: [],
    isLoading: false,
    isLoadingLocation: false,
    error: null,
    locationPermission: 'undetermined',
};

/**
 * Fetch saved addresses
 */
export const fetchSavedAddresses = createAsyncThunk<
    SavedAddress[],
    void,
    { rejectValue: string }
>('location/fetchAddresses', async (_, { rejectWithValue }) => {
    try {
        return await locationService.getSavedAddresses();
    } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch addresses');
    }
});

/**
 * Add new address
 */
export const addAddress = createAsyncThunk<
    SavedAddress,
    AddAddressPayload,
    { rejectValue: string }
>('location/addAddress', async (payload, { rejectWithValue }) => {
    try {
        return await locationService.addAddress(payload);
    } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || error.message || 'Failed to add address');
    }
});

/**
 * Delete address
 */
export const deleteAddress = createAsyncThunk<
    string,
    string,
    { rejectValue: string }
>('location/deleteAddress', async (id, { rejectWithValue }) => {
    try {
        await locationService.deleteAddress(id);
        return id;
    } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || error.message || 'Failed to delete address');
    }
});

/**
 * Set address as default
 */
export const setDefaultAddress = createAsyncThunk<
    SavedAddress,
    string,
    { rejectValue: string }
>('location/setDefault', async (id, { rejectWithValue }) => {
    try {
        return await locationService.setDefaultAddress(id);
    } catch (error: any) {
        return rejectWithValue(error.message || 'Failed to set default address');
    }
});

/**
 * Location slice
 */
const locationSlice = createSlice({
    name: 'location',
    initialState,
    reducers: {
        // Clear error
        clearError: (state) => {
            state.error = null;
        },
        // Set current location
        setCurrentLocation: (state, action: PayloadAction<CurrentLocation>) => {
            state.currentLocation = action.payload;
            state.isLoadingLocation = false;
        },
        // Set location loading
        setLocationLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoadingLocation = action.payload;
        },
        // Set permission status
        setLocationPermission: (state, action: PayloadAction<LocationState['locationPermission']>) => {
            state.locationPermission = action.payload;
        },
        // Clear current location
        clearCurrentLocation: (state) => {
            state.currentLocation = null;
        },
    },
    extraReducers: (builder) => {
        // Fetch saved addresses
        builder
            .addCase(fetchSavedAddresses.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchSavedAddresses.fulfilled, (state, action) => {
                state.isLoading = false;
                state.savedAddresses = action.payload;
            })
            .addCase(fetchSavedAddresses.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || 'Failed to fetch addresses';
            });

        // Add address
        builder
            .addCase(addAddress.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(addAddress.fulfilled, (state, action) => {
                state.isLoading = false;
                state.savedAddresses.push(action.payload);
            })
            .addCase(addAddress.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || 'Failed to add address';
            });

        // Delete address
        builder
            .addCase(deleteAddress.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(deleteAddress.fulfilled, (state, action) => {
                state.isLoading = false;
                state.savedAddresses = state.savedAddresses.filter((a) => a.id !== action.payload);
            })
            .addCase(deleteAddress.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || 'Failed to delete address';
            });

        // Set default address
        builder
            .addCase(setDefaultAddress.fulfilled, (state, action) => {
                state.savedAddresses = state.savedAddresses.map((a) => ({
                    ...a,
                    isDefault: a.id === action.payload.id,
                }));
            });
    },
});

export const {
    clearError,
    setCurrentLocation,
    setLocationLoading,
    setLocationPermission,
    clearCurrentLocation,
} = locationSlice.actions;

export default locationSlice.reducer;
