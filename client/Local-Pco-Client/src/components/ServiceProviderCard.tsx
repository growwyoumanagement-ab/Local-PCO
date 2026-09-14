// src/components/ServiceProviderCard.tsx
// Modern elevated service provider card

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZE, RADIUS, SHADOWS } from '../utils/constants';

export interface ServiceProvider {
    _id?: string;
    id: string;
    name: string;
    image?: string;
    location: string;
    phone?: string;
    isVerified?: boolean;
    isAvailable?: boolean;
    availableUntil?: string;
    rating?: number;
    reviewCount?: number;
    totalJobs?: number;
    category?: string;
    avatar?: string;
    address?: string;
    hasBookAppointment?: boolean;
}

interface ServiceProviderCardProps {
    provider: ServiceProvider;
    onCallPress?: () => void;
    onBookPress?: () => void;
    onPress?: () => void;
}

const ServiceProviderCard: React.FC<ServiceProviderCardProps> = ({
    provider,
    onCallPress,
    onBookPress,
    onPress,
}) => {
    return (
        <TouchableOpacity
            style={styles.container}
            onPress={onPress}
            activeOpacity={0.9}
        >
            {/* Provider Image */}
            <View style={styles.imageContainer}>
                {provider.image ? (
                    <Image source={{ uri: provider.image }} style={styles.image} />
                ) : (
                    <View style={styles.imagePlaceholder}>
                        <Ionicons name="person" size={32} color={COLORS.primary} />
                    </View>
                )}
                {provider.isVerified && (
                    <View style={styles.verifiedDot}>
                        <Ionicons name="checkmark" size={10} color={COLORS.white} />
                    </View>
                )}
            </View>

            {/* Provider Info */}
            <View style={styles.infoContainer}>
                {/* Verified Badge */}
                {provider.isVerified && (
                    <View style={styles.verifiedBadge}>
                        <Ionicons name="shield-checkmark" size={12} color={COLORS.primary} style={styles.verifiedIcon} />
                        <Text style={styles.verifiedText}>Verified</Text>
                    </View>
                )}

                {/* Name */}
                <Text style={styles.name}>{provider.name}</Text>

                {/* Location */}
                <View style={styles.locationRow}>
                    <Ionicons name="location-outline" size={13} color={COLORS.gray400} />
                    <Text style={styles.location}>Near {provider.location}</Text>
                </View>

                {/* Availability */}
                <View style={styles.availabilityRow}>
                    <View style={[styles.statusDot, { backgroundColor: provider.isAvailable ? COLORS.success : COLORS.danger }]} />
                    <Text style={[
                        styles.availability,
                        provider.isAvailable ? styles.availableText : styles.unavailableText
                    ]}>
                        {provider.isAvailable ? 'Available' : 'Unavailable'}
                    </Text>
                    {provider.availableUntil && (
                        <Text style={styles.availableUntil}> until {provider.availableUntil}</Text>
                    )}
                </View>

                {/* Action Buttons */}
                <View style={styles.actions}>
                    <TouchableOpacity
                        style={styles.callButton}
                        onPress={onCallPress}
                    >
                        <Ionicons name="call" size={14} color={COLORS.white} />
                        <Text style={styles.callButtonText}>Call to Book</Text>
                    </TouchableOpacity>

                    {provider.hasBookAppointment && (
                        <TouchableOpacity
                            style={styles.bookButton}
                            onPress={onBookPress}
                        >
                            <Ionicons name="calendar-outline" size={14} color={COLORS.primary} />
                            <Text style={styles.bookButtonText}>Appointment</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.xl,
        padding: SPACING.base,
        flexDirection: 'row',
        marginBottom: SPACING.md,
        ...SHADOWS.md,
    },
    imageContainer: {
        marginRight: SPACING.base,
        position: 'relative',
    },
    image: {
        width: 72,
        height: 72,
        borderRadius: RADIUS.xl,
    },
    imagePlaceholder: {
        width: 72,
        height: 72,
        borderRadius: RADIUS.xl,
        backgroundColor: COLORS.primaryBg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    verifiedDot: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: COLORS.white,
    },
    infoContainer: {
        flex: 1,
    },
    verifiedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 2,
    },
    verifiedIcon: {
        marginRight: 3,
    },
    verifiedText: {
        fontSize: FONT_SIZE.xs,
        color: COLORS.primary,
        fontWeight: '600',
    },
    name: {
        fontSize: FONT_SIZE.md,
        fontWeight: '700',
        color: COLORS.gray900,
        marginBottom: 2,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        marginBottom: 2,
    },
    location: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.gray500,
    },
    availabilityRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 5,
    },
    availability: {
        fontSize: FONT_SIZE.sm,
        fontWeight: '600',
    },
    availableText: {
        color: COLORS.success,
    },
    unavailableText: {
        color: COLORS.danger,
    },
    availableUntil: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.gray500,
    },
    actions: {
        flexDirection: 'row',
        gap: SPACING.sm,
    },
    callButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.md,
        borderRadius: RADIUS.md,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 2,
    },
    callButtonText: {
        color: COLORS.white,
        fontSize: FONT_SIZE.sm,
        fontWeight: '700',
    },
    bookButton: {
        backgroundColor: COLORS.primaryBg,
        borderWidth: 1,
        borderColor: COLORS.primaryLight,
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.md,
        borderRadius: RADIUS.md,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    bookButtonText: {
        color: COLORS.primary,
        fontSize: FONT_SIZE.sm,
        fontWeight: '700',
    },
});

export default ServiceProviderCard;
