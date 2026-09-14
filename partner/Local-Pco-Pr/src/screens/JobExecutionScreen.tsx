// src/screens/JobExecutionScreen.tsx
// Job execution screen for tracking job progress and completion

import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    TextInput,
    Image,
    Switch,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { COLORS, FONT_SIZE, SPACING, ROUTES, JOB_STATUS } from '../utils/constants';
import { formatCurrency, getJobStatusLabel } from '../utils/helpers';
import { useAppDispatch, useAppSelector } from '../store';
import { updateJobStatus, completeJob, fetchJobById } from '../store/jobSlice';
import jobService from '../services/jobService';
import * as ImagePicker from 'expo-image-picker';

import StatusBadge from '../components/StatusBadge';
import PrimaryButton from '../components/PrimaryButton';
import { PartnerStackParamList } from '../navigation/PartnerStackNavigator';

type JobExecutionRouteProp = RouteProp<PartnerStackParamList, 'JobExecution'>;
type JobExecutionNavigationProp = NativeStackNavigationProp<PartnerStackParamList, 'JobExecution'>;

/**
 * Status step configuration
 */
interface StatusStep {
    status: string;
    label: string;
    icon: string;
    description: string;
}

const STATUS_STEPS: StatusStep[] = [
    {
        status: JOB_STATUS.ACCEPTED,
        label: 'Job Accepted',
        icon: 'check-circle-outline',
        description: 'Navigate to the pickup location',
    },
    {
        status: JOB_STATUS.REACHED,
        label: 'Reached Location',
        icon: 'map-marker-outline',
        description: 'Confirm arrival at pickup point',
    },
    {
        status: JOB_STATUS.IN_PROGRESS,
        label: 'In Progress',
        icon: 'wrench-outline',
        description: 'Service is being performed',
    },
    {
        status: JOB_STATUS.COMPLETED,
        label: 'Completed',
        icon: 'check-all',
        description: 'Job has been completed',
    },
];

/**
 * JobExecutionScreen Component
 * Handles job status updates and completion
 */
const JobExecutionScreen: React.FC = () => {
    const navigation = useNavigation<JobExecutionNavigationProp>();
    const route = useRoute<JobExecutionRouteProp>();
    const dispatch = useAppDispatch();
    const { jobId } = route.params;

    // Redux state
    const { currentJob, isUpdating, isLoading } = useAppSelector((state) => state.job);

    // Local state
    const [showCompletionForm, setShowCompletionForm] = useState(false);
    const [completionNotes, setCompletionNotes] = useState('');
    const [proofImages, setProofImages] = useState<string[]>([]);
    const [localUpdating, setLocalUpdating] = useState(false);
    const [uploadingProof, setUploadingProof] = useState(false);

    /**
     * Pick photo proof via camera or gallery
     */
    const handlePickProofImage = async (useCamera: boolean) => {
        try {
            let result;
            if (useCamera) {
                const { status } = await ImagePicker.requestCameraPermissionsAsync();
                if (status !== 'granted') {
                    Alert.alert('Permission Denied', 'Camera permission is required to capture proof photos.');
                    return;
                }
                result = await ImagePicker.launchCameraAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                    allowsEditing: true,
                    quality: 0.8,
                });
            } else {
                const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (status !== 'granted') {
                    Alert.alert('Permission Denied', 'Gallery permission is required to select photos.');
                    return;
                }
                result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                    allowsEditing: true,
                    quality: 0.8,
                });
            }

            if (!result.canceled && result.assets && result.assets[0]?.uri) {
                const newUri = result.assets[0].uri;
                setProofImages((prev) => [...prev, newUri]);
            }
        } catch (err) {
            console.error('Image selection error:', err);
            Alert.alert('Error', 'Failed to pick image. Please try again.');
        }
    };

    const handleRemoveProofImage = (indexToRemove: number) => {
        setProofImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    };

    /**
     * FIX #8: Fetch job by ID if currentJob is missing or mismatch
     */
    React.useEffect(() => {
        if (jobId && (!currentJob || (currentJob.id !== jobId && currentJob._id !== jobId))) {
            dispatch(fetchJobById(jobId));
        }
    }, [jobId, currentJob, dispatch]);

    /**
     * Get current step index
     */
    const getCurrentStepIndex = useCallback((): number => {
        if (!currentJob) return 0;
        return STATUS_STEPS.findIndex((step) => step.status === currentJob.status);
    }, [currentJob]);

    /**
     * Get next status
     */
    const getNextStatus = useCallback((): string | null => {
        const currentIndex = getCurrentStepIndex();
        if (currentIndex < STATUS_STEPS.length - 1) {
            return STATUS_STEPS[currentIndex + 1].status;
        }
        return null;
    }, [getCurrentStepIndex]);

    /**
     * Handle status update
     */
    const handleUpdateStatus = async () => {
        if (!currentJob || localUpdating || isUpdating) return;

        const nextStatus = getNextStatus();
        if (!nextStatus) return;

        // If next status is completed, show completion form
        if (nextStatus === JOB_STATUS.COMPLETED) {
            setShowCompletionForm(true);
            return;
        }

        try {
            setLocalUpdating(true);
            await dispatch(updateJobStatus({ jobId: currentJob.id, status: nextStatus })).unwrap();
        } catch (error) {
            Alert.alert('Error', 'Failed to update job status. Please try again.');
        } finally {
            setLocalUpdating(false);
        }
    };

    /**
     * Handle job completion with photo proof
     */
    const handleCompleteJob = async () => {
        if (!currentJob || localUpdating || isUpdating) return;

        try {
            setLocalUpdating(true);

            // Upload proof images if available
            let uploadedUrls: string[] = [];
            if (proofImages.length > 0) {
                setUploadingProof(true);
                for (const imgUri of proofImages) {
                    try {
                        const targetId = currentJob.id || (currentJob as any)._id;
                        const res = await jobService.uploadProofImage(targetId, imgUri);
                        if (res?.url) uploadedUrls.push(res.url);
                    } catch (uploadErr) {
                        console.warn('Proof upload fallback to URI:', uploadErr);
                        uploadedUrls.push(imgUri);
                    }
                }
                setUploadingProof(false);
            }

            await dispatch(
                completeJob({
                    jobId: currentJob.id || (currentJob as any)._id,
                    proofImages: uploadedUrls,
                    notes: completionNotes,
                })
            ).unwrap();

            Alert.alert(
                'Job Completed! 🎉',
                'Job marked as completed. Payout is now processing.',
                [
                    {
                        text: 'Go to Dashboard',
                        onPress: () => navigation.navigate(ROUTES.DASHBOARD),
                    },
                ]
            );
        } catch (error) {
            Alert.alert('Error', 'Failed to complete job. Please try again.');
        } finally {
            setLocalUpdating(false);
            setUploadingProof(false);
        }
    };

    /**
     * Handle partner cancel job (Fix #27)
     */
    const handleCancelJob = () => {
        if (!currentJob) return;

        Alert.alert(
            'Cancel Job 🚫',
            'Are you sure you want to cancel this active job? The client will be notified.',
            [
                { text: 'No, Keep Working', style: 'cancel' },
                {
                    text: 'Yes, Cancel Job',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setLocalUpdating(true);
                            await dispatch(updateJobStatus({ jobId: currentJob.id, status: JOB_STATUS.CANCELLED })).unwrap();
                            Alert.alert('Job Cancelled', 'The job has been cancelled successfully.');
                            navigation.navigate(ROUTES.DASHBOARD);
                        } catch (err: any) {
                            Alert.alert('Error', err || 'Failed to cancel job');
                        } finally {
                            setLocalUpdating(false);
                        }
                    },
                },
            ]
        );
    };



    /**
     * Handle go back
     */
    const handleGoBack = () => {
        navigation.goBack();
    };

    // Loading state
    if (!currentJob) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Loading...</Text>
                </View>
            </SafeAreaView>
        );
    }

    const currentStepIndex = getCurrentStepIndex();
    const nextStatus = getNextStatus();
    const isCompleted = currentJob.status === JOB_STATUS.COMPLETED;

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.gray700} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Job Progress</Text>
                <StatusBadge status={currentJob.status} variant="job" />
            </View>

            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
            >
                {/* Job Summary */}
                <View style={styles.summaryCard}>
                    <View style={styles.summaryHeader}>
                        <Text style={styles.serviceType}>{currentJob.serviceType}</Text>

                    </View>
                    <View style={styles.clientRow}>
                        <Text style={styles.clientLabel}>Client:</Text>
                        <Text style={styles.clientName}>{currentJob.clientName}</Text>
                    </View>

                </View>

                {/* Progress Steps */}
                <View style={styles.stepsContainer}>
                    <Text style={styles.stepsTitle}>Progress</Text>

                    {STATUS_STEPS.map((step, index) => {
                        const isActive = index === currentStepIndex;
                        const isCompleted = index < currentStepIndex;
                        const isPending = index > currentStepIndex;

                        return (
                            <View key={step.status} style={styles.stepRow}>
                                {/* Step Line */}
                                <View style={styles.stepLineContainer}>
                                    <View
                                        style={[
                                            styles.stepCircle,
                                            isCompleted && styles.stepCircleCompleted,
                                            isActive && styles.stepCircleActive,
                                        ]}
                                    >
                                        <MaterialCommunityIcons 
                                            name={(isCompleted ? 'check' : step.icon) as any} 
                                            size={20} 
                                            color={(isCompleted || isActive) ? COLORS.white : COLORS.gray500} 
                                        />
                                    </View>
                                    {index < STATUS_STEPS.length - 1 && (
                                        <View
                                            style={[
                                                styles.stepLine,
                                                isCompleted && styles.stepLineCompleted,
                                            ]}
                                        />
                                    )}
                                </View>

                                {/* Step Content */}
                                <View style={[styles.stepContent, isActive && styles.stepContentActive]}>
                                    <Text
                                        style={[
                                            styles.stepLabel,
                                            isActive && styles.stepLabelActive,
                                            isPending && styles.stepLabelPending,
                                        ]}
                                    >
                                        {step.label}
                                    </Text>
                                    <Text
                                        style={[
                                            styles.stepDescription,
                                            isPending && styles.stepDescriptionPending,
                                        ]}
                                    >
                                        {step.description}
                                    </Text>
                                </View>
                            </View>
                        );
                    })}
                </View>

                {/* Completion Form with Photo Proof */}
                {showCompletionForm && (
                    <View style={styles.completionForm}>
                        <Text style={styles.completionTitle}>Complete Service & Upload Proof</Text>
                        <Text style={styles.stepDescription}>
                            Capture photo proof of your work and add completion notes:
                        </Text>

                        {/* Photo Proof Action Buttons */}
                        <View style={styles.photoActionRow}>
                            <TouchableOpacity
                                style={styles.photoPickerBtn}
                                onPress={() => handlePickProofImage(true)}
                                activeOpacity={0.7}
                            >
                                <MaterialCommunityIcons name="camera" size={20} color={COLORS.primary} />
                                <Text style={styles.photoPickerBtnText}>Take Photo</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.photoPickerBtn}
                                onPress={() => handlePickProofImage(false)}
                                activeOpacity={0.7}
                            >
                                <MaterialCommunityIcons name="image" size={20} color={COLORS.primary} />
                                <Text style={styles.photoPickerBtnText}>Choose Gallery</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Proof Thumbnails Grid */}
                        {proofImages.length > 0 && (
                            <View style={styles.thumbnailGrid}>
                                {proofImages.map((uri, idx) => (
                                    <View key={idx} style={styles.thumbnailWrapper}>
                                        <Image source={{ uri }} style={styles.thumbnailImage} />
                                        <TouchableOpacity
                                            style={styles.removeThumbnailBtn}
                                            onPress={() => handleRemoveProofImage(idx)}
                                        >
                                            <MaterialCommunityIcons name="close" size={14} color={COLORS.white} />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>
                        )}

                        <TextInput
                            style={styles.notesInput}
                            placeholder="e.g. Work completed, checked for leaks and verified functionality..."
                            placeholderTextColor={COLORS.gray400}
                            multiline
                            numberOfLines={3}
                            value={completionNotes}
                            onChangeText={setCompletionNotes}
                        />
                    </View>
                )}
            </ScrollView>

            {/* Action Button */}
            <View style={styles.actionContainer}>
                {!isCompleted && (
                    <>
                        {showCompletionForm ? (
                            <View style={styles.completionActions}>
                                <PrimaryButton
                                    title="Back"
                                    onPress={() => setShowCompletionForm(false)}
                                    variant="outline"
                                    style={styles.cancelButton}
                                />

                                <PrimaryButton
                                    title="Complete Job"
                                    onPress={handleCompleteJob}
                                    variant="secondary"
                                    loading={isUpdating || localUpdating}
                                    style={styles.completeButton}
                                />
                            </View>
                        ) : (
                            <View style={styles.actionColumn}>
                                <PrimaryButton
                                    title={
                                        nextStatus === JOB_STATUS.COMPLETED
                                            ? 'Complete Job'
                                            : `Mark as ${getJobStatusLabel(nextStatus || '')}`
                                    }
                                    onPress={handleUpdateStatus}
                                    variant="primary"
                                    loading={isUpdating || localUpdating}
                                    fullWidth
                                />

                                <TouchableOpacity
                                    style={styles.cancelJobBtn}
                                    onPress={handleCancelJob}
                                    activeOpacity={0.7}
                                >
                                    <MaterialCommunityIcons name="close-circle-outline" size={16} color={COLORS.danger} />
                                    <Text style={styles.cancelJobText}>Cancel Job</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </>
                )}

                {isCompleted && (
                    <View style={styles.completedMessage}>
                        <MaterialCommunityIcons name="check-decagram" size={48} color={COLORS.success} style={styles.completedIcon} />
                        <Text style={styles.completedText}>Job Completed Successfully!</Text>
                    </View>
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
    backButtonText: {
        fontSize: FONT_SIZE.xl,
        color: COLORS.gray700,
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
    summaryCard: {
        backgroundColor: COLORS.gray50,
        borderRadius: 16,
        padding: SPACING.base,
        marginBottom: SPACING.lg,
    },
    summaryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    serviceType: {
        fontSize: FONT_SIZE.xl,
        fontWeight: '700',
        color: COLORS.gray900,
    },
    earnings: {
        fontSize: FONT_SIZE.lg,
        fontWeight: '700',
        color: COLORS.secondary,
    },
    clientRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    clientLabel: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.gray500,
        marginRight: SPACING.xs,
    },
    clientName: {
        fontSize: FONT_SIZE.sm,
        fontWeight: '600',
        color: COLORS.gray800,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    locationIcon: {
        marginRight: SPACING.xs,
        marginTop: 2,
    },
    locationText: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.gray600,
        flex: 1,
        lineHeight: 20,
    },
    stepsContainer: {
        marginBottom: SPACING.lg,
    },
    stepsTitle: {
        fontSize: FONT_SIZE.sm,
        fontWeight: '600',
        color: COLORS.gray500,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: SPACING.md,
    },
    stepRow: {
        flexDirection: 'row',
        marginBottom: SPACING.md,
    },
    stepLineContainer: {
        alignItems: 'center',
        marginRight: SPACING.md,
    },
    stepCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: COLORS.gray200,
        justifyContent: 'center',
        alignItems: 'center',
    },
    stepCircleCompleted: {
        backgroundColor: COLORS.success,
    },
    stepCircleActive: {
        backgroundColor: COLORS.primary,
    },
    stepLine: {
        width: 2,
        flex: 1,
        backgroundColor: COLORS.gray200,
        marginTop: 4,
        minHeight: 30,
    },
    stepLineCompleted: {
        backgroundColor: COLORS.success,
    },
    stepContent: {
        flex: 1,
        paddingTop: 6,
    },
    stepContentActive: {
        backgroundColor: COLORS.primary + '10',
        marginLeft: -SPACING.sm,
        marginRight: -SPACING.sm,
        paddingLeft: SPACING.sm,
        paddingRight: SPACING.sm,
        paddingTop: SPACING.sm,
        paddingBottom: SPACING.sm,
        borderRadius: 12,
    },
    stepLabel: {
        fontSize: FONT_SIZE.base,
        fontWeight: '600',
        color: COLORS.gray700,
    },
    stepLabelActive: {
        color: COLORS.primary,
    },
    stepLabelPending: {
        color: COLORS.gray400,
    },
    stepDescription: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.gray500,
        marginTop: 2,
    },
    stepDescriptionPending: {
        color: COLORS.gray300,
    },
    completionForm: {
        backgroundColor: COLORS.gray50,
        borderRadius: 16,
        padding: SPACING.base,
        borderWidth: 1,
        borderColor: COLORS.gray200,
    },
    completionTitle: {
        fontSize: FONT_SIZE.lg,
        fontWeight: '600',
        color: COLORS.gray900,
        marginBottom: SPACING.xs,
    },
    notesInput: {
        backgroundColor: COLORS.white,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: COLORS.gray200,
        padding: SPACING.md,
        fontSize: FONT_SIZE.base,
        color: COLORS.gray900,
        marginTop: SPACING.md,
        textAlignVertical: 'top',
        minHeight: 80,
    },
    photoActionRow: {
        flexDirection: 'row',
        gap: SPACING.sm,
        marginTop: SPACING.md,
    },
    photoPickerBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: SPACING.sm,
        backgroundColor: COLORS.white,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.gray300,
    },
    photoPickerBtnText: {
        fontSize: FONT_SIZE.sm,
        fontWeight: '600',
        color: COLORS.gray700,
    },
    thumbnailGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.sm,
        marginTop: SPACING.sm,
    },
    thumbnailWrapper: {
        width: 72,
        height: 72,
        borderRadius: 8,
        overflow: 'hidden',
        position: 'relative',
        borderWidth: 1,
        borderColor: COLORS.gray300,
    },
    thumbnailImage: {
        width: '100%',
        height: '100%',
    },
    removeThumbnailBtn: {
        position: 'absolute',
        top: 2,
        right: 2,
        backgroundColor: 'rgba(0,0,0,0.65)',
        borderRadius: 10,
        width: 20,
        height: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionContainer: {
        padding: SPACING.base,
        paddingBottom: SPACING.xl,
        backgroundColor: COLORS.white,
        borderTopWidth: 1,
        borderTopColor: COLORS.gray100,
    },
    actionColumn: {
        gap: SPACING.xs,
    },
    cancelJobBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: SPACING.sm,
        gap: 4,
        marginTop: 4,
    },
    cancelJobText: {
        fontSize: FONT_SIZE.sm,
        fontWeight: '600',
        color: COLORS.danger,
    },
    completionActions: {
        flexDirection: 'row',
    },
    cancelButton: {
        flex: 1,
        marginRight: SPACING.sm,
    },
    completeButton: {
        flex: 2,
        marginLeft: SPACING.sm,
    },
    completedMessage: {
        alignItems: 'center',
        padding: SPACING.base,
    },
    completedIcon: {
        marginBottom: SPACING.sm,
    },
    completedText: {
        fontSize: FONT_SIZE.lg,
        fontWeight: '600',
        color: COLORS.success,
    },
});

export default JobExecutionScreen;
