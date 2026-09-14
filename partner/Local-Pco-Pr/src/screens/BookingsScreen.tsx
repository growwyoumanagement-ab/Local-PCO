// src/screens/BookingsScreen.tsx
// Bookings screen — all job bookings with All / Active / Completed / Pending tabs

import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    StatusBar,
    ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { COLORS, FONT_SIZE, SPACING, ROUTES, JOB_STATUS } from '../utils/constants';
import { formatCurrency, formatDateTime } from '../utils/helpers';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchJobHistory, fetchPendingRequests, fetchActiveJobs } from '../store/jobSlice';

import StatusBadge from '../components/StatusBadge';
import { PartnerStackParamList } from '../navigation/PartnerStackNavigator';
import { Job } from '../services/jobService';

type BookingsNavigationProp = NativeStackNavigationProp<PartnerStackParamList>;

// FIX #12: Added 'active' tab for in-flight jobs
type TabType = 'all' | 'active' | 'completed' | 'pending';

interface Tab {
    key: TabType;
    label: string;
    icon: string;
    color: string;
    filter: (jobs: Job[]) => Job[];
}

const TABS: Tab[] = [
    {
        key: 'all',
        label: 'All',
        icon: 'format-list-bulleted',
        color: COLORS.primary,
        filter: (jobs) => jobs,
    },
    {
        key: 'active',
        label: 'Active',
        icon: 'lightning-bolt',
        color: COLORS.warning,
        // FIX #9: includes accepted/reached/in_progress — previously invisible
        filter: (jobs) =>
            jobs.filter((j) =>
                [JOB_STATUS.ACCEPTED, JOB_STATUS.REACHED, JOB_STATUS.IN_PROGRESS].includes(j.status as any)
            ),
    },
    {
        key: 'completed',
        label: 'Done',
        icon: 'check-circle-outline',
        color: COLORS.success,
        filter: (jobs) => jobs.filter((j) => j.status === JOB_STATUS.COMPLETED),
    },
    {
        key: 'pending',
        label: 'Pending',
        icon: 'clock-outline',
        color: COLORS.accent,
        filter: (jobs) => jobs.filter((j) => j.status === JOB_STATUS.PENDING),
    },
];

/**
 * Status icon helper — map job status to an icon + color
 */
const getStatusAccent = (status: string) => {
    switch (status) {
        case JOB_STATUS.ACCEPTED:   return { color: COLORS.primary,  icon: 'check-circle'         };
        case JOB_STATUS.REACHED:    return { color: COLORS.accent,   icon: 'map-marker-check'      };
        case JOB_STATUS.IN_PROGRESS:return { color: COLORS.warning,  icon: 'wrench'                };
        case JOB_STATUS.COMPLETED:  return { color: COLORS.success,  icon: 'check-decagram'        };
        case JOB_STATUS.CANCELLED:  return { color: COLORS.danger,   icon: 'close-circle-outline'  };
        default:                    return { color: COLORS.gray400,  icon: 'clock-outline'         };
    }
};

/**
 * BookingsScreen Component
 * Shows all partner bookings across all statuses with tab-based filtering.
 *
 * FIX #9:  Fetches pending + active + history to cover all statuses.
 * FIX #12: Added 'Active' tab so in-flight jobs are always visible.
 */
const BookingsScreen: React.FC = () => {
    const navigation = useNavigation<BookingsNavigationProp>();
    const dispatch = useAppDispatch();

    const { isLoading } = useAppSelector((state) => state.job);

    const [activeTab, setActiveTab] = useState<TabType>('all');
    const [refreshing, setRefreshing] = useState(false);
    const [allBookings, setAllBookings] = useState<Job[]>([]);
    const [error, setError] = useState<string | null>(null);

    /**
     * Load all bookings — pending + active + history (completed/cancelled).
     * FIX #9: Previously only fetched pending + completed. Active jobs were invisible.
     */
    const loadBookings = useCallback(async () => {
        setError(null);
        try {
            const [pendingResult, activeResult, historyResult] = await Promise.all([
                dispatch(fetchPendingRequests()).unwrap(),
                dispatch(fetchActiveJobs()).unwrap(),
                dispatch(fetchJobHistory()).unwrap(),
            ]);

            const combined: Job[] = [
                ...(pendingResult || []),
                ...(activeResult || []),
                ...(historyResult?.jobs || []),
            ];

            // Deduplicate by id (same job shouldn't appear twice)
            const seen = new Set<string>();
            const deduped = combined.filter((job) => {
                const id = job.id?.toString();
                if (!id || seen.has(id)) return false;
                seen.add(id);
                return true;
            });

            // Sort by creation date (newest first)
            deduped.sort((a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );

            setAllBookings(deduped);
        } catch (err: any) {
            console.error('Error loading bookings:', err);
            setError('Failed to load bookings. Pull to refresh.');
        }
    }, [dispatch]);

    // Load on initial mount and whenever screen comes into focus
    useFocusEffect(
        useCallback(() => {
            loadBookings();
        }, [loadBookings])
    );

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadBookings();
        setRefreshing(false);
    };

    const handleBookingPress = (job: Job) => {
        navigation.navigate(ROUTES.JOB_DETAIL, { jobId: job.id?.toString() });
    };

    const currentTab = TABS.find((t) => t.key === activeTab)!;
    const filteredBookings = currentTab.filter(allBookings);

    const getTabCount = (tab: Tab) => tab.filter(allBookings).length;

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>Bookings</Text>
                    <Text style={styles.headerSubtitle}>
                        {allBookings.length} total · {getTabCount(TABS[1])} active
                    </Text>
                </View>
                {isLoading && !refreshing && (
                    <ActivityIndicator size="small" color={COLORS.primary} />
                )}
            </View>

            {/* Tab Bar — FIX #12 */}
            <View style={styles.tabContainer}>
                {TABS.map((tab) => {
                    const isActive = activeTab === tab.key;
                    const count = getTabCount(tab);
                    return (
                        <TouchableOpacity
                            key={tab.key}
                            style={[styles.tab, isActive && { borderBottomColor: tab.color, borderBottomWidth: 2 }]}
                            onPress={() => setActiveTab(tab.key)}
                            activeOpacity={0.7}
                        >
                            <MaterialCommunityIcons
                                name={tab.icon as any}
                                size={16}
                                color={isActive ? tab.color : COLORS.gray400}
                                style={styles.tabIcon}
                            />
                            <Text style={[styles.tabText, isActive && { color: tab.color }]}>
                                {tab.label}
                            </Text>
                            {count > 0 && (
                                <View style={[styles.tabBadge, isActive && { backgroundColor: tab.color }]}>
                                    <Text style={[styles.tabBadgeText, isActive && styles.tabBadgeTextActive]}>
                                        {count}
                                    </Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* Booking List */}
            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.contentContainer}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={[COLORS.primary]}
                        tintColor={COLORS.primary}
                    />
                }
                showsVerticalScrollIndicator={false}
            >
                {/* Error state */}
                {error && (
                    <View style={styles.errorBanner}>
                        <MaterialCommunityIcons name="wifi-off" size={16} color={COLORS.danger} />
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                )}

                {filteredBookings.length > 0 ? (
                    filteredBookings.map((job, index) => {
                        const accent = getStatusAccent(job.status);
                        const isActiveJob = [JOB_STATUS.ACCEPTED, JOB_STATUS.REACHED, JOB_STATUS.IN_PROGRESS].includes(
                            job.status as any
                        );
                        return (
                            <TouchableOpacity
                                key={job.id?.toString() || `job-${index}`}
                                style={[styles.bookingCard, isActiveJob && styles.bookingCardActive]}
                                onPress={() => handleBookingPress(job)}
                                activeOpacity={0.75}
                            >
                                {/* Active pulse stripe */}
                                {isActiveJob && <View style={[styles.activeStripe, { backgroundColor: accent.color }]} />}

                                <View style={styles.bookingHeader}>
                                    {/* Service icon */}
                                    <View style={[styles.serviceIcon, { backgroundColor: accent.color + '18' }]}>
                                        <Text style={[styles.serviceIconText, { color: accent.color }]}>
                                            {job.serviceType?.charAt(0).toUpperCase() || 'S'}
                                        </Text>
                                    </View>

                                    <View style={styles.bookingInfo}>
                                        <Text style={styles.serviceName} numberOfLines={1}>
                                            {job.serviceType || 'Service'}
                                        </Text>
                                        <Text style={styles.clientName} numberOfLines={1}>
                                            {job.clientName || 'Unknown Client'}
                                        </Text>
                                    </View>

                                    <StatusBadge status={job.status} variant="job" />
                                </View>

                                <View style={styles.bookingMeta}>
                                    <View style={styles.metaRow}>
                                        <MaterialCommunityIcons name="calendar-outline" size={13} color={COLORS.gray400} />
                                        <Text style={styles.metaText}>{formatDateTime(job.createdAt)}</Text>
                                    </View>
                                    {job.estimatedPrice > 0 && (
                                        <Text style={styles.priceText}>{formatCurrency(job.estimatedPrice)}</Text>
                                    )}
                                </View>

                                {job.pickupAddress && job.pickupAddress !== 'Address not available' && (
                                    <View style={styles.addressRow}>
                                        <MaterialCommunityIcons name="map-marker-outline" size={13} color={COLORS.gray400} />
                                        <Text style={styles.addressText} numberOfLines={1}>
                                            {job.pickupAddress}
                                        </Text>
                                    </View>
                                )}

                                {/* CTA chip for active jobs */}
                                {isActiveJob && (
                                    <View style={[styles.activeCta, { backgroundColor: accent.color + '18' }]}>
                                        <MaterialCommunityIcons name={accent.icon as any} size={14} color={accent.color} />
                                        <Text style={[styles.activeCtaText, { color: accent.color }]}>
                                            Tap to continue job
                                        </Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        );
                    })
                ) : (
                    <View style={styles.emptyState}>
                        <MaterialCommunityIcons
                            name="clipboard-text-multiple-outline"
                            size={64}
                            color={COLORS.gray200}
                            style={styles.emptyIcon}
                        />
                        <Text style={styles.emptyTitle}>No bookings found</Text>
                        <Text style={styles.emptySubtitle}>
                            {activeTab === 'active'    && 'No jobs in progress right now'}
                            {activeTab === 'completed' && "You haven't completed any jobs yet"}
                            {activeTab === 'pending'   && 'No pending jobs at the moment'}
                            {activeTab === 'all'       && 'Start accepting jobs to see them here'}
                        </Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.gray50,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: COLORS.white,
        paddingHorizontal: SPACING.base,
        paddingTop: SPACING.md,
        paddingBottom: SPACING.base,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gray100,
    },
    headerTitle: {
        fontSize: FONT_SIZE['2xl'],
        fontWeight: '700',
        color: COLORS.gray900,
    },
    headerSubtitle: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.gray500,
        marginTop: 2,
    },
    // --- Tab bar ---
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gray100,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: SPACING.md,
        paddingHorizontal: 4,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    tabIcon: {
        marginRight: 4,
    },
    tabText: {
        fontSize: FONT_SIZE.sm,
        fontWeight: '600',
        color: COLORS.gray400,
    },
    tabBadge: {
        marginLeft: 4,
        backgroundColor: COLORS.gray200,
        paddingHorizontal: 5,
        paddingVertical: 1,
        borderRadius: 8,
        minWidth: 18,
        alignItems: 'center',
    },
    tabBadgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: COLORS.gray600,
    },
    tabBadgeTextActive: {
        color: COLORS.white,
    },
    // --- List ---
    container: {
        flex: 1,
    },
    contentContainer: {
        padding: SPACING.base,
        paddingBottom: SPACING['2xl'],
    },
    errorBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.danger + '12',
        borderRadius: 10,
        padding: SPACING.md,
        marginBottom: SPACING.md,
        gap: SPACING.sm,
    },
    errorText: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.danger,
        flex: 1,
    },
    // --- Cards ---
    bookingCard: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: SPACING.base,
        marginBottom: SPACING.md,
        overflow: 'hidden',
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    bookingCardActive: {
        borderWidth: 1,
        borderColor: COLORS.warning + '30',
        shadowColor: COLORS.warning,
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
    },
    activeStripe: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 4,
        borderTopLeftRadius: 16,
        borderBottomLeftRadius: 16,
    },
    bookingHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.sm,
        paddingLeft: 8, // account for active stripe
    },
    serviceIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.md,
    },
    serviceIconText: {
        fontSize: FONT_SIZE.lg,
        fontWeight: '700',
    },
    bookingInfo: {
        flex: 1,
    },
    serviceName: {
        fontSize: FONT_SIZE.md,
        fontWeight: '600',
        color: COLORS.gray900,
        marginBottom: 2,
    },
    clientName: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.gray500,
    },
    bookingMeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: SPACING.sm,
        borderTopWidth: 1,
        borderTopColor: COLORS.gray100,
        paddingLeft: 8,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    metaText: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.gray500,
    },
    priceText: {
        fontSize: FONT_SIZE.md,
        fontWeight: '600',
        color: COLORS.secondary,
    },
    addressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: SPACING.sm,
        paddingLeft: 8,
        gap: 4,
    },
    addressText: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.gray400,
        flex: 1,
    },
    activeCta: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: SPACING.sm,
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.md,
        borderRadius: 8,
        gap: SPACING.xs,
        marginLeft: 8,
        alignSelf: 'flex-start',
    },
    activeCtaText: {
        fontSize: FONT_SIZE.sm,
        fontWeight: '600',
    },
    // --- Empty ---
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: SPACING['4xl'],
    },
    emptyIcon: {
        marginBottom: SPACING.base,
    },
    emptyTitle: {
        fontSize: FONT_SIZE.lg,
        fontWeight: '600',
        color: COLORS.gray700,
        marginBottom: SPACING.xs,
    },
    emptySubtitle: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.gray400,
        textAlign: 'center',
        paddingHorizontal: SPACING['2xl'],
    },
});

export default BookingsScreen;
