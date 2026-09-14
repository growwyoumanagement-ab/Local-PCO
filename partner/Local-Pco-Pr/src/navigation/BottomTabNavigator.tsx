// src/navigation/BottomTabNavigator.tsx
// Bottom tab navigator for main app sections

import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ROUTES, COLORS, FONT_SIZE, SPACING } from '../utils/constants';

// Import navigators and screens
import PartnerStackNavigator from './PartnerStackNavigator';
import BookingsScreen from '../screens/BookingsScreen';
import WalletScreen from '../screens/WalletScreen';
import ProfileScreen from '../screens/ProfileScreen';
import KycScreen from '../screens/KycScreen';

/**
 * Tab navigator param list type
 */
export type BottomTabParamList = {
    [ROUTES.DASHBOARD_TAB]: undefined;
    [ROUTES.BOOKINGS_TAB]: undefined;
    [ROUTES.WALLET_TAB]: undefined;
    [ROUTES.PROFILE_TAB]: undefined;
};

const Tab = createBottomTabNavigator<BottomTabParamList>();

import { MaterialCommunityIcons } from '@expo/vector-icons';

/**
 * Custom tab bar icon component
 */
interface TabIconProps {
    focused: boolean;
    icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
    label: string;
}

const TabIcon: React.FC<TabIconProps> = ({ focused, icon, label }) => {
    return (
        <View style={styles.tabIconContainer}>
            <MaterialCommunityIcons 
                name={icon as any} 
                size={24} 
                color={focused ? COLORS.primary : COLORS.gray400}
                style={styles.tabIcon}
            />
            <Text style={[styles.tabLabel, focused && styles.tabLabelFocused]}>
                {label}
            </Text>
        </View>
    );
};

import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * BottomTabNavigator Component
 * Main navigation structure for the partner app
 */
const BottomTabNavigator: React.FC = () => {
    const insets = useSafeAreaInsets();

    return (
        <Tab.Navigator
            initialRouteName={ROUTES.DASHBOARD_TAB}
            screenOptions={{
                headerShown: false,
                tabBarShowLabel: false,
                tabBarStyle: [
                    styles.tabBar,
                    {
                        height: 64 + insets.bottom,
                        paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
                    }
                ],
                tabBarHideOnKeyboard: true,
            }}
        >
            {/* Dashboard Tab */}
            <Tab.Screen
                name={ROUTES.DASHBOARD_TAB}
                component={PartnerStackNavigator}
                options={{
                    tabBarIcon: ({ focused }) => (
                        <TabIcon focused={focused} icon="view-dashboard-outline" label="Home" />
                    ),
                }}
            />

            {/* Jobs Tab */}
            <Tab.Screen
                name={ROUTES.BOOKINGS_TAB}
                component={BookingsScreen}
                options={{
                    tabBarIcon: ({ focused }) => (
                        <TabIcon focused={focused} icon="briefcase-outline" label="Jobs" />
                    ),
                }}
            />

            {/* Earnings Tab */}
            <Tab.Screen
                name={ROUTES.WALLET_TAB}
                component={WalletScreen}
                options={{
                    tabBarIcon: ({ focused }) => (
                        <TabIcon focused={focused} icon="wallet-outline" label="Earnings" />
                    ),
                }}
            />

            {/* Profile Tab */}
            <Tab.Screen
                name={ROUTES.PROFILE_TAB}
                component={ProfileNavigator}
                options={{
                    tabBarIcon: ({ focused }) => (
                        <TabIcon focused={focused} icon="account-outline" label="Profile" />
                    ),
                }}
            />
        </Tab.Navigator>
    );
};

/**
 * Profile Stack Navigator
 * Handles navigation between profile and KYC screens
 */
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BankAccountScreen from '../screens/BankAccountScreen';
import MyStatsScreen from '../screens/MyStatsScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import HelpSupportScreen from '../screens/HelpSupportScreen';
import TermsConditionsScreen from '../screens/TermsConditionsScreen';

type ProfileStackParamList = {
    [ROUTES.PROFILE]: undefined;
    [ROUTES.KYC]: undefined;
    [ROUTES.BANK_ACCOUNT]: undefined;
    [ROUTES.MY_STATS]: undefined;
    [ROUTES.HELP_SUPPORT]: undefined;
    [ROUTES.TERMS_CONDITIONS]: undefined;
    [ROUTES.EDIT_PROFILE]: undefined;
};

const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();

const ProfileNavigator: React.FC = () => {
    return (
        <ProfileStack.Navigator
            screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
                contentStyle: {
                    backgroundColor: COLORS.gray50,
                },
            }}
        >
            <ProfileStack.Screen name={ROUTES.PROFILE} component={ProfileScreen} />
            <ProfileStack.Screen name={ROUTES.KYC} component={KycScreen} />
            <ProfileStack.Screen name={ROUTES.BANK_ACCOUNT} component={BankAccountScreen} />
            <ProfileStack.Screen name={ROUTES.MY_STATS} component={MyStatsScreen} />
            <ProfileStack.Screen name={ROUTES.HELP_SUPPORT} component={HelpSupportScreen} />
            <ProfileStack.Screen name={ROUTES.TERMS_CONDITIONS} component={TermsConditionsScreen} />
            <ProfileStack.Screen name={ROUTES.EDIT_PROFILE} component={EditProfileScreen} />
        </ProfileStack.Navigator>
    );
};

const styles = StyleSheet.create({
    tabBar: {
        backgroundColor: COLORS.white,
        borderTopWidth: 0,
        elevation: 20,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        paddingTop: 8,
    },
    tabIconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabIcon: {
        marginBottom: 4,
    },
    tabLabel: {
        fontSize: FONT_SIZE.xs,
        color: COLORS.gray400,
        fontWeight: '500',
    },
    tabLabelFocused: {
        color: COLORS.primary,
        fontWeight: '600',
    },
});

export default BottomTabNavigator;
