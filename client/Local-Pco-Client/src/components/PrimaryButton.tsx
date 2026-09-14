// src/components/PrimaryButton.tsx
// Primary CTA button component (alias for styled Button)

import React from 'react';
import { ViewStyle, TextStyle } from 'react-native';
import { Button } from './ui';

interface PrimaryButtonProps {
    title: string;
    onPress: () => void;
    disabled?: boolean;
    loading?: boolean;
    fullWidth?: boolean;
    icon?: React.ReactNode;
    style?: ViewStyle;
    textStyle?: TextStyle;
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({
    title,
    onPress,
    disabled = false,
    loading = false,
    fullWidth = true,
    icon,
    style,
    textStyle,
}) => {
    return (
        <Button
            title={title}
            onPress={onPress}
            variant="primary"
            size="lg"
            disabled={disabled}
            loading={loading}
            fullWidth={fullWidth}
            icon={icon}
            style={style}
            textStyle={textStyle}
        />
    );
};

export default PrimaryButton;
