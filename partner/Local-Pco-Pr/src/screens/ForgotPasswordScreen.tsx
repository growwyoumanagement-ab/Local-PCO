// src/screens/ForgotPasswordScreen.tsx
// Partner App Forgot Password Screen with email verification code reset

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
    ActivityIndicator,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import authService from '../services/authService';
import { COLORS } from '../utils/constants';
import { isValidEmail } from '../utils/helpers';

const ForgotPasswordScreen: React.FC = () => {
    const navigation = useNavigation();
    const [step, setStep] = useState<1 | 2>(1);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSendCode = async () => {
        if (!email || !isValidEmail(email)) {
            Toast.show({
                type: 'error',
                text1: 'Invalid Email',
                text2: 'Please enter a valid registered email address',
            });
            return;
        }

        setIsLoading(true);
        try {
            const response = await authService.forgotPassword(email.trim(), 'partner');
            if (response.success) {
                Toast.show({
                    type: 'success',
                    text1: 'Verification Code Sent',
                    text2: response.message || 'Check your email for the 6-digit verification code',
                });
                setStep(2);
            }
        } catch (error: any) {
            Toast.show({
                type: 'error',
                text1: 'Request Failed',
                text2: error.response?.data?.message || error.message || 'Unable to send reset code',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (!otp || otp.trim().length !== 6) {
            Toast.show({
                type: 'error',
                text1: 'Invalid Code',
                text2: 'Please enter the 6-digit verification code sent to your email',
            });
            return;
        }

        if (!newPassword || newPassword.length < 6) {
            Toast.show({
                type: 'error',
                text1: 'Weak Password',
                text2: 'Password must be at least 6 characters long',
            });
            return;
        }

        if (newPassword !== confirmPassword) {
            Toast.show({
                type: 'error',
                text1: 'Password Mismatch',
                text2: 'Passwords do not match',
            });
            return;
        }

        setIsLoading(true);
        try {
            const response = await authService.resetPasswordWithEmail(email.trim(), otp.trim(), newPassword, 'partner');
            if (response.success) {
                Toast.show({
                    type: 'success',
                    text1: 'Password Reset Successful',
                    text2: 'You can now log in with your new password',
                });
                navigation.navigate('Login' as never);
            }
        } catch (error: any) {
            Toast.show({
                type: 'error',
                text1: 'Reset Failed',
                text2: error.response?.data?.message || error.message || 'Unable to reset password',
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
                    {/* Header Bar */}
                    <View style={styles.headerBar}>
                        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                            <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.gray900} />
                        </TouchableOpacity>
                    </View>

                    {/* Hero Section */}
                    <View style={styles.heroSection}>
                        <View style={styles.logoBadge}>
                            <MaterialCommunityIcons name="lock-reset" size={40} color={COLORS.primary} />
                        </View>
                        <Text style={styles.brandTitle}>Reset Password</Text>
                        <Text style={styles.brandTagline}>
                            {step === 1
                                ? 'Enter your registered partner email address to receive a 6-digit verification code'
                                : `Enter the 6-digit verification code sent to ${email}`}
                        </Text>
                    </View>

                    {/* Card */}
                    <View style={styles.authCard}>
                        {step === 1 ? (
                            <>
                                <View style={styles.fieldContainer}>
                                    <Text style={styles.inputLabel}>Registered Email Address</Text>
                                    <View style={styles.inputWrapper}>
                                        <MaterialCommunityIcons name="email-outline" size={20} color={COLORS.gray400} style={{ marginLeft: 12 }} />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="partner@example.com"
                                            keyboardType="email-address"
                                            autoCapitalize="none"
                                            value={email}
                                            onChangeText={setEmail}
                                            placeholderTextColor={COLORS.gray400}
                                        />
                                    </View>
                                </View>

                                <TouchableOpacity
                                    style={[styles.primaryBtn, isLoading && { opacity: 0.7 }]}
                                    onPress={handleSendCode}
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <ActivityIndicator color={COLORS.white} />
                                    ) : (
                                        <Text style={styles.primaryBtnText}>Send Verification Code</Text>
                                    )}
                                </TouchableOpacity>
                            </>
                        ) : (
                            <>
                                <View style={styles.fieldContainer}>
                                    <Text style={styles.inputLabel}>6-Digit Verification Code</Text>
                                    <View style={styles.inputWrapper}>
                                        <MaterialCommunityIcons name="key-outline" size={20} color={COLORS.gray400} style={{ marginLeft: 12 }} />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="123456"
                                            keyboardType="number-pad"
                                            maxLength={6}
                                            value={otp}
                                            onChangeText={setOtp}
                                            placeholderTextColor={COLORS.gray400}
                                        />
                                    </View>
                                </View>

                                <View style={styles.fieldContainer}>
                                    <Text style={styles.inputLabel}>New Password</Text>
                                    <View style={styles.inputWrapper}>
                                        <MaterialCommunityIcons name="lock-outline" size={20} color={COLORS.gray400} style={{ marginLeft: 12 }} />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Enter new password"
                                            secureTextEntry={!showPassword}
                                            value={newPassword}
                                            onChangeText={setNewPassword}
                                            placeholderTextColor={COLORS.gray400}
                                        />
                                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ padding: 8 }}>
                                            <MaterialCommunityIcons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={COLORS.gray500} />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                <View style={styles.fieldContainer}>
                                    <Text style={styles.inputLabel}>Confirm New Password</Text>
                                    <View style={styles.inputWrapper}>
                                        <MaterialCommunityIcons name="lock-outline" size={20} color={COLORS.gray400} style={{ marginLeft: 12 }} />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Confirm new password"
                                            secureTextEntry={!showPassword}
                                            value={confirmPassword}
                                            onChangeText={setConfirmPassword}
                                            placeholderTextColor={COLORS.gray400}
                                        />
                                    </View>
                                </View>

                                <TouchableOpacity
                                    style={[styles.primaryBtn, isLoading && { opacity: 0.7 }]}
                                    onPress={handleResetPassword}
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <ActivityIndicator color={COLORS.white} />
                                    ) : (
                                        <Text style={styles.primaryBtnText}>Reset Password</Text>
                                    )}
                                </TouchableOpacity>

                                <TouchableOpacity onPress={() => { setStep(1); setOtp(''); setNewPassword(''); setConfirmPassword(''); }} style={styles.resendBtn}>
                                    <Text style={styles.resendText}>Didn't receive code? Resend Email</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 30,
    },
    headerBar: {
        paddingVertical: 12,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.gray100,
        justifyContent: 'center',
        alignItems: 'center',
    },
    heroSection: {
        alignItems: 'center',
        marginVertical: 20,
    },
    logoBadge: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: COLORS.gray100,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    brandTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: COLORS.gray900,
        marginBottom: 6,
    },
    brandTagline: {
        fontSize: 14,
        color: COLORS.gray600,
        textAlign: 'center',
        paddingHorizontal: 16,
    },
    authCard: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: COLORS.gray200,
    },
    fieldContainer: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.gray700,
        marginBottom: 6,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.gray300,
        borderRadius: 10,
        backgroundColor: COLORS.gray50,
    },
    input: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 8,
        fontSize: 16,
        color: COLORS.gray900,
    },
    primaryBtn: {
        backgroundColor: COLORS.primary,
        borderRadius: 10,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 12,
    },
    primaryBtnText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '700',
    },
    resendBtn: {
        alignItems: 'center',
        marginTop: 16,
    },
    resendText: {
        fontSize: 14,
        color: COLORS.primary,
        fontWeight: '600',
    },
});

export default ForgotPasswordScreen;
