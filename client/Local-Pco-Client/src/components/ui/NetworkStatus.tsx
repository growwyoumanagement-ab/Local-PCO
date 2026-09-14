// src/components/ui/NetworkStatus.tsx
// Network connectivity status indicator

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZE } from '../../utils/constants';

interface NetworkStatusProps {
    // In a real app, you'd use @react-native-community/netinfo
    // This is a placeholder that can be connected to actual network state
    isConnected?: boolean;
}

const NetworkStatus: React.FC<NetworkStatusProps> = ({ isConnected = true }) => {
    const [showBanner, setShowBanner] = useState(false);
    const slideAnim = useState(new Animated.Value(-50))[0];

    useEffect(() => {
        if (!isConnected) {
            setShowBanner(true);
            Animated.spring(slideAnim, {
                toValue: 0,
                useNativeDriver: true,
                tension: 100,
                friction: 10,
            }).start();
        } else if (showBanner) {
            // Show "Back online" message briefly
            setTimeout(() => {
                Animated.timing(slideAnim, {
                    toValue: -50,
                    duration: 300,
                    useNativeDriver: true,
                }).start(() => setShowBanner(false));
            }, 2000);
        }
    }, [isConnected]);

    if (!showBanner && isConnected) return null;

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    transform: [{ translateY: slideAnim }],
                    backgroundColor: isConnected ? COLORS.success : COLORS.danger,
                },
            ]}
        >
            <Ionicons 
                name={isConnected ? 'checkmark-circle' : 'alert-circle'} 
                size={16} 
                color={COLORS.white} 
                style={styles.icon} 
            />
            <Text style={styles.text}>
                {isConnected ? 'Back online' : 'No internet connection'}
            </Text>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.base,
        zIndex: 1000,
    },
    icon: {
        fontSize: 14,
        marginRight: SPACING.sm,
    },
    text: {
        fontSize: FONT_SIZE.sm,
        fontWeight: '600',
        color: COLORS.white,
    },
});

export default NetworkStatus;
