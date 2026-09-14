// src/screens/SavedAddressScreen.tsx
// Manage saved addresses screen

import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Alert,
    Modal,
    TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector, selectSavedAddresses } from '../store';
import { fetchSavedAddresses, deleteAddress, addAddress } from '../store/locationSlice';
import { AddressCard, Button, Loader, EmptyState, Card, Input } from '../components';
import { SavedAddress, AddAddressPayload } from '../services/locationService';
import { COLORS, SPACING, FONT_SIZE, ADDRESS_TYPE } from '../utils/constants';

const SavedAddressScreen: React.FC = () => {
    const dispatch = useAppDispatch();

    const savedAddresses = useAppSelector(selectSavedAddresses);
    const isLoading = useAppSelector((state) => state.location.isLoading);

    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState<AddAddressPayload>({
        label: '',
        type: 'other',
        full: '',
        landmark: '',
        city: '',
        pincode: '',
    });

    // Per-field validation errors
    const [errors, setErrors] = useState<{ label?: string; full?: string; city?: string; pincode?: string }>({});

    useEffect(() => {
        dispatch(fetchSavedAddresses());
    }, []);

    const handleDelete = (address: SavedAddress) => {
        const addressId = address.id || (address as any)._id;
        if (!addressId) return;

        Alert.alert(
            'Delete Address',
            `Are you sure you want to delete "${address.label}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => dispatch(deleteAddress(addressId)),
                },
            ]
        );
    };

    const validateForm = (): boolean => {
        const newErrors: { label?: string; full?: string; city?: string; pincode?: string } = {};

        if (!formData.label.trim()) {
            newErrors.label = 'Label is required (e.g., Home, Office)';
        }
        if (!formData.full.trim()) {
            newErrors.full = 'Full address is required';
        } else if (formData.full.trim().length < 5) {
            newErrors.full = 'Address is too short, please be more specific';
        }
        if (!formData.city.trim()) {
            newErrors.city = 'City is required';
        }
        if (!formData.pincode.trim()) {
            newErrors.pincode = 'Pincode is required';
        } else if (!/^\d{6}$/.test(formData.pincode.trim())) {
            newErrors.pincode = 'Pincode must be exactly 6 digits';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleAddAddress = async () => {
        if (!validateForm()) return;

        try {
            await dispatch(addAddress(formData)).unwrap();
            setShowModal(false);
            resetForm();
            Alert.alert('Success', 'Address added successfully');
        } catch (error: any) {
            const errorMessage = typeof error === 'string' ? error : error.message || 'Something went wrong';
            Alert.alert('Error', errorMessage);
        }
    };

    const resetForm = () => {
        setFormData({
            label: '',
            type: 'other',
            full: '',
            landmark: '',
            city: '',
            pincode: '',
        });
        setErrors({});
    };

    const renderItem = ({ item }: { item: SavedAddress }) => (
        <AddressCard
            address={item}
            showActions
            onDelete={() => handleDelete(item)}
        />
    );

    if (isLoading && savedAddresses.length === 0) {
        return <Loader fullScreen text="Loading addresses..." />;
    }

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={savedAddresses}
                keyExtractor={(item, index) => item.id || (item as any)._id || index.toString()}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <EmptyState
                        icon="location-outline"
                        title="No Saved Addresses"
                        description="Add your frequently used addresses for quick access"
                        actionLabel="Add Address"
                        onAction={() => setShowModal(true)}
                    />
                }
                ListFooterComponent={
                    savedAddresses.length > 0 ? (
                        <Button
                            title="+ Add New Address"
                            onPress={() => setShowModal(true)}
                            variant="outline"
                            fullWidth
                        />
                    ) : null
                }
            />

            {/* Add Address Modal */}
            <Modal
                visible={showModal}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setShowModal(false)}
            >
                <SafeAreaView style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Add New Address</Text>
                        <TouchableOpacity onPress={() => setShowModal(false)}>
                            <Ionicons name="close" size={24} color={COLORS.gray500} />
                        </TouchableOpacity>
                    </View>

                    <FlatList
                        data={[1]} // Dummy data to enable scrolling
                        keyExtractor={() => 'form'}
                        renderItem={() => (
                            <View style={styles.modalContent}>
                                <Input
                                    label="Label *"
                                    placeholder="e.g., Home, Office, Mom's House"
                                    value={formData.label}
                                    onChangeText={(text) => {
                                        setFormData({ ...formData, label: text });
                                        if (errors.label) setErrors({ ...errors, label: undefined });
                                    }}
                                />
                                {errors.label ? <Text style={styles.fieldError}>{errors.label}</Text> : null}

                                <Text style={styles.typeLabel}>Address Type</Text>
                                <View style={styles.typeRow}>
                                    {Object.entries(ADDRESS_TYPE).map(([key, value]) => (
                                        <TouchableOpacity
                                            key={key}
                                            style={[
                                                styles.typeChip,
                                                formData.type === value && styles.typeChipActive,
                                            ]}
                                            onPress={() => setFormData({ ...formData, type: value })}
                                        >
                                            <View style={styles.typeChipContent}>
                                                <Ionicons
                                                    name={key === 'HOME' ? 'home-outline' : key === 'WORK' ? 'briefcase-outline' : 'location-outline'}
                                                    size={16}
                                                    color={formData.type === value ? COLORS.white : COLORS.gray600}
                                                />
                                                <Text
                                                    style={[
                                                        styles.typeText,
                                                        formData.type === value && styles.typeTextActive,
                                                    ]}
                                                >
                                                    {key}
                                                </Text>
                                            </View>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                <Input
                                    label="Full Address *"
                                    placeholder="House/Flat No, Building, Street"
                                    value={formData.full}
                                    onChangeText={(text) => {
                                        setFormData({ ...formData, full: text });
                                        if (errors.full) setErrors({ ...errors, full: undefined });
                                    }}
                                    multiline
                                    numberOfLines={2}
                                />
                                {errors.full ? <Text style={styles.fieldError}>{errors.full}</Text> : null}

                                <Input
                                    label="Landmark"
                                    placeholder="Near..."
                                    value={formData.landmark}
                                    onChangeText={(text) => setFormData({ ...formData, landmark: text })}
                                />

                                <View style={styles.row}>
                                    <View style={styles.halfInput}>
                                        <Input
                                            label="City *"
                                            placeholder="City"
                                            value={formData.city}
                                            onChangeText={(text) => {
                                                setFormData({ ...formData, city: text });
                                                if (errors.city) setErrors({ ...errors, city: undefined });
                                            }}
                                        />
                                        {errors.city ? <Text style={styles.fieldError}>{errors.city}</Text> : null}
                                    </View>
                                    <View style={styles.halfInput}>
                                        <Input
                                            label="Pincode *"
                                            placeholder="6 digits"
                                            value={formData.pincode}
                                            onChangeText={(text) => {
                                                setFormData({ ...formData, pincode: text });
                                                if (errors.pincode) setErrors({ ...errors, pincode: undefined });
                                            }}
                                            keyboardType="number-pad"
                                            maxLength={6}
                                        />
                                        {errors.pincode ? <Text style={styles.fieldError}>{errors.pincode}</Text> : null}
                                    </View>
                                </View>
                            </View>
                        )}
                    />

                    <View style={styles.modalFooter}>
                        <Button
                            title="Save Address"
                            onPress={handleAddAddress}
                            loading={isLoading}
                            fullWidth
                        />
                    </View>
                </SafeAreaView>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    listContent: {
        padding: SPACING.base,
        paddingBottom: SPACING['3xl'],
    },
    modalContainer: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: SPACING.base,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gray100,
    },
    modalTitle: {
        fontSize: FONT_SIZE.lg,
        fontWeight: '700',
        color: COLORS.gray900,
    },
    closeButton: {
        fontSize: 24,
        color: COLORS.gray500,
        padding: SPACING.xs,
    },
    modalContent: {
        padding: SPACING.base,
    },
    typeLabel: {
        fontSize: FONT_SIZE.sm,
        fontWeight: '500',
        color: COLORS.gray700,
        marginBottom: SPACING.sm,
    },
    typeRow: {
        flexDirection: 'row',
        marginBottom: SPACING.base,
    },
    typeChip: {
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.md,
        borderRadius: 20,
        backgroundColor: COLORS.gray100,
        marginRight: SPACING.sm,
    },
    typeChipActive: {
        backgroundColor: COLORS.primary,
    },
    typeChipContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.xs,
    },
    typeText: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.gray600,
    },
    typeTextActive: {
        color: COLORS.white,
        fontWeight: '600',
    },
    row: {
        flexDirection: 'row',
        marginHorizontal: -SPACING.xs,
    },
    halfInput: {
        flex: 1,
        paddingHorizontal: SPACING.xs,
    },
    fieldError: {
        fontSize: FONT_SIZE.xs,
        color: '#DC2626',
        marginTop: -SPACING.xs,
        marginBottom: SPACING.xs,
        marginLeft: 2,
        fontWeight: '500',
    },
    modalFooter: {
        padding: SPACING.base,
        borderTopWidth: 1,
        borderTopColor: COLORS.gray100,
    },
});

export default SavedAddressScreen;
