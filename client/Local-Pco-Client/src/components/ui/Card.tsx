// src/components/ui/Card.tsx
// Modern elevated card component — no border, shadow-based depth

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../../utils/constants';

interface CardProps {
    children: React.ReactNode;
    style?: ViewStyle;
    padding?: keyof typeof SPACING;
    shadow?: keyof typeof SHADOWS;
    borderRadius?: keyof typeof RADIUS;
}

const Card: React.FC<CardProps> = ({
    children,
    style,
    padding = 'base',
    shadow = 'md',
    borderRadius = 'xl',
}) => {
    return (
        <View
            style={[
                styles.card,
                { padding: SPACING[padding], borderRadius: RADIUS[borderRadius] },
                SHADOWS[shadow],
                style,
            ]}
        >
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.white,
    },
});

export default Card;
