import { v2 as cloudinary } from 'cloudinary';
import CustomError from './customError.js';
import fs from "fs"

import dotenv from 'dotenv';
dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});

export const uploadToCloudinary = async (filePath) => {
    try {
        const result = await cloudinary.uploader.upload(filePath);
        fs.unlinkSync(filePath)
        return result;
    } catch (error) {
        return next(new CustomError(400, "failed to upload to cloudinary"))
    }
};
