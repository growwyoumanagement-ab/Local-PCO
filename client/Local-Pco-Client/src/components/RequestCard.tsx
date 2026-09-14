// src/components/RequestCard.tsx
// Redesigned modern request card — sleek, rich & production-ready

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ServiceRequest } from '../store/requestSlice';
import { COLORS, SPACING, FONT_SIZE, RADIUS, SHADOWS } from '../utils/constants';
import { formatDateTime, truncateText } from '../utils/helpers';

interface RequestCardProps {
    request: ServiceRequest;
    onPress?: () => void;
    isActive?: boolean;
}

const getCategoryMeta = (serviceName: string) => {
    const name = (serviceName || '').toLowerCase();
    if (name.includes('plumb')) return { icon: 'construct', bg: '#E0F2F1', color: '#0F766E' };
    if (name.includes('elect')) return { icon: 'flash', bg: '#FEF3C7', color: '#D97706' };
    if (name.includes('clean')) return { icon: 'sparkles', bg: '#E8F5E9', color: '#16A34A' };
    if (name.includes('ac') || name.includes('cool')) return { icon: 'snow', bg: '#E0F7FA', color: '#0284C7' };
    if (name.includes('paint')) return { icon: 'color-palette', bg: '#F3E8FF', color: '#9333EA' };
    if (name.includes('mech') || name.includes('car')) return { icon: 'settings', bg: '#FEE2E2', color: '#DC2626' };
    return { icon: 'build', bg: '#F1F5F9', color: COLORS.primary };
};

const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
        case 'completed':
            return { label: 'Completed', bg: '#DCFCE7', text: '#15803D', icon: 'checkmark-circle' };
        case 'in_progress':
        case 'accepted':
        case 'on_the_way':
            return { label: 'In Progress', bg: '#FEF3C7', text: '#B45309', icon: 'time' };
        case 'cancelled':
            return { label: 'Cancelled', bg: '#FEE2E2', text: '#B91C1C', icon: 'close-circle' };
        case 'pending':
        default:
            return { label: 'Pending', bg: '#E0F2F1', text: '#0F766E', icon: 'ellipse' };
    }
};

const RequestCard: React.FC<RequestCardProps> = ({ request, onPress, isActive = false }) => {
    const catMeta = getCategoryMeta(request.serviceName);
    const statusMeta = getStatusBadge(request.status);
    const bookingIdShort = request.id ? request.id.slice(-6).toUpperCase() : 'REQ';

    return (
        <TouchableOpacity
            style={[styles.card, isActive && styles.cardActive]}
            onPress={onPress}
            activeOpacity={0.88}
        >
            {/* Active Indicator Top Stripe */}
            {isActive && <View style={styles.activeStripe} />}

            {/* Header Row */}
            <View style={styles.header}>
                <View style={[styles.categoryIconBox, { backgroundColor: catMeta.bg }]}>
                    <Ionicons name={catMeta.icon as any} size={22} color={catMeta.color} />
                </View>
                <View style={styles.headerTextInfo}>
                    <Text style={styles.serviceName}>{request.serviceName}</Text>
                    <View style={styles.subRow}>
                        <Text style={styles.bookingIdText}>ID: #{bookingIdShort}</Text>
                        <Text style={styles.dotSeparator}>•</Text>
                        <Text style={styles.bookingTypeTag}>
                            {request.bookingType === 'appointment' ? '📅 Scheduled' : '⚡ Instant'}
                        </Text>
                    </View>
                </View>
                {/* Status Badge */}
                <View style={[styles.statusBadge, { backgroundColor: statusMeta.bg }]}>
                    <Ionicons name={statusMeta.icon as any} size={12} color={statusMeta.text} style={{ marginRight: 3 }} />
                    <Text style={[styles.statusBadgeText, { color: statusMeta.text }]}>{statusMeta.label}</Text>
                </View>
            </View>

            {/* Middle Section: Address & Partner */}
            <View style={styles.middleSection}>
                <View style={styles.infoRow}>
                    <Ionicons name="location-sharp" size={15} color={COLORS.primary} style={styles.infoIcon} />
                    <Text style={styles.infoText} numberOfLines={1}>
                        {request.address?.full || 'Service Address Provided'}
                    </Text>
                </View>

                {!!request.partnerName && (
                    <View style={styles.infoRow}>
                        <Ionicons name="person-circle" size={15} color={COLORS.secondary} style={styles.infoIcon} />
                        <Text style={styles.partnerText}>
                            Partner: <Text style={styles.partnerNameBold}>{request.partnerName}</Text>
                        </Text>
                    </View>
                )}
            </View>

            {/* Footer Row */}
            <View style={styles.footer}>
                <View style={styles.dateBox}>
                    <Ionicons name="calendar-outline" size={13} color={COLORS.gray400} />
                    <Text style={styles.dateText}>{formatDateTime(request.createdAt)}</Text>
                </View>
            </View>

            {/* Action Bar Footer if Active */}
            {isActive && (
                <View style={styles.actionBanner}>
                    <Text style={styles.actionBannerText}>Track Live Arrival →</Text>
                </View>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.white,
        borderRadius: RADIUS['2xl'],
        marginBottom: SPACING.md,
        padding: SPACING.base,
        borderWidth: 1.5,
        borderColor: COLORS.gray100,
        ...SHADOWS.sm,
        position: 'relative',
        overflow: 'hidden',
    },
    cardActive: {
        borderColor: COLORS.primary,
        backgroundColor: '#F0FDFA',
    },
    activeStripe: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 3.5,
        backgroundColor: COLORS.primary,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.sm + 2,
    },
    categoryIconBox: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.sm + 2,
    },
    headerTextInfo: {
        flex: 1,
    },
    serviceName: {
        fontSize: FONT_SIZE.base,
        fontWeight: '800',
        color: COLORS.gray900,
        letterSpacing: -0.2,
    },
    subRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    bookingIdText: {
        fontSize: FONT_SIZE.xs,
        color: COLORS.gray500,
        fontWeight: '600',
    },
    dotSeparator: {
        fontSize: FONT_SIZE.xs,
        color: COLORS.gray300,
        marginHorizontal: 4,
    },
    bookingTypeTag: {
        fontSize: FONT_SIZE.xs,
        color: COLORS.primaryDark,
        fontWeight: '700',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.sm + 2,
        paddingVertical: 4,
        borderRadius: RADIUS.full,
    },
    statusBadgeText: {
        fontSize: 10,
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    middleSection: {
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.lg,
        padding: SPACING.sm + 2,
        marginBottom: SPACING.sm + 2,
        gap: 4,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    infoIcon: {
        marginRight: 6,
    },
    infoText: {
        flex: 1,
        fontSize: FONT_SIZE.xs + 1,
        color: COLORS.gray700,
        fontWeight: '500',
    },
    partnerText: {
        fontSize: FONT_SIZE.xs + 1,
        color: COLORS.gray600,
    },
    partnerNameBold: {
        fontWeight: '700',
        color: COLORS.gray900,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 2,
    },
    dateBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    dateText: {
        fontSize: FONT_SIZE.xs,
        color: COLORS.gray500,
        fontWeight: '500',
    },
    priceBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    priceLabel: {
        fontSize: 10,
        color: COLORS.gray400,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    priceValue: {
        fontSize: FONT_SIZE.sm + 1,
        fontWeight: '900',
        color: COLORS.gray900,
    },
    actionBanner: {
        marginTop: SPACING.sm,
        paddingTop: SPACING.xs,
        borderTopWidth: 1,
        borderTopColor: 'rgba(13,148,136,0.2)',
        alignItems: 'flex-end',
    },
    actionBannerText: {
        fontSize: FONT_SIZE.xs + 1,
        fontWeight: '800',
        color: COLORS.primary,
    },
});

export default React.memo(RequestCard);
