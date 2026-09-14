import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, FONT_SIZE, RADIUS } from '../../utils/constants';

interface BookingStepHeaderProps {
    currentStep: 1 | 2 | 3;
    title?: string;
    subtitle?: string;
}

export const BookingStepHeader: React.FC<BookingStepHeaderProps> = ({
    currentStep,
    title,
    subtitle,
}) => {
    const totalSteps = 3;
    const progressPercent = (currentStep / totalSteps) * 100;

    const stepTitles = [
        'Step 1 of 3 — Select Provider',
        'Step 2 of 3 — Service Location',
        'Step 3 of 3 — Review & Confirm',
    ];

    return (
        <View style={styles.container}>
            <View style={styles.textRow}>
                <Text style={styles.stepBadge}>
                    {stepTitles[currentStep - 1]}
                </Text>
                {title && <Text style={styles.title}>{title}</Text>}
            </View>

            {/* Step Track */}
            <View style={styles.trackBackground}>
                <View style={[styles.trackFill, { width: `${progressPercent}%` }]} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.white,
        paddingHorizontal: SPACING.base,
        paddingVertical: SPACING.sm + 2,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gray100,
    },
    textRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.xs + 2,
    },
    stepBadge: {
        fontSize: FONT_SIZE.xs + 1,
        fontWeight: '800',
        color: COLORS.primary,
        letterSpacing: 0.5,
    },
    title: {
        fontSize: FONT_SIZE.xs,
        fontWeight: '600',
        color: COLORS.gray500,
    },
    trackBackground: {
        height: 4,
        backgroundColor: COLORS.gray200,
        borderRadius: RADIUS.full,
        overflow: 'hidden',
    },
    trackFill: {
        height: '100%',
        backgroundColor: COLORS.primary,
        borderRadius: RADIUS.full,
    },
});

export default BookingStepHeader;
