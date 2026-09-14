// src/components/PromoBanner.tsx
// Modern promotional banner with gradient feel

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZE, RADIUS, SHADOWS } from '../utils/constants';

interface PromoBannerProps {
    title: string;
    subtitle?: string;
    ctaText?: string;
    backgroundColor?: string;
    onPress?: () => void;
}

const PromoBanner: React.FC<PromoBannerProps> = ({
    title,
    subtitle,
    ctaText = 'Apply Now',
    backgroundColor = COLORS.primaryBg,
    onPress,
}) => {
    return (
        <TouchableOpacity
            style={[styles.container, { backgroundColor }]}
            onPress={onPress}
            activeOpacity={0.9}
        >
            <View style={styles.content}>
                <Text style={styles.title}>{title}</Text>
                {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
                {ctaText && (
                    <View style={styles.ctaButton}>
                        <Text style={styles.ctaText}>{ctaText}</Text>
                        <Ionicons name="arrow-forward" size={14} color={COLORS.white} />
                    </View>
                )}
            </View>
            <View style={styles.imageContainer}>
                <View style={styles.iconCircle}>
                    <Ionicons name="business" size={28} color={COLORS.primary} />
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: RADIUS.xl,
        padding: SPACING.lg,
        flexDirection: 'row',
        alignItems: 'center',
        overflow: 'hidden',
        minHeight: 110,
        ...SHADOWS.sm,
    },
    content: {
        flex: 1,
        paddingRight: SPACING.md,
    },
    title: {
        fontSize: FONT_SIZE.lg,
        fontWeight: '700',
        color: COLORS.gray900,
        marginBottom: SPACING.xs,
    },
    subtitle: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.gray600,
        marginBottom: SPACING.md,
        lineHeight: 18,
    },
    ctaButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.base,
        borderRadius: RADIUS.md,
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 2,
    },
    ctaText: {
        color: COLORS.white,
        fontSize: FONT_SIZE.sm,
        fontWeight: '700',
    },
    imageContainer: {
        width: 80,
        height: 80,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: COLORS.white,
        alignItems: 'center',
        justifyContent: 'center',
        ...SHADOWS.sm,
    },
});

export default PromoBanner;
