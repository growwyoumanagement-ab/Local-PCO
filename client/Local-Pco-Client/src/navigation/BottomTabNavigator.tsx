// src/navigation/BottomTabNavigator.tsx
// Bottom tab navigation for main app sections

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
    DashboardScreen,
    AddressScreen,
    CreateRequestScreen,
    TrackingScreen,
    RequestHistoryScreen,
    RequestDetailScreen,
    ProfileScreen,
    SavedAddressScreen,
    RatingScreen,
    CategoryDetailScreen,
    ServiceProvidersScreen,
    ProviderDetailScreen,
    HelpSupportScreen,
    TermsConditionsScreen,
    AboutScreen,
} from '../screens';
import { ActiveRequestBanner } from '../components';
import { BannerScrollProvider } from '../context/BannerScrollContext';
import { COLORS, FONT_SIZE, SHADOWS, ROUTES } from '../utils/constants';

// Home Stack (Dashboard + all request flow screens)
const HomeStack = createNativeStackNavigator();

const HomeStackScreen: React.FC = () => {
    return (
        <HomeStack.Navigator
            screenOptions={{
                headerStyle: { backgroundColor: COLORS.white },
                headerTintColor: COLORS.gray900,
                headerTitleStyle: { fontWeight: '600' },
                headerShadowVisible: false,
                headerBackTitleVisible: false,
            }}
        >
            <HomeStack.Screen
                name={ROUTES.DASHBOARD}
                component={DashboardScreen}
                options={{ headerShown: false }}
            />
            <HomeStack.Screen
                name={ROUTES.CATEGORY_DETAIL}
                component={CategoryDetailScreen}
                options={{ headerShown: false }}
            />
            <HomeStack.Screen
                name={ROUTES.SERVICE_PROVIDERS}
                component={ServiceProvidersScreen}
                options={{ headerShown: false }}
            />
            <HomeStack.Screen
                name={ROUTES.PROVIDER_DETAIL}
                component={ProviderDetailScreen}
                options={{ headerShown: false }}
            />
            <HomeStack.Screen
                name={ROUTES.ADDRESS_PICKER}
                component={AddressScreen}
                options={{ title: 'Service Address' }}
            />
            <HomeStack.Screen
                name={ROUTES.CREATE_REQUEST}
                component={CreateRequestScreen}
                options={{ title: 'Review Request' }}
            />
            <HomeStack.Screen
                name={ROUTES.TRACKING}
                component={TrackingScreen}
                options={{ headerShown: false }}
            />
            <HomeStack.Screen
                name={ROUTES.REQUEST_DETAIL}
                component={RequestDetailScreen}
                options={{ headerShown: false }}
            />
            <HomeStack.Screen
                name={ROUTES.RATING}
                component={RatingScreen}
                options={{ title: 'Rate Your Experience' }}
            />
        </HomeStack.Navigator>
    );
};

// History Stack
const HistoryStack = createNativeStackNavigator();

const HistoryStackScreen: React.FC = () => {
    return (
        <HistoryStack.Navigator
            screenOptions={{
                headerStyle: { backgroundColor: COLORS.white },
                headerTintColor: COLORS.gray900,
                headerTitleStyle: { fontWeight: '600' },
                headerShadowVisible: false,
            }}
        >
            <HistoryStack.Screen
                name={ROUTES.REQUEST_HISTORY}
                component={RequestHistoryScreen}
                options={{ headerShown: false }}
            />
        </HistoryStack.Navigator>
    );
};

// Profile Stack (Profile + SavedAddresses + Help + Terms + About)
const ProfileStack = createNativeStackNavigator();

const ProfileStackScreen: React.FC = () => {
    return (
        <ProfileStack.Navigator
            screenOptions={{
                headerStyle: { backgroundColor: COLORS.white },
                headerTintColor: COLORS.gray900,
                headerTitleStyle: { fontWeight: '600' },
                headerShadowVisible: false,
                headerBackTitleVisible: false,
            }}
        >
            <ProfileStack.Screen
                name={ROUTES.PROFILE}
                component={ProfileScreen}
                options={{ headerShown: false }}
            />
            <ProfileStack.Screen
                name={ROUTES.SAVED_ADDRESSES}
                component={SavedAddressScreen}
                options={{ title: 'Saved Addresses' }}
            />
            <ProfileStack.Screen
                name={ROUTES.HELP_SUPPORT}
                component={HelpSupportScreen}
                options={{ headerShown: false }}
            />
            <ProfileStack.Screen
                name={ROUTES.TERMS_CONDITIONS}
                component={TermsConditionsScreen}
                options={{ headerShown: false }}
            />
            <ProfileStack.Screen
                name={ROUTES.ABOUT}
                component={AboutScreen}
                options={{ headerShown: false }}
            />
        </ProfileStack.Navigator>
    );
};

// Tab Bar Icon Component
interface TabIconProps {
    focused: boolean;
    icon: string;
    label: string;
}

const TabIcon: React.FC<TabIconProps> = ({ focused, icon, label }) => {
    return (
        <View style={styles.tabItem}>
            <Ionicons 
                name={(focused ? icon : `${icon}-outline`) as any} 
                size={22} 
                color={focused ? COLORS.primary : COLORS.gray400} 
            />
            <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>{label}</Text>
        </View>
    );
};

// Bottom Tab Navigator
const Tab = createBottomTabNavigator();

const BottomTabNavigator: React.FC = () => {
    const insets = useSafeAreaInsets();
    
    return (
        <BannerScrollProvider>
            <View style={{ flex: 1 }}>
                <Tab.Navigator
                    screenOptions={{
                        headerShown: false,
                        tabBarShowLabel: false,
                        tabBarStyle: [
                            styles.tabBar,
                            { 
                                height: 60 + insets.bottom,
                                paddingBottom: insets.bottom > 0 ? insets.bottom : 8 
                            }
                        ],
                    }}
                >
                    <Tab.Screen
                        name={ROUTES.HOME_TAB}
                        component={HomeStackScreen}
                        options={{
                            tabBarIcon: ({ focused }) => (
                                <TabIcon focused={focused} icon="home" label="Home" />
                            ),
                        }}
                    />
                    <Tab.Screen
                        name={ROUTES.HISTORY_TAB}
                        component={HistoryStackScreen}
                        options={{
                            tabBarIcon: ({ focused }) => (
                                <TabIcon focused={focused} icon="time" label="Bookings" />
                            ),
                        }}
                    />
                    <Tab.Screen
                        name={ROUTES.PROFILE_TAB}
                        component={ProfileStackScreen}
                        options={{
                            tabBarIcon: ({ focused }) => (
                                <TabIcon focused={focused} icon="person" label="Profile" />
                            ),
                        }}
                    />
                </Tab.Navigator>
                <ActiveRequestBanner />
            </View>
        </BannerScrollProvider>
    );
};

const styles = StyleSheet.create({
    tabBar: {
        backgroundColor: COLORS.white,
        paddingTop: 8,
        borderTopWidth: 0,
        ...SHADOWS.md,
    },
    tabItem: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabLabel: {
        fontSize: FONT_SIZE.xs,
        color: COLORS.gray400,
        fontWeight: '500',
    },
    tabLabelActive: {
        color: COLORS.primary,
        fontWeight: '600',
    },
});

export default BottomTabNavigator;
