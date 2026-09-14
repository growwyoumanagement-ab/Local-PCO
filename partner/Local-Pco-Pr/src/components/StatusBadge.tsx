// src/components/StatusBadge.tsx
// Reusable status badge component for job/KYC status indicators

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, FONT_SIZE, SPACING, JOB_STATUS, KYC_STATUS, PARTNER_STATUS } from '../utils/constants';

/**
 * StatusBadge Props
 */
interface StatusBadgeProps {
    status: string;
    variant?: 'job' | 'kyc' | 'partner' | 'custom';
    customColor?: string;
    customBackgroundColor?: string;
    size?: 'small' | 'medium' | 'large';
    style?: ViewStyle;
}

/**
 * Status color mapping for job statuses
 */
const JOB_STATUS_COLORS: { [key: string]: { bg: string; text: string } } = {
    [JOB_STATUS.PENDING]: { bg: '#FEF3C7', text: '#D97706' },
    [JOB_STATUS.COMPLETED]: { bg: '#D1FAE5', text: '#059669' },
};

/**
 * Status color mapping for KYC statuses
 */
const KYC_STATUS_COLORS: { [key: string]: { bg: string; text: string } } = {
    [KYC_STATUS.PENDING]: { bg: '#FEF3C7', text: '#D97706' },
    [KYC_STATUS.UNDER_REVIEW]: { bg: '#DBEAFE', text: '#2563EB' },
    [KYC_STATUS.APPROVED]: { bg: '#D1FAE5', text: '#059669' },
    [KYC_STATUS.REJECTED]: { bg: '#FEE2E2', text: '#DC2626' },
};

/**
 * Status color mapping for partner availability
 */
const PARTNER_STATUS_COLORS: { [key: string]: { bg: string; text: string } } = {
    [PARTNER_STATUS.ONLINE]: { bg: '#D1FAE5', text: '#059669' },
    [PARTNER_STATUS.OFFLINE]: { bg: '#FEE2E2', text: '#DC2626' },
    [PARTNER_STATUS.BUSY]: { bg: '#FEF3C7', text: '#D97706' },
};

/**
 * Status label mapping for jobs
 */
const JOB_STATUS_LABELS: { [key: string]: string } = {
    [JOB_STATUS.PENDING]: 'Pending',
    [JOB_STATUS.COMPLETED]: 'Completed',
};

/**
 * Status label mapping for KYC
 */
const KYC_STATUS_LABELS: { [key: string]: string } = {
    [KYC_STATUS.PENDING]: 'Pending',
    [KYC_STATUS.UNDER_REVIEW]: 'Under Review',
    [KYC_STATUS.APPROVED]: 'Approved',
    [KYC_STATUS.REJECTED]: 'Rejected',
};

/**
 * Status label mapping for partner
 */
const PARTNER_STATUS_LABELS: { [key: string]: string } = {
    [PARTNER_STATUS.ONLINE]: 'Online',
    [PARTNER_STATUS.OFFLINE]: 'Offline',
    [PARTNER_STATUS.BUSY]: 'Busy',
};

/**
 * StatusBadge Component
 * Displays status indicators with appropriate colors
 */
const StatusBadge: React.FC<StatusBadgeProps> = ({
    status,
    variant = 'job',
    customColor,
    customBackgroundColor,
    size = 'medium',
    style,
}) => {
    /**
     * Get colors based on variant and status
     */
    const getColors = (): { bg: string; text: string } => {
        if (customColor && customBackgroundColor) {
            return { bg: customBackgroundColor, text: customColor };
        }

        switch (variant) {
            case 'job':
                return JOB_STATUS_COLORS[status] || { bg: COLORS.gray100, text: COLORS.gray600 };
            case 'kyc':
                return KYC_STATUS_COLORS[status] || { bg: COLORS.gray100, text: COLORS.gray600 };
            case 'partner':
                return PARTNER_STATUS_COLORS[status] || { bg: COLORS.gray100, text: COLORS.gray600 };
            default:
                return { bg: COLORS.gray100, text: COLORS.gray600 };
        }
    };

    /**
     * Get label for status
     */
    const getLabel = (): string => {
        switch (variant) {
            case 'job':
                return JOB_STATUS_LABELS[status] || status;
            case 'kyc':
                return KYC_STATUS_LABELS[status] || status;
            case 'partner':
                return PARTNER_STATUS_LABELS[status] || status;
            default:
                return status;
        }
    };

    /**
     * Get padding based on size
     */
    const getPadding = (): { paddingVertical: number; paddingHorizontal: number } => {
        switch (size) {
            case 'small':
                return { paddingVertical: 2, paddingHorizontal: SPACING.sm };
            case 'medium':
                return { paddingVertical: 4, paddingHorizontal: SPACING.md };
            case 'large':
                return { paddingVertical: 6, paddingHorizontal: SPACING.base };
            default:
                return { paddingVertical: 4, paddingHorizontal: SPACING.md };
        }
    };

    /**
     * Get font size based on badge size
     */
    const getFontSize = (): number => {
        switch (size) {
            case 'small':
                return FONT_SIZE.xs;
            case 'medium':
                return FONT_SIZE.sm;
            case 'large':
                return FONT_SIZE.base;
            default:
                return FONT_SIZE.sm;
        }
    };

    const colors = getColors();

    return (
        <View
            style={[
                styles.badge,
                {
                    backgroundColor: colors.bg,
                    ...getPadding(),
                },
                style,
            ]}
        >
            <Text
                style={[
                    styles.badgeText,
                    {
                        color: colors.text,
                        fontSize: getFontSize(),
                    },
                ]}
            >
                {getLabel()}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    badge: {
        borderRadius: 20,
        alignSelf: 'flex-start',
    },
    badgeText: {
        fontWeight: '600',
    },
});

export default StatusBadge;
