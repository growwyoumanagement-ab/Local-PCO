// src/components/ImagePicker.tsx
// Image picker component for request photos

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Alert,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZE, RADIUS } from '../utils/constants';

interface ImagePickerProps {
    image: string | null;
    onImageSelected: (uri: string | null) => void;
    label?: string;
    placeholder?: string;
}

const ImagePicker: React.FC<ImagePickerProps> = ({
    image,
    onImageSelected,
    label = 'Add Photo (Optional)',
    placeholder = 'Take a photo or choose from gallery',
}) => {
    const [isLoading, setIsLoading] = useState(false);

    const handlePickImage = () => {
        // In a real app, use expo-image-picker
        // import * as ImagePicker from 'expo-image-picker';

        Alert.alert(
            'Add Photo',
            'Choose an option',
            [
                {
                    text: 'Camera',
                    onPress: () => handleCamera(),
                },
                {
                    text: 'Gallery',
                    onPress: () => handleGallery(),
                },
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
            ]
        );
    };

    const handleCamera = async () => {
        // TODO: Implement with expo-image-picker
        // const { status } = await ImagePicker.requestCameraPermissionsAsync();
        // if (status !== 'granted') {
        //   Alert.alert('Permission required', 'Camera permission is needed');
        //   return;
        // }
        // const result = await ImagePicker.launchCameraAsync({
        //   mediaTypes: ImagePicker.MediaTypeOptions.Images,
        //   allowsEditing: true,
        //   aspect: [4, 3],
        //   quality: 0.8,
        // });
        // if (!result.canceled) {
        //   onImageSelected(result.assets[0].uri);
        // }

        // Placeholder for demo
        Alert.alert('Camera', 'Camera functionality will be available when expo-image-picker is installed');
    };

    const handleGallery = async () => {
        // TODO: Implement with expo-image-picker
        // const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        // if (status !== 'granted') {
        //   Alert.alert('Permission required', 'Gallery permission is needed');
        //   return;
        // }
        // const result = await ImagePicker.launchImageLibraryAsync({
        //   mediaTypes: ImagePicker.MediaTypeOptions.Images,
        //   allowsEditing: true,
        //   aspect: [4, 3],
        //   quality: 0.8,
        // });
        // if (!result.canceled) {
        //   onImageSelected(result.assets[0].uri);
        // }

        // Placeholder for demo
        Alert.alert('Gallery', 'Gallery functionality will be available when expo-image-picker is installed');
    };

    const handleRemoveImage = () => {
        Alert.alert(
            'Remove Photo',
            'Are you sure you want to remove this photo?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: () => onImageSelected(null),
                },
            ]
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>

            {image ? (
                <View style={styles.imageContainer}>
                    <Image source={{ uri: image }} style={styles.image} />
                    <TouchableOpacity style={styles.removeButton} onPress={handleRemoveImage}>
                        <Ionicons name="close" size={18} color={COLORS.white} />
                    </TouchableOpacity>
                </View>
            ) : (
                <TouchableOpacity style={styles.picker} onPress={handlePickImage}>
                    <Ionicons name="camera" size={40} color={COLORS.gray400} style={styles.pickerIcon} />
                    <Text style={styles.pickerText}>{placeholder}</Text>
                    <Text style={styles.pickerHint}>Tap to add</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: SPACING.base,
    },
    label: {
        fontSize: FONT_SIZE.sm,
        fontWeight: '500',
        color: COLORS.gray700,
        marginBottom: SPACING.sm,
    },
    picker: {
        backgroundColor: COLORS.gray100,
        borderRadius: RADIUS.lg,
        borderWidth: 2,
        borderColor: COLORS.gray200,
        borderStyle: 'dashed',
        padding: SPACING.xl,
        alignItems: 'center',
        justifyContent: 'center',
    },
    pickerIcon: {
        fontSize: 40,
        marginBottom: SPACING.sm,
    },
    pickerText: {
        fontSize: FONT_SIZE.base,
        color: COLORS.gray600,
        marginBottom: SPACING.xs,
    },
    pickerHint: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.gray400,
    },
    imageContainer: {
        position: 'relative',
        borderRadius: RADIUS.lg,
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: 200,
        borderRadius: RADIUS.lg,
    },
    removeButton: {
        position: 'absolute',
        top: SPACING.sm,
        right: SPACING.sm,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    removeIcon: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '600',
    },
});

export default ImagePicker;
