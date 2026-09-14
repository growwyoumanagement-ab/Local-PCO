// src/screens/TrackingScreen.tsx
// Redesigned modern live tracking screen

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAppDispatch, useAppSelector, selectActiveRequest } from '../store';
import { cancelRequest, fetchActiveRequest } from '../store/requestSlice';
import { Card, Button, EmptyState } from '../components';
import { COLORS, SPACING, FONT_SIZE, STATUS_TIMELINE, ROUTES, RADIUS, SHADOWS } from '../utils/constants';
import { canCancelRequest, formatDateTime } from '../utils/helpers';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

export const TrackingScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const dispatch = useAppDispatch();

    const activeRequest = useAppSelector(selectActiveRequest);
    const isCancelling = useAppSelector((state) => state.request.isCancelling);

    // Track whether user was actively tracking an order
    const hadActiveRequestRef = React.useRef(false);
    const [partnerCancelled, setPartnerCancelled] = React.useState(false);

    React.useEffect(() => {
        dispatch(fetchActiveRequest());
    }, [dispatch]);

    useFocusEffect(
        React.useCallback(() => {
            dispatch(fetchActiveRequest());

            const interval = setInterval(() => {
                dispatch(fetchActiveRequest())
                    .unwrap()
                    .then((request) => {
                        if (request) {
                            hadActiveRequestRef.current = true;
                            if (request.status === 'cancelled') {
                                clearInterval(interval);
                                setPartnerCancelled(true);
                            } else if (request.status === 'completed') {
                                clearInterval(interval);
                                navigation.navigate(ROUTES.RATING, {
                                    requestId: request.id,
                                    serviceName: request.serviceName,
                                    partnerName: request.partnerName,
                                });
                            }
                        } else {
                            // If request was active previously but now returned null -> partner rejected/cancelled
                            if (hadActiveRequestRef.current) {
                                clearInterval(interval);
                                setPartnerCancelled(true);
                            }
                        }
                    })
                    .catch(() => {});
            }, 3000);

            return () => clearInterval(interval);
        }, [dispatch, navigation])
    );

    const handleCancel = () => {
        if (!activeRequest) return;

        Alert.alert(
            'Cancel Request',
            'Are you sure you want to cancel this request?',
            [
                { text: 'No', style: 'cancel' },
                {
                    text: 'Yes, Cancel',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await dispatch(cancelRequest(activeRequest.id)).unwrap();
                            navigation.navigate(ROUTES.HOME_TAB);
                        } catch (error: any) {
                            Alert.alert('Error', error.message);
                        }
                    },
                },
            ]
        );
    };

    const handleCallPartner = () => {
        if (activeRequest?.partnerPhone) {
            Linking.openURL(`tel:${activeRequest.partnerPhone}`);
        } else {
            Alert.alert('Info', 'Partner contact number not available yet');
        }
    };

    const getCurrentStatusIndex = () => {
        if (!activeRequest) return -1;
        const index = STATUS_TIMELINE.findIndex((s) => s.key === activeRequest.status);
        return index !== -1 ? index : 0;
    };

    if (partnerCancelled) {
        return (
            <SafeAreaView style={styles.container}>
                <EmptyState
                    icon="alert-circle-outline"
                    title="Service Partner Unavailable 😞"
                    description="The assigned service partner was unable to accept your request at this time. You can choose another available partner nearby."
                    actionLabel="Select Another Partner"
                    onAction={() =>
                        navigation.reset({
                            index: 0,
                            routes: [{ name: ROUTES.HOME_TAB }],
                        })
                    }
                />
            </SafeAreaView>
        );
    }

    if (!activeRequest) {
        return (
            <SafeAreaView style={styles.container}>
                <EmptyState
                    icon="compass-outline"
                    title="No Active Bookings"
                    description="You don't have any service request currently in progress."
                    actionLabel="Explore Services"
                    onAction={() => navigation.navigate(ROUTES.HOME_TAB)}
                />
            </SafeAreaView>
        );
    }

    const currentStatusIndex = getCurrentStatusIndex();
    const showCancel = canCancelRequest(activeRequest.status);

    return (
        <SafeAreaView style={styles.container}>
            {/* Top Bar */}
            <View style={styles.topHeader}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.gray900} />
                </TouchableOpacity>
                <Text style={styles.topTitle}>Live Request Tracking</Text>
                <View style={styles.livePill}>
                    <View style={styles.liveDot} />
                    <Text style={styles.liveText}>LIVE</Text>
                </View>
            </View>

            <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Map Section */}
                <View style={styles.mapCardContainer}>
                    {(() => {
                        const mapLat = activeRequest.address?.lat || 28.6139;
                        const mapLng = activeRequest.address?.lng || 77.2090;
                        return (
                            <MapView
                                provider={PROVIDER_GOOGLE}
                                style={styles.map}
                                initialRegion={{
                                    latitude: mapLat,
                                    longitude: mapLng,
                                    latitudeDelta: 0.015,
                                    longitudeDelta: 0.012,
                                }}
                            >
                                <Marker
                                    coordinate={{
                                        latitude: mapLat,
                                        longitude: mapLng,
                                    }}
                                    title="Service Location"
                                    description={activeRequest.address?.full || 'Service Address'}
                                    pinColor={COLORS.primary}
                                />

                                {activeRequest.partnerLocation && activeRequest.partnerLocation.lat && (
                                    <Marker
                                        coordinate={{
                                            latitude: activeRequest.partnerLocation.lat,
                                            longitude: activeRequest.partnerLocation.lng,
                                        }}
                                        title={activeRequest.partnerName || 'Service Partner'}
                                    >
                                        <View style={styles.partnerMapMarker}>
                                            <Ionicons name="construct" size={16} color={COLORS.white} />
                                        </View>
                                    </Marker>
                                )}
                            </MapView>
                        );
                    })()}
                </View>

                {/* Service Details Floating Card */}
                <Card style={styles.infoCard}>
                    <View style={styles.serviceHeader}>
                        <View style={styles.serviceIconCircle}>
                            <Ionicons name="construct" size={24} color={COLORS.primary} />
                        </View>
                        <View style={styles.serviceTextGroup}>
                            <Text style={styles.serviceName}>{activeRequest.serviceName}</Text>
                            <Text style={styles.requestId}>Booking #{activeRequest.id.slice(-8).toUpperCase()}</Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.addressRow}>
                        <Ionicons name="location" size={20} color={COLORS.primary} style={{ marginRight: SPACING.sm }} />
                        <Text style={styles.addressText} numberOfLines={2}>
                            {activeRequest.address.full}
                        </Text>
                    </View>

                    <Text style={styles.createdAtText}>
                        Placed on {formatDateTime(activeRequest.createdAt)}
                    </Text>
                </Card>

                {/* Partner Contact Card */}
                {activeRequest.partnerName && (
                    <Card style={styles.partnerCard}>
                        <View style={styles.partnerHeader}>
                            <View style={styles.partnerAvatar}>
                                <Text style={styles.partnerAvatarText}>
                                    {activeRequest.partnerName.charAt(0).toUpperCase()}
                                </Text>
                            </View>
                            <View style={styles.partnerInfoGroup}>
                                <Text style={styles.partnerName}>{activeRequest.partnerName}</Text>
                                <Text style={styles.partnerSubtext}>Assigned Service Specialist</Text>
                            </View>
                            <TouchableOpacity style={styles.callFab} onPress={handleCallPartner}>
                                <Ionicons name="call" size={20} color={COLORS.white} />
                            </TouchableOpacity>
                        </View>
                    </Card>
                )}

                {/* Multi-step Status Timeline */}
                <Card style={styles.timelineCard}>
                    <Text style={styles.timelineHeaderTitle}>Status Timeline</Text>
                    {STATUS_TIMELINE.map((step, index) => {
                        const isCompleted = index <= currentStatusIndex;
                        const isCurrent = index === currentStatusIndex;

                        return (
                            <View key={step.key} style={styles.timelineItem}>
                                <View style={styles.timelineLeftCol}>
                                    <View
                                        style={[
                                            styles.timelineDot,
                                            isCompleted && styles.timelineDotCompleted,
                                            isCurrent && styles.timelineDotCurrent,
                                        ]}
                                    >
                                        <Ionicons
                                            name={step.icon as any}
                                            size={14}
                                            color={isCompleted ? COLORS.white : COLORS.gray400}
                                        />
                                    </View>
                                    {index < STATUS_TIMELINE.length - 1 && (
                                        <View
                                            style={[
                                                styles.timelineLine,
                                                isCompleted && styles.timelineLineCompleted,
                                            ]}
                                        />
                                    )}
                                </View>
                                <View style={styles.timelineRightCol}>
                                    <Text
                                        style={[
                                            styles.timelineStepLabel,
                                            isCompleted && styles.timelineStepCompleted,
                                            isCurrent && styles.timelineStepCurrent,
                                        ]}
                                    >
                                        {step.label}
                                    </Text>
                                    {isCurrent && <Text style={styles.currentStatusBadge}>Active Status</Text>}
                                </View>
                            </View>
                        );
                    })}
                </Card>

                {/* Cancel Action Button */}
                {showCancel && (
                    <Button
                        title="Cancel Booking"
                        onPress={handleCancel}
                        variant="danger"
                        loading={isCancelling}
                        fullWidth
                        style={styles.cancelBtn}
                    />
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    topHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.base,
        paddingVertical: SPACING.md,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gray100,
    },
    backBtn: {
        padding: SPACING.xs,
    },
    topTitle: {
        fontSize: FONT_SIZE.lg,
        fontWeight: '700',
        color: COLORS.gray900,
    },
    livePill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEF2F2',
        paddingHorizontal: SPACING.sm + 2,
        paddingVertical: 4,
        borderRadius: RADIUS.full,
    },
    liveDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: COLORS.danger,
        marginRight: 4,
    },
    liveText: {
        fontSize: FONT_SIZE.xs,
        fontWeight: '800',
        color: COLORS.danger,
    },
    scroll: {
        flex: 1,
    },
    content: {
        padding: SPACING.base,
        paddingBottom: SPACING['4xl'],
    },
    mapCardContainer: {
        height: 220,
        borderRadius: RADIUS['2xl'],
        overflow: 'hidden',
        marginBottom: SPACING.base,
        ...SHADOWS.md,
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    mapPlaceholder: {
        flex: 1,
        backgroundColor: COLORS.primaryBg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    mapPlaceholderText: {
        fontSize: FONT_SIZE.sm,
        fontWeight: '600',
        color: COLORS.primaryDark,
        marginTop: SPACING.sm,
    },
    partnerMapMarker: {
        backgroundColor: COLORS.secondary,
        padding: 8,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: COLORS.white,
    },
    infoCard: {
        padding: SPACING.lg,
        borderRadius: RADIUS.xl,
        marginBottom: SPACING.md,
    },
    serviceHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    serviceIconCircle: {
        width: 48,
        height: 48,
        borderRadius: RADIUS.lg,
        backgroundColor: COLORS.primaryBg,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.md,
    },
    serviceTextGroup: {
        flex: 1,
    },
    serviceName: {
        fontSize: FONT_SIZE.lg,
        fontWeight: '800',
        color: COLORS.gray900,
    },
    requestId: {
        fontSize: FONT_SIZE.xs + 1,
        color: COLORS.gray500,
        marginTop: 2,
        fontWeight: '600',
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.gray100,
        marginVertical: SPACING.md,
    },
    addressRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    addressText: {
        flex: 1,
        fontSize: FONT_SIZE.sm,
        color: COLORS.gray700,
        fontWeight: '500',
    },
    createdAtText: {
        fontSize: FONT_SIZE.xs,
        color: COLORS.gray400,
        marginTop: SPACING.sm,
    },
    partnerCard: {
        padding: SPACING.lg,
        borderRadius: RADIUS.xl,
        marginBottom: SPACING.md,
    },
    partnerHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    partnerAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.md,
    },
    partnerAvatarText: {
        fontSize: FONT_SIZE.xl,
        fontWeight: '800',
        color: COLORS.white,
    },
    partnerInfoGroup: {
        flex: 1,
    },
    partnerName: {
        fontSize: FONT_SIZE.md,
        fontWeight: '700',
        color: COLORS.gray900,
    },
    partnerSubtext: {
        fontSize: FONT_SIZE.xs,
        color: COLORS.gray500,
        marginTop: 2,
    },
    callFab: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: COLORS.success,
        alignItems: 'center',
        justifyContent: 'center',
        ...SHADOWS.sm,
    },
    timelineCard: {
        padding: SPACING.lg,
        borderRadius: RADIUS.xl,
        marginBottom: SPACING.lg,
    },
    timelineHeaderTitle: {
        fontSize: FONT_SIZE.md,
        fontWeight: '700',
        color: COLORS.gray900,
        marginBottom: SPACING.lg,
    },
    timelineItem: {
        flexDirection: 'row',
        minHeight: 52,
    },
    timelineLeftCol: {
        width: 32,
        alignItems: 'center',
    },
    timelineDot: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: COLORS.surface,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: COLORS.gray300,
    },
    timelineDotCompleted: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    timelineDotCurrent: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primaryDark,
        borderWidth: 3,
    },
    timelineLine: {
        flex: 1,
        width: 2,
        backgroundColor: COLORS.gray200,
        marginVertical: 4,
    },
    timelineLineCompleted: {
        backgroundColor: COLORS.primary,
    },
    timelineRightCol: {
        flex: 1,
        paddingLeft: SPACING.md,
        paddingBottom: SPACING.md,
    },
    timelineStepLabel: {
        fontSize: FONT_SIZE.base,
        color: COLORS.gray400,
    },
    timelineStepCompleted: {
        color: COLORS.gray800,
        fontWeight: '600',
    },
    timelineStepCurrent: {
        color: COLORS.primary,
        fontWeight: '800',
    },
    currentStatusBadge: {
        fontSize: FONT_SIZE.xs,
        color: COLORS.primary,
        fontWeight: '700',
        marginTop: 2,
    },
    cancelBtn: {
        borderRadius: RADIUS.xl,
    },
});

export default TrackingScreen;
