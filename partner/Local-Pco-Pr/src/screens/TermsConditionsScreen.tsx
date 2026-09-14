// src/screens/TermsConditionsScreen.tsx
// Terms & Conditions screen for partners with scrollable legal content

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, FONT_SIZE } from '../utils/constants';

const SECTIONS = [
    {
        title: '1. Partner Agreement',
        content: `By registering as a service partner on the Local PCO platform ("App"), you agree to be bound by these Terms and Conditions. If you do not agree with any part, you must discontinue use of the platform.\n\nYou must be at least 18 years of age, hold valid identification, and possess the necessary skills and licenses for the services you offer.`,
    },
    {
        title: '2. Registration & KYC',
        content: `All partners must complete the Know Your Customer (KYC) verification process before accepting jobs. This includes submitting valid government-issued identification documents.\n\nYou agree that all information provided during registration is accurate and up-to-date. Providing false information may result in account suspension or termination.`,
    },
    {
        title: '3. Service Standards',
        content: `As a Local PCO partner, you agree to:\n• Provide services with professional quality and care\n• Arrive on time for accepted jobs\n• Treat all customers with respect and courtesy\n• Maintain proper hygiene and safety standards\n• Carry necessary tools and equipment for your service category`,
    },
    {
        title: '4. Job Management',
        content: `Once you accept a job request, you are committed to completing it. Frequent cancellations or no-shows may result in penalties or account restrictions.\n\nYou must update job status accurately in the App. Complete jobs promptly and mark them as completed once finished to ensure proper tracking.`,
    },
    {
        title: '5. Payment Terms',
        content: `Payments for completed services are processed through the platform. Payouts will be made to your registered bank account as per the payout schedule.\n\nAll applicable taxes and deductions will be handled as per regulatory requirements. You are responsible for your own tax compliance and reporting.`,
    },
    {
        title: '6. Code of Conduct',
        content: `Partners must not:\n• Engage in any form of harassment or discrimination\n• Solicit customers for private arrangements outside the platform\n• Share customer personal information\n• Provide services under the influence of alcohol or drugs\n• Damage customer property\n• Misrepresent their skills or qualifications`,
    },
    {
        title: '7. Account Suspension',
        content: `Local PCO reserves the right to suspend or terminate partner accounts for:\n• Violation of these Terms & Conditions\n• Low service quality or repeated negative reviews\n• Failure to complete KYC verification\n• Fraudulent activity or misrepresentation\n• Extended periods of inactivity`,
    },
    {
        title: '8. Changes to Terms',
        content: `We reserve the right to modify these terms at any time. Changes will be notified through the App. Continued use of the platform after modifications constitutes acceptance of the updated terms.\n\nWe encourage you to review these terms periodically to stay informed of any changes.`,
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
                        <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.gray900} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Terms & Conditions</Text>
                    <View style={{ width: 40 }} />
                </View>

                {/* Intro Card */}
                <View style={styles.introCard}>
                    <MaterialCommunityIcons name="file-certificate-outline" size={36} color={COLORS.primary} />
                    <Text style={styles.introTitle}>Partner Agreement</Text>
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
                        By continuing as a Local PCO partner, you acknowledge that you have read, understood, and agree to these Terms & Conditions.
                    </Text>
                </View>

                <View style={{ height: SPACING['2xl'] }} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: COLORS.gray50 },
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
