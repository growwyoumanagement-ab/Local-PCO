// src/screens/JobRequestScreen.tsx
// Job request screen for accepting or rejecting incoming jobs

import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    TouchableOpacity,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { COLORS, FONT_SIZE, SPACING, ROUTES, JOB_REQUEST_TIMEOUT } from '../utils/constants';
import { formatCurrency, formatDistance } from '../utils/helpers';
import { useAppDispatch, useAppSelector } from '../store';
import { acceptJob, rejectJob, removePendingRequest, fetchJobById } from '../store/jobSlice';

import PrimaryButton from '../components/PrimaryButton';
import { PartnerStackParamList } from '../navigation/PartnerStackNavigator';

type JobRequestRouteProp = RouteProp<PartnerStackParamList, 'JobRequest'>;
type JobRequestNavigationProp = NativeStackNavigationProp<PartnerStackParamList, 'JobRequest'>;

/**
 * JobRequestScreen Component
 * Displays incoming job request with accept/reject options and timeout
 */
const JobRequestScreen: React.FC = () => {
    const navigation = useNavigation<JobRequestNavigationProp>();
    const route = useRoute<JobRequestRouteProp>();
    const dispatch = useAppDispatch();

    // Redux state
    const { pendingRequests, currentJob, isUpdating } = useAppSelector((state) => state.job);

    // Get job from route params or first pending request
    const jobId = route.params?.jobId;
    const job = jobId
        ? pendingRequests.find(j => j.id === jobId) || currentJob
        : pendingRequests[0];

    // Local state
    const [timeRemaining, setTimeRemaining] = useState(JOB_REQUEST_TIMEOUT);
    const [isExpired, setIsExpired] = useState(false);

    // Animation values
    const progressAnim = useRef(new Animated.Value(1)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;

    /**
     * Fetch job details if not in pending requests
     */
    useEffect(() => {
        if (jobId && !job) {
            dispatch(fetchJobById(jobId));
        }
    }, [jobId, job, dispatch]);

    // Timer & animation refs — FIX #17 (prevent interval leaks)
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    /**
     * Handle timeout - auto reject
     * FIX #15: Moved execution out of setTimeRemaining state setter
     */
    const handleTimeout = useCallback(async () => {
        if (job) {
            await dispatch(rejectJob({ jobId: job.id, reason: 'Timeout' }));
            dispatch(removePendingRequest(job.id));
            navigation.goBack();
        }
    }, [job, dispatch, navigation]);

    /**
     * Countdown timer for auto-reject
     */
    useEffect(() => {
        if (!job || isExpired) return;

        // FIX #16: Reset animation on new job
        progressAnim.setValue(1);

        timerRef.current = setInterval(() => {
            setTimeRemaining((prev) => {
                if (prev <= 1) {
                    if (timerRef.current) clearInterval(timerRef.current);
                    setIsExpired(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        Animated.timing(progressAnim, {
            toValue: 0,
            duration: JOB_REQUEST_TIMEOUT * 1000,
            useNativeDriver: false,
        }).start();

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            progressAnim.stopAnimation();
        };
    }, [job?.id, isExpired]);

    // Trigger auto-reject when timer expires
    useEffect(() => {
        if (isExpired) {
            handleTimeout();
        }
    }, [isExpired, handleTimeout]);

    /**
     * Handle accept job
     */
    const handleAccept = async () => {
        if (!job) return;

        // Pulse animation
        Animated.sequence([
            Animated.timing(scaleAnim, { toValue: 0.95, duration: 100, useNativeDriver: true }),
            Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
        ]).start();

        try {
            await dispatch(acceptJob(job.id)).unwrap();
            navigation.replace(ROUTES.JOB_DETAIL, { jobId: job.id });
        } catch (error) {
            console.error('Failed to accept job:', error);
        }
    };

    /**
     * Handle reject job
     */
    const handleReject = async () => {
        if (!job) return;

        try {
            await dispatch(rejectJob({ jobId: job.id })).unwrap();

            // Check if more pending requests exist
            if (pendingRequests.length > 1) {
                // Show next request
                setTimeRemaining(JOB_REQUEST_TIMEOUT);
                setIsExpired(false);
                progressAnim.setValue(1);
            } else {
                navigation.goBack();
            }
        } catch (error) {
            console.error('Failed to reject job:', error);
        }
    };

    /**
     * Handle close/dismiss
     */
    const handleClose = () => {
        navigation.goBack();
    };

    // Show loading or empty state if no job
    if (!job) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.emptyContainer}>
                    <MaterialCommunityIcons name="clipboard-text-outline" size={64} color={COLORS.gray300} style={styles.emptyIcon} />
                    <Text style={styles.emptyText}>No pending requests</Text>
                    <PrimaryButton
                        title="Go Back"
                        onPress={handleClose}
                        variant="outline"
                        style={{ marginTop: SPACING.lg }}
                    />
                </View>
            </SafeAreaView>
        );
    }

    const progressWidth = progressAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%'],
    });

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                {/* Header with close button */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                        <MaterialCommunityIcons name="close" size={24} color={COLORS.gray600} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>New Job Request</Text>
                    <View style={styles.timerContainer}>
                        <Text style={[styles.timerText, timeRemaining <= 10 && styles.timerTextUrgent]}>
                            {timeRemaining}s
                        </Text>
                    </View>
                </View>

                {/* Timer Progress Bar */}
                <View style={styles.progressBarContainer}>
                    <Animated.View
                        style={[
                            styles.progressBar,
                            {
                                width: progressWidth,
                                backgroundColor: timeRemaining <= 10 ? COLORS.danger : COLORS.primary,
                            },
                        ]}
                    />
                </View>

                {/* Job Content */}
                <Animated.View style={[styles.content, { transform: [{ scale: scaleAnim }] }]}>
                    {/* Service Type */}
                    <View style={styles.serviceContainer}>
                        <View style={styles.serviceIcon}>
                            <Text style={styles.serviceIconText}>
                                {job.serviceType.charAt(0).toUpperCase()}
                            </Text>
                        </View>
                        <View>
                            <Text style={styles.serviceType}>{job.serviceType}</Text>
                            <Text style={styles.serviceCategory}>{job.serviceCategory}</Text>
                        </View>
                    </View>

                    {/* Client Info */}
                    <View style={styles.clientSection}>
                        <View style={styles.clientAvatar}>
                            <Text style={styles.clientAvatarText}>
                                {job.clientName.charAt(0).toUpperCase()}
                            </Text>
                        </View>
                        <View style={styles.clientInfo}>
                            <Text style={styles.clientName}>{job.clientName}</Text>
                            <View style={styles.clientRatingContainer}>
                                <MaterialCommunityIcons name="star" size={14} color="#FFD700" style={{ marginRight: 2 }} />
                                <Text style={styles.clientRating}>4.8 (120 jobs)</Text>
                            </View>
                        </View>
                    </View>

                    {/* Location */}
                    <View style={styles.infoSection}>
                        <View style={styles.infoLabelContainer}>
                            <MaterialCommunityIcons name="map-marker-outline" size={16} color={COLORS.gray500} style={{ marginRight: 4 }} />
                            <Text style={styles.infoLabel}>Pickup Location</Text>
                        </View>
                        <Text style={styles.infoValue} numberOfLines={2}>
                            {job.pickupAddress}
                        </Text>
                    </View>

                    {/* Distance */}
                    <View style={styles.metricsContainer}>
                        <View style={styles.metricItem}>
                            <Text style={styles.metricLabel}>Distance</Text>
                            <Text style={styles.metricValue}>{formatDistance(job.distance)}</Text>
                        </View>
                    </View>

                    {/* Notes if any */}
                    {job.notes && (
                        <View style={styles.notesSection}>
                            <View style={styles.notesLabelContainer}>
                                <MaterialCommunityIcons name="notebook-outline" size={16} color={COLORS.gray700} style={{ marginRight: 4 }} />
                                <Text style={styles.notesLabel}>Special Instructions</Text>
                            </View>
                            <Text style={styles.notesText}>{job.notes}</Text>
                        </View>
                    )}
                </Animated.View>

                {/* Action Buttons */}
                <View style={styles.actionContainer}>
                    <PrimaryButton
                        title="Reject"
                        onPress={handleReject}
                        variant="outline"
                        loading={isUpdating}
                        style={styles.rejectButton}
                    />
                    <PrimaryButton
                        title="Accept Job"
                        onPress={handleAccept}
                        variant="secondary"
                        loading={isUpdating}
                        style={styles.acceptButton}
                    />
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.base,
        paddingVertical: SPACING.md,
    },
    closeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.gray100,
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButtonText: {
        fontSize: FONT_SIZE.lg,
        color: COLORS.gray600,
    },
    headerTitle: {
        fontSize: FONT_SIZE.lg,
        fontWeight: '600',
        color: COLORS.gray900,
    },
    timerContainer: {
        width: 50,
        alignItems: 'flex-end',
    },
    timerText: {
        fontSize: FONT_SIZE.lg,
        fontWeight: '700',
        color: COLORS.primary,
    },
    timerTextUrgent: {
        color: COLORS.danger,
    },
    progressBarContainer: {
        height: 4,
        backgroundColor: COLORS.gray200,
        marginHorizontal: SPACING.base,
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        borderRadius: 2,
    },
    content: {
        flex: 1,
        padding: SPACING.base,
    },
    serviceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.lg,
    },
    serviceIcon: {
        width: 56,
        height: 56,
        borderRadius: 14,
        backgroundColor: COLORS.primary + '15',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.md,
    },
    serviceIconText: {
        fontSize: FONT_SIZE['2xl'],
        fontWeight: '700',
        color: COLORS.primary,
    },
    serviceType: {
        fontSize: FONT_SIZE.xl,
        fontWeight: '700',
        color: COLORS.gray900,
    },
    serviceCategory: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.gray500,
        marginTop: 2,
    },
    clientSection: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.gray50,
        padding: SPACING.md,
        borderRadius: 12,
        marginBottom: SPACING.base,
    },
    clientAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: COLORS.secondary + '20',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.md,
    },
    clientAvatarText: {
        fontSize: FONT_SIZE.lg,
        fontWeight: '600',
        color: COLORS.secondary,
    },
    clientInfo: {
        flex: 1,
    },
    clientName: {
        fontSize: FONT_SIZE.md,
        fontWeight: '600',
        color: COLORS.gray900,
    },
    clientRatingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    clientRating: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.gray500,
    },
    infoSection: {
        marginBottom: SPACING.base,
    },
    infoLabelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    infoLabel: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.gray500,
    },
    infoValue: {
        fontSize: FONT_SIZE.base,
        color: COLORS.gray800,
        lineHeight: 22,
    },
    metricsContainer: {
        flexDirection: 'row',
        backgroundColor: COLORS.gray50,
        borderRadius: 12,
        padding: SPACING.base,
        marginBottom: SPACING.base,
    },
    metricItem: {
        flex: 1,
        alignItems: 'center',
    },
    metricDivider: {
        width: 1,
        backgroundColor: COLORS.gray200,
        marginHorizontal: SPACING.md,
    },
    metricLabel: {
        fontSize: FONT_SIZE.xs,
        color: COLORS.gray500,
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    metricValue: {
        fontSize: FONT_SIZE.xl,
        fontWeight: '700',
        color: COLORS.gray900,
    },
    earningsValue: {
        color: COLORS.secondary,
    },
    notesSection: {
        backgroundColor: COLORS.accent + '10',
        borderRadius: 12,
        padding: SPACING.md,
        borderLeftWidth: 4,
        borderLeftColor: COLORS.accent,
    },
    notesLabelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    notesLabel: {
        fontSize: FONT_SIZE.sm,
        fontWeight: '600',
        color: COLORS.gray700,
    },
    notesText: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.gray600,
        lineHeight: 20,
    },
    actionContainer: {
        flexDirection: 'row',
        padding: SPACING.base,
        paddingBottom: SPACING.xl,
        backgroundColor: COLORS.white,
        borderTopWidth: 1,
        borderTopColor: COLORS.gray100,
    },
    rejectButton: {
        flex: 1,
        marginRight: SPACING.sm,
    },
    acceptButton: {
        flex: 2,
        marginLeft: SPACING.sm,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.xl,
    },
    emptyIcon: {
        marginBottom: SPACING.md,
    },
    emptyText: {
        fontSize: FONT_SIZE.lg,
        color: COLORS.gray500,
    },
});

export default JobRequestScreen;
