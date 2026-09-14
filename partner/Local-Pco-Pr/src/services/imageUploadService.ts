// src/services/imageUploadService.ts
// Service for preparing images for upload to backend/Cloudinary

/**
 * Convert image URI to base64 string using fetch
 * @param uri - Local file URI from image picker
 * @returns Base64 encoded image string with data URI prefix
 */
export const convertImageToBase64 = async (uri: string): Promise<string> => {
    try {
        // Fetch the image as a blob
        const response = await fetch(uri);
        const blob = await response.blob();

        // Convert blob to base64
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                resolve(base64String);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.error('Error converting image to base64:', error);
        throw new Error('Failed to process image');
    }
};

/**
 * Validate image file
 * @param uri - Local file URI
 * @returns Validation result
 */
export const validateImage = async (
    uri: string
): Promise<{ valid: boolean; error?: string }> => {
    try {
        // Basic validation - check if URI exists
        if (!uri || uri.trim() === '') {
            return { valid: false, error: 'Invalid image URI' };
        }

        // Check file type from URI
        const validExtensions = ['.jpg', '.jpeg', '.png'];
        const isValidType = validExtensions.some(ext =>
            uri.toLowerCase().endsWith(ext)
        );

        if (!isValidType) {
            return {
                valid: false,
                error: 'Invalid file type. Please select a JPG or PNG image',
            };
        }

        // Check file size using blob
        const response = await fetch(uri);
        const blob = await response.blob();
        const sizeInMB = blob.size / (1024 * 1024);

        if (sizeInMB > 2) {
            return {
                valid: false,
                error: `Image size is ${sizeInMB.toFixed(2)}MB. Limit is 2MB. Please verify your camera settings or choose a smaller image.`,
            };
        }

        return { valid: true };
    } catch (error) {
        console.error('Error validating image:', error);
        return { valid: false, error: 'Failed to validate image' };
    }
};

/**
 * Prepare image for upload
 * @param uri - Local file URI
 * @returns Base64 encoded image ready for upload
 */
export const prepareImageForUpload = async (uri: string): Promise<string> => {
    // Validate image
    const validation = await validateImage(uri);
    if (!validation.valid) {
        throw new Error(validation.error || 'Invalid image');
    }

    // Convert to base64
    const base64Image = await convertImageToBase64(uri);

    return base64Image;
};
