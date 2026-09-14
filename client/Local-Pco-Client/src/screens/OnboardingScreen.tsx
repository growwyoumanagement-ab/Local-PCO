// src/screens/OnboardingScreen.tsx
// Onboarding carousel for first-time users

import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Dimensions,
    TouchableOpacity,
    Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SPACING, FONT_SIZE, RADIUS } from '../utils/constants';

const { width } = Dimensions.get('window');

export const HAS_SEEN_ONBOARDING_KEY = '@LocalPCO:hasSeenOnboarding';

const SLIDES = [
    {
        id: '1',
        title: 'Verified Home Professionals',
        description: 'Book trusted and background-verified experts for plumbing, electrical, cleaning, and more right to your doorstep.',
        icon: 'construct',
        badge: 'Fast & Reliable',
    },
    {
        id: '2',
        title: 'Real-time Live Tracking',
        description: 'Track your assigned service partner on an interactive map with step-by-step status updates.',
        icon: 'location',
        badge: 'Live Map Updates',
    },
    {
        id: '3',
        title: 'Transparent & Safe Care',
        description: 'Enjoy upfront transparent pricing, dedicated customer support, and seamless direct service bookings.',
        icon: 'shield-checkmark',
        badge: '100% Satisfaction',
    },
];

interface OnboardingScreenProps {
    onFinish: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onFinish }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollX = useRef(new Animated.Value(0)).current;
    const slidesRef = useRef<FlatList>(null);

    const handleNext = async () => {
        if (currentIndex < SLIDES.length - 1) {
            slidesRef.current?.scrollToIndex({ index: currentIndex + 1 });
        } else {
            await finishOnboarding();
        }
    };

    const handleSkip = async () => {
        await finishOnboarding();
    };

    const finishOnboarding = async () => {
        try {
            await AsyncStorage.setItem(HAS_SEEN_ONBOARDING_KEY, 'true');
        } catch (e) {
            console.error('Error saving onboarding state:', e);
        }
        onFinish();
    };

    const viewableItemsChanged = useRef(({ viewableItems }: any) => {
        if (viewableItems && viewableItems.length > 0) {
            setCurrentIndex(viewableItems[0].index || 0);
        }
    }).current;

    const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

    const renderSlide = ({ item }: { item: typeof SLIDES[0] }) => (
        <View style={styles.slide}>
            <View style={styles.iconContainer}>
                <View style={styles.iconCircle}>
                    <Ionicons name={item.icon as any} size={64} color={COLORS.primary} />
                </View>
                <View style={styles.badgeContainer}>
                    <Text style={styles.badgeText}>{item.badge}</Text>
                </View>
            </View>
            <View style={styles.textContainer}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.description}>{item.description}</Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.brandTitle}>
                    Local PCO <Text style={styles.brandSubtitle}>HomeServices</Text>
                </Text>
                {currentIndex < SLIDES.length - 1 && (
                    <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                        <Text style={styles.skipText}>Skip</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Slides Carousel */}
            <FlatList
                data={SLIDES}
                renderItem={renderSlide}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                bounces={false}
                keyExtractor={(item) => item.id}
                onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
                    useNativeDriver: false,
                })}
                onViewableItemsChanged={viewableItemsChanged}
                viewabilityConfig={viewConfig}
                ref={slidesRef}
            />

            {/* Pagination & Footer Controls */}
            <View style={styles.footer}>
                {/* Dots */}
                <View style={styles.pagination}>
                    {SLIDES.map((_, index) => {
                        const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
                        const dotWidth = scrollX.interpolate({
                            inputRange,
                            outputRange: [8, 24, 8],
                            extrapolate: 'clamp',
                        });
                        const opacity = scrollX.interpolate({
                            inputRange,
                            outputRange: [0.3, 1, 0.3],
                            extrapolate: 'clamp',
                        });
                        return (
                            <Animated.View
                                key={index}
                                style={[
                                    styles.dot,
                                    { width: dotWidth, opacity },
                                    index === currentIndex && styles.activeDot,
                                ]}
                            />
                        );
                    })}
                </View>

                {/* Primary Next/Get Started Button */}
                <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                    <Text style={styles.nextButtonText}>
                        {currentIndex === SLIDES.length - 1 ? 'Get Started' : 'Next'}
                    </Text>
                    <Ionicons
                        name={currentIndex === SLIDES.length - 1 ? 'checkmark' : 'arrow-forward'}
                        size={20}
                        color={COLORS.white}
                    />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.xl,
        paddingTop: SPACING.md,
    },
    brandTitle: {
        fontSize: FONT_SIZE.xl,
        fontWeight: '800',
        color: COLORS.primary,
    },
    brandSubtitle: {
        color: COLORS.gray700,
        fontWeight: '600',
    },
    skipButton: {
        paddingVertical: SPACING.xs,
        paddingHorizontal: SPACING.md,
    },
    skipText: {
        fontSize: FONT_SIZE.base,
        color: COLORS.gray500,
        fontWeight: '600',
    },
    slide: {
        width,
        alignItems: 'center',
        paddingHorizontal: SPACING['2xl'],
        justifyContent: 'center',
    },
    iconContainer: {
        alignItems: 'center',
        marginBottom: SPACING['3xl'],
        position: 'relative',
    },
    iconCircle: {
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: COLORS.primaryBg,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: COLORS.primaryLight,
    },
    badgeContainer: {
        position: 'absolute',
        bottom: -12,
        backgroundColor: COLORS.secondary,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.xs,
        borderRadius: RADIUS.full,
    },
    badgeText: {
        fontSize: FONT_SIZE.xs,
        fontWeight: '700',
        color: COLORS.white,
    },
    textContainer: {
        alignItems: 'center',
    },
    title: {
        fontSize: FONT_SIZE['2xl'],
        fontWeight: '800',
        color: COLORS.gray900,
        textAlign: 'center',
        marginBottom: SPACING.md,
        lineHeight: 32,
    },
    description: {
        fontSize: FONT_SIZE.base,
        color: COLORS.gray600,
        textAlign: 'center',
        lineHeight: 22,
    },
    footer: {
        paddingHorizontal: SPACING.xl,
        paddingBottom: SPACING.xl,
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.xl,
    },
    dot: {
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.primary,
        marginHorizontal: 4,
    },
    activeDot: {
        backgroundColor: COLORS.primary,
    },
    nextButton: {
        backgroundColor: COLORS.primary,
        height: 54,
        borderRadius: RADIUS.xl,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    nextButtonText: {
        fontSize: FONT_SIZE.md,
        fontWeight: '700',
        color: COLORS.white,
        marginRight: SPACING.sm,
    },
});

export default OnboardingScreen;
