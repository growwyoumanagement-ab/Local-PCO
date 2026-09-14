// src/components/ui/EmptyState.tsx
// Empty state placeholder component

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZE } from '../../utils/constants';
import Button from './Button';

interface EmptyStateProps {
    icon?: string;
    title: string;
    description?: string;
    actionLabel?: string;
    onAction?: () => void;
    style?: ViewStyle;
}

const EmptyState: React.FC<EmptyStateProps> = ({
    icon = 'cube',
    title,
    description,
    actionLabel,
    onAction,
    style,
}) => {
    return (
        <View style={[styles.container, style]}>
            <Ionicons name={icon as any} size={64} color={COLORS.gray300} style={styles.icon} />
            <Text style={styles.title}>{title}</Text>
            {description && <Text style={styles.description}>{description}</Text>}
            {actionLabel && onAction && (
                <Button
                    title={actionLabel}
                    onPress={onAction}
                    variant="outline"
                    size="sm"
                    style={styles.button}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: SPACING['2xl'],
    },
    icon: {
        fontSize: 64,
        marginBottom: SPACING.base,
    },
    title: {
        fontSize: FONT_SIZE.lg,
        fontWeight: '600',
        color: COLORS.gray800,
        textAlign: 'center',
        marginBottom: SPACING.sm,
    },
    description: {
        fontSize: FONT_SIZE.base,
        color: COLORS.gray500,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: SPACING.base,
    },
    button: {
        marginTop: SPACING.md,
    },
});

export default EmptyState;
