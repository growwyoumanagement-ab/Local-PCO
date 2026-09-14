// src/screens/DashboardScreen.tsx
// Redesigned modern client dashboard — polished & production-ready

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    RefreshControl,
    TouchableOpacity,
    ActivityIndicator,
    Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAppSelector, useAppDispatch, selectCurrentUser, selectCurrentLocation, selectProfile } from '../store';
import { fetchProfile } from '../store/profileSlice';
import { setCurrentLocation } from '../store/locationSlice';
import * as Location from 'expo-location';
import { useBannerScroll } from '../context/BannerScrollContext';
import { CategoryGrid, SearchBar, BannerCarousel, CategoryGridSkeleton } from '../components';
import {
    COLORS,
    SPACING,
    FONT_SIZE,
    RADIUS,
    SHADOWS,
    ROUTES,
    SERVICE_CATEGORIES,
} from '../utils/constants';
import { getServiceCategories } from '../services/serviceService';
import { getContentSections, ContentSection } from '../services/contentService';
import Toast from 'react-native-toast-message';

const QUICK_FILTERS = [
    { id: 'plumber', label: '🔧 Plumbing', color: '#E3F2FD' },
    { id: 'electrician', label: '⚡ Electric', color: '#FFF9C4' },
    { id: 'cleaning', label: '✨ Cleaning', color: '#E8F5E9' },
    { id: 'ac_repair', label: '❄️ AC Repair', color: '#E0F7FA' },
    { id: 'painter', label: '🎨 Painting', color: '#FCE4EC' },
];

export const DashboardScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const dispatch = useAppDispatch();
    const currentUser = useAppSelector(selectCurrentUser);
    const profile = useAppSelector(selectProfile);
    const currentLocation = useAppSelector(selectCurrentLocation);
    const requestLoading = useAppSelector((state) => state.request.isLoading);
    const { onScroll } = useBannerScroll();

    const [refreshing, setRefreshing] = useState(false);
    const [services, setServices] = useState<any[]>([]);
    const [loadingServices, setLoadingServices] = useState(true);
    const [contentSections, setContentSections] = useState<ContentSection[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [hasUnreadNotifications, setHasUnreadNotifications] = useState(true);

    const displayCity = currentLocation?.city || currentLocation?.address?.split(',')[0] || 'Detecting Location...';

    // Fetch latest profile on startup
    useEffect(() => {
        dispatch(fetchProfile());
    }, [dispatch]);

    // Auto-detect location on startup
    useEffect(() => {
        (async () => {
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status === 'granted') {
                    const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
                    let cityName = '';
                    let fullAddress = '';
                    let pincodeStr = '';
                    try {
                        const [geo] = await Location.reverseGeocodeAsync({
                            latitude: loc.coords.latitude,
                            longitude: loc.coords.longitude
                        });
                        if (geo) {
                            cityName = geo.city || geo.subregion || geo.region || '';
                            fullAddress = [geo.name, geo.street, geo.city, geo.region].filter(Boolean).join(', ');
                            pincodeStr = geo.postalCode || '';
                        }
                    } catch (e) {
                        console.log('Reverse geocode error:', e);
                    }

                    dispatch(setCurrentLocation({
                        lat: loc.coords.latitude,
                        lng: loc.coords.longitude,
                        city: cityName || 'Current Location',
                        address: fullAddress || `${loc.coords.latitude.toFixed(4)}, ${loc.coords.longitude.toFixed(4)}`,
                        pincode: pincodeStr
                    }));
                }
            } catch (err) {
                console.log('Location detection error:', err);
            }
        })();
    }, [dispatch]);

    useEffect(() => {
        fetchServices();
        fetchContent();
    }, []);

    const fetchContent = async () => {
        try {
            const data = await getContentSections();
            setContentSections(data);
        } catch (error) {
            console.error('Error fetching content:', error);
        }
    };

    const fetchServices = async () => {
        try {
            setLoadingServices(true);
            const data = await getServiceCategories();
            const mappedServices = data.map((service, index) => ({
                id: service._id || service.name.toLowerCase(),
                name: service.name,
                icon: service.icon || SERVICE_CATEGORIES[index % SERVICE_CATEGORIES.length]?.icon || 'construct',
                color: SERVICE_CATEGORIES[index % SERVICE_CATEGORIES.length]?.color || '#E0F2F1',
                iconColor: SERVICE_CATEGORIES[index % SERVICE_CATEGORIES.length]?.iconColor || COLORS.primary,
            }));
            setServices(mappedServices.length > 0 ? mappedServices : SERVICE_CATEGORIES);
        } catch (error) {
            setServices(SERVICE_CATEGORIES);
        } finally {
            setLoadingServices(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await Promise.all([fetchServices(), fetchContent()]);
        setRefreshing(false);
    };

    const handleCategoryPress = (category: any) => {
        if (requestLoading) return;
        navigation.navigate(ROUTES.SERVICE_PROVIDERS, {
            categoryId: category.id || category.name,
            categoryName: category.name,
        });
    };

    const handleSearchSubmit = () => {
        if (!searchQuery.trim()) return;
        navigation.navigate(ROUTES.SERVICE_PROVIDERS, {
            searchQuery: searchQuery.trim(),
            categoryName: `"${searchQuery.trim()}"`,
        });
    };

    // Clear search + refresh service list back to default
    const handleSearchClear = () => {
        setSearchQuery('');
    };

    const handleUserHeaderPress = () => {
        navigation.navigate(ROUTES.PROFILE_TAB as any);
    };

    const userFirstName = (currentUser?.name || profile?.name)?.split(' ')[0] || 'User';
    const userInitial = (currentUser?.name || profile?.name || 'U').charAt(0).toUpperCase();
    const avatarUri = currentUser?.avatar || profile?.avatar;

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.content}
                onScroll={onScroll}
                scrollEventThrottle={16}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={[COLORS.primary]}
                        tintColor={COLORS.primary}
                    />
                }
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* ── User Top Header ── */}
                <View style={styles.topHeader}>
                    <TouchableOpacity
                        style={styles.userRow}
                        onPress={handleUserHeaderPress}
                        activeOpacity={0.7}
                    >
                        <View style={styles.avatarMini}>
                            {avatarUri ? (
                                <Image source={{ uri: avatarUri }} style={styles.avatarMiniImage} />
                            ) : (
                                <Text style={styles.avatarMiniText}>{userInitial}</Text>
                            )}
                        </View>
                        <View style={styles.userInfo}>
                            <Text style={styles.greetingLabel}>Good day,</Text>
                            <Text style={styles.greetingText}>{userFirstName} 👋</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={16} color={COLORS.gray400} style={{ marginLeft: 4 }} />
                    </TouchableOpacity>

                    <View style={styles.headerActions}>
                        <TouchableOpacity
                            style={styles.locationPill}
                            onPress={() => navigation.navigate(ROUTES.SAVED_ADDRESSES || 'SavedAddress')}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="location" size={13} color={COLORS.primary} />
                            <Text style={styles.locationText} numberOfLines={1}>{displayCity}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.notificationBtn}
                            onPress={() => {
                                setHasUnreadNotifications(false);
                                Toast.show({
                                    type: 'info',
                                    text1: 'Notifications',
                                    text2: 'You are all caught up! No new notifications.'
                                });
                            }}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <Ionicons name="notifications-outline" size={22} color={COLORS.gray700} />
                            {hasUnreadNotifications && <View style={styles.unreadBadge} />}
                        </TouchableOpacity>
                    </View>
                </View>

                {/* ── Hero Search Bar ── */}
                <View style={styles.searchSection}>
                    <SearchBar
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholder="Search plumber, AC repair, cleaning..."
                        onSearch={handleSearchSubmit}
                        onClear={handleSearchClear}
                    />
                </View>

                {/* ── Quick Filter Chips ── */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.quickFilters}
                >
                    {QUICK_FILTERS.map((f) => (
                        <TouchableOpacity
                            key={f.id}
                            style={[styles.quickFilterChip, { backgroundColor: f.color }]}
                            onPress={() => handleCategoryPress({ id: f.id, name: f.label.split(' ').slice(1).join(' ') })}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.quickFilterLabel}>{f.label}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* ── Service Banner Carousel ── */}
                <BannerCarousel
                    onExplore={(categoryId, categoryName) =>
                        navigation.navigate(ROUTES.SERVICE_PROVIDERS, { categoryId, categoryName })
                    }
                />

                {/* ── Session Restore Indicator ── */}
                {requestLoading && (
                    <View style={styles.sessionGuard}>
                        <ActivityIndicator size="small" color={COLORS.primary} />
                        <Text style={styles.sessionGuardText}>Syncing your active booking...</Text>
                    </View>
                )}

                {/* ── Category Grid Section ── */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>All Services</Text>
                        <TouchableOpacity
                            onPress={() => navigation.navigate(ROUTES.SERVICE_PROVIDERS, { categoryId: 'all', categoryName: 'All Services' })}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.sectionTagline}>12+ categories →</Text>
                        </TouchableOpacity>
                    </View>

                    {loadingServices ? (
                        <CategoryGridSkeleton />
                    ) : (
                        <CategoryGrid
                            categories={services}
                            onCategoryPress={handleCategoryPress}
                            numColumns={4}
                        />
                    )}
                </View>

                {/* ── How It Works — Vertical Roadmap ── */}
                <View style={styles.roadmapSection}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>How It Works</Text>
                    </View>

                    <View style={styles.roadmapCard}>
                        {[
                            {
                                step: '01',
                                icon: 'search',
                                title: 'Choose a Service',
                                desc: 'Browse 12+ home service categories or search by name.',
                                color: COLORS.primaryBg,
                                iconColor: COLORS.primary,
                            },
                            {
                                step: '02',
                                icon: 'person-circle',
                                title: 'Pick Your Expert',
                                desc: 'View verified partner profiles, ratings & real-time availability.',
                                color: '#FFF3E0',
                                iconColor: COLORS.secondary,
                            },
                            {
                                step: '03',
                                icon: 'location',
                                title: 'Confirm Your Address',
                                desc: 'Share your doorstep location — no travel needed.',
                                color: '#EDE9FE',
                                iconColor: '#7C3AED',
                            },
                            {
                                step: '04',
                                icon: 'checkmark-done-circle',
                                title: 'Job Done & Rated',
                                desc: 'Service completed at your door. Rate the expert after.',
                                color: '#DCFCE7',
                                iconColor: COLORS.success,
                            },
                        ].map((item, index, arr) => (
                            <View key={item.step} style={styles.roadmapItem}>
                                {/* Left column: icon circle + dashed line */}
                                <View style={styles.roadmapLeft}>
                                    <View style={[styles.roadmapCircle, { backgroundColor: item.color }]}>
                                        <Ionicons name={item.icon as any} size={22} color={item.iconColor} />
                                    </View>
                                    {index < arr.length - 1 && (
                                        <View style={styles.roadmapDashedLine}>
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <View key={i} style={styles.roadmapDash} />
                                            ))}
                                        </View>
                                    )}
                                </View>

                                {/* Right column: text */}
                                <View style={[styles.roadmapContent, index < arr.length - 1 && styles.roadmapContentSpacing]}>
                                    <Text style={styles.roadmapStepNum}>STEP {item.step}</Text>
                                    <Text style={styles.roadmapTitle}>{item.title}</Text>
                                    <Text style={styles.roadmapDesc}>{item.desc}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>

                {/* ── Brand Footer ── */}
                <View style={styles.brandFooterCard}>
                    <View style={styles.footerLogoBadge}>
                        <Image
                            source={require('../../assets/logo.png')}
                            style={{ width: 44, height: 44, resizeMode: 'contain' }}
                        />
                    </View>
                    <Text style={styles.footerBrandName}>Local PCO</Text>
                    <Text style={styles.footerTagline}>Quality Care Across 50+ Cities</Text>
                    <View style={styles.footerDivider} />
                    <Text style={styles.footerCopyright}>© 2026 Local PCO Technologies Pvt. Ltd.</Text>
                </View>
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
        paddingBottom: 100,
    },

    // ── Header ──
    topHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.base,
        paddingTop: SPACING.md,
        paddingBottom: SPACING.sm,
    },
    userRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatarMini: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.sm,
        overflow: 'hidden',
        ...SHADOWS.sm,
    },
    avatarMiniImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    avatarMiniText: {
        fontSize: FONT_SIZE.md,
        fontWeight: '800',
        color: COLORS.white,
    },
    userInfo: {
        flex: 1,
    },
    greetingLabel: {
        fontSize: FONT_SIZE.xs,
        color: COLORS.gray500,
        fontWeight: '500',
    },
    greetingText: {
        fontSize: FONT_SIZE.lg,
        fontWeight: '800',
        color: COLORS.gray900,
        letterSpacing: -0.3,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
    },
    locationPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primaryBg,
        paddingHorizontal: SPACING.sm,
        paddingVertical: 5,
        borderRadius: RADIUS.full,
    },
    locationText: {
        fontSize: FONT_SIZE.xs,
        color: COLORS.primary,
        fontWeight: '700',
        marginLeft: 3,
    },
    notificationBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.white,
        alignItems: 'center',
        justifyContent: 'center',
        ...SHADOWS.sm,
        position: 'relative',
    },
    unreadBadge: {
        position: 'absolute',
        top: 9,
        right: 9,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.secondary,
        borderWidth: 1.5,
        borderColor: COLORS.white,
    },

    // ── Search ──
    searchSection: {
        paddingHorizontal: SPACING.base,
        marginBottom: SPACING.md,
    },

    // ── Quick Filters ──
    quickFilters: {
        paddingHorizontal: SPACING.base,
        paddingBottom: SPACING.md,
        gap: SPACING.sm,
    },
    quickFilterChip: {
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.xs + 2,
        borderRadius: RADIUS.full,
        marginRight: SPACING.xs,
    },
    quickFilterLabel: {
        fontSize: FONT_SIZE.xs + 1,
        fontWeight: '700',
        color: COLORS.gray800,
    },



    // ── Session Guard ──
    sessionGuard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.primaryBg,
        marginHorizontal: SPACING.base,
        padding: SPACING.md,
        borderRadius: RADIUS.lg,
        marginBottom: SPACING.lg,
        gap: SPACING.sm,
    },
    sessionGuardText: {
        fontSize: FONT_SIZE.sm,
        fontWeight: '600',
        color: COLORS.primary,
    },

    // ── Sections ──
    section: {
        paddingHorizontal: SPACING.base,
        marginBottom: SPACING.xl,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    sectionTitle: {
        fontSize: FONT_SIZE.lg,
        fontWeight: '800',
        color: COLORS.gray900,
    },
    sectionTagline: {
        fontSize: FONT_SIZE.xs + 1,
        color: COLORS.gray500,
        fontWeight: '600',
    },
    loadingContainer: {
        paddingVertical: SPACING['2xl'],
        alignItems: 'center',
    },
    loadingText: {
        marginTop: SPACING.md,
        fontSize: FONT_SIZE.sm,
        color: COLORS.gray500,
    },

    // ── Roadmap Section ──
    roadmapSection: {
        paddingHorizontal: SPACING.base,
        marginBottom: SPACING.xl,
    },
    roadmapCard: {
        backgroundColor: COLORS.white,
        borderRadius: RADIUS['2xl'],
        padding: SPACING.xl,
        marginTop: SPACING.md,
        ...SHADOWS.sm,
    },
    roadmapItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    roadmapLeft: {
        width: 52,
        alignItems: 'center',
        marginRight: SPACING.base,
    },
    roadmapCircle: {
        width: 52,
        height: 52,
        borderRadius: 26,
        alignItems: 'center',
        justifyContent: 'center',
    },
    roadmapDashedLine: {
        alignItems: 'center',
        paddingVertical: 4,
        minHeight: 36,
    },
    roadmapDash: {
        width: 2,
        height: 5,
        borderRadius: 1,
        backgroundColor: COLORS.gray300,
        marginVertical: 2,
    },
    roadmapContent: {
        flex: 1,
        paddingTop: 4,
    },
    roadmapContentSpacing: {
        paddingBottom: SPACING.lg,
    },
    roadmapStepNum: {
        fontSize: 10,
        fontWeight: '800',
        color: COLORS.gray400,
        letterSpacing: 1.2,
        marginBottom: 3,
    },
    roadmapTitle: {
        fontSize: FONT_SIZE.base,
        fontWeight: '800',
        color: COLORS.gray900,
        marginBottom: 4,
    },
    roadmapDesc: {
        fontSize: FONT_SIZE.xs + 1,
        color: COLORS.gray500,
        lineHeight: 18,
    },

    // ── Brand Footer ──
    brandFooterCard: {
        alignItems: 'center',
        backgroundColor: COLORS.white,
        marginHorizontal: SPACING.base,
        marginBottom: SPACING.xl,
        borderRadius: RADIUS['2xl'],
        padding: SPACING.xl,
        ...SHADOWS.sm,
    },
    footerLogoBadge: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: COLORS.primaryBg,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.sm,
    },
    footerBrandName: {
        fontSize: FONT_SIZE.md,
        fontWeight: '800',
        color: COLORS.gray900,
    },
    footerTagline: {
        fontSize: FONT_SIZE.xs + 1,
        color: COLORS.gray500,
        marginTop: 2,
        marginBottom: SPACING.md,
    },
    footerDivider: {
        width: '50%',
        height: 1,
        backgroundColor: COLORS.gray100,
        marginBottom: SPACING.md,
    },
    footerCopyright: {
        fontSize: FONT_SIZE.xs,
        color: COLORS.gray400,
    },
});

export default DashboardScreen;

