// src/components/JobCard.tsx
// Reusable job card component for displaying job information

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ViewStyle,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, FONT_SIZE, SPACING } from '../utils/constants';
import { Job } from '../services/jobService';
import { formatCurrency, formatDistance, formatTime } from '../utils/helpers';
import StatusBadge from './StatusBadge';

/**
 * JobCard Props
 */
interface JobCardProps {
    job: Job;
    onPress: (job: Job) => void;
    showStatus?: boolean;
    showEarnings?: boolean;
    compact?: boolean;
    style?: ViewStyle;
}

/**
 * JobCard Component
 * Displays job information in a card format
 */
const JobCard: React.FC<JobCardProps> = ({
    job,
    onPress,
    showStatus = true,
    showEarnings = false,
    compact = false,
    style,
}) => {
    return (
        <TouchableOpacity
            style={[styles.card, compact && styles.cardCompact, style]}
            onPress={() => onPress(job)}
            activeOpacity={0.7}
        >
            {/* Header with service type and status */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    {/* Service icon placeholder */}
                    <View style={styles.serviceIcon}>
                        <Text style={styles.serviceIconText}>
                            {job.serviceType.charAt(0).toUpperCase()}
                        </Text>
                    </View>
                    <View style={styles.headerInfo}>
                        <Text style={styles.serviceType} numberOfLines={1}>
                            {job.serviceType}
                        </Text>
                        <Text style={styles.serviceCategory} numberOfLines={1}>
                            {job.serviceCategory}
                        </Text>
                    </View>
                </View>
                {showStatus && <StatusBadge status={job.status} variant="job" size="small" />}
            </View>

            {/* Client Info */}
            {!compact && (
                <View style={styles.clientInfo}>
                    <View style={styles.clientAvatar}>
                        <Text style={styles.clientAvatarText}>
                            {job.clientName.charAt(0).toUpperCase()}
                        </Text>
                    </View>
                    <View style={styles.clientDetails}>
                        <Text style={styles.clientName} numberOfLines={1}>
                            {job.clientName}
                        </Text>
                    </View>
                </View>
            )}





            {/* Description preview if available */}
            {!compact && job.description && (
                <View style={styles.descriptionContainer}>
                    <Text style={styles.description} numberOfLines={2}>
                        {job.description}
                    </Text>
                </View>
            )}

            {/* Notes indicator */}
            {job.notes && (
                <View style={styles.notesIndicator}>
                    <MaterialCommunityIcons name="notebook-outline" size={16} color={COLORS.accent} style={{ marginRight: 6 }} />
                    <Text style={styles.notesText}>Has special instructions</Text>
                </View>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: SPACING.base,
        marginBottom: SPACING.md,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    cardCompact: {
        padding: SPACING.md,
        marginBottom: SPACING.sm,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    serviceIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: COLORS.primary + '15',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.md,
    },
    serviceIconText: {
        fontSize: FONT_SIZE.lg,
        fontWeight: '700',
        color: COLORS.primary,
    },
    headerInfo: {
        flex: 1,
    },
    serviceType: {
        fontSize: FONT_SIZE.md,
        fontWeight: '600',
        color: COLORS.gray900,
    },
    serviceCategory: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.gray500,
        marginTop: 2,
    },
    clientInfo: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingVertical: SPACING.md,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: COLORS.gray100,
        marginBottom: SPACING.md,
    },
    clientAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: COLORS.secondary + '20',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.md,
    },
    clientAvatarText: {
        fontSize: FONT_SIZE.base,
        fontWeight: '600',
        color: COLORS.secondary,
    },
    clientDetails: {
        flex: 1,
    },
    clientName: {
        fontSize: FONT_SIZE.base,
        fontWeight: '500',
        color: COLORS.gray800,
    },
    clientAddress: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.gray500,
        flex: 1,
    },
    addressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    compactAddress: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.gray600,
        flex: 1,
    },
    compactAddressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    metaContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    metaItem: {
        alignItems: 'center',
    },
    metaLabel: {
        fontSize: FONT_SIZE.xs,
        color: COLORS.gray400,
        marginBottom: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    metaValue: {
        fontSize: FONT_SIZE.base,
        fontWeight: '600',
        color: COLORS.gray700,
    },
    priceValue: {
        color: COLORS.secondary,
    },
    descriptionContainer: {
        marginTop: SPACING.md,
        paddingTop: SPACING.md,
        borderTopWidth: 1,
        borderTopColor: COLORS.gray100,
    },
    description: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.gray600,
        lineHeight: 20,
    },
    notesIndicator: {
        marginTop: SPACING.sm,
        paddingTop: SPACING.sm,
        borderTopWidth: 1,
        borderTopColor: COLORS.gray100,
        flexDirection: 'row',
        alignItems: 'center',
    },
    notesText: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.accent,
        fontWeight: '500',
    },
});

export default JobCard;
