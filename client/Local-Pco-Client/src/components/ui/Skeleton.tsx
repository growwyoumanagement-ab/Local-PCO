// src/components/ui/Skeleton.tsx
// Skeleton loader component for loading states

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle } from 'react-native';
import { COLORS, RADIUS } from '../../utils/constants';

interface SkeletonProps {
    width?: number | string;
    height?: number;
    borderRadius?: number;
    style?: ViewStyle;
}

const Skeleton: React.FC<SkeletonProps> = ({
    width = '100%',
    height = 20,
    borderRadius = RADIUS.md,
    style,
}) => {
    const shimmerAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const shimmer = Animated.loop(
            Animated.sequence([
                Animated.timing(shimmerAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(shimmerAnim, {
                    toValue: 0,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        );
        shimmer.start();
        return () => shimmer.stop();
    }, []);

    const opacity = shimmerAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0.7],
    });

    return (
        <Animated.View
            style={[
                styles.skeleton,
                {
                    width: width as any,
                    height,
                    borderRadius,
                    opacity,
                },
                style,
            ]}
        />
    );
};

// Pre-built skeleton patterns
export const SkeletonCard: React.FC<{ style?: ViewStyle }> = ({ style }) => (
    <View style={[styles.card, style]}>
        <View style={styles.cardHeader}>
            <Skeleton width={120} height={18} />
            <Skeleton width={80} height={24} borderRadius={RADIUS.full} />
        </View>
        <Skeleton width="80%" height={14} style={styles.line} />
        <Skeleton width="60%" height={14} style={styles.line} />
        <View style={styles.cardFooter}>
            <Skeleton width={100} height={12} />
            <Skeleton width={60} height={16} />
        </View>
    </View>
);

export const SkeletonServiceCard: React.FC<{ style?: ViewStyle }> = ({ style }) => (
    <View style={[styles.serviceCard, style]}>
        <Skeleton width={56} height={56} borderRadius={28} />
        <Skeleton width={80} height={14} style={{ marginTop: 12 }} />
    </View>
);

export const SkeletonProfile: React.FC = () => (
    <View style={styles.profile}>
        <Skeleton width={80} height={80} borderRadius={40} />
        <Skeleton width={150} height={20} style={{ marginTop: 16 }} />
        <Skeleton width={120} height={14} style={{ marginTop: 8 }} />
    </View>
);

export const SkeletonList: React.FC<{ count?: number }> = ({ count = 3 }) => (
    <View>
        {Array.from({ length: count }).map((_, i) => (
            <SkeletonCard key={i} style={{ marginBottom: 12 }} />
        ))}
    </View>
);

const styles = StyleSheet.create({
    skeleton: {
        backgroundColor: COLORS.gray200,
    },
    card: {
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.lg,
        padding: 16,
        borderWidth: 1,
        borderColor: COLORS.gray100,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    line: {
        marginBottom: 8,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: COLORS.gray100,
    },
    serviceCard: {
        width: '48%',
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.lg,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.gray100,
        marginBottom: 12,
    },
    profile: {
        alignItems: 'center',
        padding: 24,
    },
});

export default Skeleton;
