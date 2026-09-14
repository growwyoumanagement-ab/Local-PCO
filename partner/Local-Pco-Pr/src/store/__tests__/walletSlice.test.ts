jest.mock('expo-secure-store', () => ({
    getItemAsync: jest.fn(),
    setItemAsync: jest.fn(),
    deleteItemAsync: jest.fn(),
}));

import walletReducer, { fetchWalletSummary, requestPayout } from '../walletSlice';

describe('walletSlice Reducer and Thunk Lifecycle Tests', () => {
    const initialState = {
        summary: null,
        transactions: [],
        selectedPeriod: 'today',
        isLoading: false,
        isProcessing: false,
        error: null,
        pagination: {
            page: 1,
            limit: 20,
            totalCount: 0,
        },
    };

    it('should return the initial state', () => {
        expect(walletReducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });

    it('should handle fetchWalletSummary.pending lifecycle state transition', () => {
        const nextState = walletReducer(initialState, fetchWalletSummary.pending(''));
        expect(nextState.isLoading).toBe(true);
        expect(nextState.error).toBeNull();
    });

    it('should handle fetchWalletSummary.fulfilled lifecycle state transition', () => {
        const mockSummary = {
            currentBalance: 1200,
            totalEarnings: 2000,
            todayEarnings: 400,
            pendingPayout: 0,
            weeklyEarnings: 1500,
            monthlyEarnings: 2000,
        };
        const nextState = walletReducer(
            { ...initialState, isLoading: true },
            fetchWalletSummary.fulfilled(mockSummary, '')
        );
        expect(nextState.isLoading).toBe(false);
        expect(nextState.summary).toEqual(mockSummary);
    });

    it('should handle fetchWalletSummary.rejected lifecycle state transition', () => {
        const nextState = walletReducer(
            { ...initialState, isLoading: true },
            fetchWalletSummary.rejected(new Error('Fetch failed'), '', undefined, 'Fetch failed')
        );
        expect(nextState.isLoading).toBe(false);
        expect(nextState.error).toBe('Fetch failed');
    });

    it('should handle requestPayout.pending lifecycle state transition', () => {
        const nextState = walletReducer(initialState, requestPayout.pending('', { amount: 200, bankAccountId: 'bank1', otp: '123456' }));
        expect(nextState.isProcessing).toBe(true);
    });

    it('should handle requestPayout.fulfilled lifecycle state transition', () => {
        const initialSummary = {
            currentBalance: 1000,
            totalEarnings: 2000,
            todayEarnings: 400,
            pendingPayout: 100,
            weeklyEarnings: 1500,
            monthlyEarnings: 2000,
        };
        const mockPayload = { payoutId: 'payout123', amount: 300, status: 'pending', estimatedArrival: 'tomorrow' };
        const nextState = walletReducer(
            { ...initialState, summary: initialSummary, isProcessing: true },
            requestPayout.fulfilled(mockPayload, '', { amount: 300, bankAccountId: 'bank1', otp: '123456' })
        );
        expect(nextState.isProcessing).toBe(false);
        expect(nextState.summary?.pendingPayout).toBe(400);
        expect(nextState.summary?.currentBalance).toBe(700);
    });
});
