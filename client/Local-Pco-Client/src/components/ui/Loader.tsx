// src/components/ui/Loader.tsx
// Loading spinner component

import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, SPACING, FONT_SIZE } from '../../utils/constants';

interface LoaderProps {
    size?: 'small' | 'large';
    color?: string;
    text?: string;
    fullScreen?: boolean;
    style?: ViewStyle;
}

const Loader: React.FC<LoaderProps> = ({
    size = 'large',
    color = COLORS.primary,
    text,
    fullScreen = false,
    style,
}) => {
    if (fullScreen) {
        return (
            <View style={[styles.fullScreen, style]}>
                <ActivityIndicator size={size} color={color} />
                {text && <Text style={styles.text}>{text}</Text>}
            </View>
        );
    }

    return (
        <View style={[styles.container, style]}>
            <ActivityIndicator size={size} color={color} />
            {text && <Text style={styles.text}>{text}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: SPACING.lg,
    },
    fullScreen: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.white,
    },
    text: {
        marginTop: SPACING.md,
        fontSize: FONT_SIZE.base,
        color: COLORS.gray600,
    },
});

export default Loader;
