import ImageKit from 'imagekit';

let imagekit = null;

const getImageKit = () => {
  if (!imagekit) {
    const { IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, IMAGEKIT_URL_ENDPOINT } = process.env;

    console.log('🔍 ImageKit env check (before trim):', {
      hasPublicKey: !!IMAGEKIT_PUBLIC_KEY,
      publicKeyLength: IMAGEKIT_PUBLIC_KEY?.length,
      hasPrivateKey: !!IMAGEKIT_PRIVATE_KEY,
      privateKeyLength: IMAGEKIT_PRIVATE_KEY?.length,
      hasUrlEndpoint: !!IMAGEKIT_URL_ENDPOINT,
      urlEndpointLength: IMAGEKIT_URL_ENDPOINT?.length,
      urlEndpointValue: IMAGEKIT_URL_ENDPOINT
    });

    if (!IMAGEKIT_PUBLIC_KEY || !IMAGEKIT_PRIVATE_KEY || !IMAGEKIT_URL_ENDPOINT) {
      console.error('❌ Missing ImageKit configuration:');
      if (!IMAGEKIT_PUBLIC_KEY) console.error('   - IMAGEKIT_PUBLIC_KEY is missing');
      if (!IMAGEKIT_PRIVATE_KEY) console.error('   - IMAGEKIT_PRIVATE_KEY is missing');
      if (!IMAGEKIT_URL_ENDPOINT) console.error('   - IMAGEKIT_URL_ENDPOINT is missing');
      throw new Error('ImageKit configuration missing');
    }

    // Trim values to remove any whitespace
    const publicKey = IMAGEKIT_PUBLIC_KEY.trim();
    const privateKey = IMAGEKIT_PRIVATE_KEY.trim();
    const urlEndpoint = IMAGEKIT_URL_ENDPOINT.trim();

    console.log('🔍 ImageKit env check (after trim):', {
      publicKeyLength: publicKey.length,
      privateKeyLength: privateKey.length,
      urlEndpointLength: urlEndpoint.length,
      urlEndpointValue: urlEndpoint
    });

    try {
      console.log('🔧 Attempting ImageKit initialization...');
      imagekit = new ImageKit({
        publicKey: publicKey,
        privateKey: privateKey,
        urlEndpoint: urlEndpoint
      });
      console.log('✅ ImageKit initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize ImageKit:', error.message);
      console.error('   Error details:', error);
      throw error;
    }
  }
  return imagekit;
};

export const uploadFromBuffer = async (buffer, fileName, folder = '/') => {
  try {
    console.log('🔄 uploadFromBuffer called:', { fileName, folder, bufferLength: buffer?.length });
    const ik = getImageKit();
    console.log('✅ ImageKit instance obtained');

    const base64Data = buffer.toString('base64');
    console.log('✅ Buffer converted to base64, length:', base64Data.length);

    const result = await ik.upload({
      file: base64Data,
      fileName,
      folder
    });
    console.log('✅ ImageKit upload complete:', { url: result.url, fileId: result.fileId });
    return result;
  } catch (err) {
    console.error('❌ uploadFromBuffer error:', err.message);
    console.error('❌ Full error:', err);
    throw err;
  }
};

export const deleteFile = async (fileId) => {
  try {
    const ik = getImageKit();
    return await ik.deleteFile(fileId);
  } catch (err) {
    throw err;
  }
};

export default {
  getImageKit,
  uploadFromBuffer,
  deleteFile
};
