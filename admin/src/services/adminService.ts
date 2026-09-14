import api from './api';

export interface DashboardStats {
    totalPartners: number;
    totalClients: number;
    totalBookings: number;
    activeBookings: number;
    totalRevenue: number;
    recentBookings: {
        _id: string;
        partnerId: { name: string } | null;
        clientId: { name: string } | null;
        serviceName: string;
        status: string;
        createdAt: string;
    }[];
    bookingStatusDistribution: {
        name: string;
        value: number;
    }[];
}

export interface PaginatedResponse<T> {
    success: boolean;
    count: number;
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
    data: T[];
}

export interface QueryParams {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    status?: string;
    kycStatus?: string;
    startDate?: string;
    endDate?: string;
}

export const adminService = {
    getStats: async (): Promise<DashboardStats> => {
        const response = await api.get('/v1/admin/stats');
        return response.data.data;
    },
    getAllPartners: async (params: QueryParams = {}): Promise<PaginatedResponse<any>> => {
        const response = await api.get(`/v1/admin/partners`, { params });
        return response.data;
    },
    getPartnerById: async (id: string) => {
        const response = await api.get(`/v1/admin/partners/${id}`);
        return response.data.data;
    },
    createPartner: async (data: any) => {
        const response = await api.post('/v1/admin/partners', data);
        return response.data.data;
    },
    resetPartnerPassword: async (id: string, password: string) => {
        const response = await api.put(`/v1/admin/partners/${id}/reset-password`, { password });
        return response.data;
    },
    verifyPartnerKyc: async (id: string, status: 'approved' | 'rejected', reason?: string) => {
        const response = await api.put(`/v1/admin/partners/${id}/kyc`, { status, reason });
        return response.data.data;
    },
    togglePartnerStatus: async (id: string, isActive: boolean) => {
        const response = await api.put(`/v1/admin/partners/${id}/status`, { isActive });
        return response.data.data;
    },
    getAllClients: async (params: QueryParams = {}): Promise<PaginatedResponse<any>> => {
        const response = await api.get(`/v1/admin/clients`, { params });
        return response.data;
    },
    toggleClientBlock: async (id: string, isBlocked: boolean) => {
        const response = await api.put(`/v1/admin/clients/${id}/block`, { isBlocked });
        return response.data.data;
    },
    getAllBookings: async (params: QueryParams = {}): Promise<PaginatedResponse<any>> => {
        const response = await api.get(`/v1/admin/bookings`, { params });
        return response.data;
    },
    getAllWallets: async (page = 1, limit = 10): Promise<PaginatedResponse<any>> => {
        const response = await api.get(`/v1/admin/wallets`, { params: { page, limit } });
        return response.data;
    },
    getAllServices: async () => {
        const response = await api.get('/v1/admin/services');
        return response.data.data;
    },
    createService: async (data: any) => {
        const response = await api.post('/v1/admin/services', data);
        return response.data.data;
    },
    updateService: async (id: string, data: any) => {
        const response = await api.put(`/v1/admin/services/${id}`, data);
        return response.data.data;
    },
    deleteService: async (id: string) => {
        const response = await api.delete(`/v1/admin/services/${id}`);
        return response.data.data;
    },
    updateKycDocumentStatus: async (id: string, status: string, rejectionReason?: string) => {
        const response = await api.put(`/v1/admin/kyc-documents/${id}/status`, { status, rejectionReason });
        return response.data.data;
    },
    verifyPartnerBankDetails: async (id: string, accountId?: string) => {
        const response = await api.put(`/v1/admin/partners/${id}/bank-verify`, { accountId });
        return response.data.data;
    },
    addPartnerBankAccount: async (id: string, data: { accountHolderName: string; accountNumber: string; bankName: string; ifsc: string; isPrimary?: boolean }) => {
        const response = await api.post(`/v1/admin/partners/${id}/bank-accounts`, data);
        return response.data.data;
    },
    getClientBookings: async (clientId: string, page = 1, limit = 10): Promise<PaginatedResponse<any>> => {
        const response = await api.get(`/v1/admin/clients/${clientId}/bookings`, { params: { page, limit } });
        return response.data;
    },
    // Content Management
    getAllContent: async () => {
        const response = await api.get('/v1/admin/content');
        return response.data.data;
    },
    createContent: async (data: any) => {
        const response = await api.post('/v1/admin/content', data);
        return response.data.data;
    },
    updateContent: async (id: string, data: any) => {
        const response = await api.put(`/v1/admin/content/${id}`, data);
        return response.data;
    },
    deleteContent: async (id: string) => {
        const response = await api.delete(`/v1/admin/content/${id}`);
        return response.data;
    },

    // Image Upload
    uploadImage: async (image: string, folder: string): Promise<string> => {
        const response = await api.post('/v1/admin/upload-image', { image, folder });
        return response.data.data.url;
    },

    // Verifier Management
    getVerifiers: async (params: QueryParams = {}): Promise<PaginatedResponse<any>> => {
        const response = await api.get(`/v1/admin/verifiers`, { params });
        return response.data;
    },
    createVerifier: async (data: any) => {
        const response = await api.post('/v1/admin/verifiers', data);
        return response.data.data;
    },
    toggleVerifierStatus: async (id: string, isBlocked: boolean) => {
        const response = await api.put(`/v1/admin/verifiers/${id}/status`, { isBlocked });
        return response.data;
    },
    activatePartner: async (partnerId: string, isActive: boolean) => {
        const response = await api.put(`/v1/admin/partners/${partnerId}/status`, { isActive });
        return response.data;
    }
};
