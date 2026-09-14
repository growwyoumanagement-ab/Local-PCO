// src/services/requestService.ts
// Service request API calls

import api from './api';
import { ServiceRequest } from '../store/requestSlice';

/**
 * Service type interface
 */
export interface ServiceType {
    id: string;
    name: string;
    icon: string;
    description: string;
    basePrice?: number;
}

/**
 * Create request payload
 */
export interface CreateRequestPayload {
    serviceId: string;
    partnerId: string;
    bookingType: 'instant' | 'appointment';
    address: {
        full: string;
        landmark?: string;
        lat?: number;
        lng?: number;
    };
    notes?: string;
    imageUri?: string;
    scheduledAt?: string;
}

/**
 * Request history filters
 */
interface HistoryFilters {
    status?: string;
    page?: number;
    limit?: number;
}

/**
 * Request service
 * Contains all service request related API calls
 */
const mapRequest = (data: any): ServiceRequest => ({
    ...data,
    id: data._id || data.id,
});

export const requestService = {
    /**
     * Get available services
     * GET /requests/services
     */
    getServices: async (): Promise<ServiceType[]> => {
        const response = await api.get('/requests/services');
        return response.data.data.map((s: any) => ({ ...s, id: s._id || s.id }));
    },

    /**
     * Get active request
     * GET /requests/active
     */
    getActiveRequest: async (): Promise<ServiceRequest | null> => {
        const response = await api.get('/requests/active');
        if (!response.data.data) return null;
        return mapRequest(response.data.data);
    },

    /**
     * Get request history
     * GET /requests/history
     */
    getRequestHistory: async (filters: HistoryFilters): Promise<ServiceRequest[]> => {
        const response = await api.get('/requests/history', { params: filters });
        return (response.data.data || []).map(mapRequest);
    },

    /**
     * Get request by ID
     * GET /requests/{id}
     */
    getRequestById: async (id: string): Promise<ServiceRequest> => {
        const response = await api.get(`/requests/${id}`);
        return mapRequest(response.data.data);
    },

    /**
     * Create new request
     * POST /requests
     */
    createRequest: async (payload: CreateRequestPayload): Promise<ServiceRequest> => {
        const response = await api.post('/requests', payload);
        return mapRequest(response.data.data);
    },

    /**
     * Cancel request
     * PUT /requests/{id}/cancel
     */
    cancelRequest: async (id: string): Promise<ServiceRequest> => {
        const response = await api.put(`/requests/${id}/cancel`);
        return mapRequest(response.data.data);
    },

    /**
     * Submit a rating/review for a completed request
     * POST /requests/{id}/review
     */
    submitRating: async (requestId: string, payload: { rating: number; feedback: string; tags: string[] }): Promise<any> => {
        const response = await api.post(`/requests/${requestId}/review`, payload);
        return response.data;
    },

    skipRating: async (requestId: string): Promise<any> => {
        const response = await api.put(`/requests/${requestId}/skip-review`);
        return response.data;
    },
};

export default requestService;
