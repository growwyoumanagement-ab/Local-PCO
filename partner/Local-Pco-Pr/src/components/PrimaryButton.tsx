// src/components/PrimaryButton.tsx
// Reusable primary button component with loading state

import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ActivityIndicator,
    ViewStyle,
    TextStyle,
} from 'react-native';
import { COLORS, FONT_SIZE, SPACING } from '../utils/constants';

/**
 * PrimaryButton Props
 */
interface PrimaryButtonProps {
    title: string;
    onPress: () => void;
    loading?: boolean;
    disabled?: boolean;
    variant?: 'primary' | 'secondary' | 'danger' | 'outline';
    size?: 'small' | 'medium' | 'large';
    fullWidth?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
    icon?: React.ReactNode;
}

/**
 * PrimaryButton Component
 * Reusable button with multiple variants and states
 */
const PrimaryButton: React.FC<PrimaryButtonProps> = ({
    title,
    onPress,
    loading = false,
    disabled = false,
    variant = 'primary',
    size = 'medium',
    fullWidth = false,
    style,
    textStyle,
    icon,
}) => {
    // Determine if button is interactive
    const isDisabled = disabled || loading;

    /**
     * Get background color based on variant
     */
    const getBackgroundColor = (): string => {
        if (isDisabled) return COLORS.gray300;

        switch (variant) {
            case 'primary':
                return COLORS.primary;
            case 'secondary':
                return COLORS.secondary;
            case 'danger':
                return COLORS.danger;
            case 'outline':
                return 'transparent';
            default:
                return COLORS.primary;
        }
    };

    /**
     * Get text color based on variant
     */
    const getTextColor = (): string => {
        if (isDisabled) return COLORS.gray500;

        if (variant === 'outline') {
            return COLORS.primary;
        }
        return COLORS.white;
    };

    /**
     * Get button padding based on size
     */
    const getPadding = (): { paddingVertical: number; paddingHorizontal: number } => {
        switch (size) {
            case 'small':
                return { paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md };
            case 'medium':
                return { paddingVertical: SPACING.md, paddingHorizontal: SPACING.lg };
            case 'large':
                return { paddingVertical: SPACING.base, paddingHorizontal: SPACING.xl };
            default:
                return { paddingVertical: SPACING.md, paddingHorizontal: SPACING.lg };
        }
    };

    /**
     * Get font size based on button size
     */
    const getFontSize = (): number => {
        switch (size) {
            case 'small':
                return FONT_SIZE.sm;
            case 'medium':
                return FONT_SIZE.base;
            case 'large':
                return FONT_SIZE.md;
            default:
                return FONT_SIZE.base;
        }
    };

    return (
        <TouchableOpacity
            style={[
                styles.button,
                {
                    backgroundColor: getBackgroundColor(),
                    ...getPadding(),
                    borderWidth: variant === 'outline' ? 2 : 0,
                    borderColor: variant === 'outline' ? COLORS.primary : 'transparent',
                    width: fullWidth ? '100%' : undefined,
                    opacity: isDisabled ? 0.7 : 1,
                },
                style,
            ]}
            onPress={onPress}
            disabled={isDisabled}
            activeOpacity={0.8}
        >
            {loading ? (
                <ActivityIndicator
                    size="small"
                    color={variant === 'outline' ? COLORS.primary : COLORS.white}
                />
            ) : (
                <>
                    {icon && <>{icon}</>}
                    <Text
                        style={[
                            styles.buttonText,
                            {
                                color: getTextColor(),
                                fontSize: getFontSize(),
                                marginLeft: icon ? SPACING.sm : 0,
                            },
                            textStyle,
                        ]}
                    >
                        {title}
                    </Text>
                </>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12,
        minHeight: 48,
    },
    buttonText: {
        fontWeight: '600',
        textAlign: 'center',
    },
});

export default PrimaryButton;
