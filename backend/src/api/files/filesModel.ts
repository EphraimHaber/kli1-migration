import mongoose, { Schema } from 'mongoose';
import { IFiles } from './types';

const files = new Schema<IFiles>({
    url: {
        type: String,
        required: true,
    },
    userId: [
        {
            type: Schema.Types.ObjectId,
            required: true,
        },
    ],
    createdAt: {
        type: Date,
        required: false,
    },
    updatedAt: {
        type: Date,
        required: false,
    },
    fileId: {
        type: Schema.Types.ObjectId,
        required: true,
    },
});

files.pre('save', function (next) {
    const now = new Date();
    this.updatedAt = now;
    if (!this.createdAt) {
        this.createdAt = now;
    }
    next();
});

export const Files = mongoose.model<IFiles>('Files', files);
