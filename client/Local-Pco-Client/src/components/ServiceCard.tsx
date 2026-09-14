// src/components/ServiceCard.tsx
// Service selection card component

import React from 'react';
import { Text, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ServiceType } from '../services/requestService';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZE, RADIUS, SHADOWS } from '../utils/constants';

interface ServiceCardProps {
    service: ServiceType;
    onPress: () => void;
    selected?: boolean;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service, onPress, selected = false }) => {
    return (
        <TouchableOpacity
            style={[styles.container, selected && styles.selected]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={[styles.iconContainer, selected && styles.iconContainerSelected]}>
                <Ionicons 
                    name={service.icon as any} 
                    size={28} 
                    color={selected ? COLORS.white : COLORS.primary} 
                />
            </View>
            <Text style={[styles.name, selected && styles.nameSelected]}>{service.name}</Text>
            {selected && (
                <View style={styles.checkmark}>
                    <Text style={styles.checkmarkText}>✓</Text>
                </View>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '48%',
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.lg,
        padding: SPACING.base,
        marginBottom: SPACING.md,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: COLORS.gray100,
        ...SHADOWS.sm,
    },
    selected: {
        borderColor: COLORS.primary,
        backgroundColor: '#EFF6FF',
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: COLORS.gray100,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.md,
    },
    iconContainerSelected: {
        backgroundColor: COLORS.primary,
    },
    icon: {
        fontSize: 28,
    },
    name: {
        fontSize: FONT_SIZE.sm,
        fontWeight: '600',
        color: COLORS.gray700,
        textAlign: 'center',
    },
    nameSelected: {
        color: COLORS.primary,
    },
    checkmark: {
        position: 'absolute',
        top: SPACING.sm,
        right: SPACING.sm,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkmarkText: {
        color: COLORS.white,
        fontSize: 12,
        fontWeight: '700',
    },
});

export default ServiceCard;
