// src/components/ui/ErrorBoundary.tsx
// Error boundary component for graceful error handling

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZE, RADIUS } from '../../utils/constants';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        this.props.onError?.(error, errorInfo);
    }

    handleRetry = (): void => {
        this.setState({ hasError: false, error: null });
    };

    render(): ReactNode {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <View style={styles.container}>
                    <Ionicons name="alert-circle-outline" size={64} color={COLORS.gray400} style={styles.icon} />
                    <Text style={styles.title}>Something went wrong</Text>
                    <Text style={styles.message}>
                        We're sorry, but something unexpected happened.
                    </Text>
                    {__DEV__ && this.state.error && (
                        <View style={styles.errorBox}>
                            <Text style={styles.errorText}>
                                {this.state.error.message}
                            </Text>
                        </View>
                    )}
                    <TouchableOpacity style={styles.button} onPress={this.handleRetry}>
                        <Text style={styles.buttonText}>Try Again</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        return this.props.children;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: SPACING.xl,
        backgroundColor: COLORS.white,
    },
    icon: {
        fontSize: 64,
        marginBottom: SPACING.lg,
    },
    title: {
        fontSize: FONT_SIZE['2xl'],
        fontWeight: '700',
        color: COLORS.gray900,
        marginBottom: SPACING.sm,
    },
    message: {
        fontSize: FONT_SIZE.base,
        color: COLORS.gray500,
        textAlign: 'center',
        marginBottom: SPACING.lg,
    },
    errorBox: {
        backgroundColor: COLORS.danger + '10',
        borderRadius: RADIUS.md,
        padding: SPACING.md,
        marginBottom: SPACING.lg,
        maxWidth: '100%',
    },
    errorText: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.danger,
        fontFamily: 'monospace',
    },
    button: {
        backgroundColor: COLORS.primary,
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.xl,
        borderRadius: RADIUS.lg,
    },
    buttonText: {
        color: COLORS.white,
        fontSize: FONT_SIZE.md,
        fontWeight: '600',
    },
});

export default ErrorBoundary;
