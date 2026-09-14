// src/screens/TermsConditionsScreen.tsx
// Terms & Conditions screen with scrollable legal content

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, FONT_SIZE } from '../utils/constants';

const SECTIONS = [
    {
        title: '1. User Agreement',
        content: `By downloading, installing, or using the Local PCO application ("App"), you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you must not use the App.\n\nYou must be at least 18 years of age to use this App. By using the App, you represent and warrant that you are at least 18 years old and have the legal capacity to enter into this agreement.`,
    },
    {
        title: '2. Services',
        content: `Local PCO is a platform that connects users with local service providers across various categories including but not limited to plumbing, electrical, beauty, medical, tutoring, and more.\n\nWe act as an intermediary and do not directly provide any services. The quality, timing, and execution of services are the responsibility of the individual service providers.`,
    },
    {
        title: '3. Account & Registration',
        content: `To use certain features of the App, you must register and create an account. You agree to provide accurate, current, and complete information during registration.\n\nYou are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify us immediately of any unauthorized use.`,
    },
    {
        title: '4. Service Requests',
        content: `When you submit a service request, it is sent to available service providers in your area. Acceptance of your request is at the discretion of the service provider.\n\nOnce a service provider accepts your request, you agree to cooperate fully and provide access as needed for the service to be completed. Cancellation policies may apply.`,
    },
    {
        title: '5. Privacy Policy',
        content: `We collect and process your personal information in accordance with our Privacy Policy. By using the App, you consent to the collection, use, and sharing of your information as described.\n\nWe implement reasonable security measures to protect your data. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.`,
    },
    {
        title: '6. User Conduct',
        content: `You agree not to:\n• Use the App for any unlawful purpose\n• Harass, abuse, or harm service providers or other users\n• Submit false or misleading service requests\n• Attempt to circumvent the platform to avoid fees\n• Use automated systems to access the App\n• Impersonate any person or entity`,
    },
    {
        title: '7. Limitation of Liability',
        content: `Local PCO shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the App or services obtained through the App.\n\nOur total liability shall not exceed the amount paid by you for services through the App in the twelve (12) months preceding the claim.`,
    },
    {
        title: '8. Changes to Terms',
        content: `We reserve the right to modify these Terms and Conditions at any time. Changes will be effective immediately upon posting in the App.\n\nYour continued use of the App after any changes constitutes your acceptance of the modified terms. We encourage you to review these terms periodically.`,
    },
];

const TermsConditionsScreen: React.FC = () => {
    const navigation = useNavigation();

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color={COLORS.gray900} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Terms & Conditions</Text>
                    <View style={{ width: 40 }} />
                </View>

                {/* Intro Card */}
                <View style={styles.introCard}>
                    <Ionicons name="document-text" size={36} color={COLORS.primary} />
                    <Text style={styles.introTitle}>Terms of Service</Text>
                    <Text style={styles.introSubtitle}>Last updated: March 2026</Text>
                </View>

                {/* Sections */}
                {SECTIONS.map((section, index) => (
                    <View key={index} style={styles.sectionCard}>
                        <Text style={styles.sectionTitle}>{section.title}</Text>
                        <Text style={styles.sectionContent}>{section.content}</Text>
                    </View>
                ))}

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        By using Local PCO, you acknowledge that you have read, understood, and agree to these Terms & Conditions.
                    </Text>
                </View>

                <View style={{ height: SPACING['2xl'] }} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: COLORS.background },
    container: { flex: 1 },
    content: { padding: SPACING.base, paddingBottom: SPACING['3xl'] },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: SPACING.lg,
    },
    backBtn: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center',
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1,
    },
    headerTitle: { fontSize: FONT_SIZE.xl, fontWeight: '700', color: COLORS.gray900 },
    introCard: {
        backgroundColor: COLORS.white, borderRadius: 20, padding: SPACING.xl,
        alignItems: 'center', marginBottom: SPACING.xl,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
    },
    introTitle: { fontSize: FONT_SIZE.xl, fontWeight: '700', color: COLORS.gray900, marginTop: SPACING.md },
    introSubtitle: { fontSize: FONT_SIZE.sm, color: COLORS.gray400, marginTop: SPACING.xs },
    sectionCard: {
        backgroundColor: COLORS.white, borderRadius: 16, padding: SPACING.base, marginBottom: SPACING.md,
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 4, elevation: 1,
    },
    sectionTitle: { fontSize: FONT_SIZE.md, fontWeight: '700', color: COLORS.gray900, marginBottom: SPACING.sm },
    sectionContent: { fontSize: FONT_SIZE.sm, color: COLORS.gray600, lineHeight: 22 },
    footer: {
        backgroundColor: COLORS.primary + '10', borderRadius: 12, padding: SPACING.base, marginTop: SPACING.md,
    },
    footerText: { fontSize: FONT_SIZE.sm, color: COLORS.primary, textAlign: 'center', lineHeight: 20, fontWeight: '500' },
});

export default TermsConditionsScreen;
