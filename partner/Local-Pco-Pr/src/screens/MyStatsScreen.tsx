// src/screens/MyStatsScreen.tsx
// Partner statistics screen

import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { COLORS, FONT_SIZE, SPACING } from '../utils/constants';
import api from '../services/api';

interface Stats {
    totalJobs: number;
    completedJobs: number;
    cancelledJobs: number;
    totalEarnings: number;
    rating: number;
    completionRate: number;
}

const MyStatsScreen: React.FC = () => {
    const navigation = useNavigation();
    const [stats, setStats] = useState<Stats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadStats = async () => {
        try {
            const response = await api.get('/partner/stats');
            if (response.data.success) {
                setStats(response.data.data);
            }
        } catch (error) {
            console.error('Error loading stats:', error);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadStats();
    }, []);

    const handleRefresh = () => {
        setRefreshing(true);
        loadStats();
    };

    const StatCard = ({ label, value, icon, iconColor }: { 
        label: string; 
        value: string | number; 
        icon: keyof typeof MaterialCommunityIcons.glyphMap;
        iconColor: string;
    }) => (
        <View style={styles.statCard}>
            <MaterialCommunityIcons name={icon} size={32} color={iconColor} style={styles.statIcon} />
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.statLabel}>{label}</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.content}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[COLORS.primary]} />
                }
            >
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <View style={styles.backButtonContent}>
                        <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.primary} />
                        <Text style={styles.backButtonText}>Back</Text>
                    </View>
                </TouchableOpacity>

                <Text style={styles.title}>My Stats</Text>
                <Text style={styles.subtitle}>Your performance overview</Text>

                {isLoading ? (
                    <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: SPACING.xl }} />
                ) : stats ? (
                    <>
                        <View style={styles.statsGrid}>
                            <StatCard label="Total Jobs" value={stats.totalJobs} icon="clipboard-text-outline" iconColor={COLORS.primary} />
                            <StatCard label="Completed" value={stats.completedJobs} icon="check-circle-outline" iconColor={COLORS.success} />
                            <StatCard label="Cancelled" value={stats.cancelledJobs} icon="close-circle-outline" iconColor={COLORS.danger} />
                            <StatCard label="Completion Rate" value={`${stats.completionRate}%`} icon="chart-line" iconColor={COLORS.accent} />
                        </View>

                        <View style={styles.ratingCard}>
                            <Text style={styles.ratingLabel}>Rating</Text>
                            <View style={styles.ratingValueContainer}>
                                <MaterialCommunityIcons name="star" size={24} color={COLORS.accent} style={{ marginRight: 4 }} />
                                <Text style={styles.ratingValue}>{stats.rating.toFixed(1)}</Text>
                            </View>
                        </View>
                    </>
                ) : (
                    <Text style={styles.errorText}>Unable to load stats</Text>
                )}
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
    backButtonText: { color: COLORS.primary, fontSize: FONT_SIZE.base, marginLeft: 4 },
    title: { fontSize: FONT_SIZE['2xl'], fontWeight: '700', color: COLORS.gray900 },
    subtitle: { fontSize: FONT_SIZE.sm, color: COLORS.gray500, marginBottom: SPACING.lg },
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: SPACING.md },
    statCard: { width: '48%', backgroundColor: COLORS.white, borderRadius: 16, padding: SPACING.md, alignItems: 'center' },
    statIcon: { marginBottom: SPACING.xs },
    statValue: { fontSize: FONT_SIZE.xl, fontWeight: '700', color: COLORS.gray900 },
    statLabel: { fontSize: FONT_SIZE.sm, color: COLORS.gray500 },
    ratingCard: { backgroundColor: COLORS.white, borderRadius: 16, padding: SPACING.lg, marginTop: SPACING.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    ratingLabel: { fontSize: FONT_SIZE.base, color: COLORS.gray700 },
    ratingValueContainer: { flexDirection: 'row', alignItems: 'center' },
    ratingValue: { fontSize: FONT_SIZE.xl, fontWeight: '600', color: COLORS.accent },
    errorText: { textAlign: 'center', color: COLORS.gray500, marginTop: SPACING.xl },
});

export default MyStatsScreen;
