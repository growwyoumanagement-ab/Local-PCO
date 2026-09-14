import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

let messaging: any = null;
try {
    messaging = require('@react-native-firebase/messaging').default;
} catch (e) {
    console.log('[FCM] Native Firebase Messaging is not available. Mock/Fallback mode will be used.');
}

const FCM_TOKEN_KEY = '@LocalPCO:fcmToken';

class FcmService {
    /**
     * Retrieve the cached FCM token or generate a mock one for local testing
     */
    public async getFcmToken(): Promise<string | null> {
        if (messaging) {
            try {
                const authStatus = await messaging().requestPermission();
                const enabled =
                    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
                    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

                if (enabled) {
                    const token = await messaging().getToken();
                    if (token) {
                        await AsyncStorage.setItem(FCM_TOKEN_KEY, token);
                        return token;
                    }
                }
            } catch (error: any) {
                console.log('[FCM] Native Firebase Messaging not available: ', error.message);
            }
        }

        if (__DEV__) {
            let token = await AsyncStorage.getItem(FCM_TOKEN_KEY);
            if (!token) {
                // Generate a stable mock FCM token for local device testing
                const randomBytes = Math.random().toString(36).substring(2, 15);
                token = `mock_fcm_token_${randomBytes}`;
                await AsyncStorage.setItem(FCM_TOKEN_KEY, token);
            }
            return token;
        }
        return null;
    }

    /**
     * Register/update the FCM token on the backend
     */
    public async registerFcmToken(): Promise<void> {
        try {
            const fcmToken = await this.getFcmToken();
            if (!fcmToken) {
                console.log('[FCM] No valid FCM token available, skipping registration.');
                return;
            }
            console.log('[FCM] Registering token on backend:', fcmToken);
            const response = await api.put('/notifications/partner/register-token', { fcmToken });
            if (response.data.success) {
                console.log('[FCM] Token registered successfully on backend.');
            }
        } catch (error: any) {
            console.error('[FCM] Failed to register token:', error.response?.data?.message || error.message);
        }
    }

    /**
     * Clear local FCM token cache (e.g. on logout)
     */
    public async clearFcmToken(): Promise<void> {
        try {
            const storedToken = await AsyncStorage.getItem(FCM_TOKEN_KEY);
            if (storedToken) {
                try {
                    await api.put('/notifications/partner/register-token', { fcmToken: null });
                    console.log('[FCM] Unregistered token from backend.');
                } catch (apiError: any) {
                    console.error('[FCM] Failed to unregister token from backend:', apiError.message);
                }
            }
            await AsyncStorage.removeItem(FCM_TOKEN_KEY);
            console.log('[FCM] Cleared cached local token.');
        } catch (error: any) {
            console.error('[FCM] Failed to clear token:', error.message);
        }
    }

    /**
     * Set up notification listeners for push notifications (Fix #20)
     * Handles taps when app is in foreground, background, or quit state.
     */
    public setupNotificationListeners(onNotificationTap?: (data: any) => void): () => void {
        if (!messaging) return () => {};

        try {
            // 1. App opened from background state by tapping notification
            const unsubscribeOnOpen = messaging().onNotificationOpenedApp((remoteMessage: any) => {
                console.log('[FCM] Notification opened app from background:', remoteMessage?.data);
                if (remoteMessage?.data && onNotificationTap) {
                    onNotificationTap(remoteMessage.data);
                }
            });

            // 2. App opened from quit state by tapping notification
            messaging()
                .getInitialNotification()
                .then((remoteMessage: any) => {
                    if (remoteMessage?.data) {
                        console.log('[FCM] Notification opened app from quit state:', remoteMessage.data);
                        if (onNotificationTap) {
                            onNotificationTap(remoteMessage.data);
                        }
                    }
                })
                .catch((err: any) => console.log('[FCM] Error checking initial notification:', err.message));

            // 3. Foreground message handler
            const unsubscribeOnMessage = messaging().onMessage(async (remoteMessage: any) => {
                console.log('[FCM] Foreground notification received:', remoteMessage?.notification?.title);
            });

            return () => {
                unsubscribeOnOpen();
                unsubscribeOnMessage();
            };
        } catch (error: any) {
            console.log('[FCM] Failed to setup listeners:', error.message);
            return () => {};
        }
    }
}

export const fcmService = new FcmService();
