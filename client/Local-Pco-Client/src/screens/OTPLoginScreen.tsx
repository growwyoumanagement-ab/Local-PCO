// src/screens/OTPLoginScreen.tsx
// OTP-based phone authentication screen with premium modern UI

import React, { useState, useRef, useEffect } from 'react';
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch } from '../store';
import { setAuthenticated, updateUser, setToken } from '../store/authSlice';
import { authService } from '../services/authService';
import { Button, Card } from '../components';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZE, RADIUS, SHADOWS, ROUTES } from '../utils/constants';
import { isValidPhone, isValidOTP } from '../utils/validators';

type Screen = 'phone' | 'otp';

const OTPLoginScreen: React.FC = () => {
    const navigation = useNavigation();
    const dispatch = useAppDispatch();
    const [screen, setScreen] = useState<Screen>('phone');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [isLoading, setIsLoading] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [receivedOtp, setReceivedOtp] = useState<string | null>(null);

    const otpInputs = useRef<(TextInput | null)[]>([]);
    const timerRef = useRef<any>(null);

    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, []);

    const handleSendOTP = async () => {
        if (!isValidPhone(phone)) {
            Toast.show({
                type: 'error',
                text1: 'Invalid Number',
                text2: 'Please enter a valid 10-digit phone number',
            });
            return;
        }

        setIsLoading(true);
        try {
            const response = await authService.requestOTP(phone);
            setScreen('otp');
            if (response.success && response.otp) {
                setReceivedOtp(response.otp);
            }
            startCountdown();
        } catch (error: any) {
            Toast.show({
                type: 'error',
                text1: 'Failed to Send OTP',
                text2: error.response?.data?.message || error.message || 'Something went wrong',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOTP = async () => {
        const otpString = otp.join('');
        if (!isValidOTP(otpString)) {
            Toast.show({
                type: 'error',
                text1: 'Invalid OTP',
                text2: 'Please enter a valid 6-digit OTP',
            });
            return;
        }

        setIsLoading(true);
        try {
            const response = await authService.verifyOTP(phone, otpString);
            dispatch(setToken(response.token));
            dispatch(updateUser(response));
            dispatch(setAuthenticated(true));
        } catch (error: any) {
            Toast.show({
                type: 'error',
                text1: 'Verification Failed',
                text2: error.response?.data?.message || error.message || 'Incorrect OTP provided',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleOTPChange = (value: string, index: number) => {
        if (value.length > 1) {
            const digits = value.replace(/\D/g, '').slice(0, 6).split('');
            const newOtp = [...otp];
            digits.forEach((digit, i) => {
                if (index + i < 6) {
                    newOtp[index + i] = digit;
                }
            });
            setOtp(newOtp);
            const nextFocusIndex = Math.min(index + digits.length, 5);
            otpInputs.current[nextFocusIndex]?.focus();
            return;
        }

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < 5) {
            otpInputs.current[index + 1]?.focus();
        }
    };

    const handleOTPKeyPress = (key: string, index: number) => {
        if (key === 'Backspace' && !otp[index] && index > 0) {
            otpInputs.current[index - 1]?.focus();
        }
    };

    const startCountdown = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
        setCountdown(30);
        timerRef.current = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    if (timerRef.current) clearInterval(timerRef.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const handleResendOTP = () => {
        if (countdown === 0) {
            handleSendOTP();
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    {/* Hero Brand Banner */}
                    <View style={styles.heroSection}>
                        <Image
                            source={require('../../assets/logo.png')}
                            style={styles.logoImage}
                            resizeMode="contain"
                        />
                        <Text style={styles.brandTitle}>
                            Local PCO <Text style={styles.brandAccent}>HomeServices</Text>
                        </Text>
                        <Text style={styles.brandTagline}>Instant Doorstep Professional Care ✨</Text>
                    </View>

                    {/* Main Form Card */}
                    <Card style={styles.authCard}>
                        {screen === 'phone' ? (
                            <>
                                <View style={styles.cardHeader}>
                                    <Text style={styles.cardTitle}>Mobile Verification</Text>
                                    <Text style={styles.cardSubtitle}>
                                        Enter your phone number to receive a secure OTP code
                                    </Text>
                                </View>

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

                                <Button
                                    title="Send Verification Code"
                                    onPress={handleSendOTP}
                                    loading={isLoading}
                                    disabled={phone.length !== 10}
                                    fullWidth
                                    style={styles.primaryBtn}
                                />
                            </>
                        ) : (
                            <>
                                <View style={styles.cardHeader}>
                                    <TouchableOpacity
                                        style={styles.backStepBtn}
                                        onPress={() => setScreen('phone')}
                                    >
                                        <Ionicons name="arrow-back" size={20} color={COLORS.gray700} />
                                    </TouchableOpacity>
                                    <Text style={styles.cardTitle}>Verify OTP Code</Text>
                                    <Text style={styles.cardSubtitle}>
                                        Enter the 6-digit code sent to <Text style={styles.phoneHighlight}>+91 {phone}</Text>
                                    </Text>
                                </View>



                                <View style={styles.otpGrid}>
                                    {otp.map((digit, index) => (
                                        <TextInput
                                            key={index}
                                            ref={(ref) => { otpInputs.current[index] = ref; }}
                                            style={[
                                                styles.otpBox,
                                                digit.length > 0 && styles.otpBoxFilled,
                                            ]}
                                            keyboardType="number-pad"
                                            maxLength={1}
                                            value={digit}
                                            onChangeText={(value) => handleOTPChange(value, index)}
                                            onKeyPress={({ nativeEvent }) =>
                                                handleOTPKeyPress(nativeEvent.key, index)
                                            }
                                        />
                                    ))}
                                </View>

                                <Button
                                    title="Verify & Continue"
                                    onPress={handleVerifyOTP}
                                    loading={isLoading}
                                    disabled={otp.some((d) => !d)}
                                    fullWidth
                                    style={styles.primaryBtn}
                                />

                                <View style={styles.resendRow}>
                                    {countdown > 0 ? (
                                        <Text style={styles.countdownText}>
                                            Resend code in <Text style={styles.countdownBold}>{countdown}s</Text>
                                        </Text>
                                    ) : (
                                        <TouchableOpacity onPress={handleResendOTP}>
                                            <Text style={styles.resendLink}>Resend OTP Code</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>

                                <TouchableOpacity
                                    style={styles.changePhoneBtn}
                                    onPress={() => setScreen('phone')}
                                >
                                    <Ionicons name="create-outline" size={16} color={COLORS.gray500} />
                                    <Text style={styles.changePhoneText}>Change Phone Number</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </Card>

                    {/* Footer Navigation */}
                    <View style={styles.navigationFooter}>
                        <View style={styles.registerRow}>
                            <Text style={styles.registerPrompt}>Don't have an account? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate(ROUTES.REGISTER as never)}>
                                <Text style={styles.registerLink}>Register Account</Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity 
                            style={styles.passwordFallbackBtn}
                            onPress={() => navigation.navigate('Login' as never)}
                        >
                            <Ionicons name="key-outline" size={16} color={COLORS.primary} style={{ marginRight: 6 }} />
                            <Text style={styles.passwordFallbackText}>Login with Password instead</Text>
                        </TouchableOpacity>
                    </View>
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
    heroSection: {
        alignItems: 'center',
        marginBottom: SPACING.lg,
    },
    logoImage: {
        width: 90,
        height: 90,
        borderRadius: 16,
        marginBottom: SPACING.sm,
    },
    brandTitle: {
        fontSize: FONT_SIZE['3xl'],
        fontWeight: '800',
        color: COLORS.gray900,
        letterSpacing: -0.5,
    },
    brandAccent: {
        color: COLORS.primary,
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
    cardHeader: {
        alignItems: 'center',
        marginBottom: SPACING.xl,
        position: 'relative',
    },
    backStepBtn: {
        position: 'absolute',
        left: 0,
        top: 0,
        padding: SPACING.xs,
    },
    cardTitle: {
        fontSize: FONT_SIZE.xl,
        fontWeight: '800',
        color: COLORS.gray900,
        textAlign: 'center',
        marginBottom: SPACING.xs,
    },
    cardSubtitle: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.gray500,
        textAlign: 'center',
        lineHeight: 20,
    },
    phoneHighlight: {
        fontWeight: '700',
        color: COLORS.gray800,
    },
    fieldContainer: {
        marginBottom: SPACING.xl,
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
    primaryBtn: {
        height: 52,
        borderRadius: RADIUS.xl,
        ...SHADOWS.md,
    },
    devOtpCard: {
        backgroundColor: COLORS.secondaryLight,
        padding: SPACING.md,
        borderRadius: RADIUS.lg,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.lg,
        borderWidth: 1,
        borderColor: COLORS.secondary,
    },
    devOtpLabel: {
        fontSize: FONT_SIZE.xs,
        fontWeight: '600',
        color: COLORS.gray700,
        marginLeft: SPACING.xs,
        marginRight: SPACING.xs,
    },
    devOtpValue: {
        fontSize: FONT_SIZE.md,
        fontWeight: '800',
        color: COLORS.secondary,
        letterSpacing: 2,
    },
    otpGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: SPACING.xl,
    },
    otpBox: {
        width: 46,
        height: 52,
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.lg,
        textAlign: 'center',
        fontSize: FONT_SIZE.xl,
        fontWeight: '800',
        color: COLORS.gray900,
        borderWidth: 2,
        borderColor: COLORS.gray200,
    },
    otpBoxFilled: {
        borderColor: COLORS.primary,
        backgroundColor: COLORS.primaryBg,
    },
    resendRow: {
        alignItems: 'center',
        marginTop: SPACING.md,
    },
    countdownText: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.gray500,
    },
    countdownBold: {
        fontWeight: '700',
        color: COLORS.primary,
    },
    resendLink: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.primary,
        fontWeight: '700',
    },
    changePhoneBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: SPACING.md,
        paddingVertical: SPACING.xs,
    },
    changePhoneText: {
        fontSize: FONT_SIZE.xs + 1,
        color: COLORS.gray500,
        marginLeft: 4,
        fontWeight: '600',
    },
    navigationFooter: {
        marginTop: SPACING.xl,
        alignItems: 'center',
    },
    registerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    registerPrompt: {
        fontSize: FONT_SIZE.base,
        color: COLORS.gray500,
    },
    registerLink: {
        fontSize: FONT_SIZE.base,
        color: COLORS.primary,
        fontWeight: '700',
    },
    passwordFallbackBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.sm + 2,
        borderRadius: RADIUS.full,
        ...SHADOWS.sm,
    },
    passwordFallbackText: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.primary,
        fontWeight: '700',
    },
});

export default OTPLoginScreen;
