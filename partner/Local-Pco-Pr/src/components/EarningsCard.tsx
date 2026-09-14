// src/components/EarningsCard.tsx
// Reusable earnings card component for displaying financial metrics

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ViewStyle,
} from 'react-native';
import { COLORS, FONT_SIZE, SPACING } from '../utils/constants';
import { formatCurrency } from '../utils/helpers';

/**
 * EarningsCard Props
 */
interface EarningsCardProps {
    amount: number;
    label: string;
    trend?: {
        value: number; // Percentage change
        isPositive: boolean;
    };
    icon?: React.ReactNode;
    onPress?: () => void;
    variant?: 'primary' | 'secondary' | 'highlight' | 'neutral';
    size?: 'small' | 'medium' | 'large';
    showCurrency?: boolean;
    style?: ViewStyle;
}

/**
 * EarningsCard Component
 * Displays earnings/financial metrics with optional trend indicator
 */
const EarningsCard: React.FC<EarningsCardProps> = ({
    amount,
    label,
    trend,
    icon,
    onPress,
    variant = 'primary',
    size = 'medium',
    showCurrency = true,
    style,
}) => {
    /**
     * Get background color based on variant
     */
    const getBackgroundColor = (): string => {
        switch (variant) {
            case 'primary':
                return COLORS.primary;
            case 'secondary':
                return COLORS.secondary;
            case 'highlight':
                return COLORS.accent;
            case 'neutral':
                return COLORS.white;
            default:
                return COLORS.primary;
        }
    };

    /**
     * Get text color based on variant
     */
    const getTextColor = (): string => {
        return variant === 'neutral' ? COLORS.gray900 : COLORS.white;
    };

    /**
     * Get label color based on variant
     */
    const getLabelColor = (): string => {
        return variant === 'neutral' ? COLORS.gray500 : 'rgba(255,255,255,0.8)';
    };

    /**
     * Get card dimensions based on size
     */
    const getCardDimensions = (): { padding: number; minWidth: number } => {
        switch (size) {
            case 'small':
                return { padding: SPACING.md, minWidth: 100 };
            case 'medium':
                return { padding: SPACING.base, minWidth: 140 };
            case 'large':
                return { padding: SPACING.lg, minWidth: 180 };
            default:
                return { padding: SPACING.base, minWidth: 140 };
        }
    };

    /**
     * Get font sizes based on card size
     */
    const getFontSizes = (): { amount: number; label: number } => {
        switch (size) {
            case 'small':
                return { amount: FONT_SIZE.lg, label: FONT_SIZE.xs };
            case 'medium':
                return { amount: FONT_SIZE.xl, label: FONT_SIZE.sm };
            case 'large':
                return { amount: FONT_SIZE['2xl'], label: FONT_SIZE.base };
            default:
                return { amount: FONT_SIZE.xl, label: FONT_SIZE.sm };
        }
    };

    const dimensions = getCardDimensions();
    const fontSizes = getFontSizes();
    const backgroundColor = getBackgroundColor();
    const textColor = getTextColor();
    const labelColor = getLabelColor();

    const CardWrapper = onPress ? TouchableOpacity : View;

    return (
        <CardWrapper
            style={[
                styles.card,
                {
                    backgroundColor,
                    padding: dimensions.padding,
                    minWidth: dimensions.minWidth,
                },
                variant === 'neutral' && styles.cardNeutral,
                style,
            ]}
            onPress={onPress}
            activeOpacity={onPress ? 0.8 : 1}
        >
            {/* Icon and Label Row */}
            <View style={styles.header}>
                {icon && <View style={styles.iconContainer}>{icon}</View>}
                <Text
                    style={[
                        styles.label,
                        {
                            color: labelColor,
                            fontSize: fontSizes.label,
                        },
                    ]}
                    numberOfLines={1}
                >
                    {label}
                </Text>
            </View>

            {/* Amount */}
            <Text
                style={[
                    styles.amount,
                    {
                        color: textColor,
                        fontSize: fontSizes.amount,
                    },
                ]}
                numberOfLines={1}
                adjustsFontSizeToFit
            >
                {showCurrency ? formatCurrency(amount) : amount.toLocaleString()}
            </Text>

            {/* Trend Indicator */}
            {trend && (
                <View style={styles.trendContainer}>
                    <Text
                        style={[
                            styles.trendText,
                            {
                                color: variant === 'neutral'
                                    ? trend.isPositive
                                        ? COLORS.success
                                        : COLORS.danger
                                    : 'rgba(255,255,255,0.9)',
                            },
                        ]}
                    >
                        {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
                    </Text>
                    <Text
                        style={[
                            styles.trendLabel,
                            { color: labelColor },
                        ]}
                    >
                        vs last period
                    </Text>
                </View>
            )}
        </CardWrapper>
    );
};

/**
 * QuickStats Component
 * A row of small stat cards
 */
interface QuickStatsProps {
    stats: Array<{
        label: string;
        value: number | string;
        icon?: React.ReactNode;
    }>;
    style?: ViewStyle;
}

export const QuickStats: React.FC<QuickStatsProps> = ({ stats, style }) => {
    return (
        <View style={[styles.quickStatsContainer, style]}>
            {stats.map((stat, index) => (
                <View
                    key={index}
                    style={[
                        styles.quickStatItem,
                        index !== stats.length - 1 && styles.quickStatDivider,
                    ]}
                >
                    {stat.icon && <View style={styles.quickStatIcon}>{stat.icon}</View>}
                    <Text style={styles.quickStatValue}>
                        {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                    </Text>
                    <Text style={styles.quickStatLabel}>{stat.label}</Text>
                </View>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: 16,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 5,
    },
    cardNeutral: {
        borderWidth: 1,
        borderColor: COLORS.gray200,
        shadowOpacity: 0.05,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    iconContainer: {
        marginRight: SPACING.sm,
    },
    label: {
        fontWeight: '500',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    amount: {
        fontWeight: '700',
        marginBottom: SPACING.xs,
    },
    trendContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: SPACING.xs,
    },
    trendText: {
        fontSize: FONT_SIZE.sm,
        fontWeight: '600',
        marginRight: SPACING.xs,
    },
    trendLabel: {
        fontSize: FONT_SIZE.xs,
    },
    // Quick Stats styles
    quickStatsContainer: {
        flexDirection: 'row',
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: SPACING.md,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    quickStatItem: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: SPACING.sm,
    },
    quickStatDivider: {
        borderRightWidth: 1,
        borderRightColor: COLORS.gray200,
    },
    quickStatIcon: {
        marginBottom: SPACING.xs,
    },
    quickStatValue: {
        fontSize: FONT_SIZE.lg,
        fontWeight: '700',
        color: COLORS.gray900,
    },
    quickStatLabel: {
        fontSize: FONT_SIZE.xs,
        color: COLORS.gray500,
        marginTop: 2,
        textAlign: 'center',
    },
});

export default EarningsCard;
