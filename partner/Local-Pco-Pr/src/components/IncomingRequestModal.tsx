import React, { useState, useEffect } from 'react';
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZE, SPACING } from '../utils/constants';

interface IncomingRequestModalProps {
    visible: boolean;
    jobData: {
        id: string;
        serviceName: string;
        notes?: string;
        address?: {
            full: string;
        };
        bookingType?: string;
        clientName?: string;
        estimatedPrice?: number;
    } | null;
    onAccept: () => void;
    onDecline: () => void;
}

const IncomingRequestModal: React.FC<IncomingRequestModalProps> = ({
    visible,
    jobData,
    onAccept,
    onDecline,
}) => {
    const [timeLeft, setTimeLeft] = useState(30);
    const progressAnim = React.useRef(new Animated.Value(1)).current;
    const settledRef = React.useRef(false);

    const [isExpired, setIsExpired] = useState(false);
    const timerRef = React.useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (!visible) {
            setTimeLeft(30);
            setIsExpired(false);
            progressAnim.setValue(1);
            settledRef.current = false;
            return;
        }

        // Ticking timer
        timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    if (timerRef.current) clearInterval(timerRef.current);
                    setIsExpired(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        // Animate circular/linear progress bar over 30s
        Animated.timing(progressAnim, {
            toValue: 0,
            duration: 30000,
            useNativeDriver: false,
        }).start();

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            progressAnim.stopAnimation();
        };
    }, [visible]);

    // Separate effect for auto-decline on expiration
    useEffect(() => {
        if (isExpired && !settledRef.current) {
            settledRef.current = true;
            onDecline();
        }
    }, [isExpired, onDecline]);

    if (!visible || !jobData) return null;

    const progressWidth = progressAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%'],
    });

    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
            statusBarTranslucent
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    {/* Alert Header */}
                    <View style={styles.alertHeader}>
                        <Ionicons name="flash" size={32} color={COLORS.secondary} />
                        <Text style={styles.alertTitle}>New Request Assigned!</Text>
                    </View>

                    {/* Progress indicator */}
                    <View style={styles.progressContainer}>
                        <Animated.View style={[styles.progressBar, { width: progressWidth }]} />
                    </View>

                    {/* Timeout text */}
                    <View style={styles.timerCircle}>
                        <Text style={styles.timerText}>{timeLeft}s</Text>
                        <Text style={styles.timerSub}>remaining</Text>
                    </View>

                    {/* Request Details */}
                    <View style={styles.detailsContainer}>
                        <View style={styles.detailRow}>
                            <Ionicons name="construct" size={20} color={COLORS.primary} />
                            <View style={styles.detailTextContainer}>
                                <Text style={styles.detailLabel}>SERVICE</Text>
                                <Text style={styles.detailValue}>{jobData.serviceName}</Text>
                            </View>
                        </View>

                        <View style={styles.detailRow}>
                            <Ionicons name="person" size={20} color={COLORS.primary} />
                            <View style={styles.detailTextContainer}>
                                <Text style={styles.detailLabel}>CLIENT</Text>
                                <Text style={styles.detailValue}>{jobData.clientName || 'Local Client'}</Text>
                            </View>
                        </View>

                        {jobData.address?.full && (
                            <View style={styles.detailRow}>
                                <Ionicons name="location" size={20} color={COLORS.primary} />
                                <View style={styles.detailTextContainer}>
                                    <Text style={styles.detailLabel}>ADDRESS</Text>
                                    <Text style={styles.detailValue} numberOfLines={2}>
                                        {jobData.address.full}
                                    </Text>
                                </View>
                            </View>
                        )}

                        {jobData.notes && (
                            <View style={styles.detailRow}>
                                <Ionicons name="document-text" size={20} color={COLORS.primary} />
                                <View style={styles.detailTextContainer}>
                                    <Text style={styles.detailLabel}>INSTRUCTIONS</Text>
                                    <Text style={styles.detailValue} numberOfLines={2}>
                                        {jobData.notes}
                                    </Text>
                                </View>
                            </View>
                        )}
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.actions}>
                        <TouchableOpacity style={styles.declineButton} onPress={() => {
                            if (!settledRef.current) {
                                settledRef.current = true;
                                onDecline();
                            }
                        }}>
                            <Text style={styles.declineText}>Decline</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.acceptButton} onPress={() => {
                            if (!settledRef.current) {
                                settledRef.current = true;
                                onAccept();
                            }
                        }}>
                            <Text style={styles.acceptText}>Accept</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.xl,
    },
    container: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: SPACING.xl,
        width: '100%',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    alertHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
        marginBottom: SPACING.base,
    },
    alertTitle: {
        fontSize: FONT_SIZE.lg,
        fontWeight: '800',
        color: COLORS.gray900,
    },
    progressContainer: {
        width: '100%',
        height: 6,
        backgroundColor: COLORS.gray100,
        borderRadius: 9999,
        overflow: 'hidden',
        marginBottom: SPACING.xl,
    },
    progressBar: {
        height: '100%',
        backgroundColor: COLORS.secondary,
    },
    timerCircle: {
        width: 90,
        height: 90,
        borderRadius: 45,
        borderWidth: 4,
        borderColor: COLORS.secondary + '20',
        backgroundColor: COLORS.white,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.xl,
        shadowColor: COLORS.secondary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 2,
    },
    timerText: {
        fontSize: FONT_SIZE.xl,
        fontWeight: '800',
        color: COLORS.secondary,
    },
    timerSub: {
        fontSize: 10,
        color: COLORS.gray500,
        marginTop: -2,
    },
    detailsContainer: {
        width: '100%',
        gap: SPACING.md,
        backgroundColor: COLORS.gray50,
        padding: SPACING.md,
        borderRadius: 12,
        marginBottom: SPACING.xl,
        borderWidth: 1,
        borderColor: COLORS.gray100,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
    },
    detailTextContainer: {
        flex: 1,
    },
    detailLabel: {
        fontSize: 10,
        fontWeight: '700',
        color: COLORS.gray500,
        letterSpacing: 0.5,
    },
    detailValue: {
        fontSize: FONT_SIZE.base,
        fontWeight: '600',
        color: COLORS.gray800,
        marginTop: 2,
    },
    actions: {
        flexDirection: 'row',
        width: '100%',
        gap: SPACING.md,
    },
    declineButton: {
        flex: 1,
        paddingVertical: SPACING.md,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.gray200,
        alignItems: 'center',
        backgroundColor: COLORS.white,
    },
    declineText: {
        fontSize: FONT_SIZE.base,
        fontWeight: '700',
        color: COLORS.gray600,
    },
    acceptButton: {
        flex: 2,
        paddingVertical: SPACING.md,
        borderRadius: 12,
        alignItems: 'center',
        backgroundColor: COLORS.primary,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    acceptText: {
        fontSize: FONT_SIZE.base,
        fontWeight: '700',
        color: COLORS.white,
    },
});

export default IncomingRequestModal;
