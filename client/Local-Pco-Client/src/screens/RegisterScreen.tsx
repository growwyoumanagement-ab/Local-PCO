// src/screens/RegisterScreen.tsx
// Client registration screen with ultra-modern UI design

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TouchableOpacity,
    Image,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ClientStackParamList } from '../navigation/ClientStackNavigator';
import { useAppDispatch } from '../store';
import { setAuthenticated, updateUser, setToken } from '../store/authSlice';
import { authService } from '../services/authService';
import { Button, Card } from '../components';
import { COLORS, SPACING, FONT_SIZE, RADIUS, SHADOWS, ROUTES } from '../utils/constants';

const RegisterScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<ClientStackParamList>>();
    const dispatch = useAppDispatch();

    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleRegister = async () => {
        if (!name || !phone || !password) {
            Toast.show({
                type: 'error',
                text1: 'Missing Fields',
                text2: 'Name, Phone, and Password are required',
            });
            return;
        }

        const phoneRegex = /^[6-9]\d{9}$/;
        if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
            Toast.show({
                type: 'error',
                text1: 'Invalid Phone Number',
                text2: 'Please enter a valid 10-digit Indian phone number starting with 6, 7, 8, or 9',
            });
            return;
        }

        if (email.trim()) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email.trim())) {
                Toast.show({
                    type: 'error',
                    text1: 'Invalid Email',
                    text2: 'Please enter a valid email address',
                });
                return;
            }
        }

        if (password.length < 6) {
            Toast.show({
                type: 'error',
                text1: 'Weak Password',
                text2: 'Password must be at least 6 characters long',
            });
            return;
        }

        setIsLoading(true);
        try {
            const data = await authService.register({
                name: name.trim(),
                phone: phone.trim(),
                email: email.trim() || undefined,
                password
            });
            dispatch(setToken(data.token));
            dispatch(updateUser(data));
            dispatch(setAuthenticated(true));
        } catch (error: any) {
            Toast.show({
                type: 'error',
                text1: 'Registration Failed',
                text2: error.response?.data?.message || error.message || 'Unable to create account',
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
                    {/* Header bar */}
                    <View style={styles.headerBar}>
                        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                            <Ionicons name="arrow-back" size={24} color={COLORS.gray900} />
                        </TouchableOpacity>
                    </View>

                    {/* Hero Header */}
                    <View style={styles.heroSection}>
                        <Image
                            source={require('../../assets/logo.png')}
                            style={styles.logoImage}
                            resizeMode="contain"
                        />
                        <Text style={styles.brandTitle}>Create Account</Text>
                        <Text style={styles.brandTagline}>Join Local PCO in seconds ✨</Text>
                    </View>

                    {/* Card */}
                    <Card style={styles.authCard}>
                        <View style={styles.fieldContainer}>
                            <Text style={styles.inputLabel}>Full Name</Text>
                            <View style={styles.inputWrapper}>
                                <Ionicons name="person-outline" size={20} color={COLORS.gray400} style={styles.fieldIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Jane Doe"
                                    value={name}
                                    onChangeText={setName}
                                    placeholderTextColor={COLORS.gray400}
                                />
                            </View>
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

                        <View style={styles.fieldContainer}>
                            <Text style={styles.inputLabel}>Email Address (Optional)</Text>
                            <View style={styles.inputWrapper}>
                                <Ionicons name="mail-outline" size={20} color={COLORS.gray400} style={styles.fieldIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="jane@example.com"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    value={email}
                                    onChangeText={setEmail}
                                    placeholderTextColor={COLORS.gray400}
                                />
                            </View>
                        </View>

                        <View style={styles.fieldContainer}>
                            <Text style={styles.inputLabel}>Password</Text>
                            <View style={styles.inputWrapper}>
                                <Ionicons name="lock-closed-outline" size={20} color={COLORS.gray400} style={styles.fieldIcon} />
                                <TextInput
                                    style={styles.passwordInput}
                                    placeholder="Min 6 characters"
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

                        <Button
                            title="Register & Get Started"
                            onPress={handleRegister}
                            loading={isLoading}
                            fullWidth
                            style={styles.primaryBtn}
                        />

                        <View style={styles.footerRow}>
                            <Text style={styles.footerPrompt}>Already have an account? </Text>
                            <TouchableOpacity onPress={() => navigation.goBack()}>
                                <Text style={styles.footerLink}>Sign In</Text>
                            </TouchableOpacity>
                        </View>
                    </Card>
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
    headerBar: {
        marginBottom: SPACING.md,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.white,
        alignItems: 'center',
        justifyContent: 'center',
        ...SHADOWS.sm,
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
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.lg,
        borderWidth: 1,
        borderColor: COLORS.gray200,
        height: 52,
    },
    fieldIcon: {
        marginLeft: SPACING.md,
    },
    input: {
        flex: 1,
        paddingHorizontal: SPACING.md,
        fontSize: FONT_SIZE.md,
        fontWeight: '600',
        color: COLORS.gray900,
    },
    passwordInput: {
        flex: 1,
        paddingHorizontal: SPACING.md,
        fontSize: FONT_SIZE.md,
        fontWeight: '600',
        color: COLORS.gray900,
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

export default RegisterScreen;
