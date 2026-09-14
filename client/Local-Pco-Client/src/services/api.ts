// src/services/api.ts
// Axios instance with JWT interceptors for API communication

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { secureStorage } from './secureStorage'; // Encrypted token storage (expo-secure-store)

import CONFIG from '../config';

// Use your computer's local IP address for device testing
const API_BASE_URL = __DEV__ ? CONFIG.API_URLS.DEV : CONFIG.API_URLS.PROD;
const API_FALLBACK_URL = __DEV__ ? CONFIG.API_URLS.DEV : CONFIG.API_URLS.FALLBACK; // Backup Render service
const API_TIMEOUT = CONFIG.TIMEOUT;

// Tracks whether we've permanently switched to the fallback backend
let usingFallback = false;
let currentBaseURL = API_BASE_URL;

/**
 * Storage keys for auth tokens
 */
const STORAGE_KEYS = {
    ACCESS_TOKEN: '@LocalPCO:Client:accessToken',
    REFRESH_TOKEN: '@LocalPCO:Client:refreshToken',
};

let isRefreshing = false;
let failedQueue: { resolve: (value?: unknown) => void, reject: (reason?: any) => void }[] = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

/**
 * Create Axios instance with base configuration
 */
const api: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: API_TIMEOUT,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

/**
 * Dynamically update the baseURL of the axios instance (used when switching to fallback)
 */
const switchToFallback = () => {
    if (!usingFallback) {
        usingFallback = true;
        currentBaseURL = API_FALLBACK_URL;
        api.defaults.baseURL = API_FALLBACK_URL;
        console.warn('[API] Primary backend unreachable – switched to fallback:', API_FALLBACK_URL);
    }
};

/**
 * Request interceptor to attach JWT token to all requests
 */
api.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        try {
            const token = await secureStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
            if (token && config.headers) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (error) {
            console.error('Error getting token from storage:', error);
        }
        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

/**
 * Response interceptor for handling errors and token refresh
 */
api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean; _fallbackRetry?: boolean };

        // ── Fallback: retry once on the backup Render service when the primary is down ──
        // Triggers on network errors OR server errors (5xx) from the primary URL only.
        if (
            !originalRequest._fallbackRetry &&
            !usingFallback &&
            (!error.response || (error.response.status >= 500 && error.response.status < 600))
        ) {
            originalRequest._fallbackRetry = true;
            switchToFallback();
            originalRequest.baseURL = API_FALLBACK_URL;
            return api(originalRequest);
        }

        // Handle 401 Unauthorized - Token expired (skip for auth requests)
        const isAuthRequest = originalRequest.url?.includes('/auth/');
        if (error.response?.status === 401 && !originalRequest._retry && !isAuthRequest) {
            if (isRefreshing) {
                return new Promise(function(resolve, reject) {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    if (originalRequest.headers) {
                        originalRequest.headers.Authorization = 'Bearer ' + token;
                    }
                    originalRequest._retry = true; // prevent infinite refresh loop on replay
                    return api(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const refreshToken = await secureStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);

                if (!refreshToken) {
                    throw new Error("No refresh token available");
                }

                // Call the unified refresh endpoint (use currentBaseURL to respect fallback switch)
                const response = await axios.post(`${currentBaseURL}/auth/refresh`, {
                    refreshToken,
                });

                const { accessToken, refreshToken: newRefreshToken } = response.data.data || response.data;

                // Save new tokens
                await secureStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
                if (newRefreshToken) {
                    await secureStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);
                }

                if (originalRequest.headers) {
                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                }
                
                processQueue(null, accessToken);
                return api(originalRequest);
                
            } catch (refreshError) {
                processQueue(refreshError, null);
                // Refresh failed - clear tokens
                await secureStorage.multiRemove([
                    STORAGE_KEYS.ACCESS_TOKEN,
                    STORAGE_KEYS.REFRESH_TOKEN,
                ]);
                console.error('Token refresh failed:', refreshError);
                
                // CRITICAL REVISION: Reset Redux state
                const { store } = require('../store');
                const { logout } = require('../store/authSlice');
                store.dispatch(logout());
                
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        // Handle other errors
        const customMessage = (error.response?.data as any)?.message || error.message || 'An unexpected error occurred';
        error.message = customMessage;
        return Promise.reject(error);
    }
);

/**
 * Helper to save auth tokens
 */
export const saveAuthTokens = async (accessToken: string, refreshToken: string): Promise<void> => {
    await secureStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    await secureStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
};

/**
 * Helper to clear auth tokens (logout)
 */
export const clearAuthTokens = async (): Promise<void> => {
    await secureStorage.multiRemove([
        STORAGE_KEYS.ACCESS_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
    ]);
};

/**
 * Helper to get current access token
 */
export const getAccessToken = async (): Promise<string | null> => {
    return secureStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
};

export default api;
