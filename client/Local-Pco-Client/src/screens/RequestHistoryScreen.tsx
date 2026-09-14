import React, { useState, useMemo, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAppDispatch, useAppSelector, selectRequestHistory } from '../store';
import { fetchRequestHistory } from '../store/requestSlice';
import { RequestCard, EmptyState, RequestCardSkeleton } from '../components';
import { useBannerScroll } from '../context/BannerScrollContext';
import { COLORS, SPACING, FONT_SIZE, RADIUS, SHADOWS, ROUTES } from '../utils/constants';

type FilterType = 'all' | 'pending' | 'completed' | 'cancelled';

const FILTERS: { key: FilterType; label: string; icon: string }[] = [
    { key: 'all', label: 'All', icon: 'apps' },
    { key: 'pending', label: 'Active', icon: 'flash' },
    { key: 'completed', label: 'Completed', icon: 'checkmark-circle' },
    { key: 'cancelled', label: 'Cancelled', icon: 'close-circle' },
];

export const RequestHistoryScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const dispatch = useAppDispatch();
    const { onScroll } = useBannerScroll();

    const requestHistory = useAppSelector(selectRequestHistory);
    const isLoading = useAppSelector((state) => state.request.isLoading);

    const [filter, setFilter] = useState<FilterType>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [refreshing, setRefreshing] = useState(false);

    const isBookingActive = (status?: string) => {
        const s = status?.toLowerCase();
        return s === 'pending' || s === 'in_progress' || s === 'accepted' || s === 'reached' || s === 'arrived' || s === 'en_route' || s === 'assigned' || s === 'confirmed';
    };

    const loadData = useCallback(async () => {
        await dispatch(fetchRequestHistory({}));
    }, [dispatch]);

    useFocusEffect(
        useCallback(() => {
            loadData();
            // Polling interval for live status updates from Admin/Partner app
            const interval = setInterval(() => {
                loadData();
            }, 4000);
            return () => clearInterval(interval);
        }, [loadData])
    );

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    const handleViewDetail = (requestId: string) => {
        navigation.navigate(ROUTES.REQUEST_DETAIL, { requestId });
    };

    // Calculate booking counts
    const stats = useMemo(() => {
        const total = requestHistory.length;
        const active = requestHistory.filter((r) => isBookingActive(r.status)).length;
        const completed = requestHistory.filter((r) => r.status === 'completed').length;
        return { total, active, completed };
    }, [requestHistory]);

    // Filter and search logic
    const filteredHistory = useMemo(() => {
        let list = filter === 'all'
            ? requestHistory
            : requestHistory.filter((r) => {
                if (filter === 'pending') {
                    return isBookingActive(r.status);
                }
                return r.status === filter;
            });

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase().trim();
            list = list.filter(
                (r) =>
                    r.serviceName?.toLowerCase().includes(query) ||
                    r.partnerName?.toLowerCase().includes(query) ||
                    r.id?.toLowerCase().includes(query)
            );
        }

        return list;
    }, [requestHistory, filter, searchQuery]);

    const handleBack = () => {
        if (navigation.canGoBack()) {
            navigation.goBack();
        } else {
            navigation.navigate(ROUTES.HOME_TAB || 'Home');
        }
    };

    const renderItem = ({ item }: { item: typeof requestHistory[0] }) => {
        const isActive = isBookingActive(item.status);
        return (
            <RequestCard
                request={item}
                onPress={() => handleViewDetail(item.id)}
                isActive={isActive}
            />
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Top Stat Hero Card */}
            <View style={styles.heroCard}>
                <View style={styles.heroHeaderRow}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <TouchableOpacity
                            onPress={handleBack}
                            style={{ padding: 4 }}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <Ionicons name="arrow-back" size={22} color={COLORS.white} />
                        </TouchableOpacity>
                        <View>
                            <Text style={styles.heroTitle}>My Bookings 📋</Text>
                            <Text style={styles.heroSubTitle}>Track service orders & history</Text>
                        </View>
                    </View>
                    <TouchableOpacity
                        style={styles.refreshIconBtn}
                        onPress={handleRefresh}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="refresh" size={18} color={COLORS.white} />
                    </TouchableOpacity>
                </View>

                {/* Stat Counters */}
                <View style={styles.statsContainer}>
                    <View style={styles.statBox}>
                        <Text style={styles.statNumber}>{stats.total}</Text>
                        <Text style={styles.statLabel}>Total</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statBox}>
                        <Text style={[styles.statNumber, { color: '#FDE047' }]}>{stats.active}</Text>
                        <Text style={styles.statLabel}>Active ⚡</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statBox}>
                        <Text style={[styles.statNumber, { color: '#4ADE80' }]}>{stats.completed}</Text>
                        <Text style={styles.statLabel}>Completed</Text>
                    </View>
                </View>
            </View>

            {/* Live Search Input */}
            <View style={styles.searchSection}>
                <View style={styles.searchBarContainer}>
                    <Ionicons name="search" size={18} color={COLORS.gray400} style={{ marginRight: 8 }} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search service, partner name or ID..."
                        placeholderTextColor={COLORS.gray400}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                            <Ionicons name="close-circle" size={18} color={COLORS.gray400} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Filter Segmented Chips */}
            <View style={styles.filtersContainer}>
                {FILTERS.map((f) => {
                    const isSelected = filter === f.key;
                    return (
                        <TouchableOpacity
                            key={f.key}
                            style={[styles.filterChip, isSelected && styles.filterChipActive]}
                            onPress={() => setFilter(f.key)}
                            activeOpacity={0.8}
                        >
                            <Ionicons
                                name={f.icon as any}
                                size={14}
                                color={isSelected ? COLORS.white : COLORS.gray500}
                                style={{ marginRight: 4 }}
                            />
                            <Text style={[styles.filterText, isSelected && styles.filterTextActive]}>
                                {f.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* Bookings List */}
            {isLoading && !refreshing ? (
                <View style={{ paddingHorizontal: SPACING.base, paddingTop: SPACING.xs }}>
                    <RequestCardSkeleton />
                    <RequestCardSkeleton />
                    <RequestCardSkeleton />
                </View>
            ) : (
                <FlatList
                    data={filteredHistory}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    onScroll={onScroll}
                    scrollEventThrottle={16}
                    initialNumToRender={8}
                    maxToRenderPerBatch={10}
                    windowSize={5}
                    removeClippedSubviews={true}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[COLORS.primary]} />
                    }
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <EmptyState
                            icon="calendar-outline"
                            title={searchQuery ? 'No Matching Bookings' : 'No Bookings Found'}
                            description={
                                searchQuery
                                    ? `No requests match "${searchQuery}". Try a different keyword.`
                                    : filter === 'all'
                                        ? 'Your service request history will appear here once you place a booking.'
                                        : `No ${filter} service bookings found.`
                            }
                            actionLabel="Browse Services"
                            onAction={() => navigation.navigate(ROUTES.DASHBOARD)}
                        />
                    }
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },

    // ── Hero Card ──
    heroCard: {
        backgroundColor: COLORS.primaryDark,
        marginHorizontal: SPACING.base,
        marginTop: SPACING.sm,
        marginBottom: SPACING.md,
        borderRadius: RADIUS['2xl'],
        padding: SPACING.lg,
        ...SHADOWS.md,
    },
    heroHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    heroTitle: {
        fontSize: FONT_SIZE.xl,
        fontWeight: '900',
        color: COLORS.white,
        letterSpacing: -0.4,
    },
    heroSubTitle: {
        fontSize: FONT_SIZE.xs + 1,
        color: 'rgba(255,255,255,0.75)',
        marginTop: 2,
    },
    refreshIconBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.18)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    statsContainer: {
        flexDirection: 'row',
        backgroundColor: 'rgba(0, 0, 0, 0.15)',
        borderRadius: RADIUS.xl,
        paddingVertical: SPACING.sm + 2,
        paddingHorizontal: SPACING.md,
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    statBox: {
        alignItems: 'center',
        flex: 1,
    },
    statNumber: {
        fontSize: FONT_SIZE.lg,
        fontWeight: '900',
        color: COLORS.white,
    },
    statLabel: {
        fontSize: 10,
        fontWeight: '700',
        color: 'rgba(255,255,255,0.8)',
        marginTop: 1,
        textTransform: 'uppercase',
    },
    statDivider: {
        width: 1,
        height: 24,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },

    // ── Search Bar ──
    searchSection: {
        paddingHorizontal: SPACING.base,
        marginBottom: SPACING.sm,
    },
    searchBarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.xl,
        paddingHorizontal: SPACING.md,
        height: 44,
        borderWidth: 1.5,
        borderColor: COLORS.gray100,
        ...SHADOWS.sm,
    },
    searchInput: {
        flex: 1,
        fontSize: FONT_SIZE.sm + 1,
        color: COLORS.gray900,
        fontWeight: '500',
    },

    // ── Filter Segmented Bar ──
    filtersContainer: {
        flexDirection: 'row',
        paddingHorizontal: SPACING.base,
        marginBottom: SPACING.md,
        gap: SPACING.xs,
    },
    filterChip: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: SPACING.xs + 3,
        borderRadius: RADIUS.full,
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: COLORS.gray200,
    },
    filterChipActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    filterText: {
        fontSize: FONT_SIZE.xs,
        fontWeight: '700',
        color: COLORS.gray600,
    },
    filterTextActive: {
        color: COLORS.white,
    },
    listContent: {
        paddingHorizontal: SPACING.base,
        paddingBottom: SPACING['4xl'],
    },
});

export default RequestHistoryScreen;
