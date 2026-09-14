// src/components/CategoryGrid.tsx
// Service category grid component with larger pastel circles

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZE, RADIUS, SHADOWS } from '../utils/constants';

export interface ServiceCategory {
    id: string;
    name: string;
    icon: string;
    color?: string;
    iconColor?: string;
}

interface CategoryGridProps {
    categories: ServiceCategory[];
    onCategoryPress: (category: ServiceCategory) => void;
    numColumns?: number;
}

const CategoryGrid: React.FC<CategoryGridProps> = ({
    categories,
    onCategoryPress,
    numColumns = 4,
}) => {
    const renderCategory = ({ item }: { item: ServiceCategory }) => (
        <TouchableOpacity
            style={styles.categoryItem}
            onPress={() => onCategoryPress(item)}
            activeOpacity={0.7}
        >
            <View style={[styles.iconContainer, { backgroundColor: item.color || COLORS.primaryBg }]}>
                <Ionicons name={item.icon as any} size={26} color={item.iconColor || COLORS.primary} />
            </View>
            <Text style={styles.categoryName} numberOfLines={1}>
                {item.name}
            </Text>
        </TouchableOpacity>
    );

    return (
        <FlatList
            data={categories}
            renderItem={renderCategory}
            keyExtractor={(item) => item.id}
            numColumns={numColumns}
            scrollEnabled={false}
            contentContainerStyle={styles.grid}
            columnWrapperStyle={styles.row}
        />
    );
};

const styles = StyleSheet.create({
    grid: {
        paddingVertical: SPACING.sm,
    },
    row: {
        justifyContent: 'space-between',
        marginBottom: SPACING.lg,
    },
    categoryItem: {
        width: '23%',
        alignItems: 'center',
    },
    iconContainer: {
        width: 60,
        height: 60,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.sm,
        ...SHADOWS.sm,
    },
    categoryName: {
        fontSize: FONT_SIZE.xs,
        color: COLORS.gray700,
        textAlign: 'center',
        fontWeight: '600',
    },
});

export default CategoryGrid;
