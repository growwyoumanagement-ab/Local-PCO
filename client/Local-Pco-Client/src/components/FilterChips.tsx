// src/components/FilterChips.tsx
// Modern rounded filter chips

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZE, RADIUS, SHADOWS } from '../utils/constants';

export interface FilterOption {
    id: string;
    label: string;
    icon?: string;
    hasDropdown?: boolean;
}

interface FilterChipsProps {
    filters: FilterOption[];
    selectedFilters: string[];
    onFilterPress: (filterId: string) => void;
}

const FilterChips: React.FC<FilterChipsProps> = ({
    filters,
    selectedFilters,
    onFilterPress,
}) => {
    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.container}
        >
            {filters.map((filter) => {
                const isSelected = selectedFilters.includes(filter.id);
                return (
                    <TouchableOpacity
                        key={filter.id}
                        style={[styles.chip, isSelected && styles.chipSelected]}
                        onPress={() => onFilterPress(filter.id)}
                        activeOpacity={0.7}
                    >
                        {filter.icon && (
                            <Ionicons 
                                name={filter.icon as any} 
                                size={15} 
                                color={isSelected ? COLORS.white : COLORS.gray600} 
                                style={styles.chipIcon} 
                            />
                        )}
                        <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                            {filter.label}
                        </Text>
                        {filter.hasDropdown && (
                            <Ionicons 
                                name="chevron-down" 
                                size={14} 
                                color={isSelected ? COLORS.white : COLORS.gray400} 
                                style={styles.dropdownIcon} 
                            />
                        )}
                    </TouchableOpacity>
                );
            })}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: SPACING.md,
        gap: SPACING.sm,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.full,
        paddingVertical: SPACING.sm + 2,
        paddingHorizontal: SPACING.base,
        marginRight: SPACING.sm,
        ...SHADOWS.sm,
    },
    chipSelected: {
        backgroundColor: COLORS.primary,
        shadowColor: COLORS.primary,
        shadowOpacity: 0.2,
    },
    chipIcon: {
        marginRight: SPACING.xs,
    },
    chipText: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.gray700,
        fontWeight: '600',
    },
    chipTextSelected: {
        color: COLORS.white,
    },
    dropdownIcon: {
        marginLeft: SPACING.xs,
    },
});

export default FilterChips;
