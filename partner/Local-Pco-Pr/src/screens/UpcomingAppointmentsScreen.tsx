import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    StatusBar,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchPendingRequests, fetchAcceptedAppointments, acceptJob, rejectJob } from '../store/jobSlice';
import { COLORS, FONT_SIZE, SPACING, ROUTES } from '../utils/constants';
import { formatCurrency } from '../utils/helpers';
import { Job } from '../services/jobService';

const UpcomingAppointmentsScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const dispatch = useAppDispatch();

    const { pendingRequests = [], acceptedAppointments = [], isLoading } = useAppSelector((state) => state.job);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState<'invitations' | 'confirmed'>('invitations');

    // Filter pending appointments from list of all pending requests
    const appointmentInvitations = pendingRequests.filter(
        (req) => req.bookingType === 'appointment'
    );

    const loadData = useCallback(async () => {
        try {
            await Promise.all([
                dispatch(fetchPendingRequests()).unwrap(),
                dispatch(fetchAcceptedAppointments()).unwrap(),
            ]);
        } catch (error: any) {
            console.error('[UpcomingAppointments] Load Error:', error);
        }
    }, [dispatch]);

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [loadData])
    );

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    const handleAccept = async (jobId: string) => {
        Alert.alert(
            'Accept Appointment 📅',
            'Are you sure you want to accept this scheduled appointment?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Accept',
                    onPress: async () => {
                        try {
                            await dispatch(acceptJob(jobId)).unwrap();
                            Alert.alert('Success', 'Appointment accepted successfully!');
                            loadData();
                        } catch (error: any) {
                            Alert.alert('Error', error || 'Failed to accept appointment');
                        }
                    },
                },
            ]
        );
    };

    const handleDecline = async (jobId: string) => {
        Alert.alert(
            'Decline Appointment 🚫',
            'Are you sure you want to decline this scheduled appointment request?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Decline',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await dispatch(rejectJob({ jobId, reason: 'Declined by Partner' })).unwrap();
                            Alert.alert('Declined', 'Appointment request declined.');
                            loadData();
                        } catch (error: any) {
                            Alert.alert('Error', error || 'Failed to decline appointment');
                        }
                    },
                },
            ]
        );
    };

    const formatAppointmentTime = (utcString?: string) => {
        if (!utcString) return 'Date not set';
        const date = new Date(utcString);
        return date.toLocaleDateString([], {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const renderInvitationItem = ({ item }: { item: Job }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.headerTitleContainer}>
                    <MaterialCommunityIcons name="calendar-clock" size={20} color={COLORS.primary} style={styles.headerIcon} />
                    <Text style={styles.serviceName}>{item.serviceType}</Text>
                </View>
            </View>

            <View style={styles.detailsBlock}>
                <View style={styles.detailRow}>
                    <MaterialCommunityIcons name="account-outline" size={16} color={COLORS.gray500} />
                    <Text style={styles.detailText}>{item.clientName}</Text>
                </View>
                <View style={styles.detailRow}>
                    <MaterialCommunityIcons name="map-marker-outline" size={16} color={COLORS.gray500} />
                    <Text style={styles.detailText} numberOfLines={1}>{item.pickupAddress}</Text>
                </View>
                <View style={styles.detailRow}>
                    <MaterialCommunityIcons name="clock-outline" size={16} color={COLORS.primary} />
                    <Text style={[styles.detailText, styles.timeHighlight]}>
                        Scheduled: {formatAppointmentTime(item.scheduledAt)}
                    </Text>
                </View>
                {item.notes && (
                    <View style={styles.notesBlock}>
                        <Text style={styles.notesLabel}>Notes:</Text>
                        <Text style={styles.notesText}>{item.notes}</Text>
                    </View>
                )}
            </View>

            <View style={styles.actionContainer}>
                <TouchableOpacity
                    style={[styles.actionButton, styles.declineButton]}
                    onPress={() => handleDecline(item.id)}
                >
                    <Text style={styles.declineButtonText}>Decline</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.actionButton, styles.acceptButton]}
                    onPress={() => handleAccept(item.id)}
                >
                    <Text style={styles.acceptButtonText}>Accept</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderConfirmedItem = ({ item }: { item: Job }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate(ROUTES.JOB_DETAIL, { jobId: item.id })}
            activeOpacity={0.8}
        >
            <View style={styles.cardHeader}>
                <View style={styles.headerTitleContainer}>
                    <MaterialCommunityIcons name="calendar-check" size={20} color={COLORS.success} style={styles.headerIcon} />
                    <Text style={styles.serviceName}>{item.serviceType}</Text>
                </View>
            </View>

            <View style={styles.detailsBlock}>
                <View style={styles.detailRow}>
                    <MaterialCommunityIcons name="account-outline" size={16} color={COLORS.gray500} />
                    <Text style={styles.detailText}>{item.clientName}</Text>
                </View>
                <View style={styles.detailRow}>
                    <MaterialCommunityIcons name="map-marker-outline" size={16} color={COLORS.gray500} />
                    <Text style={styles.detailText} numberOfLines={1}>{item.pickupAddress}</Text>
                </View>
                <View style={styles.detailRow}>
                    <MaterialCommunityIcons name="clock-outline" size={16} color={COLORS.success} />
                    <Text style={[styles.detailText, styles.timeConfirmedHighlight]}>
                        Scheduled: {formatAppointmentTime(item.scheduledAt)}
                    </Text>
                </View>
            </View>

            <View style={styles.cardFooter}>
                <Text style={styles.viewDetailsText}>Tap to view details & route</Text>
                <MaterialCommunityIcons name="chevron-right" size={16} color={COLORS.gray400} />
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
            
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.gray800} />
                </TouchableOpacity>
                <View>
                    <Text style={styles.headerTitle}>Appointments</Text>
                    <Text style={styles.headerSubtitle}>Manage your scheduled commitments</Text>
                </View>
            </View>

            {/* Selector tabs */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'invitations' && styles.tabActive]}
                    onPress={() => setActiveTab('invitations')}
                >
                    <Text style={[styles.tabText, activeTab === 'invitations' && styles.tabTextActive]}>
                        Invitations ({appointmentInvitations.length})
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'confirmed' && styles.tabActive]}
                    onPress={() => setActiveTab('confirmed')}
                >
                    <Text style={[styles.tabText, activeTab === 'confirmed' && styles.tabTextActive]}>
                        Confirmed ({acceptedAppointments.length})
                    </Text>
                </TouchableOpacity>
            </View>

            {/* List */}
            {isLoading && !refreshing ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : (
                <FlatList
                    data={activeTab === 'invitations' ? appointmentInvitations : acceptedAppointments}
                    keyExtractor={(item) => item.id}
                    renderItem={activeTab === 'invitations' ? renderInvitationItem : renderConfirmedItem}
                    contentContainerStyle={styles.listContent}
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <MaterialCommunityIcons
                                name={activeTab === 'invitations' ? "calendar-alert" : "calendar-blank"}
                                size={64}
                                color={COLORS.gray300}
                            />
                            <Text style={styles.emptyStateText}>
                                {activeTab === 'invitations'
                                    ? 'No pending appointment invitations'
                                    : 'No upcoming scheduled appointments'}
                            </Text>
                        </View>
                    }
                />
            )}
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
        paddingHorizontal: SPACING.base,
        paddingVertical: SPACING.md,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gray100,
    },
    backButton: {
        marginRight: SPACING.md,
    },
    headerTitle: {
        fontSize: FONT_SIZE.xl,
        fontWeight: '700',
        color: COLORS.gray800,
    },
    headerSubtitle: {
        fontSize: FONT_SIZE.xs,
        color: COLORS.gray500,
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gray100,
    },
    tab: {
        flex: 1,
        paddingVertical: SPACING.md,
        alignItems: 'center',
    },
    tabActive: {
        borderBottomWidth: 2,
        borderBottomColor: COLORS.primary,
    },
    tabText: {
        fontSize: FONT_SIZE.sm,
        fontWeight: '600',
        color: COLORS.gray500,
    },
    tabTextActive: {
        color: COLORS.primary,
    },
    listContent: {
        padding: SPACING.base,
        paddingBottom: SPACING['3xl'],
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        backgroundColor: COLORS.white,
        borderRadius: 8,
        padding: SPACING.base,
        marginBottom: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.gray100,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gray100,
        paddingBottom: SPACING.sm,
        marginBottom: SPACING.sm,
    },
    headerTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    headerIcon: {
        marginRight: SPACING.xs,
    },
    serviceName: {
        fontSize: FONT_SIZE.base,
        fontWeight: '700',
        color: COLORS.gray800,
        flex: 1,
    },
    price: {
        fontSize: FONT_SIZE.base,
        fontWeight: '700',
        color: COLORS.primary,
    },
    detailsBlock: {
        gap: SPACING.xs,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.xs,
    },
    detailText: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.gray600,
        flex: 1,
    },
    timeHighlight: {
        fontWeight: '700',
        color: COLORS.primary,
    },
    timeConfirmedHighlight: {
        fontWeight: '700',
        color: COLORS.success,
    },
    notesBlock: {
        marginTop: SPACING.xs,
        backgroundColor: COLORS.gray50,
        padding: SPACING.sm,
        borderRadius: 4,
    },
    notesLabel: {
        fontSize: FONT_SIZE.xs,
        fontWeight: '700',
        color: COLORS.gray500,
        marginBottom: 2,
    },
    notesText: {
        fontSize: FONT_SIZE.xs,
        color: COLORS.gray700,
    },
    actionContainer: {
        flexDirection: 'row',
        gap: SPACING.md,
        marginTop: SPACING.md,
    },
    actionButton: {
        flex: 1,
        paddingVertical: SPACING.sm,
        borderRadius: 6,
        alignItems: 'center',
    },
    declineButton: {
        backgroundColor: COLORS.gray100,
    },
    declineButtonText: {
        color: COLORS.gray700,
        fontWeight: '600',
        fontSize: FONT_SIZE.sm,
    },
    acceptButton: {
        backgroundColor: COLORS.primary,
    },
    acceptButtonText: {
        color: COLORS.white,
        fontWeight: '600',
        fontSize: FONT_SIZE.sm,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: COLORS.gray100,
        paddingTop: SPACING.sm,
        marginTop: SPACING.sm,
    },
    viewDetailsText: {
        fontSize: FONT_SIZE.xs,
        color: COLORS.gray500,
        fontWeight: '500',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 100,
        gap: SPACING.sm,
    },
    emptyStateText: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.gray500,
        fontWeight: '500',
        textAlign: 'center',
    },
});

export default UpcomingAppointmentsScreen;
