import { Schema } from 'mongoose';

export interface imageInterface {
    _id?: string;
    publicId: string;
    origName: string;
    src: string;
    alt?: string;
    sort?: string;
}

export const imageSchema = new Schema({
    publicId: String,
    origName: String,
    src: {
        type: String,
        required: true,
    },
    alt: {
        type: String,
        required: false,
    },
    sort: {
        type: String,
        default: '0',
    },
});
