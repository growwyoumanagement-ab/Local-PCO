// src/navigation/ClientStackNavigator.tsx
// Stack navigation for create request flow and details

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
    AddressScreen,
    CreateRequestScreen,
    TrackingScreen,
    RequestDetailScreen,
    SavedAddressScreen,
    RatingScreen,
    ProviderDetailScreen,
} from '../screens';
import { COLORS, ROUTES } from '../utils/constants';

export type ClientStackParamList = {
    [ROUTES.ADDRESS_PICKER]: undefined;
    [ROUTES.CREATE_REQUEST]: undefined;
    [ROUTES.TRACKING]: undefined;
    [ROUTES.REQUEST_DETAIL]: { requestId: string };
    [ROUTES.SAVED_ADDRESSES]: undefined;
    [ROUTES.RATING]: { requestId: string; serviceName: string; partnerName?: string };
    [ROUTES.PROVIDER_DETAIL]: { provider: any; categoryId?: string; categoryName?: string };
};

const Stack = createNativeStackNavigator<ClientStackParamList>();

const ClientStackNavigator: React.FC = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: {
                    backgroundColor: COLORS.white,
                },
                headerTintColor: COLORS.gray900,
                headerTitleStyle: {
                    fontWeight: '600',
                },
                headerShadowVisible: false,
                headerBackTitleVisible: false,
            }}
        >
            <Stack.Screen
                name={ROUTES.ADDRESS_PICKER}
                component={AddressScreen}
                options={{ title: 'Service Address' }}
            />
            <Stack.Screen
                name={ROUTES.CREATE_REQUEST}
                component={CreateRequestScreen}
                options={{ title: 'Review Request' }}
            />
            <Stack.Screen
                name={ROUTES.TRACKING}
                component={TrackingScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name={ROUTES.REQUEST_DETAIL}
                component={RequestDetailScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name={ROUTES.SAVED_ADDRESSES}
                component={SavedAddressScreen}
                options={{ title: 'Saved Addresses' }}
            />
            <Stack.Screen
                name={ROUTES.RATING}
                component={RatingScreen}
                options={{ title: 'Rate Your Experience' }}
            />
        </Stack.Navigator>
    );
};

export default ClientStackNavigator;
