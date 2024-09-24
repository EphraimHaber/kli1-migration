import mongoose, { Schema } from 'mongoose';
import { IReviews } from './types';

const review = new Schema<IReviews>({
    createrId: {
        type: Schema.Types.ObjectId,
        required: true,
    },
    nameUserCreater: {
        type: String,
        required: true,
    },
    photoUserCreater: {
        type: String,
        required: true,
    },
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
    },
    type: {
        type: String,
        required: true,
    },
    userType: {
        type: String,
        required: true,
    },
    text: {
        type: String,
        required: true,
    },
    projectId: {
        type: Schema.Types.ObjectId,
        required: true,
    },
    categoryProjectId: {
        type: Schema.Types.ObjectId,
        required: true,
    },
    evaluation: {
        type: Number,
        required: true,
    },
    date: {
        type: Date,
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

review.pre('save', function (next) {
    const now = new Date();
    this.updatedAt = now;
    if (!this.createdAt) {
        this.createdAt = now;
    }
    next();
});

export const Reviews = mongoose.model<IReviews>('review', review);
