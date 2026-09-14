import axios, { type InternalAxiosRequestConfig } from 'axios';

const PRIMARY_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000/api' : 'https://jayshree-pco.onrender.com/api');
const FALLBACK_URL = import.meta.env.VITE_API_FALLBACK_URL || (import.meta.env.DEV ? 'http://localhost:5000/api' : 'https://jayshree-pco-5g5i.onrender.com/api'); // Backup Render service

// Tracks whether we've permanently switched to the fallback backend
let usingFallback = false;

const switchToFallback = () => {
    if (!usingFallback) {
        usingFallback = true;
        api.defaults.baseURL = FALLBACK_URL;
        console.warn('[AdminAPI] Primary backend unreachable – switched to fallback:', FALLBACK_URL);
    }
};

const api = axios.create({
    baseURL: PRIMARY_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000,
});

api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('adminToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else if (token) {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { 
            _fallbackRetry?: boolean; 
            _retry?: boolean;
        };

        if (!originalRequest) {
            return Promise.reject(error);
        }

        // ── Fallback: retry once on backup Render service when primary is unreachable ──
        if (
            !originalRequest._fallbackRetry &&
            !usingFallback &&
            (!error.response || (error.response.status >= 500 && error.response.status < 600))
        ) {
            originalRequest._fallbackRetry = true;
            switchToFallback();
            originalRequest.baseURL = FALLBACK_URL;
            return api(originalRequest);
        }

        // ── Automatic Token Refresh on 401 ──
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            // Ignore 401 on login and refresh endpoints themselves
            const requestUrl = originalRequest.url || '';
            if (requestUrl.includes('/auth/client/login') || requestUrl.includes('/auth/refresh')) {
                return Promise.reject(error);
            }

            const refreshToken = localStorage.getItem('adminRefreshToken');

            if (!refreshToken) {
                localStorage.removeItem('adminToken');
                localStorage.removeItem('adminRefreshToken');
                localStorage.removeItem('adminUser');
                if (window.location.pathname !== '/login') {
                    window.location.href = '/login';
                }
                return Promise.reject(error);
            }

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((newToken) => {
                        originalRequest.headers.Authorization = `Bearer ${newToken}`;
                        return api(originalRequest);
                    })
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const currentBase = usingFallback ? FALLBACK_URL : PRIMARY_URL;
                const { data } = await axios.post(`${currentBase}/v1/auth/refresh`, {
                    refreshToken,
                    token: refreshToken
                });

                const newAccessToken = data.data?.accessToken || data.accessToken || data.token;
                const newRefreshToken = data.data?.refreshToken || data.refreshToken;

                if (newAccessToken) {
                    localStorage.setItem('adminToken', newAccessToken);
                    if (newRefreshToken) {
                        localStorage.setItem('adminRefreshToken', newRefreshToken);
                    }

                    api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

                    processQueue(null, newAccessToken);
                    return api(originalRequest);
                } else {
                    throw new Error('No access token returned from refresh');
                }
            } catch (refreshErr) {
                processQueue(refreshErr, null);
                localStorage.removeItem('adminToken');
                localStorage.removeItem('adminRefreshToken');
                localStorage.removeItem('adminUser');
                if (window.location.pathname !== '/login') {
                    window.location.href = '/login';
                }
                return Promise.reject(refreshErr);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;
