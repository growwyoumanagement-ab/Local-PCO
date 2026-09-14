// src/services/categoryService.ts
// Service for fetching service categories

import api from './api';

/**
 * Service category interface
 */
export interface ServiceCategory {
    _id: string;
    name: string;
    icon?: string;
    description?: string;
    subcategories: Subcategory[];
    priority: number;
    isActive: boolean;
}

/**
 * Subcategory interface
 */
export interface Subcategory {
    _id?: string;
    name: string;
    icon?: string;
    isActive: boolean;
}

/**
 * Category service response
 */
interface CategoryResponse {
    success: boolean;
    count: number;
    data: ServiceCategory[];
}

/**
 * Category Service
 * Handles fetching service categories
 */
const categoryService = {
    /**
     * Get all active service categories with subcategories
     * @returns List of active categories
     */
    getCategories: async (): Promise<ServiceCategory[]> => {
        try {
            const response = await api.get<CategoryResponse>('/categories');
            return response.data.data;
        } catch (error) {
            console.error('Get categories error:', error);
            throw error;
        }
    },
};

export default categoryService;
