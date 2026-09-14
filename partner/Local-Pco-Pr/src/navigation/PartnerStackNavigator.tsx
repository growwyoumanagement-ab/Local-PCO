// src/navigation/PartnerStackNavigator.tsx
// Stack navigator for partner screens

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ROUTES, COLORS } from '../utils/constants';

// Import screens
import DashboardScreen from '../screens/DashboardScreen';
import JobRequestScreen from '../screens/JobRequestScreen';
import JobDetailScreen from '../screens/JobDetailScreen';
import JobExecutionScreen from '../screens/JobExecutionScreen';
import UpcomingAppointmentsScreen from '../screens/UpcomingAppointmentsScreen';

/**
 * Stack navigator param list type
 */
export type PartnerStackParamList = {
    [ROUTES.DASHBOARD]: undefined;
    [ROUTES.JOB_REQUEST]: { jobId: string } | undefined;
    [ROUTES.JOB_DETAIL]: { jobId: string };
    [ROUTES.JOB_EXECUTION]: { jobId: string };
    [ROUTES.UPCOMING_APPOINTMENTS]: undefined;
};

const Stack = createNativeStackNavigator<PartnerStackParamList>();

/**
 * PartnerStackNavigator Component
 * Handles navigation between job-related screens
 */
const PartnerStackNavigator: React.FC = () => {
    return (
        <Stack.Navigator
            initialRouteName={ROUTES.DASHBOARD}
            screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
                contentStyle: {
                    backgroundColor: COLORS.gray50,
                },
            }}
        >
            <Stack.Screen
                name={ROUTES.DASHBOARD}
                component={DashboardScreen}
            />
            <Stack.Screen
                name={ROUTES.JOB_REQUEST}
                component={JobRequestScreen}
                options={{
                    presentation: 'modal',
                    animation: 'slide_from_bottom',
                }}
            />
            <Stack.Screen
                name={ROUTES.JOB_DETAIL}
                component={JobDetailScreen}
            />
            <Stack.Screen
                name={ROUTES.JOB_EXECUTION}
                component={JobExecutionScreen}
            />
            <Stack.Screen
                name={ROUTES.UPCOMING_APPOINTMENTS}
                component={UpcomingAppointmentsScreen}
            />

        </Stack.Navigator>
    );
};

export default PartnerStackNavigator;
