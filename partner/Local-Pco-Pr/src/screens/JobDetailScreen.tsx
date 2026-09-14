// src/screens/JobDetailScreen.tsx
// Job detail screen showing full job information with actions

import React, { useEffect, useCallback, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    Linking,
    Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { COLORS, FONT_SIZE, SPACING, ROUTES, JOB_STATUS } from '../utils/constants';
import { formatCurrency, formatDistance, formatDateTime } from '../utils/helpers';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchJobById, setCurrentJob, acceptJob } from '../store/jobSlice';

import StatusBadge from '../components/StatusBadge';
import PrimaryButton from '../components/PrimaryButton';
import { PartnerStackParamList } from '../navigation/PartnerStackNavigator';

type JobDetailRouteProp = RouteProp<PartnerStackParamList, 'JobDetail'>;
type JobDetailNavigationProp = NativeStackNavigationProp<PartnerStackParamList, 'JobDetail'>;

/**
 * JobDetailScreen Component
 * Shows full job details with navigation, call, and start actions
 */
const JobDetailScreen: React.FC = () => {
    const navigation = useNavigation<JobDetailNavigationProp>();
    const route = useRoute<JobDetailRouteProp>();
    const dispatch = useAppDispatch();
    const { jobId } = route.params;

    // Redux state
    const { currentJob, isLoading } = useAppSelector((state) => state.job);

    // Local state
    const [accepting, setAccepting] = useState(false);

    /**
     * Fetch job details on mount.
     * FIX #7: Removed the cleanup dispatch(setCurrentJob(null)) that was clearing Redux state
     * on unmount — this caused JobExecutionScreen to see null currentJob and hang on "Loading...".
     * Job state is now only cleared on explicit navigation away (logout, completion, etc.).
     */
    useEffect(() => {
        if (jobId) {
            dispatch(fetchJobById(jobId));
        }
    }, [jobId, dispatch]);


    /**
     * Handle call client
     */
    const handleCallClient = useCallback(() => {
        if (!currentJob?.clientPhone) return;

        const phoneNumber = `tel:${currentJob.clientPhone}`;
        Linking.openURL(phoneNumber).catch(() => {
            Alert.alert('Error', 'Unable to make phone call');
        });
    }, [currentJob]);

    /**
     * Handle accept job.
     * FIX #10: Auto-navigate to JobExecution immediately after a successful accept.
     * Previously showed only an Alert and required manual navigation.
     */
    const handleAcceptJob = async () => {
        if (!currentJob) return;
        setAccepting(true);
        try {
            await dispatch(acceptJob(currentJob.id)).unwrap();
            // Navigate directly into job execution — no intermediate Alert needed
            navigation.replace(ROUTES.JOB_EXECUTION, { jobId: currentJob.id });
        } catch (error: any) {
            Alert.alert('Error', error || 'Failed to accept job');
        } finally {
            setAccepting(false);
        }
    };

    /**
     * Handle start job
     */
    const handleStartJob = () => {
        if (!currentJob) return;
        navigation.navigate(ROUTES.JOB_EXECUTION, { jobId: currentJob.id });
    };

    /**
     * Handle go back
     */
    const handleGoBack = () => {
        navigation.goBack();
    };

    // Show loading state
    if (isLoading || !currentJob) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Loading job details...</Text>
                </View>
            </SafeAreaView>
        );
    }

    const isPending = currentJob.status === JOB_STATUS.PENDING;
    const isJobActive = [JOB_STATUS.ACCEPTED, JOB_STATUS.REACHED, JOB_STATUS.IN_PROGRESS].includes(
        currentJob.status as any
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.gray700} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Job Details</Text>
                <StatusBadge status={currentJob.status} variant="job" />
            </View>

            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
            >
                {/* Service Info */}
                <View style={styles.section}>
                    <View style={styles.serviceHeader}>
                        <View style={styles.serviceIcon}>
                            <Text style={styles.serviceIconText}>
                                {currentJob.serviceType?.charAt(0).toUpperCase() || 'S'}
                            </Text>
                        </View>
                        <View style={styles.serviceInfo}>
                            <Text style={styles.serviceType}>{currentJob.serviceType || 'Service'}</Text>
                            <Text style={styles.serviceCategory}>{currentJob.serviceCategory || 'Unknown'}</Text>
                            <Text style={styles.jobId}>ID: {currentJob.id?.slice(0, 8) || 'N/A'}</Text>
                        </View>

                    </View>
                </View>

                {/* Client Info */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Client Information</Text>
                    <View style={styles.clientCard}>
                        <View style={styles.clientAvatar}>
                            <Text style={styles.clientAvatarText}>
                                {currentJob.clientName?.charAt(0).toUpperCase() || 'C'}
                            </Text>
                        </View>
                        <View style={styles.clientDetails}>
                            <Text style={styles.clientName}>{currentJob.clientName || 'Unknown Client'}</Text>
                            <Text style={styles.clientPhone}>{currentJob.clientPhone || 'No phone'}</Text>
                        </View>
                        <TouchableOpacity style={styles.callButton} onPress={handleCallClient}>
                            <MaterialCommunityIcons name="phone-outline" size={20} color={COLORS.success} />
                        </TouchableOpacity>
                    </View>
                </View>



                {/* Location — FIX #14: was rendered in dead code, now visible */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Pickup Address</Text>
                    <View style={styles.locationCard}>
                        <View style={styles.locationIcon}>
                            <MaterialCommunityIcons name="map-marker" size={22} color={COLORS.primary} />
                        </View>
                        <View style={styles.locationDetails}>
                            <Text style={styles.addressText}>
                                {currentJob.pickupAddress || 'Address not available'}
                            </Text>
                            {currentJob.pickupLatitude !== 0 && (
                                <Text style={styles.distanceText}>
                                    {currentJob.pickupLatitude.toFixed(4)}° N, {currentJob.pickupLongitude.toFixed(4)}° E
                                </Text>
                            )}
                        </View>
                    </View>
                </View>

                {/* Job Details */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Job Details</Text>
                    <View style={styles.detailsGrid}>
                        <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>Created</Text>
                            <Text style={styles.detailValue}>
                                {formatDateTime(currentJob.createdAt)}
                            </Text>
                        </View>
                        {currentJob.estimatedPrice > 0 && (
                            <View style={styles.detailItem}>
                                <Text style={styles.detailLabel}>Est. Earnings</Text>
                                <Text style={[styles.detailValue, { color: COLORS.secondary, fontWeight: '700' }]}>
                                    {formatCurrency(currentJob.estimatedPrice)}
                                </Text>
                            </View>
                        )}
                        {currentJob.bookingType && (
                            <View style={styles.detailItem}>
                                <Text style={styles.detailLabel}>Booking Type</Text>
                                <Text style={styles.detailValue}>
                                    {currentJob.bookingType.replace('_', ' ')}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Description */}
                {currentJob.description && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Description</Text>
                        <Text style={styles.descriptionText}>{currentJob.description}</Text>
                    </View>
                )}

                {/* Notes / Instructions */}
                {currentJob.notes && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Special Instructions</Text>
                        <View style={styles.notesCard}>
                            <Text style={styles.notesText}>{currentJob.notes}</Text>
                        </View>
                    </View>
                )}
            </ScrollView>

            {/* Action Buttons */}
            <View style={styles.actionContainer}>
                {isPending && (
                    <PrimaryButton
                        title="Accept Job"
                        onPress={handleAcceptJob}
                        variant="primary"
                        loading={accepting}
                        style={styles.startButton}
                    />
                )}
                {isJobActive && (
                    <PrimaryButton
                        title={currentJob.status === JOB_STATUS.ACCEPTED ? 'Start Job' : 'Continue'}
                        onPress={handleStartJob}
                        variant="primary"
                        style={styles.startButton}
                    />
                )}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.base,
        paddingVertical: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gray100,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.gray100,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: FONT_SIZE.lg,
        fontWeight: '600',
        color: COLORS.gray900,
    },
    container: {
        flex: 1,
    },
    contentContainer: {
        padding: SPACING.base,
        paddingBottom: SPACING['2xl'],
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: FONT_SIZE.base,
        color: COLORS.gray500,
    },
    section: {
        marginBottom: SPACING.lg,
    },
    sectionTitle: {
        fontSize: FONT_SIZE.sm,
        fontWeight: '600',
        color: COLORS.gray500,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: SPACING.md,
    },
    serviceHeader: {
        flexDirection: 'row',
        alignItems: 'center',
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
    serviceInfo: {
        flex: 1,
    },
    serviceType: {
        fontSize: FONT_SIZE.lg,
        fontWeight: '700',
        color: COLORS.gray900,
    },
    serviceCategory: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.gray500,
        marginTop: 2,
    },
    jobId: {
        fontSize: FONT_SIZE.xs,
        color: COLORS.gray400,
        marginTop: 4,
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
    priceContainer: {
        alignItems: 'flex-end',
    },
    priceLabel: {
        fontSize: FONT_SIZE.xs,
        color: COLORS.gray500,
        textTransform: 'uppercase',
    },
    priceValue: {
        fontSize: FONT_SIZE.xl,
        fontWeight: '700',
        color: COLORS.secondary,
    },
    clientCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.gray50,
        padding: SPACING.md,
        borderRadius: 12,
    },
    clientAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
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
    clientDetails: {
        flex: 1,
    },
    clientName: {
        fontSize: FONT_SIZE.md,
        fontWeight: '600',
        color: COLORS.gray900,
    },
    clientPhone: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.gray500,
        marginTop: 2,
    },
    callButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: COLORS.success + '20',
        justifyContent: 'center',
        alignItems: 'center',
    },
    locationCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: COLORS.gray50,
        padding: SPACING.md,
        borderRadius: 12,
        marginBottom: SPACING.md,
    },
    locationIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.primary + '15',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.md,
    },
    locationDetails: {
        flex: 1,
    },
    addressText: {
        fontSize: FONT_SIZE.base,
        color: COLORS.gray800,
        lineHeight: 22,
    },
    distanceText: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.primary,
        fontWeight: '500',
        marginTop: 4,
    },
    mapPreview: {
        height: 140,
        backgroundColor: COLORS.gray100,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    mapPlaceholderText: {
        fontSize: FONT_SIZE.lg,
        color: COLORS.gray500,
        fontWeight: '500',
    },
    mapPlaceholderSubtext: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.gray400,
        marginTop: 4,
    },
    detailsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        backgroundColor: COLORS.gray50,
        borderRadius: 12,
        padding: SPACING.sm,
    },
    detailItem: {
        width: '50%',
        padding: SPACING.sm,
    },
    detailLabel: {
        fontSize: FONT_SIZE.xs,
        color: COLORS.gray500,
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    detailValue: {
        fontSize: FONT_SIZE.base,
        fontWeight: '500',
        color: COLORS.gray800,
    },
    descriptionText: {
        fontSize: FONT_SIZE.base,
        color: COLORS.gray700,
        lineHeight: 24,
    },
    notesCard: {
        backgroundColor: COLORS.accent + '10',
        padding: SPACING.md,
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: COLORS.accent,
    },
    notesText: {
        fontSize: FONT_SIZE.base,
        color: COLORS.gray700,
        lineHeight: 22,
    },
    actionContainer: {
        flexDirection: 'row',
        padding: SPACING.base,
        paddingBottom: SPACING.xl,
        backgroundColor: COLORS.white,
        borderTopWidth: 1,
        borderTopColor: COLORS.gray100,
    },
    startButton: {
        flex: 1,
    },
});

export default JobDetailScreen;
