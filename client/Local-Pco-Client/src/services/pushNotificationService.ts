import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

let messaging: any = null;
try {
    messaging = require('@react-native-firebase/messaging').default;
} catch (e) {
    console.log('[PushNotification] Native Firebase Messaging is not available (e.g. running in Expo Go). Mock mode will be used.');
}

const FCM_TOKEN_KEY = '@ClientPCO:fcmToken';

class PushNotificationService {
    /**
     * Request permissions and get active FCM token.
     * Returns null if native Firebase is unavailable — mock tokens are never returned
     * in production to prevent junk registrations reaching the backend.
     */
    public async getFcmToken(): Promise<string | null> {
        if (messaging) {
            try {
                // Attempt to use native Firebase messaging
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
                console.log('[PushNotification] Native Firebase Messaging not available: ', error.message);
            }
        }

        // Fallback mock token — only permitted in local/simulator builds (non-production)
        if (__DEV__) {
            let token = await AsyncStorage.getItem(FCM_TOKEN_KEY);
            if (!token) {
                const randomBytes = Math.random().toString(36).substring(2, 15);
                token = `mock_client_fcm_token_${randomBytes}`;
                await AsyncStorage.setItem(FCM_TOKEN_KEY, token);
            }
            return token;
        }

        // In production: no valid native token available — skip registration
        return null;
    }

    /**
     * Send FCM token to backend database profile.
     * Skips registration if token is null (no valid native token in production).
     */
    public async registerDevice(): Promise<void> {
        try {
            const fcmToken = await this.getFcmToken();
            if (!fcmToken) {
                console.log('[PushNotification] No valid FCM token available, skipping registration.');
                return;
            }
            const response = await api.put('/notifications/client/register-token', { fcmToken });
            if (response.data.success) {
                console.log('[PushNotification] Token registered successfully.');
            }
        } catch (error: any) {
            console.error('[PushNotification] Failed to register token:', error.response?.data?.message || error.message);
        }
    }

    /**
     * Unregister device from backend then clear cached token on logout.
     * Calling the backend first ensures the server stops sending push
     * notifications to this device immediately after logout.
     */
    public async clearToken(): Promise<void> {
        try {
            // Attempt to unregister from backend before clearing locally
            const storedToken = await AsyncStorage.getItem(FCM_TOKEN_KEY);
            if (storedToken) {
                try {
                    await api.put('/notifications/client/register-token', { fcmToken: null });
                    console.log('[PushNotification] Unregistered token from backend.');
                } catch (apiError: any) {
                    console.error('[PushNotification] Failed to unregister token from backend:', apiError.message);
                }
            }
            await AsyncStorage.removeItem(FCM_TOKEN_KEY);
            console.log('[PushNotification] Cleared local token.');
        } catch (error: any) {
            console.error('[PushNotification] Failed to clear token:', error.message);
        }
    }

    /**
     * Set up foreground notification listeners
     */
    public setupForegroundListener(onMessageReceived: (message: any) => void): () => void {
        if (messaging) {
            try {
                const unsubscribe = messaging().onMessage(async (remoteMessage: any) => {
                    console.log('[PushNotification] Received foreground message:', remoteMessage);
                    onMessageReceived(remoteMessage);
                });
                return unsubscribe;
            } catch (error) {
                console.log('[PushNotification] Foreground listener could not be registered (mock env)');
                return () => {};
            }
        }
        return () => {};
    }
}

export const pushNotificationService = new PushNotificationService();
export default pushNotificationService;
