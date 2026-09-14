// src/screens/ProfileScreen.tsx
// Redesigned modern profile & account settings screen — UI God level

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector, selectCurrentUser, selectProfile, selectSavedAddresses } from '../store';
import { logout } from '../store/authSlice';
import { authService } from '../services/authService';
import { fetchProfile, resetProfile, updateProfile } from '../store/profileSlice';
import { pushNotificationService } from '../services/pushNotificationService';
import { Card, Button, Input } from '../components';
import { useBannerScroll } from '../context/BannerScrollContext';
import { COLORS, SPACING, FONT_SIZE, RADIUS, SHADOWS, ROUTES } from '../utils/constants';

import * as ImagePicker from 'expo-image-picker';

export const ProfileScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const dispatch = useAppDispatch();
    const { onScroll } = useBannerScroll();

    const user = useAppSelector(selectCurrentUser);
    const profile = useAppSelector(selectProfile);
    const savedAddresses = useAppSelector(selectSavedAddresses);
    const isUpdating = useAppSelector((state) => state.profile.isUpdating);

    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(user?.name || profile?.name || '');
    const [email, setEmail] = useState(user?.email || profile?.email || '');
    const [avatar, setAvatar] = useState<string | null>((profile as any)?.avatar || (user as any)?.avatar || null);

    useEffect(() => {
        dispatch(fetchProfile());
    }, [dispatch]);

    useEffect(() => {
        if (profile || user) {
            setName(profile?.name || user?.name || '');
            setEmail(profile?.email || user?.email || '');
            setAvatar((profile as any)?.avatar || (user as any)?.avatar || null);
        }
    }, [profile, user]);

    const handleLogout = () => {
        Alert.alert(
            'Logout Account',
            'Are you sure you want to logout from Local PCO?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Yes, Logout',
                    style: 'destructive',
                    onPress: async () => {
                        await pushNotificationService.clearToken();
                        await authService.logout();
                        dispatch(logout());
                        dispatch(resetProfile());
                    },
                },
            ]
        );
    };

    const handlePickImage = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Gallery permission is required to update profile picture');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: false,
                quality: 0.4,
                base64: true,
            });

            if (!result.canceled && result.assets && result.assets[0].base64) {
                const base64Img = `data:image/jpeg;base64,${result.assets[0].base64}`;
                setAvatar(base64Img);
            }
        } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to select image');
        }
    };

    const handleSave = async () => {
        try {
            await dispatch(updateProfile({ name, email, avatar: avatar || undefined })).unwrap();
            setIsEditing(false);
            Alert.alert('Success', 'Profile details updated successfully');
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to update profile');
        }
    };

    const menuItems = [
        {
            icon: 'location',
            color: '#0F766E',
            bg: '#E0F2F1',
            label: 'Saved Addresses',
            subtitle: `${savedAddresses.length > 0 ? `${savedAddresses.length} saved` : 'Manage home & work locations'}`,
            onPress: () => navigation.navigate(ROUTES.SAVED_ADDRESSES),
        },
        {
            icon: 'calendar',
            color: '#D97706',
            bg: '#FEF3C7',
            label: 'My Bookings',
            subtitle: 'View active & completed orders',
            onPress: () => navigation.navigate(ROUTES.HISTORY_TAB),
        },
        {
            icon: 'help-buoy',
            color: '#0284C7',
            bg: '#E0F7FA',
            label: 'Help & Support',
            subtitle: '24/7 customer care & FAQs',
            onPress: () => navigation.navigate(ROUTES.HELP_SUPPORT as any),
        },
        {
            icon: 'shield-checkmark',
            color: '#9333EA',
            bg: '#F3E8FF',
            label: 'Terms & Privacy',
            subtitle: 'Usage policy & data security',
            onPress: () => navigation.navigate(ROUTES.TERMS_CONDITIONS as any),
        },
        {
            icon: 'information-circle',
            color: '#64748B',
            bg: '#F1F5F9',
            label: 'About Local PCO',
            subtitle: 'App version & brand info',
            onPress: () => navigation.navigate(ROUTES.ABOUT as any),
        },
    ];

    const displayName = profile?.name || user?.name || 'Valued User';
    const displayPhone = profile?.phone || user?.phone || '+91 9876543210';
    const displayEmail = profile?.email || user?.email || 'Add email address';
    const userInitial = displayName.charAt(0).toUpperCase();

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.content}
                onScroll={onScroll}
                scrollEventThrottle={16}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* Hero Account Card */}
                <View style={styles.heroProfileCard}>
                    <View style={styles.heroHeaderRow}>
                        <Text style={styles.heroTitle}>Account & Settings 👤</Text>
                        {!isEditing && (
                            <TouchableOpacity
                                style={styles.editIconBtn}
                                onPress={() => setIsEditing(true)}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="pencil" size={16} color={COLORS.white} />
                                <Text style={styles.editBtnText}>Edit</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    <View style={styles.profileHeroContent}>
                        <TouchableOpacity onPress={isEditing ? handlePickImage : undefined} activeOpacity={isEditing ? 0.7 : 1}>
                            <View style={styles.avatarGlow}>
                                {avatar ? (
                                    <Image source={{ uri: avatar }} style={{ width: 68, height: 68, borderRadius: 34 }} />
                                ) : (
                                    <Text style={styles.avatarText}>{userInitial}</Text>
                                )}
                                {isEditing && (
                                    <View style={{ position: 'absolute', bottom: 0, right: 0, backgroundColor: COLORS.primary, borderRadius: 10, padding: 3 }}>
                                        <Ionicons name="camera" size={12} color={COLORS.white} />
                                    </View>
                                )}
                            </View>
                        </TouchableOpacity>

                        <View style={styles.profileTextInfo}>
                            <Text style={styles.userNameText}>{displayName}</Text>
                            <View style={styles.phoneBadgeRow}>
                                <Ionicons name="checkmark-circle" size={14} color="#4ADE80" />
                                <Text style={styles.phoneText}>{displayPhone}</Text>
                            </View>
                            <Text style={styles.emailText} numberOfLines={1}>{displayEmail}</Text>
                        </View>
                    </View>
                </View>

                {/* Edit Profile Form (Inline when editing) */}
                {isEditing && (
                    <Card style={styles.editCard}>
                        <Text style={styles.editCardTitle}>Edit Profile Information</Text>
                        <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }} onPress={handlePickImage}>
                            <Ionicons name="image-outline" size={20} color={COLORS.primary} />
                            <Text style={{ color: COLORS.primary, fontWeight: '600', fontSize: FONT_SIZE.sm }}>Change Profile Photo</Text>
                        </TouchableOpacity>
                        <Input
                            label="Full Name"
                            value={name}
                            onChangeText={setName}
                            placeholder="Enter your full name"
                        />
                        <Input
                            label="Email Address (Optional)"
                            value={email}
                            onChangeText={setEmail}
                            placeholder="Enter your email"
                            keyboardType="email-address"
                        />
                        <View style={styles.editFormButtons}>
                            <Button
                                title="Cancel"
                                onPress={() => {
                                    setIsEditing(false);
                                    setName(displayName);
                                    setEmail(displayEmail);
                                }}
                                variant="outline"
                                style={styles.cancelBtn}
                            />
                            <Button
                                title="Save Changes"
                                onPress={handleSave}
                                loading={isUpdating}
                                style={styles.saveBtn}
                            />
                        </View>
                    </Card>
                )}

                {/* Menu Options Group */}
                <View style={styles.menuCard}>
                    {menuItems.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.menuItem,
                                index < menuItems.length - 1 && styles.menuItemBorder,
                            ]}
                            onPress={item.onPress}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.menuIconBox, { backgroundColor: item.bg }]}>
                                <Ionicons name={item.icon as any} size={20} color={item.color} />
                            </View>
                            <View style={styles.menuTextGroup}>
                                <Text style={styles.menuLabel}>{item.label}</Text>
                                <Text style={styles.menuSublabel}>{item.subtitle}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color={COLORS.gray400} />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Logout Button */}
                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
                    <Ionicons name="log-out-outline" size={20} color={COLORS.danger} />
                    <Text style={styles.logoutBtnText}>Logout Account</Text>
                </TouchableOpacity>

                {/* App Version Info */}
                <Text style={styles.versionText}>Local PCO v1.0.0 (Build 102)</Text>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scroll: {
        flex: 1,
    },
    content: {
        padding: SPACING.base,
        paddingBottom: SPACING['4xl'],
    },

    // ── Hero Profile Card ──
    heroProfileCard: {
        backgroundColor: COLORS.primaryDark,
        borderRadius: RADIUS['2xl'],
        padding: SPACING.lg,
        marginTop: SPACING.xs,
        marginBottom: SPACING.lg,
        ...SHADOWS.md,
    },
    heroHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    heroTitle: {
        fontSize: FONT_SIZE.lg,
        fontWeight: '900',
        color: COLORS.white,
        letterSpacing: -0.3,
    },
    editIconBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: SPACING.md,
        paddingVertical: 5,
        borderRadius: RADIUS.full,
        gap: 4,
    },
    editBtnText: {
        fontSize: FONT_SIZE.xs + 1,
        fontWeight: '700',
        color: COLORS.white,
    },
    profileHeroContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarGlow: {
        width: 68,
        height: 68,
        borderRadius: 34,
        backgroundColor: COLORS.white,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.md,
        borderWidth: 3,
        borderColor: COLORS.primaryLight,
        ...SHADOWS.sm,
    },
    avatarText: {
        fontSize: 28,
        fontWeight: '900',
        color: COLORS.primaryDark,
    },
    profileTextInfo: {
        flex: 1,
    },
    userNameText: {
        fontSize: FONT_SIZE.lg,
        fontWeight: '900',
        color: COLORS.white,
        letterSpacing: -0.3,
    },
    phoneBadgeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 2,
    },
    phoneText: {
        fontSize: FONT_SIZE.xs + 1,
        fontWeight: '700',
        color: 'rgba(255, 255, 255, 0.9)',
    },
    emailText: {
        fontSize: FONT_SIZE.xs,
        color: 'rgba(255, 255, 255, 0.7)',
        marginTop: 2,
    },

    // ── Edit Card ──
    editCard: {
        marginBottom: SPACING.lg,
        borderRadius: RADIUS.xl,
    },
    editCardTitle: {
        fontSize: FONT_SIZE.base,
        fontWeight: '800',
        color: COLORS.gray900,
        marginBottom: SPACING.sm,
    },
    editFormButtons: {
        flexDirection: 'row',
        marginTop: SPACING.md,
    },
    cancelBtn: {
        flex: 1,
        marginRight: SPACING.xs,
    },
    saveBtn: {
        flex: 1,
        marginLeft: SPACING.xs,
    },

    // ── Menu Options Card ──
    menuCard: {
        backgroundColor: COLORS.white,
        borderRadius: RADIUS['2xl'],
        marginBottom: SPACING.lg,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: COLORS.gray100,
        ...SHADOWS.sm,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.base,
    },
    menuItemBorder: {
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gray100,
    },
    menuIconBox: {
        width: 42,
        height: 42,
        borderRadius: RADIUS.xl,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.md,
    },
    menuTextGroup: {
        flex: 1,
    },
    menuLabel: {
        fontSize: FONT_SIZE.base,
        fontWeight: '800',
        color: COLORS.gray900,
    },
    menuSublabel: {
        fontSize: FONT_SIZE.xs + 1,
        color: COLORS.gray500,
        marginTop: 1,
    },

    // ── Logout Button ──
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FEE2E2',
        paddingVertical: SPACING.md,
        borderRadius: RADIUS.xl,
        marginBottom: SPACING.lg,
        gap: SPACING.xs,
    },
    logoutBtnText: {
        fontSize: FONT_SIZE.sm + 1,
        fontWeight: '800',
        color: COLORS.danger,
    },
    versionText: {
        fontSize: FONT_SIZE.xs,
        color: COLORS.gray400,
        textAlign: 'center',
        fontWeight: '600',
    },
});

export default ProfileScreen;
