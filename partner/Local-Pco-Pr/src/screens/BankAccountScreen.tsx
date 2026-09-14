// src/screens/BankAccountScreen.tsx
// Bank account management screen

import React, { useState, useEffect } from 'react';
import {
    View, Text, TextInput, StyleSheet, ScrollView,
    TouchableOpacity, Alert, ActivityIndicator,
    KeyboardAvoidingView, Platform, Modal
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { COLORS, FONT_SIZE, SPACING } from '../utils/constants';
import PrimaryButton from '../components/PrimaryButton';
import api from '../services/api';
import { useAppSelector } from '../store';

interface BankDetails {
    id?: string;
    accountHolderName: string;
    accountNumber: string;
    bankName: string;
    ifsc: string;
    isPrimary: boolean;
    isActive?: boolean;
}

const BankAccountScreen: React.FC = () => {
    const navigation = useNavigation();
    const { user } = useAppSelector(state => state.auth);
    const [accountHolderName, setAccountHolderName] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [confirmAccountNumber, setConfirmAccountNumber] = useState('');
    const [bankName, setBankName] = useState('');
    const [ifsc, setIfsc] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [hasSavedAccount, setHasSavedAccount] = useState(false);
    const [savedAccount, setSavedAccount] = useState<BankDetails | null>(null);

    // OTP Modal State
    const [otpModalVisible, setOtpModalVisible] = useState(false);
    const [otp, setOtp] = useState('');
    const [isOtpSending, setIsOtpSending] = useState(false);

    // Validation Errors State
    const [errors, setErrors] = useState({
        accountHolderName: '', accountNumber: '', confirmAccountNumber: '', bankName: '', ifsc: ''
    });

    useEffect(() => { loadBankDetails(); }, []);

    const loadBankDetails = async () => {
        try {
            const response = await api.get('/wallet/partner/bank-accounts');
            if (response.data.success && response.data.data.length > 0) {
                const bankData = response.data.data[0];
                setSavedAccount(bankData);
                setHasSavedAccount(true);
                setAccountHolderName(bankData.accountHolderName);
                setAccountNumber(bankData.accountNumber);
                setConfirmAccountNumber(bankData.accountNumber);
                setBankName(bankData.bankName);
                setIfsc(bankData.ifsc);
            }
        } catch (error) {
            console.error('Error loading bank details:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const validateField = (field: string, value: string) => {
        let error = '';
        switch (field) {
            case 'accountHolderName':
                if (!value.trim()) error = 'Account holder name is required';
                else if (value.trim().length < 3) error = 'Name must be at least 3 characters';
                break;
            case 'accountNumber':
                if (!value.trim()) error = 'Account number is required';
                else if (!/^\d{9,18}$/.test(value.trim())) error = 'Account number should be 9-18 digits';
                if (confirmAccountNumber && value !== confirmAccountNumber) {
                    setErrors(prev => ({ ...prev, confirmAccountNumber: 'Account numbers do not match' }));
                } else if (confirmAccountNumber && value === confirmAccountNumber) {
                    setErrors(prev => ({ ...prev, confirmAccountNumber: '' }));
                }
                break;
            case 'confirmAccountNumber':
                if (!value.trim()) error = 'Please confirm account number';
                else if (value !== accountNumber) error = 'Account numbers do not match';
                break;
            case 'bankName':
                if (!value.trim()) error = 'Bank name is required';
                break;
            case 'ifsc':
                if (!value.trim()) error = 'IFSC code is required';
                break;
        }
        setErrors(prev => ({ ...prev, [field]: error }));
        return error === '';
    };

    const handleAccountHolderNameChange = (text: string) => { setAccountHolderName(text); validateField('accountHolderName', text); };
    const handleAccountNumberChange = (text: string) => { setAccountNumber(text); validateField('accountNumber', text); };
    const handleConfirmAccountNumberChange = (text: string) => { setConfirmAccountNumber(text); validateField('confirmAccountNumber', text); };
    const handleBankNameChange = (text: string) => { setBankName(text); validateField('bankName', text); };
    const handleIfscChange = (text: string) => { 
        const upper = text.toUpperCase();
        setIfsc(upper); 
        validateField('ifsc', upper); 
    };

    const handleInitialSave = async () => {
        const isHolderValid = validateField('accountHolderName', accountHolderName);
        const isAccValid = validateField('accountNumber', accountNumber);
        const isConfirmValid = validateField('confirmAccountNumber', confirmAccountNumber);
        const isBankValid = validateField('bankName', bankName);
        const isIfscValid = validateField('ifsc', ifsc);

        if (!isHolderValid || !isAccValid || !isConfirmValid || !isBankValid || !isIfscValid) {
            Alert.alert('Validation Error', 'Please fix the errors in the form before saving.');
            return;
        }

        // Trigger OTP Request
        setIsOtpSending(true);
        try {
            await api.post('/auth/partner/request-otp', { phone: user?.phone });
            setOtpModalVisible(true);
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to send OTP');
        } finally {
            setIsOtpSending(false);
        }
    };

    const handleFinalSubmit = async () => {
        if (!otp || otp.length !== 6) {
            Alert.alert('Validation Error', 'Please enter a valid 6-digit OTP');
            return;
        }

        setIsSaving(true);
        try {
            const response = await api.post('/wallet/partner/bank-accounts', {
                accountHolderName,
                accountNumber,
                bankName,
                ifsc,
                otp
            });

            if (response.data.success) {
                setOtpModalVisible(false);
                setOtp('');
                setSavedAccount(response.data.data);
                setHasSavedAccount(true);
                Alert.alert('Success', 'Bank account saved successfully!');
            }
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to save bank details');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
             <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <ScrollView style={styles.container} contentContainerStyle={[styles.content, { paddingBottom: 100 }]} showsVerticalScrollIndicator={false}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <View style={styles.backButtonContent}>
                        <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.primary} />
                        <Text style={styles.backButtonText}>Back</Text>
                    </View>
                </TouchableOpacity>

                <Text style={styles.title}>Bank Account</Text>
                <Text style={styles.subtitle}>
                    {hasSavedAccount ? 'Your saved bank account details' : 'Add your bank account for payouts'}
                </Text>

                {hasSavedAccount && savedAccount && (
                    <View style={styles.savedCard}>
                        <View style={styles.savedCardHeader}>
                            <View style={styles.bankIconContainer}>
                                <MaterialCommunityIcons name="bank-outline" size={32} color={COLORS.primary} />
                            </View>
                            <View style={styles.savedCardInfo}>
                                <Text style={styles.savedCardBankName}>{savedAccount.bankName}</Text>
                                <Text style={styles.savedCardAccountNumber}>
                                    ••••••{savedAccount.accountNumber.slice(-4)}
                                </Text>
                            </View>
                            <View style={[
                                styles.statusBadge,
                                savedAccount.isActive ? styles.statusVerified : { backgroundColor: COLORS.danger + '15' }
                            ]}>
                                <View style={styles.statusBadgeContent}>
                                    <MaterialCommunityIcons 
                                        name={savedAccount.isActive ? "check-circle" : "close-circle"} 
                                        size={12} 
                                        color={savedAccount.isActive ? COLORS.success : COLORS.danger} 
                                        style={{ marginRight: 4 }} 
                                    />
                                    <Text style={[styles.statusText, { color: savedAccount.isActive ? COLORS.success : COLORS.danger }]}>
                                        {savedAccount.isActive ? "Active" : "Inactive"}
                                    </Text>
                                </View>
                            </View>
                        </View>
                        <View style={styles.savedCardDetails}>
                            <Text style={styles.savedCardLabel}>Account Holder: {savedAccount.accountHolderName}</Text>
                            <Text style={styles.savedCardLabel}>IFSC: {savedAccount.ifsc}</Text>
                        </View>
                    </View>
                )}

                <Text style={styles.formTitle}>{hasSavedAccount ? 'Update Bank Details' : 'Add Bank Details'}</Text>

                <View style={styles.form}>
                    <Text style={styles.label}>Account Holder Name</Text>
                    <TextInput
                        style={[styles.input, errors.accountHolderName ? styles.inputError : null]}
                        placeholder="Enter account holder name"
                        value={accountHolderName}
                        onChangeText={handleAccountHolderNameChange}
                        placeholderTextColor={COLORS.gray400}
                    />
                    {errors.accountHolderName ? <Text style={styles.fieldErrorText}>{errors.accountHolderName}</Text> : null}

                    <Text style={styles.label}>Account Number</Text>
                    <TextInput
                        style={[styles.input, errors.accountNumber ? styles.inputError : null]}
                        placeholder="Enter account number"
                        keyboardType="numeric"
                        value={accountNumber}
                        onChangeText={handleAccountNumberChange}
                        secureTextEntry
                        placeholderTextColor={COLORS.gray400}
                    />
                    {errors.accountNumber ? <Text style={styles.fieldErrorText}>{errors.accountNumber}</Text> : null}

                    <Text style={styles.label}>Confirm Account Number</Text>
                    <TextInput
                        style={[styles.input, errors.confirmAccountNumber ? styles.inputError : null]}
                        placeholder="Re-enter account number"
                        keyboardType="numeric"
                        value={confirmAccountNumber}
                        onChangeText={handleConfirmAccountNumberChange}
                        placeholderTextColor={COLORS.gray400}
                    />
                    {errors.confirmAccountNumber ? <Text style={styles.fieldErrorText}>{errors.confirmAccountNumber}</Text> : null}

                    <Text style={styles.label}>Bank Name</Text>
                    <TextInput
                        style={[styles.input, errors.bankName ? styles.inputError : null]}
                        placeholder="Enter bank name"
                        value={bankName}
                        onChangeText={handleBankNameChange}
                        placeholderTextColor={COLORS.gray400}
                    />
                    {errors.bankName ? <Text style={styles.fieldErrorText}>{errors.bankName}</Text> : null}

                    <Text style={styles.label}>IFSC Code</Text>
                    <TextInput
                        style={[styles.input, errors.ifsc ? styles.inputError : null]}
                        placeholder="Enter IFSC code"
                        autoCapitalize="characters"
                        value={ifsc}
                        onChangeText={handleIfscChange}
                        placeholderTextColor={COLORS.gray400}
                        maxLength={11}
                    />
                    {errors.ifsc ? <Text style={styles.fieldErrorText}>{errors.ifsc}</Text> : null}

                    <PrimaryButton
                        title={isOtpSending ? 'Requesting OTP...' : (hasSavedAccount ? 'Update Bank Account' : 'Save Bank Account')}
                        onPress={handleInitialSave}
                        loading={isOtpSending || isSaving}
                        fullWidth
                        style={{ marginTop: SPACING.lg }}
                    />
                </View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* OTP Modal */}
            <Modal visible={otpModalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Security Verification</Text>
                        <Text style={styles.modalSubtitle}>We sent a 6-digit OTP to your registered phone number to authorize this bank account change.</Text>
                        <TextInput
                            style={styles.otpInput}
                            placeholder="Enter 6-digit OTP"
                            keyboardType="numeric"
                            maxLength={6}
                            value={otp}
                            onChangeText={setOtp}
                        />
                        <PrimaryButton title="Verify & Save" onPress={handleFinalSubmit} loading={isSaving} fullWidth />
                        <TouchableOpacity style={styles.cancelButton} onPress={() => setOtpModalVisible(false)}>
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: COLORS.gray50 },
    container: { flex: 1 },
    content: { padding: SPACING.base },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    backButton: { marginBottom: SPACING.md },
    backButtonContent: { flexDirection: 'row', alignItems: 'center' },
    backButtonText: { color: COLORS.primary, fontSize: FONT_SIZE.base, marginLeft: 4 },
    title: { fontSize: FONT_SIZE['2xl'], fontWeight: '700', color: COLORS.gray900 },
    subtitle: { fontSize: FONT_SIZE.sm, color: COLORS.gray500, marginBottom: SPACING.lg },
    savedCard: { backgroundColor: COLORS.white, borderRadius: 16, padding: SPACING.md, marginBottom: SPACING.lg, borderWidth: 1, borderColor: COLORS.gray200 },
    savedCardHeader: { flexDirection: 'row', alignItems: 'center' },
    bankIconContainer: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.primary + '10', justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md },
    savedCardInfo: { flex: 1 },
    savedCardBankName: { fontSize: FONT_SIZE.base, fontWeight: '600', color: COLORS.gray900 },
    savedCardAccountNumber: { fontSize: FONT_SIZE.sm, color: COLORS.gray500 },
    statusBadge: { paddingHorizontal: SPACING.sm, paddingVertical: 4, borderRadius: 12 },
    statusBadgeContent: { flexDirection: 'row', alignItems: 'center' },
    statusVerified: { backgroundColor: COLORS.success + '15' },
    statusText: { fontSize: FONT_SIZE.xs, fontWeight: '600' },
    savedCardDetails: { marginTop: SPACING.sm, paddingTop: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.gray100 },
    savedCardLabel: { fontSize: FONT_SIZE.sm, color: COLORS.gray600, marginBottom: 4 },
    formTitle: { fontSize: FONT_SIZE.lg, fontWeight: '600', color: COLORS.gray800, marginBottom: SPACING.md },
    form: { gap: SPACING.sm },
    label: { fontSize: FONT_SIZE.sm, fontWeight: '600', color: COLORS.gray700, marginTop: SPACING.sm },
    input: { backgroundColor: COLORS.white, borderRadius: 12, padding: SPACING.md, fontSize: FONT_SIZE.base, color: COLORS.gray800, borderWidth: 1, borderColor: COLORS.gray200 },
    inputError: { borderWidth: 1, borderColor: COLORS.danger, backgroundColor: '#FFF5F5' },
    fieldErrorText: { color: COLORS.danger, fontSize: 12, marginTop: 4, marginLeft: 4 },
    
    // Modal Styles
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { width: '85%', backgroundColor: COLORS.white, borderRadius: 16, padding: SPACING.lg, alignItems: 'center' },
    modalTitle: { fontSize: FONT_SIZE.xl, fontWeight: '700', color: COLORS.gray900, marginBottom: SPACING.sm },
    modalSubtitle: { fontSize: FONT_SIZE.sm, color: COLORS.gray600, textAlign: 'center', marginBottom: SPACING.lg },
    otpInput: { width: '100%', backgroundColor: COLORS.gray50, borderWidth: 1, borderColor: COLORS.gray200, borderRadius: 12, padding: SPACING.md, fontSize: FONT_SIZE.lg, textAlign: 'center', marginBottom: SPACING.lg, letterSpacing: 4 },
    cancelButton: { marginTop: SPACING.md, paddingVertical: SPACING.sm },
    cancelText: { color: COLORS.gray500, fontSize: FONT_SIZE.base, fontWeight: '600' }
});

export default BankAccountScreen;
