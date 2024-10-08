import mongoose, { Schema } from 'mongoose';
import { IComment } from './types';

const comment = new Schema<IComment>({
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
    },
    projectId: {
        type: Schema.Types.ObjectId,
        required: true,
    },
    thread: {
        type: String,
        required: true,
    },
    text: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    position: {
        type: Number,
        required: true,
    },
    createdAt: {
        type: Date,
        required: false,
    },
    updatedAt: {
        type: Date,
        required: false,
    },
    isDelete: {
        type: Boolean,
        default: false,
    },
});

export const Comment = mongoose.model<IComment>('Comment', comment);
