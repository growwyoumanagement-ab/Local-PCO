// src/screens/DashboardScreen.tsx
// Partner dashboard screen with online/offline toggle and daily overview

import React, { useEffect, useCallback, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    RefreshControl,
    Switch,
    TouchableOpacity,
    StatusBar,
    Alert,
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { COLORS, FONT_SIZE, SPACING, ROUTES, PARTNER_STATUS, KYC_STATUS } from '../utils/constants';
import { getGreeting, formatCurrency } from '../utils/helpers';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchTodaysSummary, fetchPendingRequests, acceptJob, rejectJob } from '../store/jobSlice';
import { fetchPartnerProfile, updateAvailability } from '../store/partnerSlice';
import { socketService } from '../services/socketService';
import { fcmService } from '../services/fcmService';
import * as Location from 'expo-location';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import JobCard from '../components/JobCard';
import StatusBadge from '../components/StatusBadge';
import PrimaryButton from '../components/PrimaryButton';
import IncomingRequestModal from '../components/IncomingRequestModal';

import { PartnerStackParamList } from '../navigation/PartnerStackNavigator';
import { Job } from '../services/jobService';

type DashboardNavigationProp = NativeStackNavigationProp<PartnerStackParamList, 'Dashboard'>;

/**
 * DashboardScreen Component
 * Main screen showing partner status, earnings, and active jobs
 */
const DashboardScreen: React.FC = () => {
    const navigation = useNavigation<DashboardNavigationProp>();
    const dispatch = useAppDispatch();

    // Redux state
    const { user } = useAppSelector((state) => state.auth);
    const { profile, availability, kycStatus, isLoading: partnerLoading } = useAppSelector((state) => state.partner);
    const { pendingRequests = [], todaySummary, isLoading: jobsLoading } = useAppSelector((state) => state.job);

    // Local state
    const [refreshing, setRefreshing] = useState(false);
    const [incomingJob, setIncomingJob] = useState<any>(null);
    const [modalVisible, setModalVisible] = useState(false);

    const isOnline = availability === PARTNER_STATUS.ONLINE;

    // FCM token registration is handled in RootNavigator (App.tsx) after authentication.
    // Removed from here to prevent re-registration on every Dashboard mount/focus.

    // Manage WebSocket connections based on availability
    useEffect(() => {
        let socketInstance: any = null;
        let isCancelled = false;

        const setupSocket = async () => {
            if (isOnline) {
                try {
                    console.log('[Dashboard] Partner is ONLINE, connecting socket...');
                    const socket = await socketService.connect();
                    
                    if (isCancelled) {
                        socket.off('new_job_assigned');
                        return;
                    }
                    
                    socketInstance = socket;

                    socket.on('new_job_assigned', (jobData: any) => {
                        console.log('[Dashboard] Received new job alert via socket:', jobData);
                        if (jobData && jobData.bookingType === 'appointment') {
                            return;
                        }
                        setIncomingJob(jobData);
                        setModalVisible(true);
                    });

                    socket.on('job_cancelled_by_client', (data: any) => {
                        console.log('[Dashboard] Job cancelled by client via socket:', data);
                        setModalVisible(false);
                        setIncomingJob(null);
                        Alert.alert('Client Cancelled 🚫', `The booking for ${data.serviceName || 'service'} was cancelled by the client.`);
                        loadDashboardData();
                    });
                } catch (err) {
                    console.error('[Dashboard] Socket connection failed:', err);
                }
            } else {
                console.log('[Dashboard] Partner is OFFLINE, disconnecting socket...');
                socketService.disconnect();
            }
        };

        setupSocket();

        return () => {
            isCancelled = true;
            if (socketInstance) {
                socketInstance.off('new_job_assigned');
                socketInstance.off('job_cancelled_by_client');
            }
        };
    }, [isOnline]);

    // Track partner's live location and update the database via socket when online.
    // FIX #21: Use a ref to track whether location permission has been requested,
    // so we don't re-show the system dialog on every online/offline toggle.
    const locationPermissionGranted = React.useRef(false);

    useEffect(() => {
        let locationSubscription: any = null;
        let isCancelled = false;

        const startLocationTracking = async () => {
            if (!isOnline) return;

            try {
                // Only request permission if we haven't confirmed it yet in this session
                if (!locationPermissionGranted.current) {
                    const { status } = await Location.requestForegroundPermissionsAsync();
                    if (status !== 'granted') {
                        console.warn('[Dashboard] Location permission not granted');
                        return;
                    }
                    locationPermissionGranted.current = true;
                }

                locationSubscription = await Location.watchPositionAsync(
                    {
                        accuracy: Location.Accuracy.Balanced,
                        timeInterval: 10000, // Emit every 10 seconds
                        distanceInterval: 10, // Emit if moved more than 10 meters
                    },
                    (location) => {
                        if (isCancelled) return;
                        const socket = socketService.getSocket();
                        if (socket && socket.connected) {
                            socket.emit('update_location', {
                                latitude: location.coords.latitude,
                                longitude: location.coords.longitude
                            });
                        }
                    }
                );
            } catch (err) {
                console.error('[Dashboard] Error starting live location tracking:', err);
            }
        };

        startLocationTracking();

        return () => {
            isCancelled = true;
            if (locationSubscription) {
                locationSubscription.remove();
            }
        };
    }, [isOnline]);

    const handleAcceptIncoming = async () => {
        if (!incomingJob) return;
        setModalVisible(false);
        // FIX #1: Socket payload uses _id (MongoDB ObjectId), not id. Normalize here.
        const jobId = (incomingJob._id || incomingJob.id)?.toString();

        if (!jobId) {
            Alert.alert('Error', 'Invalid job data received. Please refresh.');
            setIncomingJob(null);
            return;
        }

        try {
            await dispatch(acceptJob(jobId)).unwrap();
            setIncomingJob(null);
            navigation.navigate(ROUTES.JOB_DETAIL, { jobId });
        } catch (error: any) {
            Alert.alert('Failed to Accept', error || 'Something went wrong');
            setIncomingJob(null);
        }
    };

    const handleDeclineIncoming = async () => {
        if (!incomingJob) return;
        setModalVisible(false);
        // FIX #1: Same id normalization for decline/reject path
        const jobId = (incomingJob._id || incomingJob.id)?.toString();

        if (!jobId) {
            setIncomingJob(null);
            return;
        }

        try {
            await dispatch(rejectJob({ jobId, reason: 'Timeout/Decline' })).unwrap();
        } catch (error: any) {
            console.error('[Dashboard] Failed to reject/decline job:', error);
        } finally {
            setIncomingJob(null);
        }
    };

    /**
     * Check if partner can go online
     */
    const canGoOnline = kycStatus === KYC_STATUS.APPROVED;

    /**
     * Load all dashboard data
     */
    const loadDashboardData = useCallback(async () => {
        try {
            await Promise.all([
                dispatch(fetchPartnerProfile()),
                dispatch(fetchTodaysSummary()),
                dispatch(fetchPendingRequests()),
            ]);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        }
    }, [dispatch]);

    /**
     * Refresh data on focus
     */
    useFocusEffect(
        useCallback(() => {
            loadDashboardData();
        }, [loadDashboardData])
    );

    /**
     * Handle pull-to-refresh
     */
    const handleRefresh = async () => {
        setRefreshing(true);
        await loadDashboardData();
        setRefreshing(false);
    };

    /**
     * Handle availability toggle
     */
    const handleAvailabilityToggle = async (value: boolean) => {
        if (!canGoOnline && value) {
            // Navigate to KYC if trying to go online without approval
            navigation.navigate(ROUTES.PROFILE_TAB as any, { screen: ROUTES.KYC });
            return;
        }

        const newStatus = value ? PARTNER_STATUS.ONLINE : PARTNER_STATUS.OFFLINE;
        await dispatch(updateAvailability(newStatus));
    };

    /**
     * Handle job card press
     */
    const handleJobPress = (job: Job) => {
        navigation.navigate(ROUTES.JOB_DETAIL, { jobId: job.id });
    };

    /**
     * Handle pending request press
     */
    const handleRequestPress = (job: Job) => {
        navigation.navigate(ROUTES.JOB_REQUEST, { jobId: job.id });
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.gray50} />

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
                {/* Header with Local PCO Brand */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                            <Image 
                                source={require('../../assets/icon.png')} 
                                style={{ width: 36, height: 36, borderRadius: 8, marginRight: 10 }} 
                                resizeMode="contain" 
                            />
                            <View>
                                <Text style={{ fontSize: FONT_SIZE.xs, fontWeight: '700', color: COLORS.primaryDark, textTransform: 'uppercase', letterSpacing: 1 }}>Local PCO Partner</Text>
                                <Text style={styles.greeting}>{getGreeting()}</Text>
                            </View>
                        </View>
                        <Text style={styles.partnerName}>{user?.name || profile?.name || 'Partner'}</Text>
                    </View>

                    {/* Availability Toggle */}
                    <View style={styles.toggleContainer}>
                        <Text style={[styles.toggleLabel, isOnline && styles.toggleLabelActive]}>
                            {isOnline ? 'Online' : 'Offline'}
                        </Text>
                        <Switch
                            value={isOnline}
                            onValueChange={handleAvailabilityToggle}
                            trackColor={{ false: COLORS.gray300, true: COLORS.success + '50' }}
                            thumbColor={isOnline ? COLORS.success : COLORS.gray400}
                            disabled={partnerLoading}
                        />
                    </View>
                </View>

                {/* KYC Warning Banner */}
                {kycStatus !== KYC_STATUS.APPROVED && (
                    <TouchableOpacity
                        style={styles.kycBanner}
                        onPress={() => navigation.navigate(ROUTES.PROFILE_TAB as any, { screen: ROUTES.KYC })}
                    >
                        <View style={styles.kycBannerContent}>
                            <MaterialCommunityIcons name="alert-circle-outline" size={20} color={COLORS.gray700} style={styles.kycIcon} />
                            <Text style={styles.kycBannerText}>
                                Complete KYC to start accepting jobs
                            </Text>
                        </View>
                        <View style={styles.kycActionContainer}>
                            <Text style={styles.kycBannerAction}>Complete Now</Text>
                            <MaterialCommunityIcons name="chevron-right" size={16} color={COLORS.accent} />
                        </View>
                    </TouchableOpacity>
                )}

                {/* Stats Grid */}
                <View style={styles.statsGridContainer}>
                    <View style={styles.statsRow}>
                        <View style={[styles.statCard, { backgroundColor: COLORS.primaryDark }]}>
                            <View style={styles.statCardHeader}>
                                <Text style={styles.statCardTitle}>Total Jobs</Text>
                                <MaterialCommunityIcons name="briefcase-outline" size={20} color="rgba(255,255,255,0.8)" />
                            </View>
                            <Text style={styles.statCardValue}>{todaySummary?.totalJobs || 0}</Text>
                            <Text style={styles.statCardSubtitle}>Assigned to you</Text>
                        </View>

                        <View style={[styles.statCard, { backgroundColor: COLORS.primary }]}>
                            <View style={styles.statCardHeader}>
                                <Text style={styles.statCardTitle}>Completed</Text>
                                <MaterialCommunityIcons name="check-circle-outline" size={20} color="rgba(255,255,255,0.8)" />
                            </View>
                            <Text style={styles.statCardValue}>{todaySummary?.completedJobs || 0}</Text>
                            <Text style={styles.statCardSubtitle}>Successfully finished</Text>
                        </View>
                    </View>

                    <View style={[styles.statCardFull, { backgroundColor: '#1E293B' }]}>
                        <View style={styles.statCardHeader}>
                            <Text style={styles.statCardTitle}>Pending Jobs</Text>
                            <MaterialCommunityIcons name="clock-outline" size={20} color="rgba(255,255,255,0.8)" />
                        </View>
                        <Text style={styles.statCardValue}>{todaySummary?.pendingJobs || 0}</Text>
                        <Text style={styles.statCardSubtitle}>Awaiting action</Text>
                    </View>
                </View>

                {/* Upcoming Appointments Quick Action */}
                <TouchableOpacity
                    style={styles.appointmentButton}
                    onPress={() => navigation.navigate(ROUTES.UPCOMING_APPOINTMENTS)}
                >
                    <View style={styles.appointmentButtonContent}>
                        <MaterialCommunityIcons name="calendar-clock" size={24} color={COLORS.primary} style={styles.appointmentIcon} />
                        <View style={styles.appointmentTextContainer}>
                            <Text style={styles.appointmentButtonText}>Upcoming Appointments</Text>
                            <Text style={styles.appointmentButtonSubtext}>View invitations & scheduled commitments</Text>
                        </View>
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.gray400} />
                </TouchableOpacity>

                {/* Pending Jobs */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Pending Jobs</Text>
                        {pendingRequests.length > 0 && (
                            <TouchableOpacity onPress={() => (navigation as any).navigate(ROUTES.BOOKINGS_TAB)}>
                                <Text style={styles.viewAllText}>View All</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {pendingRequests.length > 0 ? (
                        pendingRequests.slice(0, 3).map((job) => (
                            <JobCard
                                key={job.id}
                                job={job}
                                onPress={handleJobPress}
                            />
                        ))
                    ) : (
                        <View style={styles.emptyState}>
                            <MaterialCommunityIcons name="clipboard-text-outline" size={48} color={COLORS.gray400} style={styles.emptyStateIcon} />
                            <Text style={styles.emptyStateText}>No new jobs right now</Text>
                            <Text style={styles.emptyStateSubtext}>
                                {isOnline
                                    ? 'Keep your availability on. New work will appear here.'
                                    : 'Switch to Online to start receiving incoming broadcasts'}
                            </Text>
                        </View>
                    )}
                </View>
            </ScrollView>

            <IncomingRequestModal
                visible={modalVisible}
                jobData={incomingJob}
                onAccept={handleAcceptIncoming}
                onDecline={handleDeclineIncoming}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.gray50,
    },
    container: {
        flex: 1,
    },
    contentContainer: {
        padding: SPACING.base,
        paddingBottom: SPACING['2xl'],
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: SPACING.lg,
    },
    headerLeft: {
        flex: 1,
    },
    greeting: {
        fontSize: FONT_SIZE.base,
        color: COLORS.gray500,
    },
    partnerName: {
        fontSize: FONT_SIZE['2xl'],
        fontWeight: '700',
        color: COLORS.gray900,
        marginTop: 4,
    },
    toggleContainer: {
        alignItems: 'center',
    },
    toggleLabel: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.gray400,
        marginBottom: 4,
        fontWeight: '500',
    },
    toggleLabelActive: {
        color: COLORS.success,
    },
    kycBanner: {
        backgroundColor: COLORS.accent + '20',
        borderRadius: 12,
        padding: SPACING.md,
        marginBottom: SPACING.base,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    kycBannerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    kycIcon: {
        marginRight: 8,
    },
    kycBannerText: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.gray700,
        fontWeight: '500',
        flex: 1,
    },
    kycActionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    kycBannerAction: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.accent,
        fontWeight: '600',
        marginRight: 4,
    },
    section: {
        marginBottom: SPACING.lg,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    sectionTitle: {
        fontSize: FONT_SIZE.lg,
        fontWeight: '600',
        color: COLORS.gray900,
    },
    viewAllText: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.primary,
        fontWeight: '500',
    },
    badge: {
        backgroundColor: COLORS.danger,
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 2,
        marginLeft: SPACING.sm,
    },
    badgeText: {
        color: COLORS.white,
        fontSize: FONT_SIZE.xs,
        fontWeight: '600',
    },
    statsGridContainer: {
        marginBottom: SPACING.lg,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: SPACING.base,
    },
    statCard: {
        width: '48%',
        borderRadius: 16,
        padding: SPACING.lg,
        shadowColor: 'rgba(0,0,0,0.1)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 4,
        elevation: 3,
    },
    statCardFull: {
        width: '100%',
        borderRadius: 16,
        padding: SPACING.lg,
        shadowColor: 'rgba(0,0,0,0.1)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 4,
        elevation: 3,
    },
    statCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: SPACING.md,
    },
    statCardTitle: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: FONT_SIZE.base,
        fontWeight: '500',
    },
    statCardValue: {
        color: COLORS.white,
        fontSize: FONT_SIZE['3xl'],
        fontWeight: '700',
        marginBottom: SPACING.xs,
    },
    statCardSubtitle: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: FONT_SIZE.xs,
    },
    emptyState: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: SPACING['2xl'],
        alignItems: 'center',
    },
    emptyStateIcon: {
        marginBottom: SPACING.md,
    },
    emptyStateText: {
        fontSize: FONT_SIZE.md,
        fontWeight: '600',
        color: COLORS.gray700,
        marginBottom: SPACING.xs,
    },
    emptyStateSubtext: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.gray500,
        textAlign: 'center',
    },
    appointmentButton: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: SPACING.md,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.gray100,
    },
    appointmentButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    appointmentIcon: {
        marginRight: SPACING.md,
    },
    appointmentTextContainer: {
        flex: 1,
    },
    appointmentButtonText: {
        fontSize: FONT_SIZE.base,
        fontWeight: '600',
        color: COLORS.gray800,
    },
    appointmentButtonSubtext: {
        fontSize: FONT_SIZE.xs,
        color: COLORS.gray500,
        marginTop: 2,
    },
});

export default DashboardScreen;
