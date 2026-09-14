const cloudinary = require('../config/cloudinaryConfig');

/**
 * Upload base64 image to Cloudinary
 * @param {string} base64Image - Base64 encoded image string
 * @param {string} folder - Cloudinary folder path
 * @param {string} publicId - Optional public ID for the image
 * @returns {Promise<Object>} Upload result with URL and public ID
 */
const uploadBase64Image = async (base64Image, folder = 'kyc', publicId = null) => {
    try {
        const uploadOptions = {
            folder: folder,
            resource_type: 'image',
            transformation: [
                { width: 1200, height: 1200, crop: 'limit' },
                { quality: 'auto:good' }
            ]
        };

        if (publicId) {
            uploadOptions.public_id = publicId;
        }

        const result = await cloudinary.uploader.upload(base64Image, uploadOptions);

        return {
            success: true,
            url: result.secure_url,
            publicId: result.public_id,
            format: result.format,
            width: result.width,
            height: result.height,
            bytes: result.bytes
        };
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        throw new Error(`Failed to upload image: ${error.message}`);
    }
};

/**
 * Delete image from Cloudinary
 * @param {string} publicId - Cloudinary public ID of the image
 * @returns {Promise<Object>} Deletion result
 */
const deleteImage = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return {
            success: result.result === 'ok',
            result: result.result
        };
    } catch (error) {
        console.error('Cloudinary delete error:', error);
        throw new Error(`Failed to delete image: ${error.message}`);
    }
};

/**
 * Upload image from URL
 * @param {string} imageUrl - URL of the image to upload
 * @param {string} folder - Cloudinary folder path
 * @returns {Promise<Object>} Upload result
 */
const uploadFromUrl = async (imageUrl, folder = 'kyc') => {
    try {
        const result = await cloudinary.uploader.upload(imageUrl, {
            folder: folder,
            resource_type: 'image'
        });

        return {
            success: true,
            url: result.secure_url,
            publicId: result.public_id
        };
    } catch (error) {
        console.error('Cloudinary upload from URL error:', error);
        throw new Error(`Failed to upload image from URL: ${error.message}`);
    }
};

module.exports = {
    uploadBase64Image,
    deleteImage,
    uploadFromUrl
};
