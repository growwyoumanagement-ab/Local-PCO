// src/screens/ProviderDetailScreen.tsx
// Comprehensive partner profile and booking details screen

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Linking,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useAppDispatch, useAppSelector, selectDraftRequest } from '../store';
import { setDraftService, setDraftPartner } from '../store/requestSlice';
import { Card, Button, BookingStepHeader } from '../components';
import { COLORS, SPACING, FONT_SIZE, RADIUS, SHADOWS, ROUTES } from '../utils/constants';

type RouteParams = {
    ProviderDetail: {
        provider: {
            _id?: string;
            id: string;
            name: string;
            phone: string;
            rating?: number;
            totalJobs?: number;
            isAvailable?: boolean;
            category?: string;
            avatar?: string;
            address?: string;
        };
        categoryId?: string;
        categoryName?: string;
    };
};

export const ProviderDetailScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<RouteProp<RouteParams, 'ProviderDetail'>>();
    const dispatch = useAppDispatch();
    const draft = useAppSelector(selectDraftRequest);

    const { provider, categoryId, categoryName } = route.params || {};

    if (!provider) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.notFound}>
                    <Text style={styles.notFoundText}>Partner details not found.</Text>
                    <Button title="Go Back" onPress={() => navigation.goBack()} />
                </View>
            </SafeAreaView>
        );
    }

    const handleCall = () => {
        if (!provider.phone) {
            Alert.alert('No Contact Number', 'This partner has not provided a contact number.');
            return;
        }
        Linking.openURL(`tel:${provider.phone}`);
    };

    const handleBookNow = () => {
        const partnerId = provider._id || provider.id;
        if (!partnerId || !/^[0-9a-fA-F]{24}$/.test(partnerId)) {
            Alert.alert('Invalid Partner', 'Please select a valid partner from the list.');
            return;
        }

        const serviceName = categoryName || 'General Service';
        dispatch(setDraftService({ id: categoryId || 'general', name: serviceName }));
        dispatch(setDraftPartner(partnerId));

        if (!draft.address) {
            navigation.navigate(ROUTES.ADDRESS_PICKER, {
                providerId: partnerId,
                providerName: provider.name,
                isAvailable: provider.isAvailable ?? true,
            });
        } else {
            navigation.navigate(ROUTES.CREATE_REQUEST, {
                providerId: partnerId,
                providerName: provider.name,
                isAvailable: provider.isAvailable ?? true,
            });
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Custom Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.gray900} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Partner Profile</Text>
                <View style={{ width: 24 }} />
            </View>

            {/* Step Indicator */}
            <BookingStepHeader currentStep={1} />

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Hero Avatar Card */}
                <Card style={styles.heroCard}>
                    <View style={styles.avatarCircle}>
                        <Text style={styles.avatarText}>
                            {provider.name?.charAt(0).toUpperCase() || 'P'}
                        </Text>
                    </View>
                    <Text style={styles.providerName}>{provider.name}</Text>
                    <Text style={styles.categoryLabel}>{categoryName || 'Service Specialist'}</Text>

                    {/* Status Badge */}
                    <View style={[styles.statusBadge, provider.isAvailable === false && styles.statusOffline]}>
                        <View style={[styles.statusDot, provider.isAvailable === false && styles.statusDotOffline]} />
                        <Text style={[styles.statusBadgeText, provider.isAvailable === false && styles.statusBadgeTextOffline]}>
                            {provider.isAvailable === false ? 'Currently Busy' : 'Available Now'}
                        </Text>
                    </View>

                    {/* Stats Row */}
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <View style={styles.statIconBox}>
                                <Ionicons name="star" size={18} color="#EAB308" />
                            </View>
                            <Text style={styles.statValue}>{(provider.rating || 4.8).toFixed(1)}</Text>
                            <Text style={styles.statLabel}>Rating</Text>
                        </View>

                        <View style={styles.statDivider} />

                        <View style={styles.statItem}>
                            <View style={styles.statIconBox}>
                                <Ionicons name="briefcase" size={18} color={COLORS.primary} />
                            </View>
                            <Text style={styles.statValue}>{provider.totalJobs || 24}+</Text>
                            <Text style={styles.statLabel}>Jobs Completed</Text>
                        </View>

                        <View style={styles.statDivider} />

                        <View style={styles.statItem}>
                            <View style={styles.statIconBox}>
                                <Ionicons name="checkmark-circle" size={18} color={COLORS.success} />
                            </View>
                            <Text style={styles.statValue}>100%</Text>
                            <Text style={styles.statLabel}>Verified</Text>
                        </View>
                    </View>
                </Card>

                {/* Service Offerings Card */}
                <Card style={styles.detailsCard}>
                    <Text style={styles.cardSectionTitle}>Contact & Info</Text>
                    
                    <View style={styles.infoRow}>
                        <Ionicons name="call-outline" size={20} color={COLORS.primary} style={styles.infoIcon} />
                        <View style={styles.infoTextContainer}>
                            <Text style={styles.infoLabel}>Phone Number</Text>
                            <Text style={styles.infoValue}>{provider.phone || 'Not shared'}</Text>
                        </View>
                    </View>

                    <View style={styles.infoRow}>
                        <Ionicons name="shield-checkmark-outline" size={20} color={COLORS.primary} style={styles.infoIcon} />
                        <View style={styles.infoTextContainer}>
                            <Text style={styles.infoLabel}>KYC Status</Text>
                            <Text style={styles.infoValue}>Government ID Verified</Text>
                        </View>
                    </View>
                </Card>
            </ScrollView>

            {/* Bottom Action Footer */}
            <View style={styles.bottomFooter}>
                <TouchableOpacity style={styles.callIconBtn} onPress={handleCall}>
                    <Ionicons name="call" size={22} color={COLORS.primary} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.bookBtn} onPress={handleBookNow}>
                    <Text style={styles.bookBtnText}>Book Service Now</Text>
                    <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.base,
        paddingVertical: SPACING.md,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gray100,
    },
    backButton: {
        padding: SPACING.xs,
    },
    headerTitle: {
        fontSize: FONT_SIZE.lg,
        fontWeight: '700',
        color: COLORS.gray900,
    },
    content: {
        padding: SPACING.base,
        paddingBottom: 100,
    },
    heroCard: {
        alignItems: 'center',
        paddingVertical: SPACING.xl,
        marginBottom: SPACING.lg,
    },
    avatarCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.md,
        ...SHADOWS.md,
    },
    avatarText: {
        fontSize: 32,
        fontWeight: '800',
        color: COLORS.white,
    },
    providerName: {
        fontSize: FONT_SIZE.xl,
        fontWeight: '800',
        color: COLORS.gray900,
        marginBottom: SPACING.xs,
    },
    categoryLabel: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.gray500,
        marginBottom: SPACING.md,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primaryBg,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.xs + 2,
        borderRadius: RADIUS.full,
        marginBottom: SPACING.xl,
    },
    statusOffline: {
        backgroundColor: '#FEF2F2',
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.success,
        marginRight: 6,
    },
    statusDotOffline: {
        backgroundColor: COLORS.danger,
    },
    statusBadgeText: {
        fontSize: FONT_SIZE.xs + 1,
        fontWeight: '700',
        color: COLORS.primaryDark,
    },
    statusBadgeTextOffline: {
        color: COLORS.danger,
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        paddingTop: SPACING.md,
        borderTopWidth: 1,
        borderTopColor: COLORS.gray100,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statIconBox: {
        marginBottom: 4,
    },
    statValue: {
        fontSize: FONT_SIZE.md,
        fontWeight: '800',
        color: COLORS.gray900,
    },
    statLabel: {
        fontSize: FONT_SIZE.xs,
        color: COLORS.gray500,
        marginTop: 2,
    },
    statDivider: {
        width: 1,
        height: 32,
        backgroundColor: COLORS.gray200,
    },
    detailsCard: {
        padding: SPACING.lg,
    },
    cardSectionTitle: {
        fontSize: FONT_SIZE.md,
        fontWeight: '700',
        color: COLORS.gray800,
        marginBottom: SPACING.lg,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    infoIcon: {
        marginRight: SPACING.md,
    },
    infoTextContainer: {
        flex: 1,
    },
    infoLabel: {
        fontSize: FONT_SIZE.xs,
        color: COLORS.gray400,
        textTransform: 'uppercase',
        fontWeight: '600',
    },
    infoValue: {
        fontSize: FONT_SIZE.base,
        color: COLORS.gray800,
        fontWeight: '600',
        marginTop: 2,
    },
    bottomFooter: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: COLORS.white,
        paddingHorizontal: SPACING.base,
        paddingVertical: SPACING.md,
        flexDirection: 'row',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: COLORS.gray100,
        ...SHADOWS.lg,
    },
    callIconBtn: {
        width: 52,
        height: 52,
        borderRadius: RADIUS.lg,
        backgroundColor: COLORS.primaryBg,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.primaryLight,
    },
    bookBtn: {
        flex: 1,
        height: 52,
        borderRadius: RADIUS.lg,
        backgroundColor: COLORS.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    bookBtnText: {
        fontSize: FONT_SIZE.md,
        fontWeight: '700',
        color: COLORS.white,
        marginRight: SPACING.sm,
    },
    notFound: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: SPACING.xl,
    },
    notFoundText: {
        fontSize: FONT_SIZE.md,
        color: COLORS.gray600,
        marginBottom: SPACING.lg,
    },
});

export default ProviderDetailScreen;
