import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

console.log('☁️ Cloudinary Configured:', {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key_present: !!process.env.CLOUDINARY_API_KEY,
    api_secret_present: !!process.env.CLOUDINARY_API_SECRET
});

export const uploadFromBuffer = async (buffer, fileName, folder = '/') => {
    return new Promise((resolve, reject) => {
        console.log('🔄 uploadFromBuffer (Cloudinary) called:', { fileName, folder, bufferLength: buffer?.length });

        // Determine resource_type based on potentially missing mimetype or just default to 'auto'
        // For buffers, cloudinary stream upload works well.

        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: folder.startsWith('/') ? folder.substring(1) : folder, // Cloudinary folders don't start with /
                public_id: fileName,
                resource_type: 'auto', // Auto-detect image or video
                overwrite: true
            },
            (error, result) => {
                if (error) {
                    console.error('❌ Cloudinary upload error:', error);
                    return reject(error);
                }
                console.log('✅ Cloudinary upload complete:', { url: result.secure_url, public_id: result.public_id });

                // Normalize result to match what controller expects (url property)
                resolve({
                    ...result,
                    url: result.secure_url, // Map secure_url to url for compatibility
                    fileId: result.public_id // Map public_id to fileId for compatibility
                });
            }
        );

        uploadStream.end(buffer);
    });
};

export const deleteFile = async (publicId) => {
    try {
        console.log('🗑️ Deleting file from Cloudinary:', publicId);
        const result = await cloudinary.uploader.destroy(publicId);
        console.log('✅ Delete result:', result);
        return result;
    } catch (error) {
        console.error('❌ Cloudinary delete error:', error);
        throw error;
    }
};

export default {
    uploadFromBuffer,
    deleteFile
};
