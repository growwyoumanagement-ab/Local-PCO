// src/components/SearchBar.tsx
// Modern elevated search bar with clear button and smooth animations

import React, { useRef } from 'react';
import {
    View,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZE, RADIUS, SHADOWS } from '../utils/constants';

interface SearchBarProps {
    value?: string;
    onChangeText?: (text: string) => void;
    placeholder?: string;
    onSearch?: () => void;
    onClear?: () => void;
    autoFocus?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({
    value = '',
    onChangeText,
    placeholder = 'Search services...',
    onSearch,
    onClear,
    autoFocus = false,
}) => {
    const inputRef = useRef<TextInput>(null);
    const hasValue = value.length > 0;

    const handleClear = () => {
        onChangeText?.('');
        onClear?.();
        // Keep focus on input after clearing
        inputRef.current?.focus();
    };

    return (
        <View style={styles.container}>
            {/* Left Search Icon */}
            <Ionicons
                name="search"
                size={20}
                color={hasValue ? COLORS.primary : COLORS.gray400}
                style={styles.searchIcon}
            />

            {/* Text Input */}
            <TextInput
                ref={inputRef}
                style={styles.input}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor={COLORS.gray400}
                onSubmitEditing={onSearch}
                returnKeyType="search"
                autoCapitalize="none"
                autoCorrect={false}
                autoFocus={autoFocus}
            />

            {/* Clear Button — visible only when there's text */}
            {hasValue && (
                <TouchableOpacity
                    style={styles.clearButton}
                    onPress={handleClear}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    activeOpacity={0.7}
                >
                    <Ionicons name="close-circle" size={20} color={COLORS.gray400} />
                </TouchableOpacity>
            )}

            {/* Search / Submit Button */}
            <TouchableOpacity
                style={[styles.searchButton, !hasValue && styles.searchButtonDisabled]}
                onPress={onSearch}
                activeOpacity={0.8}
                disabled={!hasValue}
            >
                <Ionicons name="arrow-forward" size={18} color={COLORS.white} />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.xl,
        paddingLeft: SPACING.base,
        paddingRight: SPACING.sm,
        height: 52,
        borderWidth: 1.5,
        borderColor: COLORS.gray100,
        ...SHADOWS.md,
    },
    searchIcon: {
        marginRight: SPACING.sm,
    },
    input: {
        flex: 1,
        fontSize: FONT_SIZE.base,
        color: COLORS.gray800,
        paddingVertical: SPACING.sm,
        fontWeight: '500',
    },
    clearButton: {
        padding: SPACING.xs,
        marginLeft: SPACING.xs,
    },
    searchButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: SPACING.xs,
    },
    searchButtonDisabled: {
        backgroundColor: COLORS.gray300,
    },
});

export default SearchBar;
