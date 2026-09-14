// src/services/contentService.ts
// Service methods for fetching dashboard content

import api from './api';

export interface ContentItem {
    name: string;
    icon?: string;
    image?: string;
    subtitle?: string;
    ctaText?: string;
    backgroundColor?: string;
    priority: number;
    isActive: boolean;
}

export interface ContentSection {
    _id: string;
    sectionType: 'home_services' | 'banner' | 'trending';
    title: string;
    items: ContentItem[];
    priority: number;
    isActive: boolean;
}

/**
 * Fetch all active content sections
 */
export const getContentSections = async (): Promise<ContentSection[]> => {
    try {
        const response = await api.get('/content');
        return response.data.data;
    } catch (error) {
        console.error('Error fetching content sections:', error);
        throw error;
    }
};
