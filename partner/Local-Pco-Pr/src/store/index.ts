// src/store/index.ts
// Redux store configuration with all slices combined

import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    persistStore,
    persistReducer,
    FLUSH,
    REHYDRATE,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER,
} from 'redux-persist';

// Import slices
import authReducer from './authSlice';
import partnerReducer from './partnerSlice';
import jobReducer from './jobSlice';
import walletReducer from './walletSlice';

/**
 * Root reducer combining all slices
 */
const rootReducer = combineReducers({
    auth: authReducer,
    partner: partnerReducer,
    job: jobReducer,
    wallet: walletReducer,
});

/**
 * Redux Persist configuration
 * Only persist auth state for session management
 */
const persistConfig = {
    key: 'root',
    version: 1,
    storage: AsyncStorage,
    whitelist: ['auth', 'partner'], // Persist auth and partner slices
};

/**
 * Persisted reducer
 */
const persistedReducer = persistReducer(persistConfig, rootReducer);

/**
 * Configure Redux store
 */
export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                // Ignore redux-persist actions for serializable check
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }),
    devTools: process.env.NODE_ENV !== 'production',
});

/**
 * Persistor for redux-persist
 */
export const persistor = persistStore(store);

/**
 * Type definitions for Redux usage
 * Use rootReducer's ReturnType for proper typing with redux-persist
 */
export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;

/**
 * Typed hooks for use throughout the app
 * Use these instead of plain `useDispatch` and `useSelector`
 */
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

/**
 * Selectors for commonly accessed state
 */

// Auth selectors
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectAuthLoading = (state: RootState) => state.auth.isLoading;
export const selectAuthError = (state: RootState) => state.auth.error;

// Partner selectors
export const selectPartnerProfile = (state: RootState) => state.partner.profile;
export const selectAvailability = (state: RootState) => state.partner.availability;
export const selectKycStatus = (state: RootState) => state.partner.kycStatus;
export const selectPartnerLoading = (state: RootState) => state.partner.isLoading;

// Job selectors
export const selectCurrentJob = (state: RootState) => state.job.currentJob;

export const selectPendingRequests = (state: RootState) => state.job.pendingRequests;
export const selectTodaysSummary = (state: RootState) => state.job.todaySummary;
export const selectJobLoading = (state: RootState) => state.job.isLoading;
export const selectJobUpdating = (state: RootState) => state.job.isUpdating;

// Wallet selectors
export const selectWalletSummary = (state: RootState) => state.wallet.summary;
export const selectTransactions = (state: RootState) => state.wallet.transactions;
export const selectSelectedPeriod = (state: RootState) => state.wallet.selectedPeriod;
export const selectWalletLoading = (state: RootState) => state.wallet.isLoading;

export default store;
