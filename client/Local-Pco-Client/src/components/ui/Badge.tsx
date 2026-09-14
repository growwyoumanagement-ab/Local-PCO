// src/components/ui/Badge.tsx
// Status badge component

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, RADIUS, SPACING, FONT_SIZE } from '../../utils/constants';

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
type BadgeSize = 'sm' | 'md';

interface BadgeProps {
    text: string;
    variant?: BadgeVariant;
    size?: BadgeSize;
    style?: ViewStyle;
}

const getColors = (variant: BadgeVariant) => {
    switch (variant) {
        case 'primary':
            return { bg: '#DBEAFE', text: COLORS.primary };
        case 'success':
            return { bg: '#D1FAE5', text: COLORS.success };
        case 'warning':
            return { bg: '#FEF3C7', text: '#D97706' };
        case 'danger':
            return { bg: '#FEE2E2', text: COLORS.danger };
        case 'info':
            return { bg: '#E0F2FE', text: COLORS.info };
        default:
            return { bg: COLORS.gray100, text: COLORS.gray700 };
    }
};

const Badge: React.FC<BadgeProps> = ({
    text,
    variant = 'default',
    size = 'md',
    style,
}) => {
    const colors = getColors(variant);
    const isSmall = size === 'sm';

    return (
        <View
            style={[
                styles.badge,
                {
                    backgroundColor: colors.bg,
                    paddingVertical: isSmall ? 2 : SPACING.xs,
                    paddingHorizontal: isSmall ? SPACING.sm : SPACING.md,
                },
                style,
            ]}
        >
            <Text
                style={[
                    styles.text,
                    {
                        color: colors.text,
                        fontSize: isSmall ? FONT_SIZE.xs : FONT_SIZE.sm,
                    },
                ]}
            >
                {text}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    badge: {
        borderRadius: RADIUS.full,
        alignSelf: 'flex-start',
    },
    text: {
        fontWeight: '600',
    },
});

export default Badge;
