// src/screens/ProfileScreen.tsx
// Partner profile management screen

import React, { useEffect, useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, ScrollView,
    RefreshControl, TouchableOpacity, Switch, Image, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { COLORS, FONT_SIZE, SPACING, ROUTES, PARTNER_STATUS, KYC_STATUS } from '../utils/constants';
import { getKycStatusLabel, getPartnerStatusLabel } from '../utils/helpers';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchPartnerProfile, updateAvailability } from '../store/partnerSlice';
import { logoutPartner } from '../store/authSlice';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import StatusBadge from '../components/StatusBadge';
import PrimaryButton from '../components/PrimaryButton';
import api from '../services/api';

interface PartnerStats {
    totalJobs: number;
    completedJobs: number;
    pendingJobs: number;
    totalEarnings: number;
    rating: number;
    completionRate: number;
}

const ProfileScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const dispatch = useAppDispatch();
    const { user } = useAppSelector(state => state.auth);
    const { profile, availability, kycStatus, isLoading } = useAppSelector(state => state.partner);
    const [refreshing, setRefreshing] = useState(false);
    const [stats, setStats] = useState<PartnerStats | null>(null);

    const loadProfile = useCallback(async () => {
        await dispatch(fetchPartnerProfile());
    }, [dispatch]);

    const loadStats = useCallback(async () => {
        try {
            const response = await api.get('/partner/stats');
            if (response.data.success) {
                setStats(response.data.data);
            }
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    }, []);

    useFocusEffect(
        React.useCallback(() => {
            loadProfile();
            loadStats();
        }, [loadProfile, loadStats])
    );

    const handleRefresh = async () => {
        setRefreshing(true);
        await Promise.all([loadProfile(), loadStats()]);
        setRefreshing(false);
    };

    const handleLogout = () => {
        Alert.alert('Logout', 'Are you sure you want to logout?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Logout', style: 'destructive', onPress: () => dispatch(logoutPartner()) },
        ]);
    };

    const profileData = profile || user;
    const menuItems = [
        { icon: 'file-document-outline', label: 'KYC Verification', route: ROUTES.KYC, badge: kycStatus !== KYC_STATUS.APPROVED },
        { icon: 'bank-outline', label: 'Bank Account', route: ROUTES.BANK_ACCOUNT },
        { icon: 'chart-bar', label: 'My Stats', route: ROUTES.MY_STATS },
        { icon: 'help-circle-outline', label: 'Help & Support', route: ROUTES.HELP_SUPPORT },
        { icon: 'file-certificate-outline', label: 'Terms & Conditions', route: ROUTES.TERMS_CONDITIONS },
    ];

    const handleEditProfile = () => {
        navigation.navigate(ROUTES.EDIT_PROFILE);
    };

    // Use real stats from API, fallback to profile data. Only display 0 if both are genuinely 0/unset.
    const displayTotalJobs = stats?.totalJobs ?? profile?.totalJobs ?? 0;
    const displayRating = (stats?.rating && stats.rating > 0)
        ? stats.rating
        : (profile?.rating && profile.rating > 0)
            ? profile.rating
            : 0;

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[COLORS.primary]} />}>

                {/* Header */}
                <Text style={styles.headerTitle}>Profile</Text>

                {/* Profile Card */}
                <View style={styles.profileCard}>
                    <View style={styles.avatarContainer}>
                        {profileData?.avatar ? (
                            <Image source={{ uri: profileData.avatar }} style={styles.avatarImage} />
                        ) : (
                            <Text style={styles.avatarText}>{profileData?.name?.charAt(0).toUpperCase() || 'P'}</Text>
                        )}
                    </View>
                    <View style={styles.profileInfo}>
                        <Text style={styles.profileName}>{profileData?.name || 'Partner'}</Text>
                        <Text style={styles.profilePhone}>{profileData?.phone || '+91 XXXXXXXXXX'}</Text>
                        <StatusBadge status={availability} variant="partner" size="small" style={{ marginTop: SPACING.xs }} />
                    </View>
                    <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
                        <MaterialCommunityIcons name="pencil-outline" size={20} color={COLORS.gray600} />
                    </TouchableOpacity>
                </View>

                <View style={styles.infoCard}>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Service Category</Text>
                        <Text style={styles.infoValue}>
                            {typeof profile?.serviceCategory === 'object' && profile?.serviceCategory !== null
                                ? (profile.serviceCategory as any).name
                                : (profile?.serviceCategory || 'Not set')}
                        </Text>
                    </View>
                    {profile?.serviceSubcategory && (
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Subcategory</Text>
                            <Text style={styles.infoValue}>{profile.serviceSubcategory}</Text>
                        </View>
                    )}
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Rating</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <MaterialCommunityIcons name="star" size={14} color="#FFD700" style={{ marginRight: 2 }} />
                            <Text style={styles.infoValue}>{displayRating.toFixed(1)}</Text>
                        </View>
                    </View>
                    <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
                        <Text style={styles.infoLabel}>Total Jobs</Text>
                        <Text style={styles.infoValue}>{displayTotalJobs}</Text>
                    </View>
                </View>

                {/* KYC Status Banner */}
                {kycStatus !== KYC_STATUS.APPROVED && (
                    <TouchableOpacity style={styles.kycBanner} onPress={() => navigation.navigate(ROUTES.PROFILE_TAB as any, { screen: ROUTES.KYC })}>
                        <View style={styles.kycBannerLeft}>
                            <MaterialCommunityIcons name="alert-circle-outline" size={24} color={COLORS.accent} style={styles.kycBannerIcon} />
                            <View>
                                <Text style={styles.kycBannerTitle}>KYC {getKycStatusLabel(kycStatus)}</Text>
                                <Text style={styles.kycBannerSubtext}>Complete verification to accept jobs</Text>
                            </View>
                        </View>
                        <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.accent} />
                    </TouchableOpacity>
                )}

                {/* Menu Items */}
                <View style={styles.menuContainer}>
                    {menuItems.map((item, index) => (
                        <TouchableOpacity key={index} style={styles.menuItem}
                            onPress={() => item.route && (
                                item.route === ROUTES.KYC 
                                ? navigation.navigate(ROUTES.PROFILE_TAB as any, { screen: ROUTES.KYC })
                                : navigation.navigate(item.route)
                            )}>
                            <MaterialCommunityIcons name={item.icon as any} size={22} color={COLORS.gray600} style={styles.menuIcon} />
                            <Text style={styles.menuLabel}>{item.label}</Text>
                            {item.badge && <View style={styles.menuBadge} />}
                            <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.gray400} />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Logout */}
                <PrimaryButton title="Logout" onPress={handleLogout} variant="outline" fullWidth style={{ marginTop: SPACING.lg }} />

                {/* Version */}
                <Text style={styles.versionText}>Version 1.0.0</Text>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: COLORS.gray50 },
    container: { flex: 1 },
    contentContainer: { padding: SPACING.base, paddingBottom: SPACING['2xl'] },
    headerTitle: { fontSize: FONT_SIZE['2xl'], fontWeight: '700', color: COLORS.gray900, marginBottom: SPACING.lg },
    profileCard: { backgroundColor: COLORS.white, borderRadius: 16, padding: SPACING.base, flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.base },
    avatarContainer: { width: 64, height: 64, borderRadius: 32, backgroundColor: COLORS.primary + '20', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
    avatarImage: { width: 64, height: 64 },
    avatarText: { fontSize: FONT_SIZE['2xl'], fontWeight: '700', color: COLORS.primary },
    profileInfo: { flex: 1, marginLeft: SPACING.md },
    profileName: { fontSize: FONT_SIZE.lg, fontWeight: '600', color: COLORS.gray900 },
    profilePhone: { fontSize: FONT_SIZE.sm, color: COLORS.gray500, marginTop: 2 },
    editButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.gray100, justifyContent: 'center', alignItems: 'center' },
    editButtonText: { fontSize: 16 },
    infoCard: { backgroundColor: COLORS.white, borderRadius: 16, padding: SPACING.base, marginBottom: SPACING.base },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.gray100 },
    infoLabel: { fontSize: FONT_SIZE.sm, color: COLORS.gray500 },
    infoValue: { fontSize: FONT_SIZE.sm, fontWeight: '600', color: COLORS.gray800 },
    kycBanner: { backgroundColor: COLORS.accent + '15', borderRadius: 12, padding: SPACING.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.base },
    kycBannerLeft: { flexDirection: 'row', alignItems: 'center' },
    kycBannerIcon: { marginRight: SPACING.sm },
    kycBannerTitle: { fontSize: FONT_SIZE.sm, fontWeight: '600', color: COLORS.gray800 },
    kycBannerSubtext: { fontSize: FONT_SIZE.xs, color: COLORS.gray500 },
    menuContainer: { backgroundColor: COLORS.white, borderRadius: 16, overflow: 'hidden' },
    menuItem: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.gray100 },
    menuIcon: { marginRight: SPACING.md },
    menuLabel: { flex: 1, fontSize: FONT_SIZE.base, color: COLORS.gray800 },
    menuBadge: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.danger, marginRight: SPACING.sm },
    versionText: { fontSize: FONT_SIZE.xs, color: COLORS.gray400, textAlign: 'center', marginTop: SPACING.lg },
});

export default ProfileScreen;
