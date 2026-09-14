// src/store/walletSlice.ts
// Redux slice for wallet and earnings state management

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import walletService, { Transaction, WalletSummary } from '../services/walletService';
import { EARNINGS_PERIOD } from '../utils/constants';

/**
 * Wallet state interface
 */
interface WalletState {
    // Wallet summary with all earnings
    summary: WalletSummary | null;

    // Transaction history
    transactions: Transaction[];

    // Selected earnings period
    selectedPeriod: string;

    // Loading and error states
    isLoading: boolean;
    isProcessing: boolean;
    error: string | null;

    // Pagination for transactions
    pagination: {
        page: number;
        limit: number;
        totalCount: number;
    };
}

/**
 * Initial wallet state
 */
const initialState: WalletState = {
    summary: null,
    transactions: [],
    selectedPeriod: EARNINGS_PERIOD.TODAY,
    isLoading: false,
    isProcessing: false,
    error: null,
    pagination: {
        page: 1,
        limit: 20,
        totalCount: 0,
    },
};

/**
 * Async thunk to fetch wallet summary
 */
export const fetchWalletSummary = createAsyncThunk(
    'wallet/fetchSummary',
    async (_, { rejectWithValue }) => {
        try {
            const summary = await walletService.getWalletSummary();
            return summary;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch wallet');
        }
    }
);

/**
 * Async thunk to fetch transactions
 */
export const fetchTransactions = createAsyncThunk(
    'wallet/fetchTransactions',
    async (
        filters: { type?: string; startDate?: string; endDate?: string; page?: number } | undefined,
        { rejectWithValue }
    ) => {
        try {
            const response = await walletService.getTransactions(filters);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch transactions');
        }
    }
);

/**
 * Async thunk to request payout
 */
export const requestPayout = createAsyncThunk(
    'wallet/requestPayout',
    async (request: { amount: number; bankAccountId: string; otp: string }, { rejectWithValue }) => {
        try {
            const response = await walletService.requestPayout(request);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to request payout');
        }
    }
);

/**
 * Async thunk to get earnings by period
 */
export const fetchEarningsByPeriod = createAsyncThunk(
    'wallet/fetchEarningsByPeriod',
    async (period: string, { rejectWithValue }) => {
        try {
            const earnings = await walletService.getEarningsByPeriod(period);
            return { period, earnings };
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch earnings');
        }
    }
);

/**
 * Wallet slice with reducers and extra reducers
 */
const walletSlice = createSlice({
    name: 'wallet',
    initialState,
    reducers: {
        // Set selected earnings period
        setSelectedPeriod: (state, action: PayloadAction<string>) => {
            state.selectedPeriod = action.payload;
        },
        // Clear wallet error
        clearWalletError: (state) => {
            state.error = null;
        },
        // Reset wallet state
        resetWallet: () => initialState,
        // Add new transaction (real-time update)
        addTransaction: (state, action: PayloadAction<Transaction>) => {
            state.transactions.unshift(action.payload);
            // Update balance in summary
            if (state.summary) {
                state.summary.currentBalance = action.payload.balance;
            }
        },
    },
    extraReducers: (builder) => {
        // Fetch Wallet Summary
        builder
            .addCase(fetchWalletSummary.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchWalletSummary.fulfilled, (state, action) => {
                state.isLoading = false;
                state.summary = action.payload;
            })
            .addCase(fetchWalletSummary.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Fetch Transactions
        builder
            .addCase(fetchTransactions.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchTransactions.fulfilled, (state, action) => {
                state.isLoading = false;
                state.transactions = action.payload.transactions;
                state.pagination = {
                    page: action.payload.page,
                    limit: action.payload.limit,
                    totalCount: action.payload.totalCount,
                };
            })
            .addCase(fetchTransactions.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Request Payout
        builder
            .addCase(requestPayout.pending, (state) => {
                state.isProcessing = true;
            })
            .addCase(requestPayout.fulfilled, (state, action) => {
                state.isProcessing = false;
                // Update pending payout in summary
                if (state.summary) {
                    state.summary.pendingPayout += action.payload.amount;
                    state.summary.currentBalance -= action.payload.amount;
                }
            })
            .addCase(requestPayout.rejected, (state, action) => {
                state.isProcessing = false;
                state.error = action.payload as string;
            });

        // Fetch Earnings By Period
        builder
            .addCase(fetchEarningsByPeriod.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchEarningsByPeriod.fulfilled, (state, action) => {
                state.isLoading = false;
                // Update the corresponding earnings in summary
                if (state.summary) {
                    switch (action.payload.period) {
                        case EARNINGS_PERIOD.TODAY:
                            state.summary.todayEarnings = action.payload.earnings;
                            break;
                        case EARNINGS_PERIOD.WEEKLY:
                            state.summary.weeklyEarnings = action.payload.earnings;
                            break;
                        case EARNINGS_PERIOD.MONTHLY:
                            state.summary.monthlyEarnings = action.payload.earnings;
                            break;
                    }
                }
            })
            .addCase(fetchEarningsByPeriod.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });
    },
});

export const {
    setSelectedPeriod,
    clearWalletError,
    resetWallet,
    addTransaction,
} = walletSlice.actions;
export default walletSlice.reducer;
