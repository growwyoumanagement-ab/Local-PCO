// src/screens/HelpSupportScreen.tsx
// Help & Support screen for partners with FAQ and issue reporting

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    LayoutAnimation,
    Platform,
    UIManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, FONT_SIZE } from '../utils/constants';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface FAQItem {
    question: string;
    answer: string;
}

const FAQ_DATA: FAQItem[] = [
    {
        question: 'How do I complete my KYC verification?',
        answer: 'Go to Profile → KYC Verification. Upload your Aadhaar (front & back), PAN card, and a selfie photo. Our team will review your documents within 24-48 hours. You will be notified once approved.',
    },
    {
        question: 'How do I accept job requests?',
        answer: 'When a new job is assigned to you, you will receive a notification. Go to the Dashboard to view pending jobs. Tap on a job to see details and accept it. Make sure you are set to "Online" to receive jobs.',
    },
    {
        question: 'How do I go online/offline?',
        answer: 'On the Dashboard screen, use the Online/Offline toggle in the top right corner. You must have approved KYC to go online. When online, you will receive job requests in your service area.',
    },
    {
        question: 'How do I complete a job?',
        answer: 'Once you have finished the work at the customer\'s location, go to the job detail screen and tap "Complete Job". Add any completion notes if needed. The job status will be updated and the customer will be notified.',
    },
    {
        question: 'Where can I see my earnings and stats?',
        answer: 'Go to Profile → My Stats to view your performance overview including total jobs, completed jobs, completion rate, and earnings. The Dashboard also shows your daily summary.',
    },
    {
        question: 'How do I add my bank account?',
        answer: 'Go to Profile → Bank Account. Enter your account holder name, account number, bank name, and IFSC code. Your bank details will be used for payouts.',
    },
    {
        question: 'What if a customer cancels?',
        answer: 'If a customer cancels before you arrive, the job will be removed from your pending list. If work has already begun, please mark the job status accordingly and our team will review the case.',
    },
    {
        question: 'How do I update my service category?',
        answer: 'Your service category is set during registration. To change it, please contact our support team through the "Report an Issue" section below with your request.',
    },
];

const HelpSupportScreen: React.FC = () => {
    const navigation = useNavigation();
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

    const toggleFAQ = (index: number) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpandedIndex(expandedIndex === index ? null : index);
    };

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
                    <Text style={styles.headerTitle}>Help & Support</Text>
                    <View style={{ width: 40 }} />
                </View>

                {/* Hero */}
                <View style={styles.heroCard}>
                    <MaterialCommunityIcons name="lifebuoy" size={48} color={COLORS.primary} />
                    <Text style={styles.heroTitle}>How can we help you?</Text>
                    <Text style={styles.heroSubtitle}>
                        Browse FAQs or report an issue and our team will assist you.
                    </Text>
                </View>

                {/* FAQ Section */}
                <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
                <View style={styles.faqContainer}>
                    {FAQ_DATA.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.faqItem,
                                index < FAQ_DATA.length - 1 && styles.faqItemBorder,
                            ]}
                            onPress={() => toggleFAQ(index)}
                            activeOpacity={0.7}
                        >
                            <View style={styles.faqQuestion}>
                                <Text style={styles.faqQuestionText}>{item.question}</Text>
                                <MaterialCommunityIcons
                                    name={expandedIndex === index ? 'chevron-up' : 'chevron-down'}
                                    size={20}
                                    color={COLORS.gray400}
                                />
                            </View>
                            {expandedIndex === index && (
                                <Text style={styles.faqAnswer}>{item.answer}</Text>
                            )}
                        </TouchableOpacity>
                    ))}
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
    heroCard: {
        backgroundColor: COLORS.white, borderRadius: 20, padding: SPACING.xl,
        alignItems: 'center', marginBottom: SPACING.xl,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
    },
    heroTitle: { fontSize: FONT_SIZE.xl, fontWeight: '700', color: COLORS.gray900, marginTop: SPACING.md },
    heroSubtitle: { fontSize: FONT_SIZE.sm, color: COLORS.gray500, textAlign: 'center', marginTop: SPACING.xs, lineHeight: 20 },
    sectionTitle: { fontSize: FONT_SIZE.lg, fontWeight: '700', color: COLORS.gray900, marginBottom: SPACING.md },
    faqContainer: {
        backgroundColor: COLORS.white, borderRadius: 16, overflow: 'hidden', marginBottom: SPACING.xl,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
    },
    faqItem: { padding: SPACING.base },
    faqItemBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.gray100 },
    faqQuestion: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    faqQuestionText: { flex: 1, fontSize: FONT_SIZE.base, fontWeight: '600', color: COLORS.gray800, marginRight: SPACING.sm },
    faqAnswer: { fontSize: FONT_SIZE.sm, color: COLORS.gray500, marginTop: SPACING.sm, lineHeight: 20 },

});

export default HelpSupportScreen;
