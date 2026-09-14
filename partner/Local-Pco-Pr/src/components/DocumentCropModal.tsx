// src/components/DocumentCropModal.tsx
// In-app document crop editor — adapted from reference implementation.
// 
// Key design decisions:
// - Corner handles (tl/tr/bl/br) resize the crop frame; dragging inside moves it.
// - An invisible full-screen View carries all panHandlers to avoid child interference.
// - Backdrop overlays and crop frame are updated imperatively via setNativeProps
//   during gestures to avoid React re-render lag.
// - expo-image-manipulator does the final pixel-accurate crop on "Done".

import React, { useRef, useState, useEffect } from 'react';
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    PanResponder,
    Image,
    Dimensions,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImageManipulator from 'expo-image-manipulator';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZE, SPACING } from '../utils/constants';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Larger threshold makes it much easier to grab corners on high-density screens
const HANDLE_THRESHOLD = 60;
const MIN_CROP_SIZE = 80;

interface DocumentCropModalProps {
    visible: boolean;
    imageUri: string;
    rawWidth: number;
    rawHeight: number;
    isSquare?: boolean;
    documentLabel: string;
    onClose: () => void;
    onCropComplete: (croppedUri: string) => void;
}

export default function DocumentCropModal({
    visible,
    imageUri,
    rawWidth,
    rawHeight,
    isSquare = false,
    documentLabel,
    onClose,
    onCropComplete,
}: DocumentCropModalProps) {
    const [containerLayout, setContainerLayout] = useState<{ w: number; h: number } | null>(null);
    const [imageLayout, setImageLayout] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
    const [processing, setProcessing] = useState(false);

    const cropAreaRef = useRef<View>(null);
    const containerLayoutRef = useRef<{ w: number; h: number } | null>(null);
    const cropRectRef = useRef({ x: 0, y: 0, w: 0, h: 0 });
    const dragStartRef = useRef({
        grabMode: 'none',
        initialRect: { x: 0, y: 0, w: 0, h: 0 },
        startX: 0,
        startY: 0,
    });

    const cropFrameRef = useRef<View>(null);
    const topBackdropRef = useRef<View>(null);
    const bottomBackdropRef = useRef<View>(null);
    const leftBackdropRef = useRef<View>(null);
    const rightBackdropRef = useRef<View>(null);

    const imageLayoutRef = useRef<typeof imageLayout>(null);
    const isSquareRef = useRef(isSquare);

    useEffect(() => { imageLayoutRef.current = imageLayout; }, [imageLayout]);
    useEffect(() => { isSquareRef.current = isSquare; }, [isSquare]);

    useEffect(() => {
        if (!visible) {
            setContainerLayout(null);
            containerLayoutRef.current = null;
            setImageLayout(null);
            setProcessing(false);
        }
    }, [visible]);

    // Imperatively update all overlay Views and the crop frame using refs.
    // Called on every gesture move — avoids React re-render overhead.
    const updateUI = () => {
        const rect = cropRectRef.current;
        const layout = containerLayoutRef.current;
        if (!layout || !cropFrameRef.current) return;

        cropFrameRef.current.setNativeProps({
            style: { left: rect.x, top: rect.y, width: rect.w, height: rect.h },
        });

        topBackdropRef.current?.setNativeProps({
            style: { height: Math.max(0, rect.y) },
        });

        bottomBackdropRef.current?.setNativeProps({
            style: {
                top: rect.y + rect.h,
                height: Math.max(0, layout.h - (rect.y + rect.h)),
            },
        });

        leftBackdropRef.current?.setNativeProps({
            style: { top: rect.y, height: rect.h, width: Math.max(0, rect.x) },
        });

        rightBackdropRef.current?.setNativeProps({
            style: {
                left: rect.x + rect.w,
                top: rect.y,
                height: rect.h,
                width: Math.max(0, layout.w - (rect.x + rect.w)),
            },
        });
    };

    // Initialise crop rect centred on image once both layouts are known
    useEffect(() => {
        if (!containerLayout || !imageLayout) return;

        const { x, y, w, h } = imageLayout;
        let cropX = 0, cropY = 0, cropW = 0, cropH = 0;

        if (isSquare) {
            const size = Math.min(w, h) * 0.8;
            cropW = size;
            cropH = size;
            cropX = x + (w - size) / 2;
            cropY = y + (h - size) / 2;
        } else {
            cropW = w * 0.85;
            cropH = cropW * (2 / 3);
            if (cropH > h * 0.85) {
                cropH = h * 0.85;
                cropW = cropH * (3 / 2);
            }
            cropX = x + (w - cropW) / 2;
            cropY = y + (h - cropH) / 2;
        }

        cropRectRef.current = { x: cropX, y: cropY, w: cropW, h: cropH };
        updateUI();
    }, [containerLayout, imageLayout, isSquare]);

    // Calculate image display rect (letterboxed/pillarboxed inside the container)
    const onContainerLayout = (event: any) => {
        const { width: w, height: h } = event.nativeEvent.layout;
        containerLayoutRef.current = { w, h };
        setContainerLayout({ w, h });

        const imageRatio = rawWidth / rawHeight;
        const containerRatio = w / h;

        let imgW = 0, imgH = 0, imgX = 0, imgY = 0;

        if (imageRatio > containerRatio) {
            imgW = w;
            imgH = w / imageRatio;
            imgX = 0;
            imgY = (h - imgH) / 2;
        } else {
            imgH = h;
            imgW = h * imageRatio;
            imgX = (w - imgW) / 2;
            imgY = 0;
        }

        setImageLayout({ x: imgX, y: imgY, w: imgW, h: imgH });
    };

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,

            onPanResponderGrant: (evt) => {
                const imgLayout = imageLayoutRef.current;
                if (!imgLayout) return;

                const { locationX, locationY } = evt.nativeEvent;
                const rect = cropRectRef.current;

                const distTL = Math.hypot(locationX - rect.x, locationY - rect.y);
                const distTR = Math.hypot(locationX - (rect.x + rect.w), locationY - rect.y);
                const distBL = Math.hypot(locationX - rect.x, locationY - (rect.y + rect.h));
                const distBR = Math.hypot(locationX - (rect.x + rect.w), locationY - (rect.y + rect.h));

                let grabMode: 'tl' | 'tr' | 'bl' | 'br' | 'move' | 'none' = 'none';

                if (distTL < HANDLE_THRESHOLD) grabMode = 'tl';
                else if (distTR < HANDLE_THRESHOLD) grabMode = 'tr';
                else if (distBL < HANDLE_THRESHOLD) grabMode = 'bl';
                else if (distBR < HANDLE_THRESHOLD) grabMode = 'br';
                else if (
                    locationX >= rect.x && locationX <= rect.x + rect.w &&
                    locationY >= rect.y && locationY <= rect.y + rect.h
                ) {
                    grabMode = 'move';
                }

                dragStartRef.current = {
                    grabMode,
                    initialRect: { ...rect },
                    startX: locationX,
                    startY: locationY,
                };
            },

            onPanResponderMove: (_, gestureState) => {
                const { grabMode, initialRect } = dragStartRef.current;
                const imgLayout = imageLayoutRef.current;
                if (grabMode === 'none' || !imgLayout) return;

                const dx = gestureState.dx;
                const dy = gestureState.dy;

                let nextX = initialRect.x;
                let nextY = initialRect.y;
                let nextW = initialRect.w;
                let nextH = initialRect.h;

                const minW = MIN_CROP_SIZE;
                const minH = MIN_CROP_SIZE;
                const { x: imgX, y: imgY, w: imgW, h: imgH } = imgLayout;

                if (grabMode === 'move') {
                    nextX = Math.max(imgX, Math.min(imgX + imgW - nextW, initialRect.x + dx));
                    nextY = Math.max(imgY, Math.min(imgY + imgH - nextH, initialRect.y + dy));
                } else if (isSquareRef.current) {
                    // Square mode: resize uniformly from each corner
                    if (grabMode === 'br') {
                        const delta = Math.max(dx, dy);
                        const size = Math.min(
                            Math.max(minW, initialRect.w + delta),
                            Math.min(imgX + imgW - initialRect.x, imgY + imgH - initialRect.y)
                        );
                        nextW = size; nextH = size;
                    } else if (grabMode === 'tl') {
                        const delta = Math.min(dx, dy);
                        const size = Math.min(
                            Math.max(minW, initialRect.w - delta),
                            Math.min(initialRect.x + initialRect.w - imgX, initialRect.y + initialRect.h - imgY)
                        );
                        nextX = initialRect.x + initialRect.w - size;
                        nextY = initialRect.y + initialRect.h - size;
                        nextW = size; nextH = size;
                    } else if (grabMode === 'tr') {
                        const delta = Math.max(dx, -dy);
                        const size = Math.min(
                            Math.max(minW, initialRect.w + delta),
                            Math.min(imgX + imgW - initialRect.x, initialRect.y + initialRect.h - imgY)
                        );
                        nextY = initialRect.y + initialRect.h - size;
                        nextW = size; nextH = size;
                    } else if (grabMode === 'bl') {
                        const delta = Math.max(-dx, dy);
                        const size = Math.min(
                            Math.max(minW, initialRect.w + delta),
                            Math.min(initialRect.x + initialRect.w - imgX, imgY + imgH - initialRect.y)
                        );
                        nextX = initialRect.x + initialRect.w - size;
                        nextW = size; nextH = size;
                    }
                } else {
                    // Free-aspect mode: each corner resizes independently
                    if (grabMode === 'tl') {
                        nextX = Math.max(imgX, Math.min(initialRect.x + initialRect.w - minW, initialRect.x + dx));
                        nextY = Math.max(imgY, Math.min(initialRect.y + initialRect.h - minH, initialRect.y + dy));
                        nextW = initialRect.x + initialRect.w - nextX;
                        nextH = initialRect.y + initialRect.h - nextY;
                    } else if (grabMode === 'tr') {
                        nextY = Math.max(imgY, Math.min(initialRect.y + initialRect.h - minH, initialRect.y + dy));
                        nextW = Math.max(minW, Math.min(imgX + imgW - initialRect.x, initialRect.w + dx));
                        nextH = initialRect.y + initialRect.h - nextY;
                    } else if (grabMode === 'bl') {
                        nextX = Math.max(imgX, Math.min(initialRect.x + initialRect.w - minW, initialRect.x + dx));
                        nextW = initialRect.x + initialRect.w - nextX;
                        nextH = Math.max(minH, Math.min(imgY + imgH - initialRect.y, initialRect.h + dy));
                    } else if (grabMode === 'br') {
                        nextW = Math.max(minW, Math.min(imgX + imgW - initialRect.x, initialRect.w + dx));
                        nextH = Math.max(minH, Math.min(imgY + imgH - initialRect.y, initialRect.h + dy));
                    }
                }

                cropRectRef.current = { x: nextX, y: nextY, w: nextW, h: nextH };
                updateUI();
            },

            onPanResponderRelease: () => {
                dragStartRef.current = {
                    grabMode: 'none',
                    initialRect: { x: 0, y: 0, w: 0, h: 0 },
                    startX: 0,
                    startY: 0,
                };
            },
        })
    ).current;

    const handleDone = async () => {
        if (!imageLayoutRef.current) return;
        setProcessing(true);
        try {
            const { x: imgX, y: imgY, w: imgW, h: imgH } = imageLayoutRef.current;
            const rect = cropRectRef.current;

            const scaleX = rawWidth / imgW;
            const scaleY = rawHeight / imgH;

            let cropX = Math.round((rect.x - imgX) * scaleX);
            let cropY = Math.round((rect.y - imgY) * scaleY);
            let cropW = Math.round(rect.w * scaleX);
            let cropH = Math.round(rect.h * scaleY);

            // Clamp to image bounds
            cropX = Math.max(0, Math.min(rawWidth - 1, cropX));
            cropY = Math.max(0, Math.min(rawHeight - 1, cropY));
            cropW = Math.max(1, Math.min(rawWidth - cropX, cropW));
            cropH = Math.max(1, Math.min(rawHeight - cropY, cropH));

            const manipResult = await ImageManipulator.manipulateAsync(
                imageUri,
                [{ crop: { originX: cropX, originY: cropY, width: cropW, height: cropH } }],
                { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG }
            );

            onCropComplete(manipResult.uri);
        } catch (error) {
            console.error('Cropping error:', error);
            Alert.alert('Cropping Failed', 'Could not process the image crop. Please try again.');
        } finally {
            setProcessing(false);
        }
    };

    const currentRect = cropRectRef.current;
    const layoutH = containerLayoutRef.current?.h || 0;
    const layoutW = containerLayoutRef.current?.w || 0;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <SafeAreaView style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={onClose}
                        style={styles.headerBtn}
                        disabled={processing}
                    >
                        <Ionicons name="arrow-back" size={24} color={COLORS.white} />
                    </TouchableOpacity>
                    <View style={styles.headerTextWrap}>
                        <Text style={styles.headerTitle}>{documentLabel}</Text>
                        <Text style={styles.headerSubtitle}>Drag corner handles to align document</Text>
                    </View>
                    <View style={styles.headerPlaceholder} />
                </View>

                {/* Crop area — image + backdrop overlays + crop frame */}
                <View
                    ref={cropAreaRef}
                    testID="cropArea"
                    style={styles.cropArea}
                    onLayout={onContainerLayout}
                >
                    {/* Source image — pointerEvents none so gestures pass to overlay */}
                    {imageLayout && (
                        <View
                            pointerEvents="none"
                            style={[styles.image, {
                                left: imageLayout.x,
                                top: imageLayout.y,
                                width: imageLayout.w,
                                height: imageLayout.h,
                            }]}
                        >
                            <Image
                                source={{ uri: imageUri }}
                                style={{ width: '100%', height: '100%' }}
                                resizeMode="contain"
                            />
                        </View>
                    )}

                    {/* Semi-transparent backdrops around the crop frame, updated via setNativeProps */}
                    <View
                        ref={topBackdropRef}
                        style={[styles.backdrop, { height: Math.max(0, currentRect.y) }]}
                        pointerEvents="none"
                    />
                    <View
                        ref={bottomBackdropRef}
                        style={[styles.backdrop, {
                            top: currentRect.y + currentRect.h,
                            height: Math.max(0, layoutH - (currentRect.y + currentRect.h)),
                        }]}
                        pointerEvents="none"
                    />
                    <View
                        ref={leftBackdropRef}
                        style={[styles.backdrop, {
                            top: currentRect.y,
                            height: currentRect.h,
                            width: Math.max(0, currentRect.x),
                        }]}
                        pointerEvents="none"
                    />
                    <View
                        ref={rightBackdropRef}
                        style={[styles.backdrop, {
                            left: currentRect.x + currentRect.w,
                            top: currentRect.y,
                            height: currentRect.h,
                            width: Math.max(0, layoutW - (currentRect.x + currentRect.w)),
                        }]}
                        pointerEvents="none"
                    />

                    {/* Crop frame with 3×3 guide grid and green corner hooks */}
                    {imageLayout && (
                        <View
                            ref={cropFrameRef}
                            style={[styles.cropFrame, {
                                left: currentRect.x,
                                top: currentRect.y,
                                width: currentRect.w,
                                height: currentRect.h,
                            }]}
                            pointerEvents="none"
                        >
                            {/* 3×3 rule-of-thirds grid */}
                            <View style={styles.gridRow}>
                                <View style={styles.gridCell} />
                                <View style={[styles.gridCell, styles.gridCellBorderH]} />
                                <View style={styles.gridCell} />
                            </View>
                            <View style={[styles.gridRow, styles.gridRowBorderV]}>
                                <View style={styles.gridCell} />
                                <View style={[styles.gridCell, styles.gridCellBorderH]} />
                                <View style={styles.gridCell} />
                            </View>
                            <View style={styles.gridRow}>
                                <View style={styles.gridCell} />
                                <View style={[styles.gridCell, styles.gridCellBorderH]} />
                                <View style={styles.gridCell} />
                            </View>
                            {/* Green corner hooks */}
                            <View style={[styles.cornerHook, styles.hookTL]} />
                            <View style={[styles.cornerHook, styles.hookTR]} />
                            <View style={[styles.cornerHook, styles.hookBL]} />
                            <View style={[styles.cornerHook, styles.hookBR]} />
                        </View>
                    )}

                    {/* Invisible full-screen touch overlay — carries all panHandlers.
                        Placed last so it sits on top and intercepts every touch event
                        without interfering with child Views. */}
                    <View style={StyleSheet.absoluteFill} {...panResponder.panHandlers} />
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <TouchableOpacity
                        onPress={onClose}
                        style={styles.retakeBtn}
                        disabled={processing}
                    >
                        <Ionicons name="camera-reverse-outline" size={20} color={COLORS.white} />
                        <Text style={styles.retakeBtnText}>Retake</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleDone}
                        style={styles.doneBtn}
                        disabled={processing}
                    >
                        {processing ? (
                            <ActivityIndicator color={COLORS.white} size="small" />
                        ) : (
                            <>
                                <Ionicons name="cloud-upload-outline" size={24} color={COLORS.white} />
                                <Text style={styles.doneBtnText}>Upload</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000000' },
    header: {
        height: 64,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.md,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#222222',
    },
    headerBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1a1a1a',
    },
    headerTextWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    headerTitle: {
        fontSize: FONT_SIZE.base,
        fontWeight: '700',
        color: COLORS.white,
    },
    headerSubtitle: { fontSize: 11, color: '#888888', marginTop: 2 },
    headerPlaceholder: { width: 40 },
    cropArea: {
        flex: 1,
        position: 'relative',
        backgroundColor: '#050505',
        overflow: 'hidden',
    },
    image: { position: 'absolute' },
    backdrop: {
        position: 'absolute',
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
    },
    cropFrame: {
        position: 'absolute',
        borderWidth: 1.5,
        borderColor: 'rgba(255, 255, 255, 0.9)',
        backgroundColor: 'transparent',
    },
    gridRow: { flex: 1, flexDirection: 'row' },
    gridRowBorderV: {
        borderTopWidth: 0.5,
        borderBottomWidth: 0.5,
        borderColor: 'rgba(255, 255, 255, 0.35)',
    },
    gridCell: { flex: 1 },
    gridCellBorderH: {
        borderLeftWidth: 0.5,
        borderRightWidth: 0.5,
        borderColor: 'rgba(255, 255, 255, 0.35)',
    },
    cornerHook: {
        position: 'absolute',
        width: 24,
        height: 24,
        borderColor: COLORS.success,
    },
    hookTL: { top: -3, left: -3, borderTopWidth: 4, borderLeftWidth: 4 },
    hookTR: { top: -3, right: -3, borderTopWidth: 4, borderRightWidth: 4 },
    hookBL: { bottom: -3, left: -3, borderBottomWidth: 4, borderLeftWidth: 4 },
    hookBR: { bottom: -3, right: -3, borderBottomWidth: 4, borderRightWidth: 4 },
    footer: {
        height: 80,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingHorizontal: SPACING.lg,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: '#222222',
    },
    retakeBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.xs,
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.lg,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    retakeBtnText: {
        fontSize: FONT_SIZE.sm,
        fontWeight: '500',
        color: COLORS.white,
    },
    doneBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACING.sm,
        backgroundColor: COLORS.success,
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.xl,
        borderRadius: 8,
        minWidth: 180,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
    },
    doneBtnText: {
        fontSize: FONT_SIZE.lg,
        fontWeight: '700',
        color: COLORS.white,
    },
});
