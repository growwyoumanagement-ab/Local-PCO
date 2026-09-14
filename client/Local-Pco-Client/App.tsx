// App.tsx
// Root component for the Local PCO Client App (Expo)

import * as Sentry from '@sentry/react-native';

import { LogBox } from 'react-native';

LogBox.ignoreLogs([
    'setLayoutAnimationEnabledExperimental is currently a no-op',
    'App Start Span could not be finished',
]);

// Initialize Sentry before any other code runs.
// Inactive unless EXPO_PUBLIC_SENTRY_DSN is set in .env.
if (process.env.EXPO_PUBLIC_SENTRY_DSN) {
    Sentry.init({
        dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
        environment: __DEV__ ? 'development' : 'production',
        // Capture 100% of traces in dev, 20% in production to manage quota
        tracesSampleRate: __DEV__ ? 1.0 : 0.2,
    });
}

import React, { useState, useEffect } from 'react';
import { StatusBar, ActivityIndicator, View, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor, useAppSelector, useAppDispatch } from './src/store';
import { COLORS } from './src/utils/constants';
import BottomTabNavigator from './src/navigation/BottomTabNavigator';
import { fetchActiveRequest } from './src/store/requestSlice';
import { LoginScreen, RegisterScreen, OTPLoginScreen, ForgotPasswordScreen, OnboardingScreen } from './src/screens';
import { HAS_SEEN_ONBOARDING_KEY } from './src/screens/OnboardingScreen';
import Toast from 'react-native-toast-message';
import { pushNotificationService } from './src/services/pushNotificationService';
import ErrorBoundary from './src/components/ui/ErrorBoundary';

// Root Stack Navigator
const RootStack = createNativeStackNavigator();

const RootNavigator: React.FC = () => {
    const { isAuthenticated, isLoading } = useAppSelector(state => state.auth);
    const dispatch = useAppDispatch();
    const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(null);

    useEffect(() => {
        const checkOnboarding = async () => {
            try {
                const val = await AsyncStorage.getItem(HAS_SEEN_ONBOARDING_KEY);
                setHasSeenOnboarding(val === 'true');
            } catch (e) {
                setHasSeenOnboarding(true);
            }
        };
        checkOnboarding();
    }, []);

    useEffect(() => {
        if (isAuthenticated) {
            dispatch(fetchActiveRequest());
            pushNotificationService.registerDevice();

            const unsubscribe = pushNotificationService.setupForegroundListener((message) => {
                Toast.show({
                    type: 'info',
                    text1: message.notification?.title || 'Alert',
                    text2: message.notification?.body || '',
                    position: 'top',
                });
                dispatch(fetchActiveRequest());
            });

            return () => {
                unsubscribe();
            };
        }
    }, [isAuthenticated, dispatch]);

    if (isLoading || hasSeenOnboarding === null) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    if (!isAuthenticated && !hasSeenOnboarding) {
        return <OnboardingScreen onFinish={() => setHasSeenOnboarding(true)} />;
    }

    return (
        <RootStack.Navigator screenOptions={{ headerShown: false }}>
            {isAuthenticated ? (
                <RootStack.Screen name="Main" component={BottomTabNavigator} />
            ) : (
                <>
                    <RootStack.Screen name="Login" component={LoginScreen} />
                    <RootStack.Screen name="OTPLogin" component={OTPLoginScreen} />
                    <RootStack.Screen name="Register" component={RegisterScreen} />
                    <RootStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
                </>
            )}
        </RootStack.Navigator>
    );
};

// App Component with Providers
// Wrapped with Sentry.wrap() to capture touch events, navigation breadcrumbs,
// and component render crashes automatically.
function App() {
    return (
        <Provider store={store}>
            <PersistGate loading={<ActivityIndicator />} persistor={persistor}>
                <SafeAreaProvider>
                    <ErrorBoundary>
                        <NavigationContainer>
                            <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
                            <RootNavigator />
                        </NavigationContainer>
                    </ErrorBoundary>
                    <Toast />
                </SafeAreaProvider>
            </PersistGate>
        </Provider>
    );
}

export default process.env.EXPO_PUBLIC_SENTRY_DSN ? Sentry.wrap(App) : App;

const styles = StyleSheet.create({
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.white },
});
