import api from './api';

export interface VerifierStats {
    pendingCount: number;
    approvedCount: number;
    rejectedCount: number;
    onHoldCount: number;
    needInfoCount: number;
    slaBreachedCount: number;
    todayActionsCount: number;
    recentActions: AuditLogEntry[];
    statusDistribution: { name: string; value: number }[];
}

export interface QueuePartner {
    _id: string;
    name: string;
    phone: string;
    email: string;
    serviceCategory: { _id: string; name: string } | null;
    address: { city?: string; state?: string; pincode?: string };
    kycStatus: string;
    kycRejectionReason: string | null;
    kycSubmittedAt: string;
    kycLocation?: {
        latitude: number;
        longitude: number;
        address?: string | null;
        capturedAt?: string;
    } | null;
    kycDocuments: any[];
    slaHoursElapsed: number;
    slaBreached: boolean;
    slaWarning: boolean;
    createdAt: string;
}

export interface AuditLogEntry {
    _id: string;
    partnerId: { 
        _id: string; 
        name: string; 
        phone?: string; 
        email?: string;
        kycLocation?: {
            latitude: number;
            longitude: number;
            address?: string;
            capturedAt?: string;
        };
    } | null;
    verifierId: { _id: string; name: string; email?: string } | null;
    action: string;
    reason: string | null;
    previousStatus: string;
    newStatus: string;
    timestamp: string;
    siteVisitImage?: string;
    siteVisitLocation?: {
        latitude: number;
        longitude: number;
        address?: string | null;
        capturedAt?: string;
    };
}

export const verifierService = {
    getStats: async (): Promise<VerifierStats> => {
        const response = await api.get('/v1/verifier/stats');
        return response.data.data;
    },

    getCategories: async (): Promise<any[]> => {
        const response = await api.get('/v1/categories');
        return response.data.data;
    },

    getQueue: async (filters?: {
        status?: string;
        city?: string;
        category?: string;
        startDate?: string;
        endDate?: string;
    }): Promise<QueuePartner[]> => {
        const params = new URLSearchParams();
        if (filters?.status) params.append('status', filters.status);
        if (filters?.city) params.append('city', filters.city);
        if (filters?.category) params.append('category', filters.category);
        if (filters?.startDate) params.append('startDate', filters.startDate);
        if (filters?.endDate) params.append('endDate', filters.endDate);

        const response = await api.get(`/v1/verifier/queue?${params.toString()}`);
        return response.data.data;
    },

    performAction: async (partnerId: string, action: string, reason?: string) => {
        const response = await api.put(`/v1/verifier/partners/${partnerId}/action`, {
            action,
            reason
        });
        return response.data;
    },

    getAuditLog: async (partnerId: string): Promise<AuditLogEntry[]> => {
        const response = await api.get(`/v1/verifier/partners/${partnerId}/audit-log`);
        return response.data.data;
    },

    getHistory: async (page = 1, limit = 50): Promise<{ data: AuditLogEntry[]; total: number }> => {
        const response = await api.get(`/v1/verifier/history?page=${page}&limit=${limit}`);
        return { data: response.data.data, total: response.data.total };
    },

    uploadSiteVisit: async (partnerId: string, data: { image: string; latitude: number; longitude: number; address?: string }) => {
        const response = await api.post(`/v1/verifier/partners/${partnerId}/site-visit`, data);
        return response.data;
    },

    checkSiteVisit: async (partnerId: string): Promise<boolean> => {
        const logs = await verifierService.getAuditLog(partnerId);
        return logs.some((log) => log.action === 'site_visit');
    }
};

