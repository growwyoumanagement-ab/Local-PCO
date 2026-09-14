// src/store/partnerSlice.ts
// Redux slice for partner profile and availability state management

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../services/api';
import { PARTNER_STATUS, KYC_STATUS } from '../utils/constants';

/**
 * Partner profile interface
 */
interface Address {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
}

/**
 * Partner profile interface
 */
interface PartnerProfile {
    id: string;
    name: string;
    phone: string;
    email?: string;
    avatar?: string;
    serviceCategory: { _id: string; name: string } | string;
    serviceSubcategory?: string;
    services: string[];
    rating: number;
    totalJobs: number;
    joinedAt: string;
    address?: Address;
}

/**
 * KYC document interface
 */
interface KYCDocument {
    type: string; // aadhaar, pan, license, etc.
    documentNumber: string;
    documentUrl?: string;
    status: string;
    rejectionReason?: string;
    uploadedAt?: string;
    verifiedAt?: string;
}

/**
 * Bank details interface
 */
interface BankDetails {
    accountHolderName: string;
    accountNumber: string;
    bankName: string;
    ifsc: string;
    isVerified: boolean;
}

/**
 * Partner state interface
 */
interface PartnerState {
    profile: PartnerProfile | null;
    availability: string; // online, offline, busy
    kycStatus: string;
    kycDocuments: KYCDocument[];
    bankDetails: BankDetails | null;
    isLoading: boolean;
    error: string | null;
}

/**
 * Initial partner state
 */
const initialState: PartnerState = {
    profile: null,
    availability: PARTNER_STATUS.OFFLINE,
    kycStatus: KYC_STATUS.PENDING,
    kycDocuments: [],
    bankDetails: null,
    isLoading: false,
    error: null,
};

/**
 * Async thunk to fetch partner profile
 */
export const fetchPartnerProfile = createAsyncThunk(
    'partner/fetchProfile',
    async (_, { rejectWithValue }) => {
        try {
            // API Placeholder
            const response = await api.get('/partner/profile');
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch profile');
        }
    }
);

/**
 * Async thunk to update partner availability status
 */
export const updateAvailability = createAsyncThunk(
    'partner/updateAvailability',
    async (status: string, { rejectWithValue }) => {
        try {
            // API Placeholder
            const response = await api.put('/partner/status', { status });
            return response.data.data.status;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update status');
        }
    }
);

/**
 * Async thunk to update partner profile
 */
export const updatePartnerProfile = createAsyncThunk(
    'partner/updateProfile',
    async (profileData: Partial<PartnerProfile>, { rejectWithValue }) => {
        try {
            // API Placeholder
            const response = await api.put('/partner/profile', profileData);
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update profile');
        }
    }
);

/**
 * Async thunk to fetch KYC status and documents
 */
export const fetchKYCStatus = createAsyncThunk(
    'partner/fetchKYCStatus',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/kyc/status');
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch KYC status');
        }
    }
);

/**
 * Async thunk to submit KYC document
 */
export const submitKYCDocument = createAsyncThunk(
    'partner/submitKYCDocument',
    async (document: { documentType: string; documentNumber?: string; imageBase64: string; side?: string; location?: { latitude: number; longitude: number; address?: string } }, { rejectWithValue }) => {
        try {
            const response = await api.post('/kyc/upload', document);
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to submit document');
        }
    }
);

/**
 * Async thunk to update bank details
 */
export const updateBankDetails = createAsyncThunk(
    'partner/updateBankDetails',
    async (bankDetails: BankDetails, { rejectWithValue }) => {
        try {
            // API Placeholder
            const response = await api.put('/partner/bank-details', bankDetails);
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update bank details');
        }
    }
);

/**
 * Partner slice with reducers and extra reducers
 */
const partnerSlice = createSlice({
    name: 'partner',
    initialState,
    reducers: {
        // Clear errors
        clearPartnerError: (state) => {
            state.error = null;
        },
        // Set availability locally (optimistic update)
        setAvailability: (state, action: PayloadAction<string>) => {
            state.availability = action.payload;
        },
        // Reset partner state
        resetPartner: () => initialState,
    },
    extraReducers: (builder) => {
        // Fetch Profile
        builder
            .addCase(fetchPartnerProfile.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchPartnerProfile.fulfilled, (state, action) => {
                state.isLoading = false;
                state.profile = action.payload.profile;
                state.availability = action.payload.availability || PARTNER_STATUS.OFFLINE;
                state.kycStatus = action.payload.kycStatus || KYC_STATUS.PENDING;
            })
            .addCase(fetchPartnerProfile.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Update Availability
        builder
            .addCase(updateAvailability.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(updateAvailability.fulfilled, (state, action) => {
                state.isLoading = false;
                state.availability = action.payload;
            })
            .addCase(updateAvailability.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Update Profile
        builder
            .addCase(updatePartnerProfile.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(updatePartnerProfile.fulfilled, (state, action) => {
                state.isLoading = false;
                state.profile = { ...state.profile, ...action.payload };
            })
            .addCase(updatePartnerProfile.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Fetch KYC Status — don't set isLoading so UI stays responsive during background refresh
        builder
            .addCase(fetchKYCStatus.pending, (state) => {
                // Only show loading if we have no documents at all yet (first load)
                if (state.kycDocuments.length === 0) {
                    state.isLoading = true;
                }
            })
            .addCase(fetchKYCStatus.fulfilled, (state, action) => {
                state.isLoading = false;
                state.kycStatus = action.payload.kycStatus;
                state.kycDocuments = action.payload.documents || [];
            })
            .addCase(fetchKYCStatus.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Submit KYC Document — upsert by type+side for instant UI update
        builder
            .addCase(submitKYCDocument.pending, (state) => {
                // Don't set global isLoading — the upload button has its own loading state
            })
            .addCase(submitKYCDocument.fulfilled, (state, action) => {
                state.isLoading = false;
                const newDoc = action.payload;
                const existingIndex = state.kycDocuments.findIndex(
                    (d: any) => d.type === newDoc.type && (d.side || 'front') === (newDoc.side || 'front')
                );
                if (existingIndex >= 0) {
                    state.kycDocuments[existingIndex] = newDoc;
                } else {
                    state.kycDocuments.push(newDoc);
                }
                state.kycStatus = KYC_STATUS.UNDER_REVIEW;
            })
            .addCase(submitKYCDocument.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Update Bank Details
        builder
            .addCase(updateBankDetails.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(updateBankDetails.fulfilled, (state, action) => {
                state.isLoading = false;
                state.bankDetails = action.payload;
            })
            .addCase(updateBankDetails.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearPartnerError, setAvailability, resetPartner } = partnerSlice.actions;
export default partnerSlice.reducer;
