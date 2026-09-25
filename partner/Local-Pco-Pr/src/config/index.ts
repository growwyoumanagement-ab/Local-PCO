import Constants from 'expo-constants';

// Auto-detect host IP when running via Expo, or fallback to local IP
const getLocalHost = (): string => {
    const hostUri = Constants.expoConfig?.hostUri || (Constants as any).manifest2?.extra?.expoGo?.developer?.extra?.hostUri;
    if (hostUri) {
        return hostUri.split(':')[0];
    }
    return '10.177.97.81'; // Current local IP
};

const LOCAL_IP = getLocalHost();

export const CONFIG = {
    API_URLS: {
        PROD: process.env.EXPO_PUBLIC_API_URL || 'https://local-pco-backend.onrender.com/api/v1',
        FALLBACK: process.env.EXPO_PUBLIC_API_FALLBACK_URL || 'https://local-pco-backend.onrender.com/api/v1',
        DEV: `http://${LOCAL_IP}:5000/api/v1`,
    },
    TIMEOUT: 30000,
};

export default CONFIG;

