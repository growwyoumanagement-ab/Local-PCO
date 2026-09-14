// App.tsx
// Root component for the Local PCO Partner App (Expo)

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
import { StatusBar, ActivityIndicator, View, StyleSheet, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Image } from 'react-native';
import Toast from 'react-native-toast-message';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor, useAppSelector, useAppDispatch } from './src/store';
import { COLORS } from './src/utils/constants';
import BottomTabNavigator from './src/navigation/BottomTabNavigator';
import { loginPartner, setAuthenticated, updateUser } from './src/store/authSlice';
import RegisterScreen from './src/screens/RegisterScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import authService from './src/services/authService';
import { fcmService } from './src/services/fcmService';

// Type for Auth Stack
type AuthStackParamList = {
    Login: undefined;
    Register: undefined;
    ForgotPassword: undefined;
};

import { MaterialCommunityIcons } from '@expo/vector-icons';

// Login Screen
const LoginScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
    const dispatch = useAppDispatch();
    const { isLoading, error } = useAppSelector(state => state.auth);
    const [loginMode, setLoginMode] = useState<'otp' | 'password'>('password');
    const [showPassword, setShowPassword] = useState(false);
    const [screen, setScreen] = useState<'phone' | 'otp'>('phone');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [localLoading, setLocalLoading] = useState(false);
    const [receivedOtp, setReceivedOtp] = useState<string | null>(null);

    const handleSendOTP = async () => {
        const cleanPhone = phone.replace(/\D/g, '').slice(-10);
        if (!cleanPhone || cleanPhone.length !== 10) {
            Toast.show({
                type: 'error',
                text1: 'Invalid Number',
                text2: 'Please enter a valid 10-digit phone number'
            });
            return;
        }
        
        setLocalLoading(true);
        try {
            const response = await authService.requestOTP(cleanPhone);
            if (response.success) {
                setScreen('otp');
                Toast.show({
                    type: 'success',
                    text1: 'OTP Sent',
                    text2: response.message || 'Verification code sent to your mobile number'
                });
                if (response.otp) {
                    setReceivedOtp(response.otp);
                }
            }
        } catch (err: any) {
            Toast.show({
                type: 'error',
                text1: 'Failed to Send OTP',
                text2: err.response?.data?.message || err.message || 'Something went wrong'
            });
        } finally {
            setLocalLoading(false);
        }
    };

    const handleVerifyOTP = async () => {
        if (!otp || otp.length !== 6) {
            Toast.show({
                type: 'error',
                text1: 'Invalid OTP',
                text2: 'Please enter a valid 6-digit OTP'
            });
            return;
        }

        setLocalLoading(true);
        try {
            const response = await authService.verifyOTP(phone, otp);
            if (response.success) {
                dispatch(setAuthenticated(true));
                dispatch(updateUser(response.data.partner as any));
            }
        } catch (err: any) {
            Toast.show({
                type: 'error',
                text1: 'Verification Failed',
                text2: err.response?.data?.message || err.message || 'Incorrect OTP provided'
            });
        } finally {
            setLocalLoading(false);
        }
    };

    const handlePasswordLogin = async () => {
        if (!phone || phone.length !== 10) {
            Toast.show({
                type: 'error',
                text1: 'Invalid Number',
                text2: 'Please enter a valid 10-digit phone number'
            });
            return;
        }

        if (!password) {
            Toast.show({
                type: 'error',
                text1: 'Missing Password',
                text2: 'Please enter your password'
            });
            return;
        }

        setLocalLoading(true);
        try {
            const response = await authService.login({ phone, password });
            if (response.success) {
                dispatch(setAuthenticated(true));
                dispatch(updateUser(response.data.partner as any));
            }
        } catch (err: any) {
            Toast.show({
                type: 'error',
                text1: 'Login Failed',
                text2: err.response?.data?.message || err.message || 'Invalid credentials'
            });
        } finally {
            setLocalLoading(false);
        }
    };

    return (
        <SafeAreaView style={loginStyles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <View style={loginStyles.content}>
                    <View style={loginStyles.logoContainer}>
                        <Image source={require('./assets/icon.png')} style={{ width: 72, height: 72, borderRadius: 16 }} resizeMode="contain" />
                    </View>
                    <Text style={loginStyles.title}>Local PCO</Text>
                    <Text style={loginStyles.subtitle}>Partner Workspace • Your workday, connected.</Text>

                    <View style={loginStyles.form}>
                        {loginMode === 'password' ? (
                            <>
                                <TextInput
                                    style={loginStyles.input}
                                    placeholder="Phone Number"
                                    keyboardType="phone-pad"
                                    maxLength={10}
                                    value={phone}
                                    onChangeText={setPhone}
                                    placeholderTextColor={COLORS.gray400}
                                />

                                <View style={loginStyles.passwordContainer}>
                                    <TextInput
                                        style={loginStyles.passwordInput}
                                        placeholder="Password"
                                        secureTextEntry={!showPassword}
                                        value={password}
                                        onChangeText={setPassword}
                                        placeholderTextColor={COLORS.gray400}
                                    />
                                    <TouchableOpacity
                                        style={loginStyles.eyeButton}
                                        onPress={() => setShowPassword(!showPassword)}
                                    >
                                        <MaterialCommunityIcons
                                            name={showPassword ? 'eye-off' : 'eye'}
                                            size={22}
                                            color={COLORS.gray500}
                                        />
                                    </TouchableOpacity>
                                </View>

                                {error && <Text style={loginStyles.error}>{error}</Text>}

                                <TouchableOpacity 
                                    style={[loginStyles.button, (isLoading || localLoading) && loginStyles.buttonDisabled]} 
                                    onPress={handlePasswordLogin} 
                                    disabled={isLoading || localLoading}
                                >
                                    {isLoading || localLoading ? (
                                        <ActivityIndicator color={COLORS.white} />
                                    ) : (
                                        <Text style={loginStyles.buttonText}>Login with Password</Text>
                                    )}
                                </TouchableOpacity>
                            </>
                        ) : screen === 'phone' ? (
                            <>
                                <TextInput
                                    style={loginStyles.input}
                                    placeholder="Phone Number"
                                    keyboardType="phone-pad"
                                    maxLength={10}
                                    value={phone}
                                    onChangeText={setPhone}
                                    placeholderTextColor={COLORS.gray400}
                                />
                                {error && <Text style={loginStyles.error}>{error}</Text>}

                                <TouchableOpacity 
                                    style={[loginStyles.button, (isLoading || localLoading) && loginStyles.buttonDisabled]} 
                                    onPress={handleSendOTP} 
                                    disabled={isLoading || localLoading}
                                >
                                    {isLoading || localLoading ? (
                                        <ActivityIndicator color={COLORS.white} />
                                    ) : (
                                        <Text style={loginStyles.buttonText}>Send OTP</Text>
                                    )}
                                </TouchableOpacity>
                            </>
                        ) : (
                            <>
                                <Text style={loginStyles.otpText}>Enter 6-digit OTP sent to +91 {phone}</Text>

                                <TextInput
                                    style={loginStyles.input}
                                    placeholder="Enter OTP"
                                    keyboardType="number-pad"
                                    maxLength={6}
                                    value={otp}
                                    onChangeText={setOtp}
                                    placeholderTextColor={COLORS.gray400}
                                    autoFocus
                                />
                                {error && <Text style={loginStyles.error}>{error}</Text>}

                                <TouchableOpacity 
                                    style={[loginStyles.button, (isLoading || localLoading) && loginStyles.buttonDisabled]} 
                                    onPress={handleVerifyOTP} 
                                    disabled={isLoading || localLoading}
                                >
                                    {isLoading || localLoading ? (
                                        <ActivityIndicator color={COLORS.white} />
                                    ) : (
                                        <Text style={loginStyles.buttonText}>Verify & Login</Text>
                                    )}
                                </TouchableOpacity>

                                <TouchableOpacity 
                                    style={loginStyles.backButton} 
                                    onPress={() => setScreen('phone')}
                                    disabled={isLoading || localLoading}
                                >
                                    <Text style={loginStyles.backButtonText}>Change Phone Number</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>

                    {/* Mode Toggle: Login with Password / OTP instead */}
                    <TouchableOpacity
                        style={loginStyles.modeToggleBtn}
                        onPress={() => {
                            setLoginMode(loginMode === 'otp' ? 'password' : 'otp');
                            setScreen('phone');
                        }}
                    >
                        <MaterialCommunityIcons
                            name={loginMode === 'otp' ? 'key-outline' : 'cellphone-message'}
                            size={18}
                            color={COLORS.primary}
                            style={{ marginRight: 6 }}
                        />
                        <Text style={loginStyles.modeToggleText}>
                            {loginMode === 'otp' ? 'Login with Password instead' : 'Login with OTP instead'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                        <Text style={[loginStyles.footer, { marginTop: 12 }]}>
                            Forgot Password?{' '}
                            <Text style={loginStyles.link}>Reset via Email</Text>
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                        <Text style={loginStyles.footer}>
                            Don't have an account?{' '}
                            <Text style={loginStyles.link}>
                                Register <MaterialCommunityIcons name="arrow-right" size={14} color={COLORS.primary} />
                            </Text>
                        </Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const loginStyles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.white },
    content: { flex: 1, justifyContent: 'center', padding: 24 },
    logoContainer: { alignItems: 'center', marginBottom: 16 },
    logo: { textAlign: 'center' },
    title: { fontSize: 32, fontWeight: '700', color: COLORS.gray900, textAlign: 'center' },
    subtitle: { fontSize: 16, color: COLORS.gray500, textAlign: 'center', marginBottom: 48 },
    form: { gap: 16 },
    input: { backgroundColor: COLORS.gray100, borderRadius: 12, padding: 16, fontSize: 16, color: COLORS.gray800 },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.gray100,
        borderRadius: 12,
        paddingHorizontal: 16,
    },
    passwordInput: {
        flex: 1,
        paddingVertical: 16,
        fontSize: 16,
        color: COLORS.gray800,
    },
    eyeButton: {
        padding: 8,
    },
    error: { color: COLORS.danger, fontSize: 14, textAlign: 'center' },
    button: { backgroundColor: COLORS.primary, borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
    buttonDisabled: { backgroundColor: COLORS.gray400 },
    buttonText: { color: COLORS.white, fontSize: 16, fontWeight: '600' },
    otpText: {
        fontSize: 14,
        color: COLORS.gray600,
        textAlign: 'center',
        marginBottom: 8,
    },
    backButton: {
        marginTop: 16,
        padding: 8,
    },
    backButtonText: {
        color: COLORS.gray500,
        textAlign: 'center',
        fontSize: 14,
    },
    modeToggleBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 16,
        paddingVertical: 10,
        backgroundColor: '#EFF6FF',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#DBEAFE',
    },
    modeToggleText: {
        color: COLORS.primary,
        fontSize: 14,
        fontWeight: '600',
    },
    footer: { fontSize: 14, color: COLORS.gray500, textAlign: 'center', marginTop: 24 },
    link: { color: COLORS.primary, fontWeight: '600' },
    devOtpContainer: {
        backgroundColor: COLORS.gray100,
        padding: 8,
        borderRadius: 8,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
        borderWidth: 1,
        borderColor: COLORS.primary,
        borderStyle: 'dashed',
    },
    devOtpLabel: {
        fontSize: 12,
        color: COLORS.gray600,
    },
    devOtpValue: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.primary,
        letterSpacing: 2,
    },
});

// Auth Stack Navigator
const AuthStack = createNativeStackNavigator<AuthStackParamList>();

const AuthNavigator: React.FC = () => {
    const dispatch = useAppDispatch();

    const handleRegisterSuccess = (partnerData?: any) => {
        if (partnerData) {
            dispatch(updateUser(partnerData));
        }
        dispatch(setAuthenticated(true));
    };

    return (
        <AuthStack.Navigator screenOptions={{ headerShown: false }}>
            <AuthStack.Screen name="Login" component={LoginScreen} />
            <AuthStack.Screen name="Register">
                {({ navigation }) => (
                    <RegisterScreen
                        onRegisterSuccess={handleRegisterSuccess}
                        onNavigateToLogin={() => navigation.navigate('Login')}
                    />
                )}
            </AuthStack.Screen>
            <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        </AuthStack.Navigator>
    );
};

// Root Stack Navigator
const RootStack = createNativeStackNavigator();

const RootNavigator: React.FC = () => {
    const { isAuthenticated, isLoading } = useAppSelector(state => state.auth);

    // FIX #19 & #20: Register FCM push token & notification tap listeners when authenticated.
    useEffect(() => {
        if (isAuthenticated) {
            fcmService.registerFcmToken().catch((err) =>
                console.error('[App] FCM token registration failed:', err)
            );

            const unsubscribe = fcmService.setupNotificationListeners((data) => {
                console.log('[App] Notification tap data received:', data);
            });
            return () => unsubscribe();
        }
    }, [isAuthenticated]);

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <RootStack.Navigator screenOptions={{ headerShown: false }}>
            {isAuthenticated ? (
                <RootStack.Screen name="Main" component={BottomTabNavigator} />
            ) : (
                <RootStack.Screen name="Auth" component={AuthNavigator} />
            )}
        </RootStack.Navigator>
    );
};

import { SafeAreaProvider } from 'react-native-safe-area-context';

// App Component with Providers
// Wrapped with Sentry.wrap() to capture touch events, navigation breadcrumbs,
// and component render crashes automatically.
function App() {
    return (
        <Provider store={store}>
            <PersistGate loading={<ActivityIndicator />} persistor={persistor}>
                <SafeAreaProvider>
                    <NavigationContainer>
                        <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
                        <RootNavigator />
                    </NavigationContainer>
                    <Toast />
                </SafeAreaProvider>
            </PersistGate>
        </Provider>
    );
}

export default Sentry.wrap(App);

const styles = StyleSheet.create({
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.white },
});
