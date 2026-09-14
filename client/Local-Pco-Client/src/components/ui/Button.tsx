// src/components/ui/Button.tsx
// Modern button component with teal glow and rounded style

import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ActivityIndicator,
    ViewStyle,
    TextStyle,
} from 'react-native';
import { COLORS, RADIUS, SPACING, FONT_SIZE } from '../../utils/constants';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: ButtonVariant;
    size?: ButtonSize;
    disabled?: boolean;
    loading?: boolean;
    icon?: React.ReactNode;
    iconPosition?: 'left' | 'right';
    fullWidth?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
}

const Button: React.FC<ButtonProps> = ({
    title,
    onPress,
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    icon,
    iconPosition = 'left',
    fullWidth = false,
    style,
    textStyle,
}) => {
    const isDisabled = disabled || loading;

    const getBackgroundColor = () => {
        if (isDisabled) return COLORS.gray300;
        switch (variant) {
            case 'primary':
                return COLORS.primary;
            case 'secondary':
                return COLORS.secondary;
            case 'danger':
                return COLORS.danger;
            case 'outline':
            case 'ghost':
                return 'transparent';
            default:
                return COLORS.primary;
        }
    };

    const getTextColor = () => {
        if (isDisabled) return COLORS.gray500;
        switch (variant) {
            case 'outline':
                return COLORS.primary;
            case 'ghost':
                return COLORS.gray700;
            case 'primary':
            case 'secondary':
            case 'danger':
                return COLORS.white;
            default:
                return COLORS.white;
        }
    };

    const getShadow = () => {
        if (isDisabled || variant === 'outline' || variant === 'ghost') return {};
        return {
            shadowColor: variant === 'danger' ? COLORS.danger : COLORS.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.25,
            shadowRadius: 8,
            elevation: 4,
        };
    };

    const getSizeStyles = (): { button: ViewStyle; text: TextStyle } => {
        switch (size) {
            case 'sm':
                return {
                    button: { paddingVertical: SPACING.sm, paddingHorizontal: SPACING.base },
                    text: { fontSize: FONT_SIZE.sm },
                };
            case 'lg':
                return {
                    button: { paddingVertical: SPACING.base + 2, paddingHorizontal: SPACING.xl },
                    text: { fontSize: FONT_SIZE.lg },
                };
            default:
                return {
                    button: { paddingVertical: SPACING.md + 2, paddingHorizontal: SPACING.xl },
                    text: { fontSize: FONT_SIZE.md },
                };
        }
    };

    const sizeStyles = getSizeStyles();

    return (
        <TouchableOpacity
            style={[
                styles.button,
                sizeStyles.button,
                {
                    backgroundColor: getBackgroundColor(),
                    borderWidth: variant === 'outline' ? 1.5 : 0,
                    borderColor: variant === 'outline' ? COLORS.primary : 'transparent',
                },
                getShadow(),
                fullWidth && styles.fullWidth,
                style,
            ]}
            onPress={onPress}
            disabled={isDisabled}
            activeOpacity={0.8}
        >
            {loading ? (
                <ActivityIndicator color={getTextColor()} size="small" />
            ) : (
                <>
                    {icon && iconPosition === 'left' && icon}
                    <Text
                        style={[
                            styles.text,
                            sizeStyles.text,
                            { color: getTextColor() },
                            icon && iconPosition === 'left' ? styles.textWithLeftIcon : undefined,
                            icon && iconPosition === 'right' ? styles.textWithRightIcon : undefined,
                            textStyle,
                        ]}
                    >
                        {title}
                    </Text>
                    {icon && iconPosition === 'right' && icon}
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
        borderRadius: RADIUS.lg,
    },
    fullWidth: {
        width: '100%',
    },
    text: {
        fontWeight: '700',
        textAlign: 'center',
        letterSpacing: 0.3,
    },
    textWithLeftIcon: {
        marginLeft: SPACING.sm,
    },
    textWithRightIcon: {
        marginRight: SPACING.sm,
    },
});

export default Button;
