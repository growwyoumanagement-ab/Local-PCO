// src/store/requestSlice.ts
// Request state management for Client App

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { requestService, CreateRequestPayload, ServiceType } from '../services/requestService';

/**
 * Service request interface
 */
export interface ServiceRequest {
    id: string;
    serviceType: string;
    serviceName: string;
    status: string;
    address: {
        full: string;
        landmark?: string;
        lat?: number;
        lng?: number;
    };
    notes?: string;
    imageUrl?: string;
    partnerId?: string;
    partnerName?: string;
    partnerPhone?: string;
    partnerLocation?: {
        lat: number;
        lng: number;
    };
    estimatedCharges?: number;
    finalCharges?: number;
    bookingType?: 'instant' | 'appointment';
    scheduledAt?: string;
    isReviewed?: boolean;
    createdAt: string;
    updatedAt: string;
    statusHistory: Array<{
        status: string;
        timestamp: string;
        note?: string;
    }>;
}

/**
 * Request state interface
 */
interface RequestState {
    activeRequest: ServiceRequest | null;
    currentDetailRequest: ServiceRequest | null;
    requestHistory: ServiceRequest[];
    services: ServiceType[];
    isLoading: boolean;
    isCreating: boolean;
    isCancelling: boolean;
    error: string | null;
    // Create request flow state
    draftRequest: {
        serviceId: string | null;
        partnerId: string | null;
        serviceName: string | null;
        bookingType: 'instant' | 'appointment';
        address: {
            full: string;
            landmark?: string;
            lat?: number;
            lng?: number;
        } | null;
        notes: string;
        imageUri: string | null;
    };
}

/**
 * Initial state
 */
const initialState: RequestState = {
    activeRequest: null,
    currentDetailRequest: null,
    requestHistory: [],
    services: [],
    isLoading: false,
    isCreating: false,
    isCancelling: false,
    error: null,
    draftRequest: {
        serviceId: null,
        partnerId: null,
        serviceName: null,
        bookingType: 'appointment', // Default
        address: null,
        notes: '',
        imageUri: null,
    },
};

/**
 * Fetch available services
 */
export const fetchServices = createAsyncThunk<
    ServiceType[],
    void,
    { rejectValue: string }
>('request/fetchServices', async (_, { rejectWithValue }) => {
    try {
        return await requestService.getServices();
    } catch (error: any) {
        return rejectWithValue(error.message || 'Failed to fetch services');
    }
});

/**
 * Fetch active request
 */
export const fetchActiveRequest = createAsyncThunk<
    ServiceRequest | null,
    void,
    { rejectValue: string }
>('request/fetchActive', async (_, { rejectWithValue }) => {
    try {
        return await requestService.getActiveRequest();
    } catch (error: any) {
        return rejectWithValue(error.message || 'Failed to fetch active request');
    }
});

/**
 * Fetch request history
 */
export const fetchRequestHistory = createAsyncThunk<
    ServiceRequest[],
    { status?: string; page?: number } | void,
    { rejectValue: string }
>('request/fetchHistory', async (filters, { rejectWithValue }) => {
    try {
        return await requestService.getRequestHistory(filters || {});
    } catch (error: any) {
        return rejectWithValue(error.message || 'Failed to fetch history');
    }
});

/**
 * Fetch request by ID
 */
export const fetchRequestById = createAsyncThunk<
    ServiceRequest,
    string,
    { rejectValue: string }
>('request/fetchById', async (id, { rejectWithValue }) => {
    try {
        return await requestService.getRequestById(id);
    } catch (error: any) {
        return rejectWithValue(error.message || 'Failed to fetch request');
    }
});

/**
 * Create new request
 */
export const createRequest = createAsyncThunk<
    ServiceRequest,
    CreateRequestPayload,
    { rejectValue: string }
>('request/create', async (payload, { rejectWithValue }) => {
    try {
        return await requestService.createRequest(payload);
    } catch (error: any) {
        return rejectWithValue(error.message || 'Failed to create request');
    }
});

/**
 * Cancel request
 */
export const cancelRequest = createAsyncThunk<
    ServiceRequest,
    string,
    { rejectValue: string }
>('request/cancel', async (id, { rejectWithValue }) => {
    try {
        return await requestService.cancelRequest(id);
    } catch (error: any) {
        return rejectWithValue(error.message || 'Failed to cancel request');
    }
});

/**
 * Request slice
 */
const requestSlice = createSlice({
    name: 'request',
    initialState,
    reducers: {
        // Clear error
        clearError: (state) => {
            state.error = null;
        },
        // Reset draft request
        resetDraft: (state) => {
            state.draftRequest = initialState.draftRequest;
        },
        // Set selected service
        setDraftService: (state, action: PayloadAction<{ id: string; name: string }>) => {
            state.draftRequest.serviceId = action.payload.id;
            state.draftRequest.serviceName = action.payload.name;
        },
        // Set address
        setDraftAddress: (state, action: PayloadAction<RequestState['draftRequest']['address']>) => {
            state.draftRequest.address = action.payload;
        },
        // Set notes
        setDraftNotes: (state, action: PayloadAction<string>) => {
            state.draftRequest.notes = action.payload;
        },
        // Set image
        setDraftImage: (state, action: PayloadAction<string | null>) => {
            state.draftRequest.imageUri = action.payload;
        },
        // Set partner
        setDraftPartner: (state, action: PayloadAction<string>) => {
            state.draftRequest.partnerId = action.payload;
        },
        // Set booking type
        setDraftBookingType: (state, action: PayloadAction<'instant' | 'appointment'>) => {
            state.draftRequest.bookingType = action.payload;
        },
        // Set active request manually for tracking
        setActiveRequest: (state, action: PayloadAction<ServiceRequest | null>) => {
            state.activeRequest = action.payload;
        },
        // Update active request (for real-time updates)
        updateActiveRequest: (state, action: PayloadAction<Partial<ServiceRequest>>) => {
            if (state.activeRequest) {
                state.activeRequest = { ...state.activeRequest, ...action.payload };
            }
        },
    },
    extraReducers: (builder) => {
        // Fetch services
        builder
            .addCase(fetchServices.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchServices.fulfilled, (state, action) => {
                state.isLoading = false;
                state.services = action.payload;
            })
            .addCase(fetchServices.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || 'Failed to fetch services';
            });

        // Fetch active request
        builder
            .addCase(fetchActiveRequest.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchActiveRequest.fulfilled, (state, action) => {
                state.isLoading = false;
                state.activeRequest = action.payload;
            })
            .addCase(fetchActiveRequest.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || 'Failed to fetch active request';
            });

        // Fetch history
        builder
            .addCase(fetchRequestHistory.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchRequestHistory.fulfilled, (state, action) => {
                state.isLoading = false;
                state.requestHistory = action.payload;
            })
            .addCase(fetchRequestHistory.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || 'Failed to fetch history';
            });

        // Fetch by ID
        builder
            .addCase(fetchRequestById.fulfilled, (state, action) => {
                state.currentDetailRequest = action.payload;
                // Upsert: update in history if exists, otherwise add it
                const index = state.requestHistory.findIndex((r) => r.id === action.payload.id);
                if (index !== -1) {
                    state.requestHistory[index] = action.payload;
                } else {
                    state.requestHistory.unshift(action.payload);
                }
                // Update active request if it's the same
                if (state.activeRequest?.id === action.payload.id) {
                    state.activeRequest = action.payload;
                }
            });

        // Create request
        builder
            .addCase(createRequest.pending, (state) => {
                state.isCreating = true;
                state.error = null;
            })
            .addCase(createRequest.fulfilled, (state, action) => {
                state.isCreating = false;
                state.activeRequest = action.payload;
                state.draftRequest = initialState.draftRequest;
            })
            .addCase(createRequest.rejected, (state, action) => {
                state.isCreating = false;
                state.error = action.payload || 'Failed to create request';
            });

        // Cancel request
        builder
            .addCase(cancelRequest.pending, (state) => {
                state.isCancelling = true;
            })
            .addCase(cancelRequest.fulfilled, (state, action) => {
                state.isCancelling = false;
                state.activeRequest = null;
                const index = state.requestHistory.findIndex((r) => r.id === action.payload.id);
                if (index !== -1) {
                    state.requestHistory[index] = action.payload;
                } else {
                    state.requestHistory.unshift(action.payload);
                }
            })
            .addCase(cancelRequest.rejected, (state, action) => {
                state.isCancelling = false;
                state.error = action.payload || 'Failed to cancel request';
            });
    },
});

export const {
    clearError,
    resetDraft,
    setDraftService,
    setDraftAddress,
    setDraftNotes,
    setDraftImage,
    setDraftPartner,
    setDraftBookingType,
    setActiveRequest,
    updateActiveRequest,
} = requestSlice.actions;

export default requestSlice.reducer;
