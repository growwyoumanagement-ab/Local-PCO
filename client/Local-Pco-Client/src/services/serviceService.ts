// src/services/serviceService.ts
// Service methods for fetching service categories

import api from './api';

export interface ServiceCategory {
    _id: string;
    name: string;
    icon?: string;
    description?: string;
    subcategories?: {
        name: string;
        icon?: string;
        isActive: boolean;
    }[];
    priority: number;
}

/**
 * Fetch all active service categories
 */
export const getServiceCategories = async (): Promise<ServiceCategory[]> => {
    try {
        const response = await api.get('/services');
        return response.data.data;
    } catch (error) {
        console.error('Error fetching service categories:', error);
        throw error;
    }
};
