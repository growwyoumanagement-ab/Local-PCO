// src/screens/LoginScreen.tsx
// Password-based authentication screen (primary) with premium modern UI

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Image,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch } from '../store';
import { setAuthenticated, updateUser, setToken } from '../store/authSlice';
import { authService } from '../services/authService';
import { Button, Card } from '../components';
import { COLORS, SPACING, FONT_SIZE, RADIUS, SHADOWS, ROUTES } from '../utils/constants';
import { isValidPhone } from '../utils/validators';

const LoginScreen: React.FC = () => {
    const navigation = useNavigation();
    const dispatch = useAppDispatch();
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        if (!isValidPhone(phone)) {
            Toast.show({
                type: 'error',
                text1: 'Invalid Number',
                text2: 'Please enter a valid 10-digit phone number',
            });
            return;
        }

        if (!password) {
            Toast.show({
                type: 'error',
                text1: 'Missing Password',
                text2: 'Please enter your password',
            });
            return;
        }

        setIsLoading(true);
        try {
            const response = await authService.login(phone, password);
            dispatch(setToken(response.token));
            dispatch(updateUser(response));
            dispatch(setAuthenticated(true));
        } catch (error: any) {
            Toast.show({
                type: 'error',
                text1: 'Login Failed',
                text2: error.response?.data?.message || error.message || 'Unable to sign in',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    {/* Hero Brand Section */}
                    <View style={styles.heroSection}>
                        <Image
                            source={require('../../assets/logo.png')}
                            style={styles.logoImage}
                            resizeMode="contain"
                        />
                        <Text style={styles.brandTitle}>Welcome Back</Text>
                        <Text style={styles.brandTagline}>Sign in with your phone & password</Text>
                    </View>

                    {/* Card */}
                    <Card style={styles.authCard}>
                        <View style={styles.fieldContainer}>
                            <Text style={styles.inputLabel}>Phone Number</Text>
                            <View style={styles.phoneInputRow}>
                                <View style={styles.countryCodeBadge}>
                                    <Text style={styles.flagEmoji}>🇮🇳</Text>
                                    <Text style={styles.countryCodeText}>+91</Text>
                                </View>
                                <TextInput
                                    style={styles.phoneInput}
                                    placeholder="98765 43210"
                                    keyboardType="phone-pad"
                                    maxLength={10}
                                    value={phone}
                                    onChangeText={setPhone}
                                    placeholderTextColor={COLORS.gray400}
                                />
                            </View>
                        </View>

                        <View style={styles.fieldContainer}>
                            <Text style={styles.inputLabel}>Password</Text>
                            <View style={styles.passwordWrapper}>
                                <Ionicons name="lock-closed-outline" size={20} color={COLORS.gray400} style={{ marginLeft: SPACING.md }} />
                                <TextInput
                                    style={styles.passwordInput}
                                    placeholder="Enter your password"
                                    secureTextEntry={!showPassword}
                                    value={password}
                                    onChangeText={setPassword}
                                    placeholderTextColor={COLORS.gray400}
                                />
                                <TouchableOpacity
                                    onPress={() => setShowPassword(!showPassword)}
                                    style={styles.eyeIcon}
                                >
                                    <Ionicons
                                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                        size={22}
                                        color={COLORS.gray500}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <TouchableOpacity
                            onPress={() => navigation.navigate(ROUTES.FORGOT_PASSWORD as never)}
                            style={{ alignSelf: 'flex-end', marginBottom: SPACING.md }}
                        >
                            <Text style={{ fontSize: FONT_SIZE.sm, color: COLORS.primary, fontWeight: '600' }}>
                                Forgot Password?
                            </Text>
                        </TouchableOpacity>

                        <Button
                            title="Sign In"
                            onPress={handleLogin}
                            loading={isLoading}
                            fullWidth
                            style={styles.primaryBtn}
                        />

                        <View style={styles.footerRow}>
                            <Text style={styles.footerPrompt}>Don't have an account? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate(ROUTES.REGISTER as never)}>
                                <Text style={styles.footerLink}>Register</Text>
                            </TouchableOpacity>
                        </View>
                    </Card>

                    {/* OTP Login Fallback */}
                    <TouchableOpacity
                        style={styles.otpFallbackBtn}
                        onPress={() => navigation.navigate('OTPLogin' as never)}
                    >
                        <Ionicons name="phone-portrait-outline" size={16} color={COLORS.primary} style={{ marginRight: 6 }} />
                        <Text style={styles.otpFallbackText}>Login with OTP instead</Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: SPACING.lg,
    },
    otpFallbackBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: SPACING.lg,
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.sm + 2,
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.full,
        alignSelf: 'center',
        ...SHADOWS.sm,
    },
    otpFallbackText: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.primary,
        fontWeight: '700',
    },
    heroSection: {
        alignItems: 'center',
        marginBottom: SPACING.xl,
    },
    logoImage: {
        width: 96,
        height: 96,
        borderRadius: 16,
        marginBottom: SPACING.sm,
    },
    brandTitle: {
        fontSize: FONT_SIZE['3xl'],
        fontWeight: '800',
        color: COLORS.gray900,
        letterSpacing: -0.5,
    },
    brandTagline: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.gray500,
        fontWeight: '500',
        marginTop: 4,
    },
    authCard: {
        padding: SPACING.xl,
        borderRadius: RADIUS['2xl'],
        backgroundColor: COLORS.white,
        ...SHADOWS.lg,
    },
    fieldContainer: {
        marginBottom: SPACING.lg,
    },
    inputLabel: {
        fontSize: FONT_SIZE.xs + 1,
        fontWeight: '700',
        color: COLORS.gray700,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: SPACING.sm,
    },
    phoneInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    countryCodeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.lg,
        paddingHorizontal: SPACING.md,
        height: 52,
        marginRight: SPACING.sm,
        borderWidth: 1,
        borderColor: COLORS.gray200,
    },
    flagEmoji: {
        fontSize: FONT_SIZE.md,
        marginRight: 4,
    },
    countryCodeText: {
        fontSize: FONT_SIZE.md,
        fontWeight: '700',
        color: COLORS.gray800,
    },
    phoneInput: {
        flex: 1,
        height: 52,
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.lg,
        paddingHorizontal: SPACING.base,
        fontSize: FONT_SIZE.md,
        fontWeight: '600',
        color: COLORS.gray900,
        borderWidth: 1,
        borderColor: COLORS.gray200,
    },
    passwordWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.lg,
        borderWidth: 1,
        borderColor: COLORS.gray200,
        height: 52,
    },
    passwordInput: {
        flex: 1,
        paddingHorizontal: SPACING.md,
        fontSize: FONT_SIZE.md,
        fontWeight: '600',
        color: COLORS.gray900,
    },
    eyeIcon: {
        padding: SPACING.md,
    },
    primaryBtn: {
        height: 52,
        borderRadius: RADIUS.xl,
        marginTop: SPACING.md,
        ...SHADOWS.md,
    },
    footerRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: SPACING.xl,
    },
    footerPrompt: {
        fontSize: FONT_SIZE.base,
        color: COLORS.gray500,
    },
    footerLink: {
        fontSize: FONT_SIZE.base,
        color: COLORS.primary,
        fontWeight: '700',
    },
});

export default LoginScreen;
