import api from "./api";

export interface BankAccount {
    _id: string;
    accountHolderName: string;
    accountNumber: string;
    bankName: string;
    ifsc: string;
    isPrimary: boolean;
    isActive: boolean;
}

export interface Transaction {
    _id: string;
    type: string;
    amount: number;
    status: string;
    createdAt: string;
}

export interface WalletData {
    _id: string; // Partner ID
    partnerName: string;
    balance: number;
    pendingPayout: number;
    bankAccounts: BankAccount[];
    pendingPayoutsList: Transaction[];
}

export interface PaginatedResponse<T> {
    data: T[];
    count: number;
    total: number;
    pagination: {
        page: number;
        limit: number;
    };
}

export const walletService = {
    getAllWallets: async (page = 1, limit = 10): Promise<PaginatedResponse<WalletData>> => {
        const response = await api.get(`/v1/admin/wallets?page=${page}&limit=${limit}`);
        return response.data;
    },
    approvePayout: async (transactionId: string) => {
        const response = await api.put(`/v1/admin/payouts/${transactionId}/approve`);
        return response.data;
    },
    rejectPayout: async (transactionId: string, reason?: string) => {
        const response = await api.put(`/v1/admin/payouts/${transactionId}/reject`, { reason });
        return response.data;
    }
};
