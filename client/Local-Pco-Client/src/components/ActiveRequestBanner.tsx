// src/components/ActiveRequestBanner.tsx
// Floating banner for active service requests — auto-hides on scroll down/bottom

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppSelector, selectActiveRequest } from '../store';
import { useBannerScroll } from '../context/BannerScrollContext';
import { COLORS, SPACING, FONT_SIZE, RADIUS, SHADOWS, ROUTES } from '../utils/constants';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export const ActiveRequestBanner: React.FC = () => {
    const navigation = useNavigation<any>();
    const activeRequest = useAppSelector(selectActiveRequest);
    const insets = useSafeAreaInsets();
    const { isBannerVisible, hideBanner } = useBannerScroll();

    const translateY = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.spring(translateY, {
            toValue: isBannerVisible ? 0 : 160,
            useNativeDriver: true,
            bounciness: 4,
            speed: 14,
        }).start();
    }, [isBannerVisible]);

    if (!activeRequest || activeRequest.status === 'completed' || activeRequest.status === 'cancelled') {
        return null;
    }

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'pending':
                return 'Looking for partner...';
            case 'accepted':
                return 'Partner Accepted';
            case 'on_the_way':
                return 'Partner on the way';
            case 'in_progress':
                return 'Service in progress';
            default:
                return 'Active Service';
        }
    };

    const handlePress = () => {
        navigation.navigate(ROUTES.HOME_TAB, {
            screen: ROUTES.TRACKING,
        });
    };

    const bottomOffset = 64 + (insets.bottom > 0 ? insets.bottom : 8);

    return (
        <AnimatedTouchableOpacity
            activeOpacity={0.92}
            style={[
                styles.container,
                {
                    bottom: bottomOffset,
                    transform: [{ translateY }],
                },
            ]}
            onPress={handlePress}
        >
            <View style={styles.content}>
                <View style={styles.iconBox}>
                    <Ionicons name="construct" size={18} color={COLORS.white} />
                </View>
                <View style={styles.info}>
                    <Text style={styles.serviceName} numberOfLines={1}>
                        {activeRequest.serviceName}
                    </Text>
                    <View style={styles.statusRow}>
                        <View style={styles.pulseDot} />
                        <Text style={styles.statusText}>{getStatusLabel(activeRequest.status)}</Text>
                    </View>
                </View>
                <View style={styles.actionBtn}>
                    <Text style={styles.actionText}>Track</Text>
                    <Ionicons name="arrow-forward" size={14} color={COLORS.primary} />
                </View>
                <TouchableOpacity
                    style={styles.closeBtn}
                    onPress={(e) => {
                        e.stopPropagation();
                        hideBanner();
                    }}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Ionicons name="close" size={16} color="rgba(255,255,255,0.7)" />
                </TouchableOpacity>
            </View>
        </AnimatedTouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: SPACING.md,
        right: SPACING.md,
        backgroundColor: COLORS.gray900,
        borderRadius: RADIUS.xl,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm + 2,
        zIndex: 9999,
        ...SHADOWS.lg,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.sm + 2,
    },
    info: {
        flex: 1,
    },
    serviceName: {
        fontSize: FONT_SIZE.sm + 1,
        fontWeight: '800',
        color: COLORS.white,
        marginBottom: 1,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    pulseDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#FDE047',
        marginRight: 6,
    },
    statusText: {
        fontSize: FONT_SIZE.xs,
        color: 'rgba(255,255,255,0.8)',
        fontWeight: '600',
    },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        paddingHorizontal: SPACING.md,
        paddingVertical: 6,
        borderRadius: RADIUS.full,
        gap: 3,
    },
    actionText: {
        fontSize: FONT_SIZE.xs + 1,
        fontWeight: '800',
        color: COLORS.primary,
    },
    closeBtn: {
        marginLeft: SPACING.xs,
        padding: 4,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default ActiveRequestBanner;
