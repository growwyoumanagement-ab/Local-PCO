// src/services/walletService.ts
// Wallet and earnings service for financial operations

import api from './api';
import { EARNINGS_PERIOD, TRANSACTION_TYPE } from '../utils/constants';

/**
 * Transaction interface
 */
export interface Transaction {
    id: string;
    type: string; // credit, debit, payout, bonus
    amount: number;
    balance: number; // Balance after transaction
    description: string;
    jobId?: string;
    createdAt: string;
    status: string; // pending, completed, failed
}

/**
 * Wallet summary interface
 */
export interface WalletSummary {
    currentBalance: number;
    pendingPayout: number;
    totalEarnings: number;
    todayEarnings: number;
    weeklyEarnings: number;
    monthlyEarnings: number;
}

/**
 * Payout request interface
 */
export interface PayoutRequest {
    amount: number;
    bankAccountId: string;
    otp: string;
}

/**
 * Payout response
 */
interface PayoutResponse {
    success: boolean;
    data: {
        payoutId: string;
        amount: number;
        status: string;
        estimatedArrival: string;
    };
    message?: string;
}

/**
 * Transaction list response
 */
interface TransactionListResponse {
    success: boolean;
    data: {
        transactions: Transaction[];
        totalCount: number;
        page: number;
        limit: number;
    };
}

/**
 * Transaction filters
 */
interface TransactionFilters {
    type?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
}

/**
 * Wallet Service
 * Handles all wallet and earnings related API calls
 */
const walletService = {
    /**
     * Get wallet summary with all earnings data
     * @returns Wallet summary
     */
    getWalletSummary: async (): Promise<WalletSummary> => {
        try {
            // API Placeholder
            const response = await api.get<{ success: boolean; data: WalletSummary }>('/wallet/partner');
            return response.data.data;
        } catch (error) {
            console.error('Get wallet summary error:', error);
            throw error;
        }
    },

    /**
     * Get earnings for a specific period
     * @param period - today, weekly, or monthly
     * @returns Earnings amount
     */
    getEarningsByPeriod: async (period: string): Promise<number> => {
        try {
            // API Placeholder
            const response = await api.get<{ success: boolean; data: { earnings: number } }>(
                '/wallet/partner/earnings',
                { params: { period } }
            );
            return response.data.data.earnings;
        } catch (error) {
            console.error('Get earnings by period error:', error);
            throw error;
        }
    },

    /**
     * Get transaction history
     * @param filters - Optional filters for transactions
     * @returns List of transactions
     */
    getTransactions: async (filters?: TransactionFilters): Promise<TransactionListResponse['data']> => {
        try {
            // API Placeholder
            const response = await api.get<TransactionListResponse>('/wallet/partner/transactions', {
                params: filters,
            });
            return response.data.data;
        } catch (error) {
            console.error('Get transactions error:', error);
            throw error;
        }
    },

    /**
     * Get transaction by ID
     * @param transactionId - Transaction ID
     * @returns Transaction details
     */
    getTransactionById: async (transactionId: string): Promise<Transaction> => {
        try {
            // API Placeholder
            const response = await api.get<{ success: boolean; data: Transaction }>(
                `/wallet/partner/transactions/${transactionId}`
            );
            return response.data.data;
        } catch (error) {
            console.error('Get transaction by ID error:', error);
            throw error;
        }
    },

    /**
     * Request payout to bank account
     * @param request - Payout request with amount and bank account
     * @returns Payout response
     */
    requestPayout: async (request: PayoutRequest): Promise<PayoutResponse['data']> => {
        try {
            // API Placeholder
            const response = await api.post<PayoutResponse>('/wallet/partner/payout', request);
            return response.data.data;
        } catch (error) {
            console.error('Request payout error:', error);
            throw error;
        }
    },

    /**
     * Get payout history
     * @returns List of past payouts
     */
    getPayoutHistory: async (): Promise<Transaction[]> => {
        try {
            // API Placeholder
            const response = await api.get<TransactionListResponse>('/wallet/partner/payouts');
            return response.data.data.transactions;
        } catch (error) {
            console.error('Get payout history error:', error);
            throw error;
        }
    },

    /**
     * Get earnings breakdown by service category
     * @param period - Time period for breakdown
     * @returns Earnings breakdown
     */
    getEarningsBreakdown: async (
        period: string
    ): Promise<{ category: string; amount: number; jobCount: number }[]> => {
        try {
            // API Placeholder
            const response = await api.get('/wallet/partner/earnings/breakdown', {
                params: { period },
            });
            return response.data.data;
        } catch (error) {
            console.error('Get earnings breakdown error:', error);
            throw error;
        }
    },

    /**
     * Get bank accounts linked to wallet
     * @returns List of bank accounts
     */
    getBankAccounts: async (): Promise<
        { id: string; bankName: string; accountNumber: string; ifsc: string; isPrimary: boolean }[]
    > => {
        try {
            // API Placeholder
            const response = await api.get('/wallet/partner/bank-accounts');
            return response.data.data;
        } catch (error) {
            console.error('Get bank accounts error:', error);
            throw error;
        }
    },

    /**
     * Add new bank account
     * @param bankDetails - Bank account details
     * @returns Added bank account
     */
    addBankAccount: async (bankDetails: {
        bankName: string;
        accountNumber: string;
        ifsc: string;
        accountHolderName: string;
    }): Promise<{ id: string; bankName: string; accountNumber: string }> => {
        try {
            // API Placeholder
            const response = await api.post('/wallet/partner/bank-accounts', bankDetails);
            return response.data.data;
        } catch (error) {
            console.error('Add bank account error:', error);
            throw error;
        }
    },

    /**
     * Set primary bank account for payouts
     * @param bankAccountId - Bank account ID to set as primary
     * @returns Success status
     */
    setPrimaryBankAccount: async (bankAccountId: string): Promise<{ success: boolean }> => {
        try {
            // API Placeholder
            const response = await api.put(`/wallet/partner/bank-accounts/${bankAccountId}/primary`);
            return response.data;
        } catch (error) {
            console.error('Set primary bank account error:', error);
            throw error;
        }
    },
};

export default walletService;
