// src/screens/WalletScreen.tsx
// Wallet and earnings screen with transaction history

import React, { useEffect, useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, ScrollView,
    RefreshControl, TouchableOpacity, Alert,
    Modal, TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { COLORS, FONT_SIZE, SPACING, EARNINGS_PERIOD, TRANSACTION_TYPE } from '../utils/constants';
import { formatCurrency, formatDate, formatTime } from '../utils/helpers';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchWalletSummary, fetchTransactions, setSelectedPeriod, requestPayout } from '../store/walletSlice';
import { Transaction } from '../services/walletService';
import api from '../services/api';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import EarningsCard from '../components/EarningsCard';
import PrimaryButton from '../components/PrimaryButton';

const PERIOD_TABS = [
    { key: EARNINGS_PERIOD.TODAY, label: 'Today' },
    { key: EARNINGS_PERIOD.WEEKLY, label: 'This Week' },
    { key: EARNINGS_PERIOD.MONTHLY, label: 'This Month' },
];

const WalletScreen: React.FC = () => {
    const dispatch = useAppDispatch();
    const { summary, transactions, selectedPeriod, isLoading, isProcessing } = useAppSelector(state => state.wallet);
    const { user } = useAppSelector(state => state.auth);
    const [refreshing, setRefreshing] = useState(false);

    // Payout State
    const [otpModalVisible, setOtpModalVisible] = useState(false);
    const [otp, setOtp] = useState('');
    const [bankAccountId, setBankAccountId] = useState('');
    const [isOtpSending, setIsOtpSending] = useState(false);

    const loadWalletData = useCallback(async () => {
        await Promise.all([dispatch(fetchWalletSummary()), dispatch(fetchTransactions())]);
    }, [dispatch]);

    useEffect(() => { loadWalletData(); }, [loadWalletData]);

    useFocusEffect(
        useCallback(() => {
            loadWalletData();
        }, [loadWalletData])
    );

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadWalletData();
        setRefreshing(false);
    };

    const getEarningsForPeriod = (): number => {
        if (!summary) return 0;
        switch (selectedPeriod) {
            case EARNINGS_PERIOD.TODAY: return summary.todayEarnings;
            case EARNINGS_PERIOD.WEEKLY: return summary.weeklyEarnings;
            case EARNINGS_PERIOD.MONTHLY: return summary.monthlyEarnings;
            default: return summary.todayEarnings;
        }
    };

    const handleInitiatePayout = async () => {
        if (!summary || summary.currentBalance < 500) {
            Alert.alert('Insufficient Balance', 'Minimum payout is ₹500.');
            return;
        }

        setIsOtpSending(true);
        try {
            // Check for bank account first
            const bankRes = await api.get('/wallet/partner/bank-accounts');
            if (!bankRes.data.success || bankRes.data.data.length === 0) {
                Alert.alert('No Bank Account', 'Please add a bank account in your profile before requesting a payout.');
                setIsOtpSending(false);
                return;
            }

            const primaryAccount = bankRes.data.data.find((b: any) => b.isPrimary) || bankRes.data.data[0];
            setBankAccountId(primaryAccount.id);

            // Request OTP
            await api.post('/auth/partner/request-otp', { phone: user?.phone });
            setOtpModalVisible(true);
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to initiate payout');
        } finally {
            setIsOtpSending(false);
        }
    };

    const handleConfirmPayout = async () => {
        if (!otp || otp.length !== 6) {
            Alert.alert('Validation Error', 'Please enter a valid 6-digit OTP');
            return;
        }

        if (!summary) return;

        try {
            await dispatch(requestPayout({
                amount: summary.currentBalance,
                bankAccountId,
                otp
            })).unwrap();

            setOtpModalVisible(false);
            setOtp('');
            Alert.alert('Success', 'Payout request submitted successfully!');
            loadWalletData();
        } catch (error: any) {
            setOtp('');
            const errorMessage = (error && typeof error === 'object' && error.message) 
                ? error.message 
                : (typeof error === 'string' ? error : 'Failed to request payout');
            Alert.alert('Error', errorMessage);
        }
    };

    const renderTransaction = (item: Transaction) => {
        const isCredit = item.type === 'credit' || item.type === 'bonus';
        return (
            <View key={item.id} style={styles.transactionItem}>
                <View style={styles.transactionLeft}>
                    <View style={[styles.transactionIcon, { backgroundColor: isCredit ? COLORS.success + '15' : COLORS.danger + '15' }]}>
                        <MaterialCommunityIcons 
                            name={isCredit ? 'arrow-down-circle-outline' : 'arrow-up-circle-outline'} 
                            size={22} 
                            color={isCredit ? COLORS.success : COLORS.danger} 
                        />
                    </View>
                    <View style={styles.transactionInfo}>
                        <Text style={styles.transactionDescription} numberOfLines={1}>{item.description}</Text>
                        <Text style={styles.transactionDate}>{formatDate(item.createdAt)} • {formatTime(item.createdAt)}</Text>
                    </View>
                </View>
                <View style={styles.transactionRight}>
                    <Text style={[styles.transactionAmount, { color: isCredit ? COLORS.success : COLORS.danger }]}>
                        {isCredit ? '+' : '-'}{formatCurrency(item.amount)}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[COLORS.primary]} />}
                showsVerticalScrollIndicator={false}>
                <Text style={styles.headerTitle}>Wallet</Text>

                {/* Balance Card */}
                <View style={styles.balanceCard}>
                    <Text style={styles.balanceLabel}>Available Balance</Text>
                    <Text style={styles.balanceAmount}>{formatCurrency(summary?.currentBalance || 0)}</Text>
                    <View style={styles.balanceFooter}>
                        <View style={styles.pendingContainer}>
                            <Text style={styles.pendingLabel}>Pending Payout</Text>
                            <Text style={styles.pendingAmount}>{formatCurrency(summary?.pendingPayout || 0)}</Text>
                        </View>
                        <PrimaryButton title="Request Payout" onPress={handleInitiatePayout} variant="secondary" size="small" loading={isProcessing || isOtpSending} />
                    </View>
                </View>

                {/* Earnings Section */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Earnings</Text>
                </View>
                <View style={styles.periodTabs}>
                    {PERIOD_TABS.map(tab => (
                        <TouchableOpacity key={tab.key} style={[styles.periodTab, selectedPeriod === tab.key && styles.periodTabActive]} onPress={() => dispatch(setSelectedPeriod(tab.key))}>
                            <Text style={[styles.periodTabText, selectedPeriod === tab.key && styles.periodTabTextActive]}>{tab.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
                <View style={styles.earningsContainer}>
                    <EarningsCard label={`${PERIOD_TABS.find(t => t.key === selectedPeriod)?.label} Earnings`} amount={getEarningsForPeriod()} />
                    <EarningsCard label="Total Earnings" amount={summary?.totalEarnings || 0} />
                </View>

                {/* Transactions Section */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Recent Transactions</Text>
                    <TouchableOpacity>
                        <Text style={styles.seeAllText}>See All</Text>
                    </TouchableOpacity>
                </View>

                {transactions.length > 0 ? (
                    <View style={styles.transactionsList}>
                        {transactions.slice(0, 5).map(renderTransaction)}
                    </View>
                ) : (
                    <View style={styles.emptyState}>
                        <MaterialCommunityIcons name="receipt" size={48} color={COLORS.gray300} />
                        <Text style={styles.emptyStateTitle}>No transactions yet</Text>
                        <Text style={styles.emptyStateDesc}>Your earnings and payouts will appear here.</Text>
                    </View>
                )}
            </ScrollView>

            {/* OTP Modal */}
            <Modal visible={otpModalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Confirm Payout</Text>
                        <Text style={styles.modalSubtitle}>We sent a 6-digit OTP to your phone to authorize this payout of {formatCurrency(summary?.currentBalance || 0)}.</Text>
                        <TextInput
                            style={styles.otpInput}
                            placeholder="Enter 6-digit OTP"
                            keyboardType="numeric"
                            maxLength={6}
                            value={otp}
                            onChangeText={setOtp}
                        />
                        <PrimaryButton title="Confirm Payout" onPress={handleConfirmPayout} loading={isProcessing} fullWidth />
                        <TouchableOpacity style={styles.cancelButton} onPress={() => {
                            setOtp('');
                            setOtpModalVisible(false);
                        }}>
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
    contentContainer: { padding: SPACING.base, paddingBottom: SPACING['2xl'] },
    headerTitle: { fontSize: FONT_SIZE['2xl'], fontWeight: '700', color: COLORS.gray900, marginBottom: SPACING.lg },
    balanceCard: { backgroundColor: COLORS.primary, borderRadius: 20, padding: SPACING.lg, marginBottom: SPACING.xl, elevation: 4, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
    balanceLabel: { fontSize: FONT_SIZE.sm, color: 'rgba(255, 255, 255, 0.8)', marginBottom: 4 },
    balanceAmount: { fontSize: 36, fontWeight: '700', color: COLORS.white, marginBottom: SPACING.lg },
    balanceFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: 'rgba(255, 255, 255, 0.2)', paddingTop: SPACING.md },
    pendingContainer: { flex: 1 },
    pendingLabel: { fontSize: FONT_SIZE.xs, color: 'rgba(255, 255, 255, 0.8)' },
    pendingAmount: { fontSize: FONT_SIZE.lg, fontWeight: '600', color: COLORS.white },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md, marginTop: SPACING.md },
    sectionTitle: { fontSize: FONT_SIZE.lg, fontWeight: '700', color: COLORS.gray900 },
    seeAllText: { fontSize: FONT_SIZE.sm, color: COLORS.primary, fontWeight: '600' },
    periodTabs: { flexDirection: 'row', backgroundColor: COLORS.gray100, borderRadius: 12, padding: 4, marginBottom: SPACING.md },
    periodTab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
    periodTabActive: { backgroundColor: COLORS.white, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
    periodTabText: { fontSize: FONT_SIZE.sm, fontWeight: '500', color: COLORS.gray600 },
    periodTabTextActive: { color: COLORS.primary, fontWeight: '600' },
    earningsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.xl },
    transactionsList: { backgroundColor: COLORS.white, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.gray100 },
    transactionItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.gray100 },
    transactionLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    transactionIcon: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md },
    transactionInfo: { flex: 1 },
    transactionDescription: { fontSize: FONT_SIZE.base, fontWeight: '600', color: COLORS.gray900, marginBottom: 4 },
    transactionDate: { fontSize: FONT_SIZE.xs, color: COLORS.gray500 },
    transactionRight: { alignItems: 'flex-end', marginLeft: SPACING.sm },
    transactionAmount: { fontSize: FONT_SIZE.base, fontWeight: '700' },
    emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: SPACING['2xl'], backgroundColor: COLORS.white, borderRadius: 16, borderWidth: 1, borderColor: COLORS.gray100 },
    emptyStateTitle: { fontSize: FONT_SIZE.lg, fontWeight: '600', color: COLORS.gray800, marginTop: SPACING.md, marginBottom: 4 },
    emptyStateDesc: { fontSize: FONT_SIZE.sm, color: COLORS.gray500, textAlign: 'center' },

    // Modal Styles
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { width: '85%', backgroundColor: COLORS.white, borderRadius: 16, padding: SPACING.lg, alignItems: 'center' },
    modalTitle: { fontSize: FONT_SIZE.xl, fontWeight: '700', color: COLORS.gray900, marginBottom: SPACING.sm },
    modalSubtitle: { fontSize: FONT_SIZE.sm, color: COLORS.gray600, textAlign: 'center', marginBottom: SPACING.lg },
    otpInput: { width: '100%', backgroundColor: COLORS.gray50, borderWidth: 1, borderColor: COLORS.gray200, borderRadius: 12, padding: SPACING.md, fontSize: FONT_SIZE.lg, textAlign: 'center', marginBottom: SPACING.lg, letterSpacing: 4 },
    cancelButton: { marginTop: SPACING.md, paddingVertical: SPACING.sm },
    cancelText: { color: COLORS.gray500, fontSize: FONT_SIZE.base, fontWeight: '600' }
});

export default WalletScreen;
