// src/components/StatusBadge.tsx
// Modern pastel status badge

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { REQUEST_STATUS, COLORS, RADIUS, SPACING, FONT_SIZE } from '../utils/constants';
import { getStatusLabel } from '../utils/helpers';

interface StatusBadgeProps {
    status: string;
    size?: 'sm' | 'md';
    style?: ViewStyle;
}

const getStatusColors = (status: string) => {
    switch (status) {
        case REQUEST_STATUS.PENDING:
            return { bg: '#FEF3C7', text: '#D97706' };
        case REQUEST_STATUS.COMPLETED:
            return { bg: '#DCFCE7', text: '#16A34A' };
        default:
            return { bg: COLORS.gray100, text: COLORS.gray600 };
    }
};

const getStatusIcon = (status: string): string => {
    switch (status) {
        case REQUEST_STATUS.PENDING:
            return 'time-outline';
        case REQUEST_STATUS.COMPLETED:
            return 'checkmark-circle-outline';
        default:
            return 'clipboard';
    }
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md', style }) => {
    const colors = getStatusColors(status);
    const icon = getStatusIcon(status);
    const label = getStatusLabel(status);
    const isSmall = size === 'sm';

    return (
        <View
            style={[
                styles.container,
                {
                    backgroundColor: colors.bg,
                    paddingVertical: isSmall ? 3 : SPACING.xs + 1,
                    paddingHorizontal: isSmall ? SPACING.sm : SPACING.md,
                },
                style,
            ]}
        >
            <Ionicons name={icon as any} size={isSmall ? 11 : 13} color={colors.text} style={styles.icon} />
            <Text
                style={[
                    styles.text,
                    {
                        color: colors.text,
                        fontSize: isSmall ? FONT_SIZE.xs : FONT_SIZE.sm,
                    },
                ]}
            >
                {label}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: RADIUS.full,
    },
    icon: {
        marginRight: 4,
    },
    text: {
        fontWeight: '700',
        letterSpacing: 0.2,
    },
});

export default StatusBadge;
