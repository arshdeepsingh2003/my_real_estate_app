import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();

// Configure Cloudinary using secure process.env variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a file buffer directly to Cloudinary.
 * @param {Buffer} fileBuffer - File data buffer.
 * @returns {Promise<string>} - Resolves to the secure HTTPS URL of the uploaded image.
 */
export const uploadToCloudinary = (fileBuffer, folder = 'estate-app') => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result.secure_url);
      }
    );
    stream.end(fileBuffer);
  });
};
