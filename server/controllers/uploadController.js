import upload from '../utils/multer.js';
import { uploadFromBuffer } from '../utils/cloudinary.js';
import User from '../models/User.js';

// Note: these handlers assume multer middleware is applied in the route
export const uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    const folder = '/profiles';
    const fileName = `profile_${req.userId}_${Date.now()}`;
    const result = await uploadFromBuffer(req.file.buffer, fileName, folder);

    // result.url contains the image URL
    const user = await User.findByIdAndUpdate(req.userId, { profile_picture: result.url }, { new: true });

    return res.status(200).json({ success: true, url: result.url, user });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const uploadPostImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    const folder = '/posts';
    const fileName = `post_${req.userId}_${Date.now()}`;
    const result = await uploadFromBuffer(req.file.buffer, fileName, folder);

    return res.status(200).json({ success: true, url: result.url, file: result });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const uploadStoryImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    const folder = '/stories';
    const fileName = `story_${req.userId}_${Date.now()}`;
    const result = await uploadFromBuffer(req.file.buffer, fileName, folder);

    return res.status(200).json({ success: true, url: result.url, file: result });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const uploadMessageMedia = async (req, res) => {
  try {
    console.log('📤 Upload request received');
    console.log('📤 Has file:', !!req.file);
    console.log('📤 UserId:', req.userId);

    if (!req.file) {
      console.log('❌ No file in request');
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    console.log('📤 File details:', {
      mimetype: req.file.mimetype,
      size: req.file.size,
      originalname: req.file.originalname,
      hasBuffer: !!req.file.buffer,
      bufferLength: req.file.buffer?.length
    });

    const folder = '/messages';
    const fileName = `msg_${req.userId}_${Date.now()}`;
    console.log('📤 Uploading to ImageKit:', fileName);

    const result = await uploadFromBuffer(req.file.buffer, fileName, folder);
    console.log('✅ Upload successful:', result.url);

    return res.status(200).json({ success: true, url: result.url, file: result });
  } catch (err) {
    console.error('❌ Upload message media error:', err);
    console.error('❌ Error message:', err.message);
    console.error('❌ Error stack:', err.stack);
    return res.status(500).json({ success: false, message: err.message });
  }
};

export default {
  uploadProfilePicture,
  uploadPostImage,
  uploadStoryImage,
  uploadMessageMedia
};
