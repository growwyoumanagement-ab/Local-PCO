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
import requestReducer from './requestSlice';
import locationReducer from './locationSlice';
import profileReducer from './profileSlice';

/**
 * Root reducer combining all slices
 */
const rootReducer = combineReducers({
    auth: authReducer,
    request: requestReducer,
    location: locationReducer,
    profile: profileReducer,
});

/**
 * Redux Persist configuration
 * Persist auth state for session management
 */
const persistConfig = {
    key: 'client-root',
    version: 1,
    storage: AsyncStorage,
    whitelist: ['auth', 'profile'], // Persist auth and profile state
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
 */
export type RootState = ReturnType<typeof store.getState>;
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

// Request selectors
export const selectActiveRequest = (state: RootState) => state.request.activeRequest;
export const selectRequestHistory = (state: RootState) => state.request.requestHistory;
export const selectServices = (state: RootState) => state.request.services;
export const selectDraftRequest = (state: RootState) => state.request.draftRequest;
export const selectRequestLoading = (state: RootState) => state.request.isLoading;
export const selectIsCreating = (state: RootState) => state.request.isCreating;

// Location selectors
export const selectCurrentLocation = (state: RootState) => state.location.currentLocation;
export const selectSavedAddresses = (state: RootState) => state.location.savedAddresses;
export const selectLocationLoading = (state: RootState) => state.location.isLoading;
export const selectLocationPermission = (state: RootState) => state.location.locationPermission;

// Profile selectors
export const selectProfile = (state: RootState) => state.profile.profile;
export const selectProfileLoading = (state: RootState) => state.profile.isLoading;
export const selectProfileUpdating = (state: RootState) => state.profile.isUpdating;

export default store;
