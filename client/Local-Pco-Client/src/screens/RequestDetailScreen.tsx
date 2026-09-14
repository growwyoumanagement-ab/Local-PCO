import React, { useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    Linking,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchRequestById, cancelRequest, setActiveRequest } from '../store/requestSlice';
import { Card, Button } from '../components';
import { COLORS, SPACING, FONT_SIZE, RADIUS, SHADOWS, ROUTES } from '../utils/constants';
import { formatDateTime } from '../utils/helpers';
import Toast from 'react-native-toast-message';

type RouteParams = {
    RequestDetail: {
        requestId: string;
    };
};

const getCategoryMeta = (serviceName: string) => {
    const name = (serviceName || '').toLowerCase();
    if (name.includes('plumb')) return { icon: 'construct', bg: '#E0F2F1', color: '#0F766E' };
    if (name.includes('elect')) return { icon: 'flash', bg: '#FEF3C7', color: '#D97706' };
    if (name.includes('clean')) return { icon: 'sparkles', bg: '#E8F5E9', color: '#16A34A' };
    if (name.includes('ac') || name.includes('cool')) return { icon: 'snow', bg: '#E0F7FA', color: '#0284C7' };
    if (name.includes('paint')) return { icon: 'color-palette', bg: '#F3E8FF', color: '#9333EA' };
    if (name.includes('mech') || name.includes('car')) return { icon: 'settings', bg: '#FEE2E2', color: '#DC2626' };
    return { icon: 'build', bg: '#F1F5F9', color: COLORS.primary };
};

const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
        case 'completed':
            return { label: 'Completed', bg: '#DCFCE7', text: '#15803D', icon: 'checkmark-circle' };
        case 'in_progress':
        case 'accepted':
        case 'reached':
        case 'on_the_way':
            return { label: 'In Progress', bg: '#FEF3C7', text: '#B45309', icon: 'time' };
        case 'cancelled':
            return { label: 'Cancelled', bg: '#FEE2E2', text: '#B91C1C', icon: 'close-circle' };
        case 'pending':
        default:
            return { label: 'Pending', bg: '#E0F2F1', text: '#0F766E', icon: 'ellipse' };
    }
};

export const RequestDetailScreen: React.FC = () => {
    const route = useRoute<RouteProp<RouteParams, 'RequestDetail'>>();
    const navigation = useNavigation<any>();
    const dispatch = useAppDispatch();

    const { requestId } = route.params || {};
    const requestHistory = useAppSelector((state) => state.request.requestHistory);
    const activeRequest = useAppSelector((state) => state.request.activeRequest);
    const currentDetailRequest = useAppSelector((state) => state.request.currentDetailRequest);
    const isCancelling = useAppSelector((state) => state.request.isCancelling);

    const request = (currentDetailRequest && (currentDetailRequest.id === requestId || (currentDetailRequest as any)._id === requestId))
        ? currentDetailRequest
        : (activeRequest && (activeRequest.id === requestId || (activeRequest as any)._id === requestId))
            ? activeRequest
            : requestHistory.find((r) => r.id === requestId || (r as any)._id === requestId);

    const loadRequest = useCallback(() => {
        if (requestId) {
            dispatch(fetchRequestById(requestId));
        }
    }, [dispatch, requestId]);

    useFocusEffect(
        useCallback(() => {
            loadRequest();
            const interval = setInterval(() => {
                loadRequest();
            }, 4000);
            return () => clearInterval(interval);
        }, [loadRequest])
    );

    const handleTrackRequest = () => {
        if (!request) return;
        // 1. Sync Redux active request state to this specific request
        dispatch(setActiveRequest(request));
        // 2. Navigate to tracking screen
        navigation.navigate(ROUTES.TRACKING);
    };

    const handleCancelRequest = () => {
        if (!request) return;

        Alert.alert(
            'Cancel Request 🚫',
            'Are you sure you want to cancel this booking? This action cannot be undone.',
            [
                { text: 'Keep Booking', style: 'cancel' },
                {
                    text: 'Yes, Cancel Request',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await dispatch(cancelRequest(request.id)).unwrap();
                            Toast.show({
                                type: 'success',
                                text1: 'Request Cancelled 🚫',
                                text2: 'Your booking has been cancelled successfully.',
                                visibilityTime: 3500,
                            });
                        } catch (error: any) {
                            Toast.show({
                                type: 'error',
                                text1: 'Cancellation Failed',
                                text2: typeof error === 'string' ? error : (error.message || 'Unable to cancel request'),
                            });
                        }
                    },
                },
            ]
        );
    };

    const handleCallPartner = () => {
        if (request?.partnerPhone) {
            Linking.openURL(`tel:${request.partnerPhone}`);
        }
    };

    if (!request) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingBox}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.loadingText}>Fetching request details...</Text>
                </View>
            </SafeAreaView>
        );
    }

    const catMeta = getCategoryMeta(request.serviceName);
    const statusMeta = getStatusBadge(request.status);
    const isCancellable = ['pending', 'accepted'].includes(request.status);
    const isActiveOrder = ['pending', 'accepted', 'reached', 'in_progress'].includes(request.status);
    const isCompleted = request.status === 'completed';

    return (
        <SafeAreaView style={styles.container}>
            {/* Header Navigation Bar */}
            <View style={styles.navHeader}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={20} color={COLORS.gray800} />
                </TouchableOpacity>
                <View style={styles.navTitleBox}>
                    <Text style={styles.navTitle}>Order Details</Text>
                    <Text style={styles.navSubtitle}>#{request.id.slice(-8).toUpperCase()}</Text>
                </View>
                <View style={[styles.statusPill, { backgroundColor: statusMeta.bg }]}>
                    <Ionicons name={statusMeta.icon as any} size={12} color={statusMeta.text} style={{ marginRight: 3 }} />
                    <Text style={[styles.statusPillText, { color: statusMeta.text }]}>{statusMeta.label}</Text>
                </View>
            </View>

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* Hero Service Card */}
                <View style={styles.heroCard}>
                    <View style={[styles.categoryIconCircle, { backgroundColor: catMeta.bg }]}>
                        <Ionicons name={catMeta.icon as any} size={28} color={catMeta.color} />
                    </View>
                    <View style={styles.heroTextInfo}>
                        <Text style={styles.serviceTitleText}>{request.serviceName}</Text>
                        <View style={styles.bookingTypeRow}>
                            <Ionicons
                                name={request.bookingType === 'appointment' ? 'calendar' : 'flash'}
                                size={14}
                                color={COLORS.primaryDark}
                            />
                            <Text style={styles.bookingTypeLabel}>
                                {request.bookingType === 'appointment' ? 'Scheduled Appointment' : 'Instant Doorstep Request'}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Service Partner Card */}
                {!!request.partnerName && (
                    <Card style={styles.sectionCard}>
                        <Text style={styles.sectionCardTitle}>Assigned Partner</Text>
                        <View style={styles.partnerRow}>
                            <View style={styles.partnerAvatar}>
                                <Text style={styles.partnerAvatarText}>
                                    {request.partnerName.charAt(0).toUpperCase()}
                                </Text>
                            </View>
                            <View style={styles.partnerDetails}>
                                <Text style={styles.partnerNameText}>{request.partnerName}</Text>
                                <View style={styles.verifiedChip}>
                                    <Ionicons name="checkmark-circle" size={12} color={COLORS.success} />
                                    <Text style={styles.verifiedChipText}>Verified Expert</Text>
                                </View>
                            </View>
                            {!!request.partnerPhone && (
                                <TouchableOpacity style={styles.callIconBtn} onPress={handleCallPartner} activeOpacity={0.8}>
                                    <Ionicons name="call" size={18} color={COLORS.white} />
                                </TouchableOpacity>
                            )}
                        </View>
                    </Card>
                )}

                {/* Address Card */}
                <Card style={styles.sectionCard}>
                    <Text style={styles.sectionCardTitle}>Service Location</Text>
                    <View style={styles.addressRow}>
                        <Ionicons name="location-sharp" size={20} color={COLORS.primary} style={{ marginRight: SPACING.sm }} />
                        <View style={{ flex: 1 }}>
                            <Text style={styles.addressText}>{request.address?.full}</Text>
                            {!!request.address?.landmark && (
                                <Text style={styles.landmarkText}>Landmark: {request.address.landmark}</Text>
                            )}
                        </View>
                    </View>
                </Card>

                {/* Additional Notes Card */}
                {!!request.notes && (
                    <Card style={styles.sectionCard}>
                        <Text style={styles.sectionCardTitle}>Special Instructions</Text>
                        <Text style={styles.notesText}>{request.notes}</Text>
                    </Card>
                )}

                {/* Timeline History Card */}
                <Card style={styles.sectionCard}>
                    <Text style={styles.sectionCardTitle}>Order Timeline</Text>
                    <View style={styles.timelineList}>
                        {(request.statusHistory || []).map((step, idx, arr) => (
                            <View key={idx} style={styles.timelineStepRow}>
                                <View style={styles.timelineLeftColumn}>
                                    <View style={[styles.timelineDot, idx === arr.length - 1 && styles.timelineDotActive]} />
                                    {idx < arr.length - 1 && <View style={styles.timelineLine} />}
                                </View>
                                <View style={styles.timelineRightContent}>
                                    <Text style={styles.timelineStatusTitle}>
                                        {step.status.replace(/_/g, ' ').toUpperCase()}
                                    </Text>
                                    <Text style={styles.timelineTimestamp}>{formatDateTime(step.timestamp)}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </Card>
            </ScrollView>

            {/* Bottom Actions Floating Bar */}
            <View style={styles.footerBar}>
                {isActiveOrder && (
                    <TouchableOpacity style={styles.trackBtn} onPress={handleTrackRequest} activeOpacity={0.88}>
                        <Ionicons name="compass" size={20} color={COLORS.white} />
                        <Text style={styles.trackBtnText}>Track Live Status ⚡</Text>
                    </TouchableOpacity>
                )}

                {isCancellable && (
                    <TouchableOpacity
                        style={styles.cancelBtn}
                        onPress={handleCancelRequest}
                        disabled={isCancelling}
                        activeOpacity={0.8}
                    >
                        {isCancelling ? (
                            <ActivityIndicator color={COLORS.danger} size="small" />
                        ) : (
                            <>
                                <Ionicons name="close-circle-outline" size={20} color={COLORS.danger} />
                                <Text style={styles.cancelBtnText}>Cancel Booking 🚫</Text>
                            </>
                        )}
                    </TouchableOpacity>
                )}

                {isCompleted && !request.isReviewed && (
                    <Button
                        title="Rate & Review Experience ⭐"
                        onPress={() =>
                            navigation.navigate(ROUTES.RATING, {
                                requestId: request.id,
                                serviceName: request.serviceName,
                                partnerName: request.partnerName,
                            })
                        }
                        fullWidth
                    />
                )}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    loadingBox: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACING.md,
    },
    loadingText: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.gray500,
    },
    navHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        paddingHorizontal: SPACING.base,
        paddingVertical: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gray100,
        ...SHADOWS.sm,
    },
    backBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: COLORS.gray100,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.md,
    },
    navTitleBox: {
        flex: 1,
    },
    navTitle: {
        fontSize: FONT_SIZE.md,
        fontWeight: '800',
        color: COLORS.gray900,
    },
    navSubtitle: {
        fontSize: FONT_SIZE.xs,
        color: COLORS.gray500,
        fontWeight: '600',
    },
    statusPill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.sm + 2,
        paddingVertical: 5,
        borderRadius: RADIUS.full,
    },
    statusPillText: {
        fontSize: 10,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    scroll: {
        flex: 1,
    },
    content: {
        padding: SPACING.base,
        paddingBottom: SPACING['4xl'],
    },
    heroCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.xl,
        padding: SPACING.base,
        marginBottom: SPACING.md,
        ...SHADOWS.sm,
    },
    categoryIconCircle: {
        width: 52,
        height: 52,
        borderRadius: 26,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.md,
    },
    heroTextInfo: {
        flex: 1,
    },
    serviceTitleText: {
        fontSize: FONT_SIZE.base + 1,
        fontWeight: '900',
        color: COLORS.gray900,
        letterSpacing: -0.3,
    },
    bookingTypeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 4,
    },
    bookingTypeLabel: {
        fontSize: FONT_SIZE.xs + 1,
        color: COLORS.primaryDark,
        fontWeight: '700',
    },
    sectionCard: {
        marginBottom: SPACING.md,
        borderRadius: RADIUS.xl,
    },
    sectionCardTitle: {
        fontSize: 10,
        fontWeight: '800',
        color: COLORS.gray400,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        marginBottom: SPACING.sm,
    },
    partnerRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    partnerAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: COLORS.primaryBg,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.md,
    },
    partnerAvatarText: {
        fontSize: FONT_SIZE.md,
        fontWeight: '900',
        color: COLORS.primaryDark,
    },
    partnerDetails: {
        flex: 1,
    },
    partnerNameText: {
        fontSize: FONT_SIZE.md,
        fontWeight: '800',
        color: COLORS.gray900,
    },
    verifiedChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        marginTop: 2,
    },
    verifiedChipText: {
        fontSize: FONT_SIZE.xs,
        color: COLORS.success,
        fontWeight: '700',
    },
    callIconBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        ...SHADOWS.sm,
    },
    addressRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    addressText: {
        fontSize: FONT_SIZE.sm + 1,
        fontWeight: '600',
        color: COLORS.gray800,
        lineHeight: 20,
    },
    landmarkText: {
        fontSize: FONT_SIZE.xs,
        color: COLORS.gray500,
        marginTop: 4,
    },
    notesText: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.gray700,
        lineHeight: 20,
    },
    timelineList: {
        paddingTop: 4,
    },
    timelineStepRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    timelineLeftColumn: {
        width: 24,
        alignItems: 'center',
    },
    timelineDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: COLORS.gray300,
        marginTop: 3,
    },
    timelineDotActive: {
        backgroundColor: COLORS.primary,
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    timelineLine: {
        width: 2,
        flex: 1,
        minHeight: 28,
        backgroundColor: COLORS.gray200,
        marginVertical: 2,
    },
    timelineRightContent: {
        flex: 1,
        paddingBottom: SPACING.md,
        paddingLeft: SPACING.xs,
    },
    timelineStatusTitle: {
        fontSize: FONT_SIZE.xs + 1,
        fontWeight: '800',
        color: COLORS.gray900,
    },
    timelineTimestamp: {
        fontSize: FONT_SIZE.xs,
        color: COLORS.gray400,
        marginTop: 2,
    },
    pricingCard: {
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.xl,
        marginBottom: SPACING.md,
    },
    pricingCardTitle: {
        fontSize: 10,
        fontWeight: '800',
        color: COLORS.gray400,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        marginBottom: SPACING.sm,
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 4,
    },
    priceRowLabel: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.gray600,
    },
    priceRowValue: {
        fontSize: FONT_SIZE.sm,
        fontWeight: '700',
        color: COLORS.gray900,
    },
    finalPriceRow: {
        marginTop: SPACING.xs,
        paddingTop: SPACING.xs,
        borderTopWidth: 1,
        borderTopColor: COLORS.gray100,
    },
    finalPriceLabel: {
        fontSize: FONT_SIZE.base,
        fontWeight: '900',
        color: COLORS.gray900,
    },
    finalPriceValue: {
        fontSize: FONT_SIZE.md,
        fontWeight: '900',
        color: COLORS.primaryDark,
    },
    footerBar: {
        padding: SPACING.base,
        backgroundColor: COLORS.white,
        borderTopWidth: 1,
        borderTopColor: COLORS.gray100,
        gap: SPACING.sm,
        ...SHADOWS.md,
    },
    trackBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.primary,
        paddingVertical: SPACING.md,
        borderRadius: RADIUS.xl,
        gap: SPACING.xs,
        ...SHADOWS.sm,
    },
    trackBtnText: {
        fontSize: FONT_SIZE.base,
        fontWeight: '800',
        color: COLORS.white,
    },
    cancelBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FEE2E2',
        paddingVertical: SPACING.md,
        borderRadius: RADIUS.xl,
        gap: SPACING.xs,
    },
    cancelBtnText: {
        fontSize: FONT_SIZE.sm + 1,
        fontWeight: '800',
        color: COLORS.danger,
    },
});

export default RequestDetailScreen;
