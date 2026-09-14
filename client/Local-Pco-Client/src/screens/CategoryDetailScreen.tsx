// src/screens/CategoryDetailScreen.tsx
// Category detail screen with sub-categories and medicine types

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    FlatList,
    Image,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import {
    SearchBar,
    CategoryGrid,
    Card,
} from '../components';
import {
    COLORS,
    SPACING,
    FONT_SIZE,
    RADIUS,
    ROUTES,
    MEDICAL_SUBCATEGORIES,
    MEDICINE_TYPES,
} from '../utils/constants';
import { getServiceCategories, ServiceCategory } from '../services/serviceService';

type RouteParams = {
    CategoryDetail: {
        categoryId: string;
        categoryName: string;
    };
};

// Trending searches
const TRENDING_SEARCHES = [
    { id: '1', name: 'Plumber', image: 'construct' },
    { id: '2', name: 'Mechanic', image: 'settings' },
    { id: '3', name: 'Medical Shop', image: 'medical' },
    { id: '4', name: 'Maid', image: 'sparkles' },
    { id: '5', name: 'Hotels', image: 'business' },
];

const CategoryDetailScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<RouteProp<RouteParams, 'CategoryDetail'>>();
    const { categoryId, categoryName } = route.params || { categoryId: 'medical', categoryName: 'Medical' };

    const [searchQuery, setSearchQuery] = useState('');
    const [category, setCategory] = useState<ServiceCategory | null>(null);
    const [loading, setLoading] = useState(true);

    // Fetch category data with subcategories
    useEffect(() => {
        fetchCategoryData();
    }, [categoryId]);

    const fetchCategoryData = async () => {
        try {
            setLoading(true);
            const categories = await getServiceCategories();
            const found = categories.find(cat => cat._id === categoryId || cat.name.toLowerCase() === categoryId.toLowerCase());
            setCategory(found || null);
        } catch (error) {
            console.error('Error fetching category:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubcategoryPress = (subcategory: any) => {
        navigation.navigate(ROUTES.SERVICE_PROVIDERS, {
            categoryId,
            subcategoryId: subcategory.id,
            subcategoryName: subcategory.name,
        });
    };

    const handleMedicineTypePress = (type: any) => {
        navigation.navigate(ROUTES.SERVICE_PROVIDERS, {
            categoryId,
            medicineType: type.id,
            typeName: type.name,
        });
    };

    const handleSearch = () => {
        if (searchQuery.trim()) {
            navigation.navigate(ROUTES.SERVICE_PROVIDERS, { searchQuery, categoryId });
        }
    };

    const renderTrendingItem = ({ item }: { item: typeof TRENDING_SEARCHES[0] }) => (
        <TouchableOpacity
            style={styles.trendingCard}
            onPress={() => navigation.navigate(ROUTES.SERVICE_PROVIDERS, { serviceId: item.id })}
        >
            <View style={styles.trendingImageContainer}>
                <Ionicons name={item.image as any} size={24} color={COLORS.primary} />
            </View>
            <Text style={styles.trendingName} numberOfLines={1}>{item.name}</Text>
        </TouchableOpacity>
    );

    const renderMedicineType = ({ item }: { item: typeof MEDICINE_TYPES[0] }) => (
        <TouchableOpacity
            style={styles.medicineTypeCard}
            onPress={() => handleMedicineTypePress(item)}
        >
            <View style={styles.medicineTypeImage}>
                <Ionicons name={(item.icon || 'medkit') as any} size={48} color={COLORS.primary} />
            </View>
            <Text style={styles.medicineTypeName}>{item.name}</Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="chevron-back" size={32} color={COLORS.primary} />
                    </TouchableOpacity>
                    <Text style={styles.logo}>
                        <Text style={styles.logoHindi}>Local PCO</Text>
                    </Text>
                    <View style={{ flex: 1 }} />
                    <Ionicons name="home" size={28} color={COLORS.primary} />
                </View>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <SearchBar
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholder="Search With Pincode"
                        onSearch={handleSearch}
                    />
                </View>

                {/* Dynamic Subcategories from Backend */}
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={COLORS.primary} />
                    </View>
                ) : category?.subcategories && category.subcategories.length > 0 ? (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Select Subcategory</Text>
                        <CategoryGrid
                            categories={category.subcategories
                                .filter(sub => sub.isActive)
                                .map((sub, index) => ({
                                    id: `${categoryId}_${index}`,
                                    name: sub.name,
                                    icon: sub.icon || 'location',
                                    color: '#E3F2FD'
                                }))}
                            onCategoryPress={handleSubcategoryPress}
                            numColumns={4}
                        />
                    </View>
                ) : null}

                {/* Fallback: Show hardcoded medical subcategories if it's medical category and no backend data */}
                {!loading && categoryId === 'medical' && (!category?.subcategories || category.subcategories.length === 0) && (
                    <View style={styles.section}>
                        <CategoryGrid
                            categories={MEDICAL_SUBCATEGORIES}
                            onCategoryPress={handleSubcategoryPress}
                            numColumns={4}
                        />
                    </View>
                )}

                {/* Medicine Types (for Medical) - Keep as fallback */}
                {!loading && categoryId === 'medical' && (
                    <View style={styles.section}>
                        <FlatList
                            data={MEDICINE_TYPES}
                            renderItem={renderMedicineType}
                            keyExtractor={(item) => item.id}
                            numColumns={2}
                            scrollEnabled={false}
                            columnWrapperStyle={styles.medicineTypeRow}
                        />
                    </View>
                )}

                {/* Trending Searches */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Trending Searches Near You</Text>
                        <TouchableOpacity>
                            <Text style={styles.viewAllText}>›</Text>
                        </TouchableOpacity>
                    </View>
                    <FlatList
                        data={TRENDING_SEARCHES}
                        renderItem={renderTrendingItem}
                        keyExtractor={(item) => item.id}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.horizontalList}
                    />
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>❤️ With Groww You</Text>
                </View>
            </ScrollView>
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
        paddingBottom: SPACING['3xl'],
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.base,
        paddingVertical: SPACING.md,
    },
    backButton: {
        marginRight: SPACING.md,
    },
    backIcon: {
        fontSize: 32,
        color: COLORS.primary,
        fontWeight: '300',
    },
    logo: {
        fontSize: FONT_SIZE['2xl'],
        fontWeight: '700',
    },
    logoHindi: {
        color: COLORS.primary,
    },
    logoPco: {
        color: COLORS.success,
    },
    searchContainer: {
        paddingHorizontal: SPACING.base,
        marginBottom: SPACING.base,
    },
    section: {
        paddingHorizontal: SPACING.base,
        marginBottom: SPACING.lg,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    sectionTitle: {
        fontSize: FONT_SIZE.sm,
        fontWeight: '600',
        color: COLORS.gray700,
        letterSpacing: 0.5,
    },
    viewAllText: {
        fontSize: FONT_SIZE.xl,
        color: COLORS.gray400,
    },
    horizontalList: {
        paddingRight: SPACING.base,
    },
    medicineTypeRow: {
        justifyContent: 'space-between',
        marginBottom: SPACING.md,
    },
    medicineTypeCard: {
        width: '48%',
        borderRadius: RADIUS.lg,
        overflow: 'hidden',
        backgroundColor: COLORS.gray100,
    },
    medicineTypeImage: {
        height: 100,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.gray100,
    },
    medicineTypeName: {
        fontSize: FONT_SIZE.sm,
        fontWeight: '600',
        color: COLORS.gray800,
        textAlign: 'center',
        paddingVertical: SPACING.sm,
        backgroundColor: COLORS.white,
    },
    trendingCard: {
        width: 70,
        marginRight: SPACING.md,
        alignItems: 'center',
    },
    trendingImageContainer: {
        width: 56,
        height: 56,
        borderRadius: RADIUS.lg,
        backgroundColor: COLORS.white,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.xs,
        shadowColor: COLORS.gray900,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    trendingName: {
        fontSize: FONT_SIZE.xs,
        color: COLORS.gray600,
        textAlign: 'center',
    },
    footer: {
        alignItems: 'center',
        paddingTop: SPACING.xl,
    },
    footerText: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.gray500,
    },
    loadingContainer: {
        paddingVertical: SPACING['2xl'],
        alignItems: 'center',
        justifyContent: 'center',
    },
    noSubcategoriesText: {
        textAlign: 'center',
        color: COLORS.gray500,
        fontSize: FONT_SIZE.sm,
        paddingVertical: SPACING.xl,
    },
});

export default CategoryDetailScreen;
