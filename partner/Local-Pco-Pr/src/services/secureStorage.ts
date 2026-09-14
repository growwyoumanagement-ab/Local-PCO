// src/services/secureStorage.ts
// Thin adapter wrapping expo-secure-store with the same interface as AsyncStorage.
// This isolates the dependency change to this single file — no changes needed
// in business logic across api.ts or Redux slices.
//
// NOTE: SecureStore values are stored encrypted on device using:
//   - iOS: Keychain Services
//   - Android: Android Keystore + EncryptedSharedPreferences
//
// All existing logged-in users will be required to log in once after this migration
// because their tokens were previously stored in unencrypted AsyncStorage.

import * as SecureStore from 'expo-secure-store';

/**
 * Sanitizes keys to contain only characters supported by Expo SecureStore
 * (alphanumeric characters, ".", "-", and "_") to prevent native errors.
 */
const sanitizeKey = (key: string): string => {
    return key.replace(/[^a-zA-Z0-9\.\-_]/g, '_');
};

export const secureStorage = {
    /**
     * Retrieve a string value stored under the given key.
     * Returns null if the key doesn't exist.
     */
    getItem: (key: string): Promise<string | null> => {
        return SecureStore.getItemAsync(sanitizeKey(key));
    },

    /**
     * Store a string value under the given key (encrypted on device).
     */
    setItem: (key: string, value: string): Promise<void> => {
        if (value === null || value === undefined) {
            return SecureStore.deleteItemAsync(sanitizeKey(key));
        }
        const stringValue = typeof value === 'string' ? value : String(value);
        return SecureStore.setItemAsync(sanitizeKey(key), stringValue);
    },

    /**
     * Remove the value stored under the given key.
     */
    removeItem: (key: string): Promise<void> => {
        return SecureStore.deleteItemAsync(sanitizeKey(key));
    },

    /**
     * Remove multiple keys at once (mirrors AsyncStorage.multiRemove).
     */
    multiRemove: (keys: string[]): Promise<void[]> => {
        return Promise.all(keys.map(k => SecureStore.deleteItemAsync(sanitizeKey(k))));
    },
};
