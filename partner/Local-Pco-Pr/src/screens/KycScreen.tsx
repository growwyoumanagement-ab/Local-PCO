// src/screens/KycScreen.tsx
// KYC verification screen for document upload and status

import React, { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView,
    TouchableOpacity, Alert, ActivityIndicator, TextInput, Modal, Image,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as Location from 'expo-location';
import { COLORS, FONT_SIZE, SPACING, KYC_STATUS, ROUTES } from '../utils/constants';
import { getKycStatusLabel } from '../utils/helpers';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchKYCStatus, submitKYCDocument } from '../store/partnerSlice';
import StatusBadge from '../components/StatusBadge';
import DocumentCropModal from '../components/DocumentCropModal';

// Document types required for KYC
// Documents that need both sides have `hasBothSides: true`
const DOCUMENT_TYPES = [
    { type: 'aadhaar', label: 'Aadhaar Card', icon: 'id-card', required: true, needsNumber: true, placeholder: 'Enter 12-digit Aadhaar number', hasBothSides: true },
    { type: 'pan', label: 'PAN Card', icon: 'credit-card-outline', required: true, needsNumber: true, placeholder: 'Enter PAN number (e.g., ABCDE1234F)', hasBothSides: false },
    { type: 'license', label: 'Driving License', icon: 'car-outline', required: false, needsNumber: true, placeholder: 'Enter license number', hasBothSides: true },
    { type: 'passbook', label: 'Bank Passbook', icon: 'bank-outline', required: true, needsNumber: false, placeholder: '', hasBothSides: false },
    { type: 'photo', label: 'Profile Photo', icon: 'camera-outline', required: true, needsNumber: false, placeholder: '', hasBothSides: false },
];

interface UploadModalData {
    type: string;
    label: string;
    needsNumber: boolean;
    placeholder: string;
    side: 'front' | 'back';
}

/**
 * Compress and resize image to prevent Android OOM crashes.
 * Returns a safe base64 string prefixed with the data URI header.
 */
const compressImage = async (uri: string): Promise<string> => {
    try {
        // Resize to max 1024px on the longest edge and compress to 60% JPEG
        const manipulated = await ImageManipulator.manipulateAsync(
            uri,
            [{ resize: { width: 1024 } }],
            { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG, base64: true }
        );
        return `data:image/jpeg;base64,${manipulated.base64}`;
    } catch (error) {
        console.error('Image compression error:', error);
        throw new Error('Failed to compress image. Please try again.');
    }
};

const KycScreen: React.FC = () => {
    const navigation = useNavigation();
    const dispatch = useAppDispatch();
    const { kycStatus, kycDocuments, isLoading } = useAppSelector(state => state.partner);

    const [showUploadModal, setShowUploadModal] = useState(false);
    const [currentUpload, setCurrentUpload] = useState<UploadModalData | null>(null);
    const [documentNumber, setDocumentNumber] = useState('');
    const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    
    // Validation state
    const [documentNumberError, setDocumentNumberError] = useState('');
    const [imageError, setImageError] = useState('');
    
    // Location state
    const [showLocationConsent, setShowLocationConsent] = useState(false);
    const [capturedLocation, setCapturedLocation] = useState<{ latitude: number, longitude: number, address?: string } | null>(null);

    // Crop modal state — stores raw asset info after picking, before upload
    const [cropData, setCropData] = useState<{
        uri: string;
        width: number;
        height: number;
        docKey: string;
        docLabel: string;
    } | null>(null);

    useEffect(() => { dispatch(fetchKYCStatus()); }, [dispatch]);

    const handleDocumentUpload = (docType: string, label: string, needsNumber: boolean, placeholder: string, side: 'front' | 'back' = 'front') => {
        setCurrentUpload({ type: docType, label, needsNumber, placeholder, side });
        setDocumentNumber('');
        setDocumentNumberError('');
        setSelectedImageUri(null);
        setImageError('');
        setShowUploadModal(true);
    };

    const pickImage = async (useCamera: boolean) => {
        try {
            const permissionResult = useCamera
                ? await ImagePicker.requestCameraPermissionsAsync()
                : await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (!permissionResult.granted) {
                Alert.alert('Permission Required', `Please grant ${useCamera ? 'camera' : 'gallery'} access to upload documents.`);
                return;
            }

            // DO NOT request base64 here — it causes OOM on Android for camera shots.
            // We will compress and get base64 later via expo-image-manipulator.
            // allowsEditing: false on BOTH sources — the in-app DocumentCropModal handles
            // the crop step so we never trigger the native OS crop editor.
            const result = useCamera
                ? await ImagePicker.launchCameraAsync({
                    mediaTypes: ['images'] as any,
                    allowsEditing: false,
                    quality: 0.8,
                    base64: false, // CRITICAL: false to avoid OOM
                })
                : await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ['images'] as any,
                    allowsEditing: false,
                    quality: 0.8,
                    base64: false, // CRITICAL: false to avoid OOM
                });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const asset = result.assets[0];
                // Open the in-app crop modal instead of setting the image directly.
                // The crop modal will call back with the final cropped URI.
                setCropData({
                    uri: asset.uri,
                    width: asset.width || 1200,
                    height: asset.height || 900,
                    docKey: currentUpload?.type || '',
                    docLabel: currentUpload?.label || 'Document',
                });
                setImageError('');
            }
        } catch (error) {
            console.error('Image picker error:', error);
            Alert.alert('Error', 'Failed to pick image. Please try again.');
        }
    };

    const validateDocumentNumber = (text: string) => {
        let formattedText = text;
        if (currentUpload?.type === 'pan' || currentUpload?.type === 'license') {
            formattedText = text.toUpperCase();
        }
        
        setDocumentNumber(formattedText);
        
        if (currentUpload?.needsNumber && currentUpload?.side === 'front') {
            const val = formattedText.trim();
            if (!val) {
                setDocumentNumberError('Document number is required');
                return false;
            }
            
            if (currentUpload.type === 'aadhaar') {
                if (!/^\d{12}$/.test(val)) {
                    setDocumentNumberError('Aadhaar must be exactly 12 digits');
                    return false;
                }
            } else if (currentUpload.type === 'pan') {
                if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(val)) {
                    setDocumentNumberError('Invalid PAN format (e.g., ABCDE1234F)');
                    return false;
                }
            } else if (currentUpload.type === 'license') {
                // Driving license formats vary greatly across states, generally 10-20 alphanumeric characters
                if (!/^[A-Z0-9 -]{10,20}$/.test(val)) {
                    setDocumentNumberError('Invalid Driving License format');
                    return false;
                }
            } else if (val.length < 5) {
                setDocumentNumberError('Document number must be at least 5 characters');
                return false;
            }
            
            setDocumentNumberError('');
            return true;
        } else {
            setDocumentNumberError('');
            return true;
        }
    };

    const handleUploadSubmit = async () => {
        if (!currentUpload) return;

        let hasError = false;

        // Force validation
        if (currentUpload.needsNumber && currentUpload.side === 'front') {
            const isValid = validateDocumentNumber(documentNumber);
            if (!isValid) hasError = true;
        }

        if (!selectedImageUri) {
            setImageError('Please select or capture an image');
            hasError = true;
        }

        if (hasError) return;

        // If location not yet captured, show the consent modal instead of uploading
        if (!capturedLocation) {
            setShowLocationConsent(true);
            return;
        }

        await processUpload(capturedLocation);
    };

    const requestLocationAndUpload = async () => {
        try {
            setUploading(true);
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Location permission is required for KYC verification.');
                setShowLocationConsent(false);
                setUploading(false);
                return;
            }

            let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
            
            let addressStr = '';
            try {
                let [geocode] = await Location.reverseGeocodeAsync({
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude
                });
                if (geocode) {
                    addressStr = [geocode.name, geocode.street, geocode.city, geocode.region]
                        .filter(Boolean)
                        .join(', ');
                }
            } catch (e) {
                console.log('Reverse geocode failed', e);
            }

            const locData = { 
                latitude: location.coords.latitude, 
                longitude: location.coords.longitude, 
                address: addressStr 
            };
            
            setCapturedLocation(locData);
            setShowLocationConsent(false);
            
            // Proceed to upload with the newly captured location
            await processUpload(locData);

        } catch (error) {
            Alert.alert('Error', 'Failed to get location. Please ensure location services are enabled.');
            setUploading(false);
            setShowLocationConsent(false);
        }
    };

    const processUpload = async (locationData: { latitude: number, longitude: number, address?: string }) => {
        try {
            setUploading(true);

            // Compress and get base64 — this is done on native thread, safe for Android
            const imageBase64 = await compressImage(selectedImageUri!);

            const uploadData: any = {
                documentType: currentUpload!.type,
                imageBase64,
                side: currentUpload!.side,
                location: locationData
            };

            if (currentUpload!.needsNumber && currentUpload!.side === 'front') {
                uploadData.documentNumber = documentNumber.trim();
            }

            await dispatch(submitKYCDocument(uploadData)).unwrap();

            Alert.alert('Success', `${currentUpload!.label} (${currentUpload!.side || 'Front'}) uploaded successfully!`);
            setShowUploadModal(false);
            setCurrentUpload(null);
            setDocumentNumber('');
            setSelectedImageUri(null);
            // We intentionally don't reset capturedLocation so they only consent once per session

            dispatch(fetchKYCStatus());
        } catch (error: any) {
            console.error('Upload error:', error);
            let errorMessage = 'Failed to upload document. Please try again.';
            if (typeof error === 'string') errorMessage = error;
            else if (error?.message) errorMessage = error.message;
            else if (error?.error) errorMessage = error.error;
            Alert.alert('Upload Failed', errorMessage);
        } finally {
            setUploading(false);
        }
    };

    const getDocumentStatus = (docType: string, side: string = 'front') => {
        const doc = (kycDocuments as any[]).find(d => d.type === docType && (d.side || 'front') === side);
        return doc?.status || 'not_uploaded';
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case KYC_STATUS.APPROVED: return COLORS.success;
            case KYC_STATUS.REJECTED: return COLORS.danger;
            case KYC_STATUS.UNDER_REVIEW: return COLORS.accent;
            case KYC_STATUS.ON_HOLD: return COLORS.accent;
            case KYC_STATUS.NEED_INFO: return COLORS.primary;
            default: return COLORS.gray400;
        }
    };

    const canResubmit = [KYC_STATUS.REJECTED, KYC_STATUS.ON_HOLD, KYC_STATUS.NEED_INFO, KYC_STATUS.PENDING].includes(kycStatus as any);

    const renderDocumentRow = (doc: typeof DOCUMENT_TYPES[0], side: 'front' | 'back') => {
        const status = getDocumentStatus(doc.type, side);
        const isUploaded = status === KYC_STATUS.APPROVED || status === KYC_STATUS.UNDER_REVIEW;
        const allowUpload = !isUploaded || canResubmit;
        const sideLabel = doc.hasBothSides ? ` (${side === 'front' ? 'Front' : 'Back'})` : '';

        return (
            <TouchableOpacity
                key={`${doc.type}-${side}`}
                style={styles.documentItem}
                onPress={() => allowUpload && handleDocumentUpload(doc.type, doc.label, doc.needsNumber, doc.placeholder, side)}
                disabled={!allowUpload}
            >
                <View style={styles.documentLeft}>
                    <View style={styles.documentIconContainer}>
                        <MaterialCommunityIcons name={doc.icon as any} size={24} color={COLORS.primary} />
                    </View>
                    <View>
                        <Text style={styles.documentLabel}>{doc.label}{sideLabel}</Text>
                        <Text style={[styles.documentStatus, { color: getStatusColor(status) }]}>
                            {status === 'not_uploaded' ? 'Not uploaded' : getKycStatusLabel(status)}
                        </Text>
                    </View>
                </View>
                {!isUploaded && (
                    <View style={styles.uploadAction}>
                        <Text style={styles.uploadText}>Upload</Text>
                        <MaterialCommunityIcons name="chevron-right" size={16} color={COLORS.primary} />
                    </View>
                )}
                {isUploaded && <MaterialCommunityIcons name="check-circle" size={20} color={COLORS.success} />}
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => (navigation as any).navigate(ROUTES.PROFILE)} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.gray700} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>KYC Verification</Text>
                <StatusBadge status={kycStatus} variant="kyc" />
            </View>

            <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
                {/* Status Card */}
                <View style={[styles.statusCard, { borderLeftColor: getStatusColor(kycStatus) }]}>
                    <Text style={styles.statusTitle}>Verification Status</Text>
                    <Text style={styles.statusText}>{getKycStatusLabel(kycStatus)}</Text>
                    {kycStatus === KYC_STATUS.APPROVED && (
                        <View style={styles.statusSubtextContainer}>
                            <MaterialCommunityIcons name="check-circle-outline" size={16} color={COLORS.success} />
                            <Text style={styles.statusSubtext}>You can now accept jobs</Text>
                        </View>
                    )}
                    {kycStatus === KYC_STATUS.REJECTED && (
                        <View style={styles.statusSubtextContainer}>
                            <MaterialCommunityIcons name="close-circle-outline" size={16} color={COLORS.danger} />
                            <Text style={styles.statusSubtext}>Please re-upload documents</Text>
                        </View>
                    )}
                    {kycStatus === KYC_STATUS.PENDING && (
                        <View style={styles.statusSubtextContainer}>
                            <MaterialCommunityIcons name="upload-outline" size={16} color={COLORS.accent} />
                            <Text style={styles.statusSubtext}>Upload required documents</Text>
                        </View>
                    )}
                    {kycStatus === KYC_STATUS.ON_HOLD && (
                        <View style={styles.statusSubtextContainer}>
                            <MaterialCommunityIcons name="pause-circle-outline" size={16} color={COLORS.accent} />
                            <Text style={styles.statusSubtext}>Your verification is on hold</Text>
                        </View>
                    )}
                    {kycStatus === KYC_STATUS.NEED_INFO && (
                        <View style={styles.statusSubtextContainer}>
                            <MaterialCommunityIcons name="information-outline" size={16} color={COLORS.primary} />
                            <Text style={styles.statusSubtext}>Additional information requested</Text>
                        </View>
                    )}
                </View>

                {/* Verifier Reason Card */}
                {(kycStatus === KYC_STATUS.REJECTED || kycStatus === KYC_STATUS.ON_HOLD || kycStatus === KYC_STATUS.NEED_INFO) && (
                    <View style={styles.reasonCard}>
                        <View style={styles.reasonHeader}>
                            <MaterialCommunityIcons 
                                name={kycStatus === KYC_STATUS.REJECTED ? "alert-circle" : "message-text-outline"} 
                                size={20} 
                                color={kycStatus === KYC_STATUS.REJECTED ? COLORS.danger : COLORS.accent} 
                            />
                            <Text style={styles.reasonTitle}>
                                {kycStatus === KYC_STATUS.REJECTED ? 'Rejection Reason' : kycStatus === KYC_STATUS.ON_HOLD ? 'Hold Reason' : 'Info Required'}
                            </Text>
                        </View>
                        <Text style={styles.reasonText}>
                            {(kycDocuments as any)?.rejectionReason || 'Please review and re-submit your documents.'}
                        </Text>
                        <TouchableOpacity style={styles.resubmitBanner}>
                            <MaterialCommunityIcons name="refresh" size={16} color={COLORS.primary} />
                            <Text style={styles.resubmitText}>You can re-upload your documents below</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Documents Section */}
                <Text style={styles.sectionTitle}>Documents</Text>
                <View style={styles.documentsContainer}>
                    {DOCUMENT_TYPES.map(doc => (
                        <React.Fragment key={doc.type}>
                            {/* Front side (always shown) */}
                            {renderDocumentRow(doc, 'front')}
                            {/* Back side (only for hasBothSides docs) */}
                            {doc.hasBothSides && renderDocumentRow(doc, 'back')}
                        </React.Fragment>
                    ))}
                </View>

                {isLoading && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={COLORS.primary} />
                        <Text style={styles.loadingText}>Loading KYC status...</Text>
                    </View>
                )}
            </ScrollView>

            {/* Upload Modal */}
            <Modal
                visible={showUploadModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowUploadModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>
                            Upload {currentUpload?.label}
                            {currentUpload?.side === 'back' ? ' (Back)' : currentUpload?.side === 'front' && DOCUMENT_TYPES.find(d => d.type === currentUpload.type)?.hasBothSides ? ' (Front)' : ''}
                        </Text>

                        {/* Document Number Input - Only show for front side */}
                        {currentUpload?.needsNumber && currentUpload?.side === 'front' && (
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Document Number *</Text>
                                <TextInput
                                    style={[styles.input, documentNumberError ? styles.inputError : null]}
                                    placeholder={currentUpload.placeholder}
                                    value={documentNumber}
                                    onChangeText={validateDocumentNumber}
                                    autoCapitalize="characters"
                                    placeholderTextColor={COLORS.gray400}
                                />
                                {documentNumberError ? <Text style={styles.fieldErrorText}>{documentNumberError}</Text> : null}
                            </View>
                        )}

                        {/* Image Preview */}
                        {selectedImageUri && (
                            <View style={styles.imagePreviewContainer}>
                                <Image source={{ uri: selectedImageUri }} style={styles.imagePreview} />
                            </View>
                        )}

                        {/* Image Error Text */}
                        {imageError ? <Text style={[styles.fieldErrorText, { textAlign: 'center', marginBottom: SPACING.md, marginTop: -SPACING.sm }]}>{imageError}</Text> : null}

                        {/* Image Selection Buttons */}
                        <View style={styles.buttonRow}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.secondaryButton]}
                                onPress={() => pickImage(true)}
                                disabled={uploading}
                            >
                                <View style={styles.modalButtonContent}>
                                    <MaterialCommunityIcons name="camera-outline" size={20} color={COLORS.gray700} style={{ marginRight: 8 }} />
                                    <Text style={styles.secondaryButtonText}>Take Photo</Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.secondaryButton]}
                                onPress={() => pickImage(false)}
                                disabled={uploading}
                            >
                                <View style={styles.modalButtonContent}>
                                    <MaterialCommunityIcons name="image-outline" size={20} color={COLORS.gray700} style={{ marginRight: 8 }} />
                                    <Text style={styles.secondaryButtonText}>Gallery</Text>
                                </View>
                            </TouchableOpacity>
                        </View>

                        {/* Action Buttons */}
                        <View style={styles.buttonRow}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => setShowUploadModal(false)}
                                disabled={uploading}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.uploadButton, uploading && styles.disabledButton]}
                                onPress={handleUploadSubmit}
                                disabled={uploading}
                            >
                                {uploading ? (
                                    <View>
                                        <ActivityIndicator color={COLORS.white} />
                                        <Text style={[styles.uploadButtonText, { fontSize: 10, marginTop: 4 }]}>Compressing...</Text>
                                    </View>
                                ) : (
                                    <Text style={styles.uploadButtonText}>Upload</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Location Consent Modal */}
            <Modal
                visible={showLocationConsent}
                animationType="fade"
                transparent={true}
                onRequestClose={() => !uploading && setShowLocationConsent(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.consentModalContent}>
                        <View style={styles.consentIconContainer}>
                            <MaterialCommunityIcons name="map-marker-radius" size={40} color={COLORS.primary} />
                        </View>
                        <Text style={styles.consentTitle}>Location Verification</Text>
                        <Text style={styles.consentText}>
                            We need to capture your current location <Text style={{ fontWeight: '700' }}>once</Text> to verify that you are submitting KYC from your registered service area. This helps prevent fraud and protects your account.
                        </Text>
                        <View style={styles.consentInfoBox}>
                            <View style={styles.consentInfoRow}>
                                <MaterialCommunityIcons name="map-marker-check" size={16} color={COLORS.primary} />
                                <Text style={styles.consentInfoText}>Only your GPS coordinates and approximate address are recorded</Text>
                            </View>
                            <View style={styles.consentInfoRow}>
                                <MaterialCommunityIcons name="clock-check-outline" size={16} color={COLORS.primary} />
                                <Text style={styles.consentInfoText}>Captured once per session — not asked again for subsequent documents</Text>
                            </View>
                            <View style={styles.consentInfoRow}>
                                <MaterialCommunityIcons name="eye-off-outline" size={16} color={COLORS.primary} />
                                <Text style={styles.consentInfoText}>No continuous tracking — location is not monitored after this</Text>
                            </View>
                        </View>

                        <View style={styles.buttonRow}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => setShowLocationConsent(false)}
                                disabled={uploading}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.uploadButton, uploading && styles.disabledButton]}
                                onPress={requestLocationAndUpload}
                                disabled={uploading}
                            >
                                {uploading ? (
                                    <ActivityIndicator color={COLORS.white} />
                                ) : (
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Text style={styles.uploadButtonText}>Allow &amp; Continue</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* In-app Document Crop Modal — opens after image is picked, before upload */}
            {cropData && (
                <DocumentCropModal
                    visible={!!cropData}
                    imageUri={cropData.uri}
                    rawWidth={cropData.width}
                    rawHeight={cropData.height}
                    documentLabel={cropData.docLabel}
                    isSquare={cropData.docKey === 'photo'}
                    onClose={() => setCropData(null)}
                    onCropComplete={(croppedUri) => {
                        setCropData(null);
                        setSelectedImageUri(croppedUri);
                    }}
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: COLORS.white },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.base, paddingVertical: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.gray100 },
    backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.gray100, justifyContent: 'center', alignItems: 'center' },
    backButtonText: { fontSize: FONT_SIZE.xl, color: COLORS.gray700 },
    headerTitle: { fontSize: FONT_SIZE.lg, fontWeight: '600', color: COLORS.gray900 },
    container: { flex: 1 },
    contentContainer: { padding: SPACING.base, paddingBottom: SPACING['2xl'] },
    statusCard: { backgroundColor: COLORS.gray50, borderRadius: 12, padding: SPACING.base, borderLeftWidth: 4, marginBottom: SPACING.lg },
    statusTitle: { fontSize: FONT_SIZE.xs, color: COLORS.gray500, textTransform: 'uppercase', marginBottom: SPACING.xs },
    statusText: { fontSize: FONT_SIZE.lg, fontWeight: '600', color: COLORS.gray900 },
    statusSubtextContainer: { flexDirection: 'row', alignItems: 'center', marginTop: SPACING.xs },
    statusSubtext: { fontSize: FONT_SIZE.sm, color: COLORS.gray600, marginLeft: 4 },
    sectionTitle: { fontSize: FONT_SIZE.md, fontWeight: '600', color: COLORS.gray900, marginBottom: SPACING.md },
    documentsContainer: { backgroundColor: COLORS.gray50, borderRadius: 12, overflow: 'hidden', marginBottom: SPACING.lg },
    documentItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.gray200 },
    documentLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    documentIconContainer: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.white, justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md },
    documentLabel: { fontSize: FONT_SIZE.base, fontWeight: '500', color: COLORS.gray800 },
    documentStatus: { fontSize: FONT_SIZE.xs, marginTop: 2 },
    uploadAction: { flexDirection: 'row', alignItems: 'center' },
    uploadText: { fontSize: FONT_SIZE.sm, color: COLORS.primary, fontWeight: '500', marginRight: 4 },
    checkmark: { fontSize: FONT_SIZE.lg, color: COLORS.success },
    loadingContainer: { alignItems: 'center', marginTop: SPACING.xl },
    loadingText: { marginTop: SPACING.md, fontSize: FONT_SIZE.sm, color: COLORS.gray600 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: COLORS.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: SPACING.lg },
    modalTitle: { fontSize: FONT_SIZE.xl, fontWeight: '600', color: COLORS.gray900, marginBottom: SPACING.lg },
    inputGroup: { marginBottom: SPACING.md },
    inputLabel: { fontSize: FONT_SIZE.sm, fontWeight: '500', color: COLORS.gray700, marginBottom: SPACING.xs },
    input: { backgroundColor: COLORS.white, borderRadius: 10, borderWidth: 1, borderColor: COLORS.gray200, padding: SPACING.md, fontSize: FONT_SIZE.base, color: COLORS.gray800 },
    inputError: { borderWidth: 1, borderColor: COLORS.danger, backgroundColor: '#FFF5F5' },
    fieldErrorText: { color: COLORS.danger, fontSize: 12, marginTop: 4, marginLeft: 4 },
    imagePreviewContainer: { marginBottom: SPACING.md, alignItems: 'center' },
    imagePreview: { width: 200, height: 200, borderRadius: 10, resizeMode: 'cover' },
    buttonRow: { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.md },
    modalButton: { flex: 1, padding: SPACING.md, borderRadius: 10, alignItems: 'center', justifyContent: 'center', minHeight: 48 },
    modalButtonContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
    secondaryButton: { backgroundColor: COLORS.gray100 },
    secondaryButtonText: { fontSize: FONT_SIZE.sm, color: COLORS.gray700, fontWeight: '500' },
    cancelButton: { backgroundColor: COLORS.gray100 },
    cancelButtonText: { fontSize: FONT_SIZE.base, color: COLORS.gray700, fontWeight: '500' },
    uploadButton: { backgroundColor: COLORS.primary },
    uploadButtonText: { fontSize: FONT_SIZE.base, color: COLORS.white, fontWeight: '600' },
    reasonCard: { backgroundColor: '#FFF7ED', borderRadius: 12, padding: SPACING.base, marginBottom: SPACING.lg, borderWidth: 1, borderColor: '#FDBA74' },
    reasonHeader: { flexDirection: 'row' as const, alignItems: 'center' as const, marginBottom: SPACING.sm },
    reasonTitle: { fontSize: FONT_SIZE.md, fontWeight: '600' as const, color: COLORS.gray900, marginLeft: SPACING.sm },
    reasonText: { fontSize: FONT_SIZE.base, color: COLORS.gray700, lineHeight: 20, marginBottom: SPACING.md },
    resubmitBanner: { flexDirection: 'row' as const, alignItems: 'center' as const, paddingTop: SPACING.sm, borderTopWidth: 1, borderTopColor: '#FDBA74' },
    resubmitText: { fontSize: FONT_SIZE.sm, color: COLORS.primary, fontWeight: '500' as const, marginLeft: SPACING.xs },
    disabledButton: { opacity: 0.5 },
    consentModalContent: { backgroundColor: COLORS.white, borderRadius: 20, padding: SPACING.xl, width: '90%', alignSelf: 'center', marginBottom: 'auto', marginTop: 'auto' },
    consentIconContainer: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.primary + '15', justifyContent: 'center', alignItems: 'center', alignSelf: 'center', marginBottom: SPACING.lg },
    consentTitle: { fontSize: FONT_SIZE.xl, fontWeight: 'bold', color: COLORS.gray900, textAlign: 'center', marginBottom: SPACING.md },
    consentText: { fontSize: FONT_SIZE.base, color: COLORS.gray600, textAlign: 'center', lineHeight: 24, marginBottom: SPACING.md },
    consentInfoBox: { backgroundColor: COLORS.primary + '0D', borderRadius: 10, padding: SPACING.md, marginBottom: SPACING.xl },
    consentInfoRow: { flexDirection: 'row' as const, alignItems: 'flex-start' as const, marginBottom: SPACING.sm },
    consentInfoText: { fontSize: FONT_SIZE.sm, color: COLORS.gray700, marginLeft: SPACING.sm, flex: 1, lineHeight: 18 },
});

export default KycScreen;
