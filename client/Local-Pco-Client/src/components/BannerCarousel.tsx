// src/components/BannerCarousel.tsx
// Auto-sliding service banner carousel with smooth animation and dot indicators

import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZE, RADIUS, SHADOWS } from '../utils/constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_MARGIN = SPACING.base;
const CARD_GAP = 12;
const CARD_WIDTH = SCREEN_WIDTH - CARD_MARGIN * 2;

export interface BannerSlide {
    id: string;
    categoryId: string;
    categoryName: string;
    title: string;
    subtitle: string;
    badgeText: string;
    icon: string;
    bgColor: string;
    accentColor: string;
    btnBgColor: string;
    btnTextColor: string;
}

export const SERVICE_BANNERS: BannerSlide[] = [
    {
        id: 'b1',
        categoryId: 'plumber',
        categoryName: 'Plumber',
        title: '30% OFF Plumbing',
        subtitle: 'Fix leaks, pipe issues & bathroom repairs with verified plumbers.',
        badgeText: '🔧 OFFER OF THE DAY',
        icon: 'construct',
        bgColor: '#0F766E',
        accentColor: '#14B8A6',
        btnBgColor: COLORS.white,
        btnTextColor: '#0F766E',
    },
    {
        id: 'b2',
        categoryId: 'ac_repair',
        categoryName: 'AC Repair',
        title: 'AC Service @ ₹299',
        subtitle: 'Deep cleaning, gas refilling & AC repairs done at your doorstep.',
        badgeText: '❄️ SUMMER SPECIAL',
        icon: 'snow',
        bgColor: '#1E40AF',
        accentColor: '#3B82F6',
        btnBgColor: COLORS.white,
        btnTextColor: '#1E40AF',
    },
    {
        id: 'b3',
        categoryId: 'electrician',
        categoryName: 'Electrician',
        title: 'Electrical Repairs',
        subtitle: 'Wiring, switchboard fixes & appliance installations by experts.',
        badgeText: '⚡ SAFETY FIRST',
        icon: 'flash',
        bgColor: '#92400E',
        accentColor: '#F59E0B',
        btnBgColor: COLORS.white,
        btnTextColor: '#92400E',
    },
    {
        id: 'b4',
        categoryId: 'cleaning',
        categoryName: 'Cleaning',
        title: 'Deep Home Cleaning',
        subtitle: 'Full home sanitisation & bathroom deep clean starting ₹499.',
        badgeText: '✨ FRESH START',
        icon: 'sparkles',
        bgColor: '#065F46',
        accentColor: '#10B981',
        btnBgColor: COLORS.white,
        btnTextColor: '#065F46',
    },
    {
        id: 'b5',
        categoryId: 'painter',
        categoryName: 'Painter',
        title: 'Home Painting 25% OFF',
        subtitle: 'Interior & exterior painting by professional certified painters.',
        badgeText: '🎨 LIMITED OFFER',
        icon: 'color-palette',
        bgColor: '#7C3AED',
        accentColor: '#A78BFA',
        btnBgColor: COLORS.white,
        btnTextColor: '#7C3AED',
    },
    {
        id: 'b6',
        categoryId: 'mechanic',
        categoryName: 'Mechanic',
        title: 'Doorstep Car Service',
        subtitle: 'Oil change, brake check & full vehicle servicing at your home.',
        badgeText: '🔩 QUICK SERVICE',
        icon: 'settings',
        bgColor: '#9D174D',
        accentColor: '#EC4899',
        btnBgColor: COLORS.white,
        btnTextColor: '#9D174D',
    },
];

const AUTO_SCROLL_INTERVAL = 3500;

interface BannerCarouselProps {
    onExplore: (categoryId: string, categoryName: string) => void;
}

const BannerCarousel: React.FC<BannerCarouselProps> = ({ onExplore }) => {
    const scrollRef = useRef<ScrollView>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const activeIndexRef = useRef(0);
    const intervalRef = useRef<any>(null);
    const dotScales = useRef(SERVICE_BANNERS.map((_, i) => new Animated.Value(i === 0 ? 1 : 0))).current;

    const scrollToIndex = useCallback((index: number) => {
        scrollRef.current?.scrollTo({
            x: index * (CARD_WIDTH + CARD_GAP),
            animated: true,
        });
        // Animate dots
        dotScales.forEach((scale, i) => {
            Animated.spring(scale, {
                toValue: i === index ? 1 : 0,
                tension: 100,
                friction: 8,
                useNativeDriver: false,
            }).start();
        });
        activeIndexRef.current = index;
        setActiveIndex(index);
    }, [dotScales]);

    const startAutoScroll = useCallback(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = setInterval(() => {
            const next = (activeIndexRef.current + 1) % SERVICE_BANNERS.length;
            scrollToIndex(next);
        }, AUTO_SCROLL_INTERVAL);
    }, [scrollToIndex]);

    useEffect(() => {
        startAutoScroll();
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [startAutoScroll]);

    const handleScrollEnd = (e: any) => {
        const offsetX = e.nativeEvent.contentOffset.x;
        const index = Math.round(offsetX / (CARD_WIDTH + CARD_GAP));
        if (index !== activeIndexRef.current) {
            dotScales.forEach((scale, i) => {
                Animated.spring(scale, {
                    toValue: i === index ? 1 : 0,
                    tension: 100,
                    friction: 8,
                    useNativeDriver: false,
                }).start();
            });
            activeIndexRef.current = index;
            setActiveIndex(index);
        }
        // Restart auto-scroll after manual swipe
        startAutoScroll();
    };

    const handleTouchStart = () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
    };

    return (
        <View style={styles.container}>
            <ScrollView
                ref={scrollRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                scrollEventThrottle={16}
                onMomentumScrollEnd={handleScrollEnd}
                onTouchStart={handleTouchStart}
                decelerationRate="fast"
                snapToInterval={CARD_WIDTH + CARD_GAP}
                snapToAlignment="start"
                contentContainerStyle={styles.scrollContent}
            >
                {SERVICE_BANNERS.map((slide, index) => (
                    <View key={slide.id} style={[styles.card, { backgroundColor: slide.bgColor }]}>
                        {/* Decorative circles */}
                        <View style={[styles.decor1, { backgroundColor: slide.accentColor }]} />
                        <View style={[styles.decor2, { backgroundColor: slide.accentColor }]} />

                        {/* Content */}
                        <View style={styles.cardContent}>
                            {/* Badge */}
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>{slide.badgeText}</Text>
                            </View>

                            {/* Title */}
                            <Text style={styles.title}>{slide.title}</Text>

                            {/* Subtitle */}
                            <Text style={styles.subtitle} numberOfLines={2}>{slide.subtitle}</Text>

                            {/* CTA Button */}
                            <TouchableOpacity
                                style={[styles.exploreBtn, { backgroundColor: slide.btnBgColor }]}
                                onPress={() => onExplore(slide.categoryId, slide.categoryName)}
                                activeOpacity={0.9}
                            >
                                <Text style={[styles.exploreBtnText, { color: slide.btnTextColor }]}>
                                    Explore Now
                                </Text>
                                <Ionicons name="arrow-forward" size={14} color={slide.btnTextColor} />
                            </TouchableOpacity>
                        </View>

                        {/* Right icon decoration */}
                        <View style={styles.iconDecoration}>
                            <Ionicons name={slide.icon as any} size={72} color="rgba(255,255,255,0.15)" />
                        </View>
                    </View>
                ))}
            </ScrollView>

            {/* Dot Indicators */}
            <View style={styles.dotsContainer}>
                {SERVICE_BANNERS.map((_, index) => {
                    const dotWidth = dotScales[index].interpolate({
                        inputRange: [0, 1],
                        outputRange: [6, 20],
                    });
                    const dotOpacity = dotScales[index].interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.35, 1],
                    });

                    return (
                        <TouchableOpacity
                            key={index}
                            onPress={() => {
                                scrollToIndex(index);
                                startAutoScroll();
                            }}
                            hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
                        >
                            <Animated.View
                                style={[
                                    styles.dot,
                                    {
                                        width: dotWidth,
                                        opacity: dotOpacity,
                                        backgroundColor: activeIndex === index
                                            ? SERVICE_BANNERS[activeIndex].accentColor
                                            : COLORS.gray400,
                                    },
                                ]}
                            />
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: SPACING.xl,
    },
    scrollContent: {
        paddingLeft: CARD_MARGIN,
        paddingRight: CARD_MARGIN - CARD_GAP, // visual symmetry
    },
    card: {
        width: CARD_WIDTH,
        marginRight: CARD_GAP,
        borderRadius: RADIUS['2xl'],
        minHeight: 168,
        overflow: 'hidden',
        position: 'relative',
        flexDirection: 'row',
        alignItems: 'center',
        ...SHADOWS.md,
    },
    decor1: {
        position: 'absolute',
        width: 140,
        height: 140,
        borderRadius: 70,
        right: -40,
        top: -40,
        opacity: 0.3,
    },
    decor2: {
        position: 'absolute',
        width: 90,
        height: 90,
        borderRadius: 45,
        right: 60,
        bottom: -30,
        opacity: 0.2,
    },
    cardContent: {
        flex: 1,
        padding: SPACING.xl,
        zIndex: 1,
    },
    badge: {
        backgroundColor: 'rgba(255,255,255,0.18)',
        alignSelf: 'flex-start',
        paddingHorizontal: SPACING.md,
        paddingVertical: 4,
        borderRadius: RADIUS.full,
        marginBottom: SPACING.sm,
    },
    badgeText: {
        fontSize: FONT_SIZE.xs,
        fontWeight: '800',
        color: COLORS.white,
        letterSpacing: 0.4,
    },
    title: {
        fontSize: FONT_SIZE.xl,
        fontWeight: '900',
        color: COLORS.white,
        marginBottom: SPACING.xs,
        letterSpacing: -0.4,
    },
    subtitle: {
        fontSize: FONT_SIZE.xs + 1,
        color: 'rgba(255,255,255,0.75)',
        lineHeight: 18,
        marginBottom: SPACING.lg,
    },
    exploreBtn: {
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.md + 2,
        paddingVertical: SPACING.xs + 3,
        borderRadius: RADIUS.full,
        gap: 5,
    },
    exploreBtnText: {
        fontSize: FONT_SIZE.xs + 1,
        fontWeight: '800',
    },
    iconDecoration: {
        position: 'absolute',
        right: SPACING.xl,
        bottom: SPACING.lg,
        opacity: 1,
    },
    dotsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: SPACING.md,
        gap: SPACING.xs - 2,
    },
    dot: {
        height: 6,
        borderRadius: 3,
        marginHorizontal: 2,
    },
});

export default BannerCarousel;
