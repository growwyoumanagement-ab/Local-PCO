// src/screens/CreateRequestScreen.tsx
// Redesigned modern request review and summary screen

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAppDispatch, useAppSelector, selectDraftRequest, selectIsCreating } from '../store';
import { createRequest, setDraftNotes, setDraftPartner, setDraftBookingType } from '../store/requestSlice';
import { Card, PrimaryButton, Button, Loader, BookingStepHeader } from '../components';
import { COLORS, SPACING, FONT_SIZE, RADIUS, SHADOWS, ROUTES } from '../utils/constants';
import Toast from 'react-native-toast-message';

export const CreateRequestScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const dispatch = useAppDispatch();

    const { providerId, providerName, isAvailable } = route.params || {};
    const draft = useAppSelector(selectDraftRequest);
    const isCreating = useAppSelector(selectIsCreating);

    const [notes, setNotes] = useState(draft.notes);
    const [isSubmitted, setIsSubmitted] = useState(false);

    // Default scheduled date (2 hours 15 mins ahead)
    const [scheduledDate, setScheduledDate] = useState<Date>(
        new Date(Date.now() + 2 * 60 * 60 * 1000 + 15 * 60 * 1000)
    );
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

    React.useEffect(() => {
        if (providerId && /^[0-9a-fA-F]{24}$/.test(providerId)) {
            dispatch(setDraftPartner(providerId));
        }
    }, [providerId, dispatch]);

    const handleNotesChange = (text: string) => {
        setNotes(text);
        dispatch(setDraftNotes(text));
    };

    const handleBookingTypeChange = (type: 'instant' | 'appointment') => {
        dispatch(setDraftBookingType(type));
    };

    const onDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(Platform.OS === 'ios');
        if (selectedDate) {
            const current = new Date(scheduledDate);
            current.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
            setScheduledDate(current);
        }
    };

    const onTimeChange = (event: any, selectedDate?: Date) => {
        setShowTimePicker(Platform.OS === 'ios');
        if (selectedDate) {
            const current = new Date(scheduledDate);
            current.setHours(selectedDate.getHours(), selectedDate.getMinutes());
            setScheduledDate(current);
        }
    };

    const handleSubmit = async () => {
        const partnerId = draft.partnerId;
        if (!draft.serviceId || !draft.address || !partnerId || !/^[0-9a-fA-F]{24}$/.test(partnerId)) {
            Toast.show({
                type: 'error',
                text1: 'Missing Information',
                text2: 'Please select a valid partner and address.',
            });
            return;
        }

        if (draft.bookingType === 'appointment') {
            const minAllowed = new Date(Date.now() + 2 * 60 * 60 * 1000);
            if (scheduledDate < minAllowed) {
                Toast.show({
                    type: 'error',
                    text1: 'Invalid Schedule',
                    text2: 'Appointments must be scheduled at least 2 hours in advance.',
                });
                return;
            }
        }

        if (isSubmitted || isCreating) return;
        setIsSubmitted(true);

        try {
            await dispatch(createRequest({
                serviceId: draft.serviceId,
                partnerId: partnerId,
                bookingType: draft.bookingType,
                address: draft.address,
                notes: notes,
                scheduledAt: draft.bookingType === 'appointment' ? scheduledDate.toISOString() : undefined,
            })).unwrap();

            if (draft.bookingType === 'appointment') {
                Toast.show({
                    type: 'success',
                    text1: 'Appointment Booked! 📅',
                    text2: 'Your appointment has been successfully scheduled.',
                    visibilityTime: 3500,
                });

                setTimeout(() => {
                    navigation.reset({
                        index: 0,
                        routes: [{ name: ROUTES.DASHBOARD }],
                    });
                    navigation.navigate(ROUTES.HISTORY_TAB);
                }, 1200);
            } else {
                Toast.show({
                    type: 'success',
                    text1: 'Request Submitted! 🎉',
                    text2: 'Partner notified! Connecting you to live tracking.',
                    visibilityTime: 3500,
                });

                setTimeout(() => {
                    navigation.reset({
                        index: 1,
                        routes: [
                            { name: ROUTES.DASHBOARD },
                            { name: ROUTES.TRACKING }
                        ],
                    });
                }, 1200);
            }
        } catch (error: any) {
            setIsSubmitted(false);
            const errorMessage = typeof error === 'string' ? error : (error.message || 'Failed to submit request');
            Toast.show({
                type: 'error',
                text1: 'Booking Failed',
                text2: errorMessage,
            });
        }
    };

    if (isSubmitted || isCreating) {
        return (
            <Loader
                fullScreen
                text={draft.bookingType === 'appointment' ? 'Scheduling your appointment...' : 'Dispatching partner...'}
            />
        );
    }

    if (!draft.serviceId || !draft.address) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.errorContainer}>
                    <View style={styles.errorIconCircle}>
                        <Ionicons name="alert-circle-outline" size={48} color={COLORS.error} />
                    </View>
                    <Text style={styles.errorTitle}>Request Incomplete</Text>
                    <Text style={styles.errorSub}>Some details are missing. Please select your service and address again.</Text>
                    <Button
                        title="Return to Dashboard"
                        onPress={() => navigation.navigate(ROUTES.DASHBOARD)}
                        variant="primary"
                    />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <BookingStepHeader currentStep={3} />
            {/* Header context */}
            <View style={styles.headerBar}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={20} color={COLORS.gray800} />
                </TouchableOpacity>
                <View style={styles.headerTitleBox}>
                    <Text style={styles.headerTitle}>Review & Confirm</Text>
                    <Text style={styles.headerSubtitle}>Step 3 of 3</Text>
                </View>
            </View>

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* Hero Partner Card */}
                <View style={styles.partnerHeroCard}>
                    <View style={styles.partnerAvatar}>
                        <Ionicons name="person" size={26} color={COLORS.primary} />
                    </View>
                    <View style={styles.partnerInfo}>
                        <Text style={styles.partnerRoleLabel}>SELECTED PARTNER</Text>
                        <Text style={styles.partnerNameText}>{providerName || 'Certified Expert'}</Text>
                        <View style={styles.partnerMetaRow}>
                            <Ionicons name="checkmark-circle" size={14} color={COLORS.success} />
                            <Text style={styles.partnerVerifiedText}>Verified Service Partner</Text>
                        </View>
                    </View>
                </View>

                {/* Service Details Card */}
                <Card style={styles.cardSection}>
                    <View style={styles.cardHeaderRow}>
                        <Ionicons name="construct" size={18} color={COLORS.primary} />
                        <Text style={styles.cardHeaderTitle}>Service</Text>
                    </View>
                    <Text style={styles.serviceNameValue}>{draft.serviceName}</Text>
                </Card>

                {/* Booking Type Segmented Selector */}
                <Card style={styles.cardSection}>
                    <Text style={styles.cardHeaderTitle}>Booking Option</Text>
                    <View style={styles.bookingTypeRow}>
                        <TouchableOpacity
                            style={[
                                styles.bookingOptionBtn,
                                draft.bookingType === 'instant' && styles.bookingOptionActive,
                            ]}
                            onPress={() => handleBookingTypeChange('instant')}
                            activeOpacity={0.8}
                        >
                            <Ionicons
                                name="flash"
                                size={20}
                                color={draft.bookingType === 'instant' ? COLORS.primary : COLORS.gray400}
                            />
                            <Text
                                style={[
                                    styles.bookingOptionText,
                                    draft.bookingType === 'instant' && styles.bookingOptionTextActive,
                                ]}
                            >
                                Instant (Now)
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.bookingOptionBtn,
                                draft.bookingType === 'appointment' && styles.bookingOptionActive,
                            ]}
                            onPress={() => handleBookingTypeChange('appointment')}
                            activeOpacity={0.8}
                        >
                            <Ionicons
                                name="calendar"
                                size={20}
                                color={draft.bookingType === 'appointment' ? COLORS.primary : COLORS.gray400}
                            />
                            <Text
                                style={[
                                    styles.bookingOptionText,
                                    draft.bookingType === 'appointment' && styles.bookingOptionTextActive,
                                ]}
                            >
                                Schedule
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Date/Time Picker block for appointment */}
                    {draft.bookingType === 'appointment' && (
                        <View style={styles.schedulePickerCard}>
                            <Text style={styles.scheduleHint}>Pick date & arrival window:</Text>
                            <View style={styles.dateTimePickerRow}>
                                <TouchableOpacity
                                    style={styles.pickerPill}
                                    onPress={() => setShowDatePicker(true)}
                                >
                                    <Ionicons name="calendar-outline" size={16} color={COLORS.primary} />
                                    <Text style={styles.pickerPillText}>
                                        {scheduledDate.toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.pickerPill}
                                    onPress={() => setShowTimePicker(true)}
                                >
                                    <Ionicons name="time-outline" size={16} color={COLORS.primary} />
                                    <Text style={styles.pickerPillText}>
                                        {scheduledDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {showDatePicker && (
                                <DateTimePicker
                                    value={scheduledDate}
                                    mode="date"
                                    display="default"
                                    minimumDate={new Date(Date.now() + 2 * 60 * 60 * 1000)}
                                    maximumDate={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)}
                                    onChange={onDateChange}
                                />
                            )}

                            {showTimePicker && (
                                <DateTimePicker
                                    value={scheduledDate}
                                    mode="time"
                                    display="default"
                                    onChange={onTimeChange}
                                />
                            )}
                        </View>
                    )}
                </Card>

                {/* Service Address Summary */}
                <Card style={styles.cardSection}>
                    <View style={styles.cardHeaderRowBetween}>
                        <View style={styles.cardHeaderRow}>
                            <Ionicons name="location" size={18} color={COLORS.primary} />
                            <Text style={styles.cardHeaderTitle}>Doorstep Address</Text>
                        </View>
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <Text style={styles.changeAddressLink}>Change</Text>
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.addressFullText}>{draft.address.full}</Text>
                    {draft.address.landmark && (
                        <Text style={styles.landmarkText}>Landmark: {draft.address.landmark}</Text>
                    )}
                </Card>

                {/* Additional Instructions Input */}
                <Card style={styles.cardSection}>
                    <Text style={styles.cardHeaderTitle}>Special Instructions (Optional)</Text>
                    <TextInput
                        style={styles.notesInput}
                        placeholder="e.g. Bring extra long pipe, call when nearby..."
                        placeholderTextColor={COLORS.gray400}
                        value={notes}
                        onChangeText={handleNotesChange}
                        multiline
                        numberOfLines={3}
                        textAlignVertical="top"
                    />
                </Card>
            </ScrollView>

            {/* Submit Action Footer */}
            <View style={styles.footer}>
                <PrimaryButton
                    title={draft.bookingType === 'appointment' ? 'Confirm Appointment 📅' : 'Confirm & Request Service ⚡'}
                    onPress={handleSubmit}
                    loading={isCreating}
                    disabled={isCreating}
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
    headerBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        paddingHorizontal: SPACING.base,
        paddingVertical: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gray100,
    },
    backBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: COLORS.gray100,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.md,
    },
    headerTitleBox: {
        flex: 1,
    },
    headerTitle: {
        fontSize: FONT_SIZE.md,
        fontWeight: '800',
        color: COLORS.gray900,
    },
    headerSubtitle: {
        fontSize: FONT_SIZE.xs,
        color: COLORS.primary,
        fontWeight: '600',
    },
    scroll: {
        flex: 1,
    },
    content: {
        padding: SPACING.base,
        paddingBottom: SPACING['3xl'],
    },
    partnerHeroCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.xl,
        padding: SPACING.base,
        marginBottom: SPACING.md,
        ...SHADOWS.sm,
    },
    partnerAvatar: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: COLORS.primaryBg,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.md,
    },
    partnerInfo: {
        flex: 1,
    },
    partnerRoleLabel: {
        fontSize: 10,
        fontWeight: '800',
        color: COLORS.gray400,
        letterSpacing: 0.8,
    },
    partnerNameText: {
        fontSize: FONT_SIZE.md,
        fontWeight: '800',
        color: COLORS.gray900,
        marginTop: 2,
    },
    partnerMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 3,
    },
    partnerVerifiedText: {
        fontSize: FONT_SIZE.xs,
        color: COLORS.success,
        fontWeight: '600',
    },
    cardSection: {
        marginBottom: SPACING.md,
        borderRadius: RADIUS.xl,
    },
    cardHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.xs,
        marginBottom: SPACING.xs,
    },
    cardHeaderRowBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.xs,
    },
    cardHeaderTitle: {
        fontSize: FONT_SIZE.xs + 1,
        fontWeight: '800',
        color: COLORS.gray500,
        textTransform: 'uppercase',
        letterSpacing: 0.6,
    },
    serviceNameValue: {
        fontSize: FONT_SIZE.base,
        fontWeight: '800',
        color: COLORS.gray900,
    },
    bookingTypeRow: {
        flexDirection: 'row',
        gap: SPACING.sm,
        marginTop: SPACING.sm,
    },
    bookingOptionBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: SPACING.md,
        borderRadius: RADIUS.lg,
        borderWidth: 1.5,
        borderColor: COLORS.gray200,
        backgroundColor: COLORS.white,
        gap: SPACING.xs,
    },
    bookingOptionActive: {
        borderColor: COLORS.primary,
        backgroundColor: COLORS.primaryBg,
    },
    bookingOptionText: {
        fontSize: FONT_SIZE.sm,
        fontWeight: '700',
        color: COLORS.gray600,
    },
    bookingOptionTextActive: {
        color: COLORS.primary,
    },
    schedulePickerCard: {
        marginTop: SPACING.md,
        paddingTop: SPACING.md,
        borderTopWidth: 1,
        borderTopColor: COLORS.gray100,
    },
    scheduleHint: {
        fontSize: FONT_SIZE.xs + 1,
        color: COLORS.gray600,
        marginBottom: SPACING.sm,
    },
    dateTimePickerRow: {
        flexDirection: 'row',
        gap: SPACING.sm,
    },
    pickerPill: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.primaryBg,
        paddingVertical: SPACING.sm + 2,
        borderRadius: RADIUS.lg,
        borderWidth: 1,
        borderColor: COLORS.primaryLight,
        gap: SPACING.xs,
    },
    pickerPillText: {
        fontSize: FONT_SIZE.sm,
        fontWeight: '700',
        color: COLORS.primaryDark,
    },
    changeAddressLink: {
        fontSize: FONT_SIZE.xs + 1,
        fontWeight: '700',
        color: COLORS.primary,
    },
    addressFullText: {
        fontSize: FONT_SIZE.sm + 1,
        fontWeight: '600',
        color: COLORS.gray800,
        lineHeight: 20,
    },
    landmarkText: {
        fontSize: FONT_SIZE.xs,
        color: COLORS.gray500,
        marginTop: 4,
    },
    notesInput: {
        backgroundColor: COLORS.gray50,
        borderRadius: RADIUS.lg,
        padding: SPACING.md,
        fontSize: FONT_SIZE.sm,
        color: COLORS.gray800,
        minHeight: 80,
        marginTop: SPACING.xs,
    },
    pricingCard: {
        backgroundColor: '#FFFBEB',
        borderColor: '#FDE68A',
        borderWidth: 1,
        borderRadius: RADIUS.xl,
        marginBottom: SPACING.md,
    },
    pricingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    pricingLabel: {
        fontSize: FONT_SIZE.sm,
        fontWeight: '700',
        color: COLORS.gray800,
    },
    pricingValue: {
        fontSize: FONT_SIZE.md,
        fontWeight: '900',
        color: COLORS.gray900,
    },
    pricingSubtitle: {
        fontSize: FONT_SIZE.xs,
        color: COLORS.gray600,
        marginTop: 4,
    },
    errorContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: SPACING.xl,
    },
    errorIconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#FEE2E2',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.md,
    },
    errorTitle: {
        fontSize: FONT_SIZE.lg,
        fontWeight: '800',
        color: COLORS.gray900,
        marginBottom: SPACING.xs,
    },
    errorSub: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.gray500,
        textAlign: 'center',
        marginBottom: SPACING.xl,
    },
    footer: {
        padding: SPACING.base,
        backgroundColor: COLORS.white,
        borderTopWidth: 1,
        borderTopColor: COLORS.gray100,
        ...SHADOWS.md,
    },
});

export default CreateRequestScreen;