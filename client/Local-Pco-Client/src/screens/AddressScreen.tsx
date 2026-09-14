// src/screens/AddressScreen.tsx
// Redesigned modern address picker screen with context banner & saved address quick-select

import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAppDispatch, useAppSelector, selectSavedAddresses, selectCurrentLocation } from '../store';
import { fetchSavedAddresses, setCurrentLocation, setLocationLoading } from '../store/locationSlice';
import { setDraftAddress } from '../store/requestSlice';
import { AddressCard, PrimaryButton, Card, Input, BookingStepHeader } from '../components';
import { SavedAddress } from '../services/locationService';
import { COLORS, SPACING, FONT_SIZE, RADIUS, SHADOWS, ROUTES } from '../utils/constants';

import * as Location from 'expo-location';
import Toast from 'react-native-toast-message';
import { locationService } from '../services/locationService';

const AddressScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const dispatch = useAppDispatch();

    const savedAddresses = useAppSelector(selectSavedAddresses);
    const currentLocation = useAppSelector(selectCurrentLocation);
    const isLoading = useAppSelector((state) => state.location.isLoading);
    const draft = useAppSelector((state) => state.request.draftRequest);

    const [selectedAddress, setSelectedAddress] = useState<SavedAddress | null>(null);
    const [useCurrentLocation, setUseCurrentLocation] = useState(false);
    const [manualAddress, setManualAddress] = useState('');
    const [showManualInput, setShowManualInput] = useState(false);
    const [isDetecting, setIsDetecting] = useState(false);

    const { providerId, providerName, isAvailable } = route.params || {};

    useEffect(() => {
        dispatch(fetchSavedAddresses());
    }, [dispatch]);

    const handleDetectLocation = async () => {
        setIsDetecting(true);
        dispatch(setLocationLoading(true));

        try {
            const servicesEnabled = await Location.hasServicesEnabledAsync();
            if (!servicesEnabled) {
                Toast.show({
                    type: 'error',
                    text1: 'GPS Services Disabled',
                    text2: 'Please enable Location/GPS on your device or enter address manually',
                });
                setShowManualInput(true);
                setIsDetecting(false);
                dispatch(setLocationLoading(false));
                return;
            }

            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Toast.show({
                    type: 'error',
                    text1: 'Permission Denied',
                    text2: 'Location permission is required to detect current location',
                });
                setShowManualInput(true);
                setIsDetecting(false);
                dispatch(setLocationLoading(false));
                return;
            }

            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
            });

            const { latitude, longitude } = location.coords;

            let formattedAddress = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
            let detectedCity = 'Current City';
            let detectedPincode = '';

            try {
                const geocoded = await locationService.reverseGeocode(latitude, longitude);
                if (geocoded && geocoded.address) {
                    formattedAddress = geocoded.address;
                    detectedCity = geocoded.city || detectedCity;
                    detectedPincode = geocoded.pincode || detectedPincode;
                } else {
                    const place = await Location.reverseGeocodeAsync({ latitude, longitude });
                    if (place && place[0]) {
                        const p = place[0];
                        formattedAddress = [p.name, p.street, p.subregion, p.city, p.region].filter(Boolean).join(', ');
                        detectedCity = p.city || p.subregion || detectedCity;
                        detectedPincode = p.postalCode || detectedPincode;
                    }
                }
            } catch (geocodeErr) {
                console.warn('Geocoding fallback failed:', geocodeErr);
            }

            dispatch(setCurrentLocation({
                lat: latitude,
                lng: longitude,
                address: formattedAddress,
                city: detectedCity,
                pincode: detectedPincode,
            }));
            setUseCurrentLocation(true);
            setSelectedAddress(null);
            setShowManualInput(false);
            Toast.show({
                type: 'success',
                text1: 'Location Detected',
                text2: formattedAddress,
            });
        } catch (error: any) {
            Toast.show({
                type: 'error',
                text1: 'Location Error',
                text2: error.message || 'Unable to detect location. Please enter custom address.',
            });
            setShowManualInput(true);
        } finally {
            setIsDetecting(false);
            dispatch(setLocationLoading(false));
        }
    };

    const handleSelectAddress = (address: SavedAddress) => {
        setSelectedAddress(address);
        setUseCurrentLocation(false);
        setShowManualInput(false);
    };

    const handleContinue = () => {
        // Validate: must have some form of location selected
        if (!useCurrentLocation && !selectedAddress && !(showManualInput && manualAddress.trim().length >= 8)) {
            if (!useCurrentLocation && !selectedAddress && !showManualInput) {
                Toast.show({
                    type: 'error',
                    text1: 'Location Required',
                    text2: 'Please detect your location, select a saved address, or enter one manually.',
                });
            } else if (showManualInput && manualAddress.trim().length < 8) {
                Toast.show({
                    type: 'error',
                    text1: 'Address Too Short',
                    text2: 'Please enter a complete address (at least 8 characters).',
                });
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'No Location Selected',
                    text2: 'Please select or enter a service location to proceed.',
                });
            }
            return;
        }

        let address: { full: string; landmark?: string; lat?: number; lng?: number } | null = null;

        if (useCurrentLocation && currentLocation) {
            address = {
                full: currentLocation.address || 'Current Location',
                lat: currentLocation.lat,
                lng: currentLocation.lng,
            };
        } else if (selectedAddress) {
            address = {
                full: selectedAddress.full,
                landmark: selectedAddress.landmark,
                lat: selectedAddress.lat,
                lng: selectedAddress.lng,
            };
        } else if (showManualInput && manualAddress.trim()) {
            address = {
                full: manualAddress.trim(),
            };
        }

        if (address) {
            dispatch(setDraftAddress(address));
            navigation.navigate(ROUTES.CREATE_REQUEST, { providerId, providerName, isAvailable });
        }
    };

    const canContinue = useCurrentLocation || selectedAddress || (showManualInput && manualAddress.trim().length >= 8);

    return (
        <SafeAreaView style={styles.container}>
            <BookingStepHeader currentStep={2} />
            {/* Header context info banner */}
            <View style={styles.contextHeader}>
                <View style={styles.contextIconBox}>
                    <Ionicons name="location-sharp" size={20} color={COLORS.primary} />
                </View>
                <View style={styles.contextTextContainer}>
                    <Text style={styles.contextTitle}>Service Location</Text>
                    <Text style={styles.contextSubtitle} numberOfLines={1}>
                        Where should {providerName || draft.serviceName || 'the expert'} come to?
                    </Text>
                </View>
            </View>

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* Auto Location Detector Button */}
                <TouchableOpacity
                    style={[styles.locationCard, useCurrentLocation && styles.locationCardSelected]}
                    onPress={handleDetectLocation}
                    activeOpacity={0.85}
                >
                    <View style={[styles.locationIcon, useCurrentLocation && styles.locationIconSelected]}>
                        {isDetecting ? (
                            <ActivityIndicator color={COLORS.white} size="small" />
                        ) : (
                            <Ionicons name="locate" size={22} color={COLORS.white} />
                        )}
                    </View>
                    <View style={styles.locationContent}>
                        <Text style={styles.locationTitle}>Use Current Location</Text>
                        {currentLocation && useCurrentLocation ? (
                            <Text style={styles.locationAddress} numberOfLines={2}>{currentLocation?.address}</Text>
                        ) : (
                            <Text style={styles.locationHint}>Detect location via GPS automatically</Text>
                        )}
                    </View>
                    {useCurrentLocation && (
                        <View style={styles.checkmark}>
                            <Ionicons name="checkmark" size={14} color={COLORS.white} />
                        </View>
                    )}
                </TouchableOpacity>

                {/* Saved Addresses Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Saved Addresses</Text>
                        {savedAddresses.length > 0 && (
                            <Text style={styles.addressCount}>{savedAddresses.length} saved</Text>
                        )}
                    </View>

                    {isLoading ? (
                        <View style={styles.loadingBox}>
                            <ActivityIndicator color={COLORS.primary} size="small" />
                            <Text style={styles.loadingText}>Fetching saved addresses...</Text>
                        </View>
                    ) : savedAddresses.length > 0 ? (
                        savedAddresses.map((address, index) => {
                            const addressId = address.id || (address as any)._id || index.toString();
                            const selectedId = selectedAddress?.id || (selectedAddress as any)?._id;
                            const isSelected = selectedId === addressId;
                            return (
                                <AddressCard
                                    key={addressId}
                                    address={address}
                                    selected={isSelected}
                                    onPress={() => handleSelectAddress(address)}
                                />
                            );
                        })
                    ) : (
                        <View style={styles.noAddressesBox}>
                            <Ionicons name="bookmark-outline" size={28} color={COLORS.gray400} />
                            <Text style={styles.noAddressesText}>No saved addresses found</Text>
                        </View>
                    )}
                </View>

                {/* Manual Address Input */}
                <View style={styles.section}>
                    <TouchableOpacity
                        style={styles.manualToggle}
                        onPress={() => {
                            setShowManualInput(!showManualInput);
                            if (!showManualInput) {
                                setSelectedAddress(null);
                                setUseCurrentLocation(false);
                            }
                        }}
                        activeOpacity={0.8}
                    >
                        <Ionicons
                            name={showManualInput ? 'remove-circle-outline' : 'add-circle-outline'}
                            size={20}
                            color={COLORS.primary}
                        />
                        <Text style={styles.manualToggleText}>
                            {showManualInput ? 'Hide Manual Address' : 'Enter Custom Address Manually'}
                        </Text>
                    </TouchableOpacity>

                    {showManualInput && (
                        <Card style={styles.manualCard}>
                            <Input
                                label="Full Service Address"
                                placeholder="House no, Flat, Building, Street, Landmark..."
                                value={manualAddress}
                                onChangeText={(text) => {
                                    setManualAddress(text);
                                    setSelectedAddress(null);
                                    setUseCurrentLocation(false);
                                }}
                                multiline
                                numberOfLines={3}
                                helperText="Include landmarks and pincode for faster arrival"
                            />
                            {manualAddress.trim().length > 0 && manualAddress.trim().length < 8 && (
                                <Text style={styles.manualAddressHint}>
                                    ⚠️ Address too short — please enter at least 8 characters ({manualAddress.trim().length}/8)
                                </Text>
                            )}
                        </Card>
                    )}
                </View>
            </ScrollView>

            {/* Bottom Floating Bar */}
            <View style={styles.footer}>
                {/* Always active — validation + Toast handled inside handleContinue */}
                <PrimaryButton
                    title="Proceed to Review →"
                    onPress={handleContinue}
                    disabled={false}
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    contextHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        paddingHorizontal: SPACING.base,
        paddingVertical: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gray100,
        ...SHADOWS.sm,
    },
    contextIconBox: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: COLORS.primaryBg,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.md,
    },
    contextTextContainer: {
        flex: 1,
    },
    contextTitle: {
        fontSize: FONT_SIZE.xs,
        fontWeight: '800',
        color: COLORS.primary,
        letterSpacing: 0.6,
        textTransform: 'uppercase',
    },
    contextSubtitle: {
        fontSize: FONT_SIZE.sm + 1,
        fontWeight: '700',
        color: COLORS.gray900,
        marginTop: 1,
    },
    scroll: {
        flex: 1,
    },
    content: {
        padding: SPACING.base,
        paddingBottom: SPACING['3xl'],
    },
    locationCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.xl,
        padding: SPACING.md + 2,
        marginBottom: SPACING.lg,
        borderWidth: 1.5,
        borderColor: COLORS.gray200,
        ...SHADOWS.sm,
    },
    locationCardSelected: {
        borderColor: COLORS.primary,
        backgroundColor: COLORS.primaryBg,
    },
    locationIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.md,
    },
    locationIconSelected: {
        backgroundColor: COLORS.primaryDark,
    },
    locationContent: {
        flex: 1,
    },
    locationTitle: {
        fontSize: FONT_SIZE.base,
        fontWeight: '700',
        color: COLORS.gray900,
        marginBottom: 2,
    },
    locationAddress: {
        fontSize: FONT_SIZE.xs + 1,
        color: COLORS.gray700,
        fontWeight: '500',
    },
    locationHint: {
        fontSize: FONT_SIZE.xs + 1,
        color: COLORS.gray500,
    },
    checkmark: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: SPACING.xs,
    },
    section: {
        marginBottom: SPACING.xl,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.sm + 2,
    },
    sectionTitle: {
        fontSize: FONT_SIZE.base,
        fontWeight: '800',
        color: COLORS.gray900,
    },
    addressCount: {
        fontSize: FONT_SIZE.xs,
        fontWeight: '600',
        color: COLORS.gray500,
    },
    loadingBox: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.md,
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.lg,
        gap: SPACING.sm,
    },
    loadingText: {
        fontSize: FONT_SIZE.xs + 1,
        color: COLORS.gray500,
    },
    noAddressesBox: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: SPACING.xl,
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.xl,
        borderStyle: 'dashed',
        borderWidth: 1,
        borderColor: COLORS.gray300,
    },
    noAddressesText: {
        fontSize: FONT_SIZE.xs + 1,
        color: COLORS.gray500,
        marginTop: SPACING.xs,
    },
    manualToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.white,
        padding: SPACING.md,
        borderRadius: RADIUS.xl,
        borderWidth: 1,
        borderColor: COLORS.gray200,
        gap: SPACING.xs,
    },
    manualToggleText: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.primary,
        fontWeight: '700',
    },
    manualCard: {
        marginTop: SPACING.sm,
        borderRadius: RADIUS.xl,
    },
    manualAddressHint: {
        fontSize: FONT_SIZE.xs,
        color: COLORS.danger ?? '#DC2626',
        marginTop: SPACING.xs,
        marginHorizontal: SPACING.xs,
        fontWeight: '500',
    },
    footer: {
        padding: SPACING.base,
        backgroundColor: COLORS.white,
        borderTopWidth: 1,
        borderTopColor: COLORS.gray100,
        ...SHADOWS.md,
    },
});

export default AddressScreen;
