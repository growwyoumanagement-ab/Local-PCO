// src/screens/SettingsScreen.tsx
// Settings screen for partner app

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Switch,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { COLORS, FONT_SIZE, SPACING } from '../utils/constants';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const SettingsScreen: React.FC = () => {
    const navigation = useNavigation();
    const [notifications, setNotifications] = useState(true);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [vibrationEnabled, setVibrationEnabled] = useState(true);
    const [locationSharing, setLocationSharing] = useState(true);

    const SettingRow = ({
        icon,
        label,
        value,
        onToggle,
        isSwitch = true,
    }: {
        icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
        label: string;
        value?: boolean;
        onToggle?: (val: boolean) => void;
        isSwitch?: boolean;
    }) => (
        <View style={styles.settingRow}>
            <MaterialCommunityIcons name={icon} size={22} color={COLORS.gray600} style={styles.settingIcon} />
            <Text style={styles.settingLabel}>{label}</Text>
            {isSwitch && onToggle && (
                <Switch
                    value={value}
                    onValueChange={onToggle}
                    trackColor={{ false: COLORS.gray300, true: COLORS.primary + '50' }}
                    thumbColor={value ? COLORS.primary : COLORS.gray400}
                />
            )}
            {!isSwitch && <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.gray400} />}
        </View>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView style={styles.container} contentContainerStyle={styles.content}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <View style={styles.backButtonContent}>
                        <MaterialCommunityIcons name="arrow-left" size={20} color={COLORS.primary} style={{ marginRight: 4 }} />
                        <Text style={styles.backButtonText}>Back</Text>
                    </View>
                </TouchableOpacity>

                <Text style={styles.title}>Settings</Text>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Notifications</Text>
                    <View style={styles.card}>
                        <SettingRow
                            icon="bell-outline"
                            label="Push Notifications"
                            value={notifications}
                            onToggle={setNotifications}
                        />
                        <SettingRow
                            icon="volume-high"
                            label="Sound"
                            value={soundEnabled}
                            onToggle={setSoundEnabled}
                        />
                        <SettingRow
                            icon="vibrate"
                            label="Vibration"
                            value={vibrationEnabled}
                            onToggle={setVibrationEnabled}
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Privacy</Text>
                    <View style={styles.card}>
                        <SettingRow
                            icon="map-marker-outline"
                            label="Share Location"
                            value={locationSharing}
                            onToggle={setLocationSharing}
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Account</Text>
                    <View style={styles.card}>
                        <TouchableOpacity>
                            <SettingRow icon="lock-outline" label="Change Password" isSwitch={false} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => Alert.alert('Delete Account', 'Contact support to delete your account.')}>
                            <SettingRow icon="trash-can-outline" label="Delete Account" isSwitch={false} />
                        </TouchableOpacity>
                    </View>
                </View>

                <Text style={styles.versionText}>App Version 1.0.0</Text>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: COLORS.gray50 },
    container: { flex: 1 },
    content: { padding: SPACING.base },
    backButton: { marginBottom: SPACING.md },
    backButtonContent: { flexDirection: 'row', alignItems: 'center' },
    backButtonText: { color: COLORS.primary, fontSize: FONT_SIZE.base },
    title: { fontSize: FONT_SIZE['2xl'], fontWeight: '700', color: COLORS.gray900, marginBottom: SPACING.lg },
    section: { marginBottom: SPACING.lg },
    sectionTitle: { fontSize: FONT_SIZE.sm, fontWeight: '600', color: COLORS.gray500, marginBottom: SPACING.sm, marginLeft: SPACING.xs },
    card: { backgroundColor: COLORS.white, borderRadius: 16, overflow: 'hidden' },
    settingRow: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.gray100 },
    settingIcon: { marginRight: SPACING.md },
    settingLabel: { flex: 1, fontSize: FONT_SIZE.base, color: COLORS.gray800 },
    versionText: { fontSize: FONT_SIZE.xs, color: COLORS.gray400, textAlign: 'center', marginTop: SPACING.lg },
});

export default SettingsScreen;
