// src/screens/RatingScreen.tsx
// Modern service rating & feedback screen with animated stars and sentiment feedback

import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Alert,
    Animated,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, RouteProp, useRoute } from '@react-navigation/native';
import { Card, Button } from '../components';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZE, RADIUS, SHADOWS, ROUTES } from '../utils/constants';
import requestService from '../services/requestService';

type RouteParams = {
    Rating: {
        requestId: string;
        serviceName: string;
        partnerName?: string;
    };
};

const RATING_EMOJIS = ['😞 Poor', '😐 Fair', '🙂 Good', '😊 Very Good', '🌟 Excellent!'];

const FEEDBACK_TAGS = [
    'Professional',
    'On Time',
    'Friendly',
    'Clean Work',
    'Good Quality',
    'Value for Money',
];

export const RatingScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<RouteProp<RouteParams, 'Rating'>>();

    const { requestId, serviceName, partnerName } = route.params || {};

    const [rating, setRating] = useState(5); // Default to 5-star positive start
    const [feedback, setFeedback] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>(['Professional', 'Good Quality']);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Scale animations per star
    const starScales = useRef([1, 2, 3, 4, 5].map(() => new Animated.Value(1))).current;

    const handleSelectStar = (selectedStar: number) => {
        setRating(selectedStar);

        // Animate selected star bounce
        const animIndex = selectedStar - 1;
        Animated.sequence([
            Animated.timing(starScales[animIndex], {
                toValue: 1.35,
                duration: 120,
                useNativeDriver: true,
            }),
            Animated.spring(starScales[animIndex], {
                toValue: 1,
                friction: 4,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const handleToggleTag = (tag: string) => {
        setSelectedTags((prev) =>
            prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
        );
    };

    const handleSubmit = async () => {
        if (rating === 0) {
            Alert.alert('Rating Required', 'Please tap the stars to rate your service experience.');
            return;
        }

        setIsSubmitting(true);

        try {
            const tagsToSubmit = rating <= 2 ? [] : selectedTags;
            await requestService.submitRating(requestId, { rating, feedback, tags: tagsToSubmit });

            Alert.alert(
                'Thank You! 🎉',
                'Your feedback helps us maintain high quality standards.',
                [
                    {
                        text: 'Done',
                        onPress: () => {
                            navigateToHome();
                        },
                    },
                ]
            );
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to submit rating. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const navigateToHome = () => {
        try {
            navigation.navigate(ROUTES.HOME_TAB as any, { screen: ROUTES.DASHBOARD });
        } catch {
            try {
                navigation.navigate(ROUTES.DASHBOARD as any);
            } catch {
                if (navigation.canGoBack()) {
                    navigation.popToTop();
                }
            }
        }
    };

    const handleSkip = async () => {
        try {
            if (requestId) {
                requestService.skipRating(requestId).catch((err) => {
                    console.log('[RatingScreen] Skip rating background notification:', err?.message);
                });
            }
        } finally {
            navigateToHome();
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* Hero Header */}
                <View style={styles.headerBox}>
                    <View style={styles.iconCircle}>
                        <Ionicons name="sparkles" size={28} color={COLORS.primary} />
                    </View>
                    <Text style={styles.title}>Rate Your Service</Text>
                    <Text style={styles.serviceName}>{serviceName || 'Home Service'}</Text>
                    {partnerName && (
                        <Text style={styles.partnerNameText}>Partner: {partnerName}</Text>
                    )}
                </View>

                {/* Animated Star Rating Card */}
                <Card style={styles.ratingCard}>
                    <Text style={styles.ratingInstruction}>Tap a star to rate</Text>
                    <View style={styles.starsRow}>
                        {[1, 2, 3, 4, 5].map((star, idx) => (
                            <TouchableOpacity
                                key={star}
                                onPress={() => handleSelectStar(star)}
                                activeOpacity={0.8}
                                style={styles.starTouchArea}
                            >
                                <Animated.View style={{ transform: [{ scale: starScales[idx] }] }}>
                                    <Ionicons
                                        name={rating >= star ? 'star' : 'star-outline'}
                                        size={44}
                                        color={rating >= star ? '#F59E0B' : COLORS.gray300}
                                    />
                                </Animated.View>
                            </TouchableOpacity>
                        ))}
                    </View>
                    {rating > 0 && (
                        <View style={styles.sentimentBadge}>
                            <Text style={styles.sentimentText}>{RATING_EMOJIS[rating - 1]}</Text>
                        </View>
                    )}
                </Card>

                {/* Quick Tags Section (if rating >= 3) */}
                {rating >= 3 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>What went great?</Text>
                        <View style={styles.tagsGrid}>
                            {FEEDBACK_TAGS.map((tag) => {
                                const isSelected = selectedTags.includes(tag);
                                return (
                                    <TouchableOpacity
                                        key={tag}
                                        style={[styles.tagPill, isSelected && styles.tagPillSelected]}
                                        onPress={() => handleToggleTag(tag)}
                                        activeOpacity={0.8}
                                    >
                                        {isSelected && (
                                            <Ionicons name="checkmark-circle" size={14} color={COLORS.white} style={{ marginRight: 4 }} />
                                        )}
                                        <Text style={[styles.tagText, isSelected && styles.tagTextSelected]}>
                                            {tag}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>
                )}

                {/* Feedback Input Card */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Write a Review (Optional)</Text>
                    <TextInput
                        style={styles.feedbackInput}
                        placeholder="Tell us about the work quality, punctuality..."
                        placeholderTextColor={COLORS.gray400}
                        value={feedback}
                        onChangeText={setFeedback}
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                    />
                </View>
            </ScrollView>

            {/* Action Buttons Footer */}
            <View style={styles.footer}>
                <Button
                    title="Submit Feedback 🎉"
                    onPress={handleSubmit}
                    loading={isSubmitting}
                    fullWidth
                />
                <TouchableOpacity style={styles.skipBtn} onPress={handleSkip} activeOpacity={0.7}>
                    <Text style={styles.skipBtnText}>Skip for now</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scroll: {
        flex: 1,
    },
    content: {
        padding: SPACING.base,
        paddingBottom: SPACING['2xl'],
    },
    headerBox: {
        alignItems: 'center',
        marginTop: SPACING.md,
        marginBottom: SPACING.lg,
    },
    iconCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: COLORS.primaryBg,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.sm,
        ...SHADOWS.sm,
    },
    title: {
        fontSize: FONT_SIZE.xl,
        fontWeight: '900',
        color: COLORS.gray900,
        letterSpacing: -0.4,
    },
    serviceName: {
        fontSize: FONT_SIZE.base,
        fontWeight: '700',
        color: COLORS.primary,
        marginTop: 2,
    },
    partnerNameText: {
        fontSize: FONT_SIZE.xs + 1,
        color: COLORS.gray500,
        marginTop: 2,
    },
    ratingCard: {
        alignItems: 'center',
        paddingVertical: SPACING.xl,
        borderRadius: RADIUS['2xl'],
        marginBottom: SPACING.xl,
        ...SHADOWS.md,
    },
    ratingInstruction: {
        fontSize: FONT_SIZE.xs,
        fontWeight: '700',
        color: COLORS.gray400,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        marginBottom: SPACING.md,
    },
    starsRow: {
        flexDirection: 'row',
        gap: SPACING.xs,
        marginBottom: SPACING.md,
    },
    starTouchArea: {
        padding: SPACING.xs,
    },
    sentimentBadge: {
        backgroundColor: '#FFFBEB',
        paddingHorizontal: SPACING.md,
        paddingVertical: 6,
        borderRadius: RADIUS.full,
        borderWidth: 1,
        borderColor: '#FDE68A',
    },
    sentimentText: {
        fontSize: FONT_SIZE.sm,
        fontWeight: '800',
        color: '#B45309',
    },
    section: {
        marginBottom: SPACING.xl,
    },
    sectionTitle: {
        fontSize: FONT_SIZE.base,
        fontWeight: '800',
        color: COLORS.gray900,
        marginBottom: SPACING.sm + 2,
    },
    tagsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.xs + 2,
    },
    tagPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderWidth: 1.5,
        borderColor: COLORS.gray200,
        borderRadius: RADIUS.full,
        paddingVertical: SPACING.xs + 2,
        paddingHorizontal: SPACING.md,
    },
    tagPillSelected: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    tagText: {
        fontSize: FONT_SIZE.xs + 1,
        color: COLORS.gray700,
        fontWeight: '600',
    },
    tagTextSelected: {
        color: COLORS.white,
        fontWeight: '700',
    },
    feedbackInput: {
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.xl,
        padding: SPACING.md,
        fontSize: FONT_SIZE.sm + 1,
        color: COLORS.gray800,
        minHeight: 100,
        borderWidth: 1.5,
        borderColor: COLORS.gray200,
        ...SHADOWS.sm,
    },
    footer: {
        padding: SPACING.base,
        backgroundColor: COLORS.white,
        borderTopWidth: 1,
        borderTopColor: COLORS.gray100,
        ...SHADOWS.md,
    },
    skipBtn: {
        alignItems: 'center',
        paddingVertical: SPACING.sm + 2,
        marginTop: SPACING.xs,
    },
    skipBtnText: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.gray500,
        fontWeight: '600',
    },
});

export default RatingScreen;
