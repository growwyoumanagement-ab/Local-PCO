// src/components/Skeleton.tsx
// Animated pulse skeleton loader for placeholder loading states

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, DimensionValue } from 'react-native';
import { COLORS, RADIUS } from '../utils/constants';

interface SkeletonProps {
    width?: DimensionValue;
    height?: DimensionValue;
    borderRadius?: number;
    style?: any;
}

export const Skeleton: React.FC<SkeletonProps> = ({
    width = '100%',
    height = 20,
    borderRadius = RADIUS.md,
    style,
}) => {
    const opacity = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, {
                    toValue: 0.8,
                    duration: 700,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0.3,
                    duration: 700,
                    useNativeDriver: true,
                }),
            ])
        );
        pulse.start();
        return () => pulse.stop();
    }, [opacity]);

    return (
        <Animated.View
            style={[
                styles.skeleton,
                {
                    width,
                    height,
                    borderRadius,
                    opacity,
                },
                style,
            ]}
        />
    );
};

// Preset skeleton cards for grids, lists and cards
export const CategoryGridSkeleton: React.FC = () => (
    <View style={styles.gridRow}>
        {[1, 2, 3, 4, 5, 6, 7, 8].map((key) => (
            <View key={key} style={styles.gridItem}>
                <Skeleton width={60} height={60} borderRadius={20} />
                <Skeleton width={48} height={10} borderRadius={4} style={{ marginTop: 8 }} />
            </View>
        ))}
    </View>
);

export const ProviderCardSkeleton: React.FC = () => (
    <View style={styles.cardBox}>
        <View style={styles.cardHeader}>
            <Skeleton width={52} height={52} borderRadius={26} />
            <View style={{ flex: 1, marginLeft: 12 }}>
                <Skeleton width="60%" height={16} borderRadius={4} />
                <Skeleton width="40%" height={12} borderRadius={4} style={{ marginTop: 6 }} />
            </View>
        </View>
        <Skeleton width="100%" height={36} borderRadius={8} style={{ marginTop: 12 }} />
    </View>
);

export const RequestCardSkeleton: React.FC = () => (
    <View style={styles.cardBox}>
        <View style={styles.cardHeader}>
            <Skeleton width={40} height={40} borderRadius={20} />
            <View style={{ flex: 1, marginLeft: 12 }}>
                <Skeleton width="50%" height={14} borderRadius={4} />
                <Skeleton width="30%" height={10} borderRadius={4} style={{ marginTop: 4 }} />
            </View>
            <Skeleton width={60} height={20} borderRadius={10} />
        </View>
        <Skeleton width="100%" height={12} borderRadius={4} style={{ marginTop: 12 }} />
    </View>
);

const styles = StyleSheet.create({
    skeleton: {
        backgroundColor: COLORS.gray300,
    },
    gridRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingVertical: 12,
        rowGap: 16,
    },
    gridItem: {
        width: '23%',
        alignItems: 'center',
    },
    cardBox: {
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.xl,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: COLORS.gray100,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
});

export default Skeleton;
