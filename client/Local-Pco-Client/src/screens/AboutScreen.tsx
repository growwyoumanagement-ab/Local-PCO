import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, FONT_SIZE } from '../utils/constants';

const FEATURES = [
    { icon: 'search', label: 'Find Services', desc: 'Browse and discover local service providers near you', color: '#3B82F6' },
    { icon: 'flash', label: 'Quick Booking', desc: 'Book services in just a few taps', color: '#F59E0B' },
    { icon: 'location', label: 'Real-time Tracking', desc: 'Track your service provider in real-time', color: '#22C55E' },
    { icon: 'star', label: 'Ratings & Reviews', desc: 'Rate and review services to help the community', color: '#EC4899' },
    { icon: 'shield-checkmark', label: 'Verified Partners', desc: 'All partners are KYC verified for your safety', color: '#8B5CF6' },
    { icon: 'bookmark', label: 'Save Addresses', desc: 'Save your favourite addresses for quick access', color: '#0EA5E9' },
];

const AboutScreen: React.FC = () => {
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
                    <Text style={styles.headerTitle}>About</Text>
                    <View style={{ width: 40 }} />
                </View>

                {/* App Identity Card */}
                <View style={styles.identityCard}>
                    <Image
                        source={require('../../assets/logo.png')}
                        style={styles.logoImage}
                        resizeMode="contain"
                    />
                    <Text style={styles.appName}>Local PCO</Text>
                    <Text style={styles.tagline}>Cleaning • Repairing • Caring</Text>
                    <View style={styles.versionBadge}>
                        <Text style={styles.versionText}>Version 1.0.0</Text>
                    </View>
                </View>

                {/* About Description */}
                <View style={styles.descriptionCard}>
                    <Text style={styles.descriptionTitle}>About Local PCO</Text>
                    <Text style={styles.descriptionText}>
                        Local PCO is a comprehensive local services platform designed to connect you with trusted, verified service providers in your area. Whether you need a plumber, electrician, doctor, tutor, or any other service — we've got you covered.
                    </Text>
                    <Text style={styles.descriptionText}>
                        Our mission is to make finding and booking reliable local services as easy as ordering food online. We believe everyone deserves access to quality services at their doorstep.
                    </Text>
                </View>

                {/* Features Section */}
                <Text style={styles.sectionTitle}>Key Features</Text>
                <View style={styles.featuresContainer}>
                    {FEATURES.map((feature, index) => (
                        <View key={index} style={styles.featureRow}>
                            <View style={[styles.featureIcon, { backgroundColor: feature.color + '15' }]}>
                                <Ionicons name={feature.icon as any} size={22} color={feature.color} />
                            </View>
                            <View style={styles.featureContent}>
                                <Text style={styles.featureLabel}>{feature.label}</Text>
                                <Text style={styles.featureDesc}>{feature.desc}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Credits */}
                <View style={styles.creditsCard}>
                    <Ionicons name="heart" size={20} color={COLORS.primary} />
                    <Text style={styles.creditsText}>
                        Made with love in India
                    </Text>
                </View>

                {/* Legal */}
                <View style={styles.legalContainer}>
                    <Text style={styles.legalText}>© 2026 Local PCO. All rights reserved.</Text>
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
    identityCard: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: SPACING.xl,
        alignItems: 'center',
        marginBottom: SPACING.base,
        borderWidth: 1,
        borderColor: COLORS.gray100,
    },
    logoImage: {
        width: 90,
        height: 90,
        borderRadius: 16,
        marginBottom: SPACING.sm,
    },
    appName: { fontSize: FONT_SIZE['2xl'], fontWeight: '800', color: COLORS.gray900 },
    tagline: { fontSize: FONT_SIZE.sm, color: COLORS.gray500, marginTop: SPACING.xs },
    versionBadge: {
        marginTop: SPACING.md, paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs,
        backgroundColor: COLORS.primary + '12', borderRadius: 20,
    },
    versionText: { fontSize: FONT_SIZE.sm, color: COLORS.primary, fontWeight: '600' },
    descriptionCard: {
        backgroundColor: COLORS.white, borderRadius: 16, padding: SPACING.base, marginBottom: SPACING.xl,
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
    },
    descriptionTitle: { fontSize: FONT_SIZE.lg, fontWeight: '700', color: COLORS.gray900, marginBottom: SPACING.md },
    descriptionText: { fontSize: FONT_SIZE.sm, color: COLORS.gray600, lineHeight: 22, marginBottom: SPACING.sm },
    sectionTitle: { fontSize: FONT_SIZE.lg, fontWeight: '700', color: COLORS.gray900, marginBottom: SPACING.md },
    featuresContainer: {
        backgroundColor: COLORS.white, borderRadius: 16, overflow: 'hidden', marginBottom: SPACING.xl,
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
    },
    featureRow: {
        flexDirection: 'row', alignItems: 'center', padding: SPACING.base,
        borderBottomWidth: 1, borderBottomColor: COLORS.gray100,
    },
    featureIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    featureContent: { flex: 1, marginLeft: SPACING.md },
    featureLabel: { fontSize: FONT_SIZE.base, fontWeight: '600', color: COLORS.gray800 },
    featureDesc: { fontSize: FONT_SIZE.xs, color: COLORS.gray500, marginTop: 2 },
    creditsCard: {
        backgroundColor: COLORS.white, borderRadius: 16, padding: SPACING.base,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.md,
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
    },
    creditsText: { fontSize: FONT_SIZE.sm, color: COLORS.gray600, fontWeight: '500', marginLeft: SPACING.sm },
    legalContainer: { alignItems: 'center', paddingVertical: SPACING.md },
    legalText: { fontSize: FONT_SIZE.xs, color: COLORS.gray400 },
});

export default AboutScreen;
