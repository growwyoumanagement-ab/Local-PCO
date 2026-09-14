// src/screens/ServiceProvidersScreen.tsx
// List of available service providers with filters

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Linking,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useAppDispatch, useAppSelector, selectDraftRequest } from '../store';
import { setDraftService, setDraftPartner } from '../store/requestSlice';
import {
    SearchBar,
    CategoryGrid,
    ServiceProviderCard,
    Loader,
    ProviderCardSkeleton,
} from '../components';
import type { FilterOption, ServiceProvider } from '../components';
import api from '../services/api';
import { Ionicons } from '@expo/vector-icons';
import {
    COLORS,
    SPACING,
    FONT_SIZE,
    RADIUS,
    ROUTES,
    MEDICAL_SUBCATEGORIES,
} from '../utils/constants';
import { getServiceCategories } from '../services/serviceService';

type RouteParams = {
    ServiceProviders: {
        categoryId?: string;
        subcategoryId?: string;
        subcategoryName?: string;
        searchQuery?: string;
        serviceId?: string;
        medicineType?: string;
        typeName?: string;
    };
};

const ServiceProvidersScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<RouteProp<RouteParams, 'ServiceProviders'>>();
    const dispatch = useAppDispatch();
    const draft = useAppSelector(selectDraftRequest);
    const {
        categoryId: paramCategoryId,
        subcategoryId,
        subcategoryName,
        medicineType,
        typeName,
        serviceId,
        categoryName,
        searchQuery: paramSearchQuery
    } = (route.params as any) || {};

    const categoryId = paramCategoryId || serviceId;

    const [searchQuery, setSearchQuery] = useState(paramSearchQuery || '');
    const [providers, setProviders] = useState<ServiceProvider[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [subcategories, setSubcategories] = useState<any[]>([]);

    useEffect(() => {
        if (paramSearchQuery !== undefined) {
            setSearchQuery(paramSearchQuery);
        }
    }, [paramSearchQuery]);

    useEffect(() => {
        if (categoryId) {
            fetchSubcategories();
        }
    }, [categoryId]);

    const fetchSubcategories = async () => {
        try {
            const categories = await getServiceCategories();
            const currentCat = categories.find(c => c._id === categoryId || c.name === categoryId);

            if (currentCat?.subcategories && currentCat.subcategories.length > 0) {
                setSubcategories(currentCat.subcategories.map((sub: any) => ({
                    id: sub.name,
                    name: sub.name,
                    icon: sub.icon || 'location',
                    color: '#E3F2FD'
                })));
            } else if (categoryId === 'medical') {
                setSubcategories(MEDICAL_SUBCATEGORIES);
            } else {
                setSubcategories([]);
            }
        } catch (error) {
            console.error('Error fetching subcategories:', error);
        }
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            loadProviders();
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [categoryId, subcategoryId, medicineType, searchQuery, categoryName]);

    const loadProviders = async () => {
        setIsLoading(true);
        try {
            const queryCategory = categoryName || categoryId;
            const response = await api.get('/partner/search', {
                params: {
                    category: queryCategory,
                    subcategory: subcategoryId,
                    query: searchQuery
                }
            });
            if (response.data.success && Array.isArray(response.data.data)) {
                const mapped: ServiceProvider[] = response.data.data.map((p: any) => {
                    const realId = p._id || p.id;
                    return {
                        _id: realId,
                        id: realId,
                        name: p.name,
                        phone: p.phone,
                        location: p.location || p.serviceArea || '',
                        rating: p.rating || 5.0,
                        reviewCount: p.totalReviews || p.reviewCount || 0,
                        totalJobs: p.completedJobsCount || p.totalJobs || 0,
                        isVerified: p.isVerified !== undefined ? p.isVerified : true,
                        isAvailable: p.isAvailable !== undefined ? p.isAvailable : true,
                        category: p.categoryName || p.category || '',
                        avatar: p.image || p.avatar,
                    };
                });
                setProviders(mapped);
            } else {
                setProviders([]);
            }
        } catch (error) {
            console.error('Error loading providers from API:', error);
            setProviders([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubcategoryPress = (subcategory: any) => {
        navigation.setParams({
            subcategoryId: subcategory.id,
            subcategoryName: subcategory.name,
        });
    };

    const handleCallPress = async (provider: ServiceProvider) => {
        const partnerId = provider._id || provider.id;

        if (!partnerId || !/^[0-9a-fA-F]{24}$/.test(partnerId)) {
            Alert.alert('Invalid Partner', 'Cannot log call for invalid partner ID.');
            return;
        }

        try {
            await api.post('/requests', {
                partnerId: partnerId,
                serviceId: categoryId || 'general',
                bookingType: 'call_log',
            });
        } catch (error) {
            console.error('Error creating call log', error);
        }

        const phoneNumber = provider.phone;
        if (!phoneNumber) {
            Alert.alert('Phone Number Not Found', 'This partner has not provided a contact number.');
            return;
        }

        Linking.openURL(`tel:${phoneNumber}`);
    };

    const handleProviderSelect = (provider: ServiceProvider) => {
        const partnerId = provider._id || provider.id;
        if (!partnerId || !/^[0-9a-fA-F]{24}$/.test(partnerId)) {
            Alert.alert('Invalid Partner', 'Please select a valid partner from the list.');
            return;
        }

        navigation.navigate(ROUTES.PROVIDER_DETAIL, {
            provider: {
                _id: partnerId,
                id: partnerId,
                name: provider.name,
                phone: provider.phone || '',
                rating: provider.rating,
                totalJobs: provider.totalJobs,
                isAvailable: provider.isAvailable,
                category: provider.category || '',
                avatar: provider.avatar,
                address: provider.address || provider.location,
            },
            categoryId,
            categoryName,
        });
    };

    const handleBookPress = (provider: ServiceProvider) => {
        handleProviderSelect(provider);
    };

    const handleSearch = () => {
        loadProviders();
    };

    const renderProvider = ({ item }: { item: ServiceProvider }) => (
        <ServiceProviderCard
            provider={item}
            onCallPress={() => handleCallPress(item)}
            onBookPress={() => handleProviderSelect(item)}
            onPress={() => handleProviderSelect(item)}
        />
    );

    const isMongoId = (str?: string) => str && /^[0-9a-fA-F]{24}$/.test(str);
    const screenTitle = categoryName || subcategoryName || typeName || (searchQuery ? `Search: "${searchQuery}"` : (!isMongoId(categoryId) ? categoryId : 'Service Providers'));

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color={COLORS.gray900} />
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>
                    {screenTitle}
                </Text>
                <View style={{ width: 24 }} />
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <SearchBar
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Search"
                    onSearch={handleSearch}
                />
            </View>

            {/* Sub-categories (Dynamic) */}
            {subcategories.length > 0 && (
                <View style={styles.subcategoriesContainer}>
                    <CategoryGrid
                        categories={subcategories}
                        onCategoryPress={handleSubcategoryPress}
                        numColumns={4}
                    />
                </View>
            )}



            {/* Providers List */}
            {isLoading ? (
                <View style={{ paddingHorizontal: 16, paddingTop: 12 }}>
                    <ProviderCardSkeleton />
                    <ProviderCardSkeleton />
                    <ProviderCardSkeleton />
                </View>
            ) : (
                <FlatList
                    data={providers}
                    renderItem={renderProvider}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Ionicons name="search" size={48} color={COLORS.gray300} style={styles.emptyIcon} />
                            <Text style={styles.emptyTitle}>No providers found</Text>
                            <Text style={styles.emptySubtitle}>
                                Try adjusting your filters or search query
                            </Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.base,
        paddingVertical: SPACING.md,
        backgroundColor: COLORS.background,
    },
    backButton: {
        marginRight: SPACING.md,
    },
    backIcon: {
        fontSize: 32,
        color: COLORS.primary,
        fontWeight: '300',
    },
    headerTitle: {
        fontSize: FONT_SIZE.lg,
        fontWeight: '700',
        color: COLORS.gray900,
        flex: 1,
        textAlign: 'center',
    },

    searchContainer: {
        paddingHorizontal: SPACING.base,
        paddingVertical: SPACING.sm,
        backgroundColor: COLORS.white,
    },
    subcategoriesContainer: {
        paddingHorizontal: SPACING.base,
        backgroundColor: COLORS.white,
        paddingBottom: SPACING.sm,
    },

    listContent: {
        padding: SPACING.base,
    },
    emptyState: {
        alignItems: 'center',
        paddingTop: SPACING['3xl'],
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: SPACING.md,
    },
    emptyTitle: {
        fontSize: FONT_SIZE.lg,
        fontWeight: '600',
        color: COLORS.gray700,
        marginBottom: SPACING.xs,
    },
    emptySubtitle: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.gray500,
        textAlign: 'center',
    },
});

export default ServiceProvidersScreen;
