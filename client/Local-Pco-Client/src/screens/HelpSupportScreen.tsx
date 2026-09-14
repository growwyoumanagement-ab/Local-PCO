// src/screens/HelpSupportScreen.tsx
// Help & Support screen with FAQ and issue reporting

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
import { Ionicons } from '@expo/vector-icons';
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
        question: 'How do I create a service request?',
        answer: 'Go to the Home screen, select a service category, choose a provider, fill in the details and submit your request. You will be notified once a partner accepts your request.',
    },
    {
        question: 'How can I track my request?',
        answer: 'Once your request is accepted by a partner, you can track the progress in real-time from the History tab. Tap on any active request to see live updates.',
    },
    {
        question: 'Can I cancel a service request?',
        answer: 'Yes, you can cancel a pending request before it is accepted by a partner. Go to History, select the request, and tap Cancel. Once a partner has accepted, please coordinate directly.',
    },
    {
        question: 'How do I save my addresses?',
        answer: 'Go to Profile → Saved Addresses. You can add, edit, or delete your saved addresses. These addresses will appear during request creation for quick selection.',
    },
    {
        question: 'How do I rate a service provider?',
        answer: 'After a job is completed, you will receive a prompt to rate the service provider. You can also go to History, select the completed request, and submit your rating.',
    },
    {
        question: 'What if I face an issue with a service?',
        answer: 'You can report an issue using the "Report an Issue" section below. Select the appropriate category and describe your problem. Our team will review and respond.',
    },
    {
        question: 'How do I update my profile?',
        answer: 'Go to the Profile tab, tap the edit icon on your profile card, update your details, and save. Your name can be updated directly from the profile screen.',
    },
    {
        question: 'Is my personal information safe?',
        answer: 'Yes, we take data privacy seriously. Your personal information is encrypted and stored securely. We do not share your data with third parties without your consent.',
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
                        <Ionicons name="arrow-back" size={24} color={COLORS.gray900} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Help & Support</Text>
                    <View style={{ width: 40 }} />
                </View>

                {/* Hero */}
                <View style={styles.heroCard}>
                    <Ionicons name="help-buoy" size={48} color={COLORS.primary} />
                    <Text style={styles.heroTitle}>How can we help you?</Text>
                    <Text style={styles.heroSubtitle}>
                        Browse FAQs below or report an issue and our team will assist you.
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
                                <Ionicons
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
    safeArea: { flex: 1, backgroundColor: COLORS.background },
    container: { flex: 1 },
    content: { padding: SPACING.base, paddingBottom: SPACING['3xl'] },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
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
