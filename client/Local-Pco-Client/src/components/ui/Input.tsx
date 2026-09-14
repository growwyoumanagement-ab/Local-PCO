// src/components/ui/Input.tsx
// Form input component with validation support

import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TextInputProps,
    ViewStyle,
} from 'react-native';
import { COLORS, RADIUS, SPACING, FONT_SIZE } from '../../utils/constants';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    helperText?: string;
    containerStyle?: ViewStyle;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

const Input: React.FC<InputProps> = ({
    label,
    error,
    helperText,
    containerStyle,
    leftIcon,
    rightIcon,
    style,
    ...props
}) => {
    const [isFocused, setIsFocused] = useState(false);

    const getBorderColor = () => {
        if (error) return COLORS.danger;
        if (isFocused) return COLORS.primary;
        return COLORS.gray200;
    };

    return (
        <View style={[styles.container, containerStyle]}>
            {label && <Text style={styles.label}>{label}</Text>}
            <View
                style={[
                    styles.inputContainer,
                    {
                        borderColor: getBorderColor(),
                        backgroundColor: props.editable === false ? COLORS.gray50 : COLORS.white,
                    },
                ]}
            >
                {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
                <TextInput
                    style={[
                        styles.input,
                        leftIcon ? styles.inputWithLeftIcon : undefined,
                        rightIcon ? styles.inputWithRightIcon : undefined,
                        style,
                    ]}
                    placeholderTextColor={COLORS.gray400}
                    onFocus={(e) => {
                        setIsFocused(true);
                        props.onFocus?.(e);
                    }}
                    onBlur={(e) => {
                        setIsFocused(false);
                        props.onBlur?.(e);
                    }}
                    {...props}
                />
                {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
            </View>
            {error && <Text style={styles.error}>{error}</Text>}
            {helperText && !error && <Text style={styles.helperText}>{helperText}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: SPACING.base,
    },
    label: {
        fontSize: FONT_SIZE.sm,
        fontWeight: '500',
        color: COLORS.gray700,
        marginBottom: SPACING.sm,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1.5,
        borderRadius: RADIUS.lg,
        overflow: 'hidden',
    },
    input: {
        flex: 1,
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.base,
        fontSize: FONT_SIZE.md,
        color: COLORS.gray900,
    },
    inputWithLeftIcon: {
        paddingLeft: SPACING.xs,
    },
    inputWithRightIcon: {
        paddingRight: SPACING.xs,
    },
    leftIcon: {
        paddingLeft: SPACING.md,
    },
    rightIcon: {
        paddingRight: SPACING.md,
    },
    error: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.danger,
        marginTop: SPACING.xs,
    },
    helperText: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.gray500,
        marginTop: SPACING.xs,
    },
});

export default Input;
