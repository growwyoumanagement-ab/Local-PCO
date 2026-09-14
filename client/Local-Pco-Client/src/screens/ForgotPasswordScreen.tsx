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
import { authService } from '../services/authService';
import { Button, Card } from '../components';
import { COLORS, SPACING, FONT_SIZE, RADIUS, ROUTES } from '../utils/constants';
import { isValidEmail } from '../utils/validators';

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
            const response = await authService.forgotPassword(email.trim(), 'client');
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
            const response = await authService.resetPassword(email.trim(), otp.trim(), newPassword, 'client');
            if (response.success) {
                Toast.show({
                    type: 'success',
                    text1: 'Password Reset Successful',
                    text2: 'You can now log in with your new password',
                });
                navigation.navigate(ROUTES.LOGIN as never);
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
                            <Ionicons name="arrow-back" size={24} color={COLORS.gray900} />
                        </TouchableOpacity>
                    </View>

                    {/* Hero Section */}
                    <View style={styles.heroSection}>
                        <Image
                            source={require('../../assets/logo.png')}
                            style={styles.logoImage}
                            resizeMode="contain"
                        />
                        <Text style={styles.brandTitle}>Forgot Password?</Text>
                        <Text style={styles.brandTagline}>
                            {step === 1
                                ? 'Enter your registered email address to receive a verification code'
                                : `Enter the 6-digit verification code sent to ${email}`}
                        </Text>
                    </View>

                    {/* Card */}
                    <Card style={styles.authCard}>
                        {step === 1 ? (
                            <>
                                <View style={styles.fieldContainer}>
                                    <Text style={styles.inputLabel}>Email Address</Text>
                                    <View style={styles.inputWrapper}>
                                        <Ionicons name="mail-outline" size={20} color={COLORS.gray400} style={{ marginLeft: SPACING.md }} />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="your.email@example.com"
                                            keyboardType="email-address"
                                            autoCapitalize="none"
                                            value={email}
                                            onChangeText={setEmail}
                                            placeholderTextColor={COLORS.gray400}
                                        />
                                    </View>
                                </View>

                                <Button
                                    title="Send Verification Code"
                                    onPress={handleSendCode}
                                    loading={isLoading}
                                    fullWidth
                                    style={styles.primaryBtn}
                                />
                            </>
                        ) : (
                            <>
                                <View style={styles.fieldContainer}>
                                    <Text style={styles.inputLabel}>6-Digit Verification Code</Text>
                                    <View style={styles.inputWrapper}>
                                        <Ionicons name="key-outline" size={20} color={COLORS.gray400} style={{ marginLeft: SPACING.md }} />
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
                                        <Ionicons name="lock-closed-outline" size={20} color={COLORS.gray400} style={{ marginLeft: SPACING.md }} />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Enter new password"
                                            secureTextEntry={!showPassword}
                                            value={newPassword}
                                            onChangeText={setNewPassword}
                                            placeholderTextColor={COLORS.gray400}
                                        />
                                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ padding: SPACING.sm }}>
                                            <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={COLORS.gray500} />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                <View style={styles.fieldContainer}>
                                    <Text style={styles.inputLabel}>Confirm New Password</Text>
                                    <View style={styles.inputWrapper}>
                                        <Ionicons name="lock-closed-outline" size={20} color={COLORS.gray400} style={{ marginLeft: SPACING.md }} />
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

                                <Button
                                    title="Reset Password"
                                    onPress={handleResetPassword}
                                    loading={isLoading}
                                    fullWidth
                                    style={styles.primaryBtn}
                                />

                                <TouchableOpacity onPress={() => { setStep(1); setOtp(''); setNewPassword(''); setConfirmPassword(''); }} style={styles.resendBtn}>
                                    <Text style={styles.resendText}>Didn't receive code? Resend Email</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </Card>
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
        paddingHorizontal: SPACING.lg,
        paddingBottom: SPACING.xl,
    },
    headerBar: {
        paddingVertical: SPACING.md,
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
        marginVertical: SPACING.lg,
    },
    logoImage: {
        width: 90,
        height: 90,
        borderRadius: 16,
        marginBottom: SPACING.sm,
    },
    brandTitle: {
        fontSize: FONT_SIZE['2xl'],
        fontWeight: '700',
        color: COLORS.gray900,
        marginBottom: SPACING.xs,
    },
    brandTagline: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.gray600,
        textAlign: 'center',
        paddingHorizontal: SPACING.md,
    },
    authCard: {
        padding: SPACING.lg,
    },
    fieldContainer: {
        marginBottom: SPACING.md,
    },
    inputLabel: {
        fontSize: FONT_SIZE.sm,
        fontWeight: '600',
        color: COLORS.gray700,
        marginBottom: SPACING.xs,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.gray300,
        borderRadius: RADIUS.md,
        backgroundColor: COLORS.gray50,
    },
    input: {
        flex: 1,
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.sm,
        fontSize: FONT_SIZE.md,
        color: COLORS.gray900,
    },
    primaryBtn: {
        marginTop: SPACING.md,
    },
    resendBtn: {
        alignItems: 'center',
        marginTop: SPACING.md,
    },
    resendText: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.primary,
        fontWeight: '600',
    },
});

export default ForgotPasswordScreen;
