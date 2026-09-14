// src/screens/EditProfileScreen.tsx
// Edit profile screen with image upload functionality

import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, FONT_SIZE, SPACING } from '../utils/constants';
import { useAppDispatch, useAppSelector } from '../store';
import { updatePartnerProfile } from '../store/partnerSlice';
import PrimaryButton from '../components/PrimaryButton';
import { prepareImageForUpload } from '../services/imageUploadService';

const MAX_IMAGE_SIZE_MB = 2;
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;

const EditProfileScreen: React.FC = () => {
    const navigation = useNavigation();
    const dispatch = useAppDispatch();
    const { profile } = useAppSelector(state => state.partner);
    const { user } = useAppSelector(state => state.auth);

    const profileData = (profile || user) as any;

    const [name, setName] = useState(profileData?.name || '');
    const [phone, setPhone] = useState(profileData?.phone || '');
    const [email, setEmail] = useState(profileData?.email || '');
    const [imageUri, setImageUri] = useState<string | null>(profileData?.avatar || null);

    // Address State
    const [street, setStreet] = useState(profileData?.address?.street || '');
    const [city, setCity] = useState(profileData?.address?.city || '');
    const [state, setState] = useState(profileData?.address?.state || '');
    const [pincode, setPincode] = useState(profileData?.address?.pincode || '');

    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    const showImagePickerOptions = () => {
        Alert.alert(
            'Upload Profile Photo',
            'Choose how you want to upload your profile photo',
            [
                {
                    text: 'Take Photo',
                    onPress: () => pickImage('camera'),
                },
                {
                    text: 'Choose from Gallery',
                    onPress: () => pickImage('gallery'),
                },
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
            ],
            { cancelable: true }
        );
    };

    const pickImage = async (source: 'camera' | 'gallery') => {
        try {
            // Request permissions
            if (source === 'camera') {
                const { status } = await ImagePicker.requestCameraPermissionsAsync();
                if (status !== 'granted') {
                    Alert.alert('Permission Required', 'Camera permission is needed to take photos.');
                    return;
                }
            } else {
                const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (status !== 'granted') {
                    Alert.alert('Permission Required', 'Gallery permission is needed to select photos.');
                    return;
                }
            }

            // Pick or take image
            const result = source === 'camera'
                ? await ImagePicker.launchCameraAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                    allowsEditing: false,
                    quality: 0.8,
                })
                : await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                    allowsEditing: false,
                    quality: 0.8,
                });

            if (!result.canceled && result.assets[0]) {
                const asset = result.assets[0];

                // Check file size
                if (asset.fileSize && asset.fileSize > MAX_IMAGE_SIZE_BYTES) {
                    Alert.alert(
                        'Image Too Large',
                        `Please select an image smaller than ${MAX_IMAGE_SIZE_MB}MB. Your image is ${(asset.fileSize / (1024 * 1024)).toFixed(1)}MB.`,
                        [{ text: 'OK' }]
                    );
                    return;
                }

                setImageUri(asset.uri);
            }
        } catch (err) {
            console.error('Image picker error:', err);
            Alert.alert('Error', 'Failed to pick image. Please try again.');
        }
    };

    const handleSave = async () => {
        if (!name.trim()) {
            setError('Name is required');
            return;
        }

        setIsSaving(true);
        setError('');

        try {
            let avatarBase64: string | undefined = undefined;

            // Convert image to base64 if a new image was selected (local URI)
            if (imageUri && !imageUri.startsWith('http') && !imageUri.startsWith('data:image')) {
                try {
                    avatarBase64 = await prepareImageForUpload(imageUri);
                } catch (imgError: any) {
                    console.error('Error preparing image:', imgError);
                    Alert.alert('Image Error', imgError.message || 'Failed to process image');
                    setIsSaving(false); // Stop saving if image fails
                    return;
                }
            }

            await dispatch(updatePartnerProfile({
                name: name.trim(),
                email: email.trim() || undefined,
                avatar: avatarBase64,
                address: {
                    street: street.trim(),
                    city: city.trim(),
                    state: state.trim(),
                    pincode: pincode.trim(),
                    country: 'India'
                }
            })).unwrap();

            Alert.alert('Success', 'Profile updated successfully!', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (err: any) {
            setError(err.message || 'Failed to update profile');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView 
                style={{ flex: 1 }} 
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
            >
                <ScrollView 
                    style={styles.container} 
                    contentContainerStyle={[styles.content, { paddingBottom: 100 }]}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Text style={styles.backButtonText}>← Back</Text>
                    </TouchableOpacity>
                    <Text style={styles.title}>Edit Profile</Text>
                    <View style={styles.placeholder} />
                </View>

                {/* Profile Image Section */}
                <View style={styles.imageSection}>
                    <TouchableOpacity onPress={showImagePickerOptions} style={styles.imageContainer}>
                        {imageUri ? (
                            <Image source={{ uri: imageUri }} style={styles.profileImage} />
                        ) : (
                            <View style={styles.avatarPlaceholder}>
                                <Text style={styles.avatarText}>
                                    {name.charAt(0).toUpperCase() || 'P'}
                                </Text>
                            </View>
                        )}
                        <View style={styles.cameraIcon}>
                            <Text style={styles.cameraIconText}>📷</Text>
                        </View>
                    </TouchableOpacity>
                    <Text style={styles.imageHint}>Tap to change photo</Text>
                </View>

                {/* Form Fields */}
                <View style={styles.form}>
                    <Text style={styles.label}>Full Name *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter your full name"
                        value={name}
                        onChangeText={setName}
                        placeholderTextColor={COLORS.gray400}
                    />

                    <Text style={styles.label}>Phone Number</Text>
                    <TextInput
                        style={[styles.input, styles.inputDisabled]}
                        placeholder="Phone number"
                        value={phone}
                        editable={false}
                        placeholderTextColor={COLORS.gray400}
                    />

                    <Text style={styles.label}>Email Address</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter your email address"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={email}
                        onChangeText={setEmail}
                        placeholderTextColor={COLORS.gray400}
                    />

                    <View style={styles.divider} />
                    <Text style={styles.sectionTitle}>Address</Text>

                    <Text style={styles.label}>Street Address</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="House No, Street, Landmark"
                        value={street}
                        onChangeText={setStreet}
                        placeholderTextColor={COLORS.gray400}
                    />

                    <View style={styles.row}>
                        <View style={styles.halfInput}>
                            <Text style={styles.label}>City</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="City"
                                value={city}
                                onChangeText={setCity}
                                placeholderTextColor={COLORS.gray400}
                            />
                        </View>
                        <View style={styles.halfInput}>
                            <Text style={styles.label}>State</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="State"
                                value={state}
                                onChangeText={setState}
                                placeholderTextColor={COLORS.gray400}
                            />
                        </View>
                    </View>

                    <Text style={styles.label}>Pincode</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter 6-digit Pincode"
                        keyboardType="numeric"
                        maxLength={6}
                        value={pincode}
                        onChangeText={setPincode}
                        placeholderTextColor={COLORS.gray400}
                    />

                    {error ? <Text style={styles.error}>{error}</Text> : null}

                    <PrimaryButton
                        title={isSaving ? 'Saving...' : 'Save Changes'}
                        onPress={handleSave}
                        loading={isSaving}
                        disabled={isSaving}
                        fullWidth
                        style={{ marginTop: SPACING.lg }}
                    />
                    {/* Add invisible spacer for keyboard */}
                    <View style={{ height: 100 }} />
                </View>
            </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: COLORS.gray50 },
    container: { flex: 1 },
    content: { padding: SPACING.base },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.lg },
    backButton: { padding: SPACING.xs },
    backButtonText: { color: COLORS.primary, fontSize: FONT_SIZE.base, fontWeight: '500' },
    title: { fontSize: FONT_SIZE.lg, fontWeight: '700', color: COLORS.gray900 },
    placeholder: { width: 60 },
    imageSection: { alignItems: 'center', marginBottom: SPACING.lg },
    imageContainer: { position: 'relative' },
    profileImage: { width: 120, height: 120, borderRadius: 60 },
    avatarPlaceholder: { width: 120, height: 120, borderRadius: 60, backgroundColor: COLORS.primary + '20', justifyContent: 'center', alignItems: 'center' },
    avatarText: { fontSize: 48, fontWeight: '700', color: COLORS.primary },
    cameraIcon: { position: 'absolute', bottom: 0, right: 0, backgroundColor: COLORS.primary, width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: COLORS.white },
    cameraIconText: { fontSize: 16 },
    imageHint: { fontSize: FONT_SIZE.sm, color: COLORS.gray500, marginTop: SPACING.sm },
    guidelinesCard: { backgroundColor: COLORS.primary + '10', borderRadius: 12, padding: SPACING.md, marginBottom: SPACING.lg },
    guidelinesTitle: { fontSize: FONT_SIZE.sm, fontWeight: '600', color: COLORS.gray800, marginBottom: SPACING.xs },
    guidelinesText: { fontSize: FONT_SIZE.xs, color: COLORS.gray600, marginBottom: 4 },
    form: { gap: SPACING.sm },
    divider: { height: 1, backgroundColor: COLORS.gray200, marginVertical: SPACING.md },
    sectionTitle: { fontSize: FONT_SIZE.md, fontWeight: '700', color: COLORS.gray800, marginBottom: SPACING.sm },
    row: { flexDirection: 'row', gap: SPACING.md },
    halfInput: { flex: 1 },
    label: { fontSize: FONT_SIZE.sm, fontWeight: '600', color: COLORS.gray700, marginTop: SPACING.sm },
    input: { backgroundColor: COLORS.white, borderRadius: 12, padding: SPACING.md, fontSize: FONT_SIZE.base, color: COLORS.gray800, borderWidth: 1, borderColor: COLORS.gray200 },
    inputDisabled: { backgroundColor: COLORS.gray100, color: COLORS.gray500 },
    fieldHint: { fontSize: FONT_SIZE.xs, color: COLORS.gray400, marginTop: 4 },
    error: { color: COLORS.danger, fontSize: FONT_SIZE.sm, textAlign: 'center', marginTop: SPACING.sm },
});

export default EditProfileScreen;
