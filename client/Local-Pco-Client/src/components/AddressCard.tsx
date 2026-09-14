// src/components/AddressCard.tsx
// Modern elevated address card

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SavedAddress } from '../services/locationService';
import { COLORS, SPACING, FONT_SIZE, RADIUS, SHADOWS } from '../utils/constants';

interface AddressCardProps {
    address: SavedAddress;
    onPress?: () => void;
    onDelete?: () => void;
    selected?: boolean;
    showActions?: boolean;
}

const getTypeIcon = (type: string): string => {
    switch (type) {
        case 'home':
            return 'home-outline';
        case 'work':
            return 'briefcase-outline';
        default:
            return 'location-outline';
    }
};

const AddressCard: React.FC<AddressCardProps> = ({
    address,
    onPress,
    onDelete,
    selected = false,
    showActions = false,
}) => {
    return (
        <TouchableOpacity
            style={[styles.container, selected && styles.selected]}
            onPress={onPress}
            activeOpacity={0.7}
            disabled={!onPress}
        >
            <View style={[styles.iconContainer, selected && styles.iconContainerSelected]}>
                <Ionicons name={getTypeIcon(address.type) as any} size={22} color={selected ? COLORS.white : COLORS.primary} />
            </View>

            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.label}>{address.label}</Text>
                    {address.isDefault && (
                        <View style={styles.defaultBadge}>
                            <Text style={styles.defaultText}>Default</Text>
                        </View>
                    )}
                </View>
                <Text style={styles.address} numberOfLines={2}>
                    {address.full}
                </Text>
                {address.landmark && (
                    <Text style={styles.landmark}>Near: {address.landmark}</Text>
                )}
                <Text style={styles.cityPincode}>
                    {address.city} - {address.pincode}
                </Text>
            </View>

            {showActions && onDelete && (
                <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
                    <Ionicons name="trash-outline" size={18} color={COLORS.danger} />
                </TouchableOpacity>
            )}

            {selected && (
                <View style={styles.checkmark}>
                    <Ionicons name="checkmark" size={16} color={COLORS.white} />
                </View>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.xl,
        padding: SPACING.base,
        marginBottom: SPACING.md,
        ...SHADOWS.md,
    },
    selected: {
        borderWidth: 2,
        borderColor: COLORS.primary,
        backgroundColor: COLORS.primaryBg,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: RADIUS.lg,
        backgroundColor: COLORS.primaryBg,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.md,
    },
    iconContainerSelected: {
        backgroundColor: COLORS.primary,
    },
    content: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.xs,
    },
    label: {
        fontSize: FONT_SIZE.md,
        fontWeight: '700',
        color: COLORS.gray900,
        marginRight: SPACING.sm,
    },
    defaultBadge: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: SPACING.sm,
        paddingVertical: 2,
        borderRadius: RADIUS.full,
    },
    defaultText: {
        fontSize: FONT_SIZE.xs,
        fontWeight: '700',
        color: COLORS.white,
    },
    address: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.gray600,
        lineHeight: 20,
        marginBottom: 2,
    },
    landmark: {
        fontSize: FONT_SIZE.xs,
        color: COLORS.gray500,
        fontStyle: 'italic',
        marginBottom: 2,
    },
    cityPincode: {
        fontSize: FONT_SIZE.xs,
        color: COLORS.gray400,
    },
    deleteButton: {
        padding: SPACING.sm,
        marginLeft: SPACING.sm,
    },
    checkmark: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: SPACING.sm,
        alignSelf: 'center',
    },
});

export default AddressCard;
