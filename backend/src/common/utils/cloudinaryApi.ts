import express from 'express';
import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { v2 } from 'cloudinary';
import { CloudinaryStorage } from '@fluidjs/multer-cloudinary';

/*
// @ts-ignore
import multerCloudinaryStorage from 'multer-storage-cloudinary'
const storage = multerCloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'prod',
    allowedFormats: ['jpg', 'jpeg', 'ico', 'png'],
    public_id: (req: express.Request, file: any) => 'computed-filename-using-request',
  },
});

export const parser = multer({ storage: storage });
*/

v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
    cloudinary: v2,
    params: {
        folder: 'prod',
        allowedFormats: ['jpg', 'jpeg', 'ico', 'png'],
        //format: async (req: Request, file: any) => 'png', // supports promises as well
        //public_id: (req: Request, file: any) => 'computed-filename-using-request',
    },
});

export const multerUpload = multer({ storage: storage });

export const multerUploadFields = multerUpload.fields([
    { name: 'icon', maxCount: 1 },
    { name: 'images', maxCount: 8 },
]);

export const uploadImage = async (image: object) => {
    try {
        let result = await v2.uploader.upload((image as any).path, (error: any, result: any) => {
            if (error) return { type: 'error', message: error };
            return { type: 'success', data: { result: result, image: image } };
        });
        return result;
    } catch (err) {
        return { type: 'error', message: err };
    }
};

export const deleteImage = async (id: string) => {
    try {
        const result = await v2.uploader.destroy(id, (error: any, result: any) => {
            if (error) return { type: 'error', message: error };
            return { type: 'success', data: result };
        });
        return result;
    } catch (err) {
        return { type: 'error', message: err };
    }
};
