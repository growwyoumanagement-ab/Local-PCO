// src/screens/SelectServiceScreen.tsx
// Service selection screen for create request flow

import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector, selectServices } from '../store';
import { fetchServices, setDraftService } from '../store/requestSlice';
import { ServiceCard, PrimaryButton, Loader } from '../components';
import { ServiceType } from '../services/requestService';
import { COLORS, SPACING, FONT_SIZE, ROUTES } from '../utils/constants';

const SelectServiceScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const dispatch = useAppDispatch();

    const services = useAppSelector(selectServices);
    const isLoading = useAppSelector((state) => state.request.isLoading);
    const draftService = useAppSelector((state) => state.request.draftRequest.serviceId);

    const [selectedId, setSelectedId] = useState<string | null>(draftService);

    useEffect(() => {
        if (services.length === 0) {
            dispatch(fetchServices());
        }
    }, []);

    const handleSelectService = (service: ServiceType) => {
        setSelectedId(service.id);
    };

    const handleContinue = () => {
        if (selectedId) {
            const service = services.find((s) => s.id === selectedId);
            if (service) {
                dispatch(setDraftService({ id: service.id, name: service.name }));
                navigation.navigate(ROUTES.ADDRESS_PICKER);
            }
        }
    };

    if (isLoading) {
        return <Loader fullScreen text="Loading services..." />;
    }

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.title}>Select a Service</Text>
                <Text style={styles.subtitle}>
                    Choose the type of service you need
                </Text>

                <View style={styles.servicesGrid}>
                    {services.map((service) => (
                        <ServiceCard
                            key={service.id}
                            service={service}
                            selected={selectedId === service.id}
                            onPress={() => handleSelectService(service)}
                        />
                    ))}
                </View>

                {selectedId && (
                    <View style={styles.selectedInfo}>
                        <Text style={styles.selectedLabel}>Selected Service:</Text>
                        <Text style={styles.selectedName}>
                            {services.find((s) => s.id === selectedId)?.name}
                        </Text>
                    </View>
                )}
            </ScrollView>

            <View style={styles.footer}>
                <PrimaryButton
                    title="Continue"
                    onPress={handleContinue}
                    disabled={!selectedId}
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.gray50,
    },
    scroll: {
        flex: 1,
    },
    content: {
        padding: SPACING.base,
        paddingBottom: SPACING['3xl'],
    },
    title: {
        fontSize: FONT_SIZE['2xl'],
        fontWeight: '700',
        color: COLORS.gray900,
        marginBottom: SPACING.xs,
    },
    subtitle: {
        fontSize: FONT_SIZE.base,
        color: COLORS.gray500,
        marginBottom: SPACING.xl,
    },
    servicesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    selectedInfo: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: SPACING.base,
        marginTop: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.primary,
    },
    selectedLabel: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.gray500,
        marginBottom: SPACING.xs,
    },
    selectedName: {
        fontSize: FONT_SIZE.lg,
        fontWeight: '600',
        color: COLORS.primary,
    },
    footer: {
        padding: SPACING.base,
        backgroundColor: COLORS.white,
        borderTopWidth: 1,
        borderTopColor: COLORS.gray100,
    },
});

export default SelectServiceScreen;
