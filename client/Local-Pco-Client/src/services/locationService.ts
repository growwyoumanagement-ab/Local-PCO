// src/services/locationService.ts
// Location and address service

import api from './api';

/**
 * Saved address interface
 */
export interface SavedAddress {
    id: string;
    label: string;
    type: 'home' | 'work' | 'other';
    full: string;
    landmark?: string;
    city: string;
    pincode: string;
    lat?: number;
    lng?: number;
    isDefault: boolean;
}

/**
 * Add address payload
 */
export interface AddAddressPayload {
    label: string;
    type: 'home' | 'work' | 'other';
    full: string;
    landmark?: string;
    city: string;
    pincode: string;
    lat?: number;
    lng?: number;
    isDefault?: boolean;
}

/**
 * Location service
 * Contains all location/address related API calls
 */
export const locationService = {
    /**
     * Get saved addresses
     * GET /location/client/addresses
     */
    getSavedAddresses: async (): Promise<SavedAddress[]> => {
        const response = await api.get('/location/client/addresses');
        const list = response.data.data || [];
        return list.map((a: any) => ({
            ...a,
            id: a.id || a._id
        }));
    },

    /**
     * Add new address
     * POST /location/client/addresses
     */
    addAddress: async (payload: AddAddressPayload): Promise<SavedAddress> => {
        const response = await api.post('/location/client/addresses', payload);
        const data = response.data.data;
        return { ...data, id: data.id || data._id };
    },

    /**
     * Update address
     * PUT /location/client/addresses/{id}
     */
    updateAddress: async (id: string, payload: Partial<AddAddressPayload>): Promise<SavedAddress> => {
        const response = await api.put(`/location/client/addresses/${id}`, payload);
        const data = response.data.data;
        return { ...data, id: data.id || data._id };
    },

    /**
     * Delete address
     * DELETE /location/client/addresses/{id}
     */
    deleteAddress: async (id: string): Promise<void> => {
        await api.delete(`/location/client/addresses/${id}`);
    },

    /**
     * Set address as default
     * PUT /location/client/addresses/{id}/default
     */
    setDefaultAddress: async (id: string): Promise<SavedAddress> => {
        const response = await api.put(`/location/client/addresses/${id}`, { isDefault: true });
        const data = response.data.data;
        return { ...data, id: data.id || data._id };
    },

    /**
     * Reverse geocode coordinates to address
     * GET /location/reverse-geocode
     */
    reverseGeocode: async (lat: number, lng: number): Promise<{ address: string; city: string; pincode: string }> => {
        const response = await api.get('/location/reverse-geocode', { params: { lat, lng } });
        return response.data.data;
    },

    /**
     * Search places by query
     * GET /location/search
     */
    searchPlaces: async (query: string): Promise<Array<{ id: string; name: string; address: string }>> => {
        const response = await api.get('/location/search', { params: { q: query } });
        return response.data.data;
    },
};

export default locationService;
