import mongoose, { Schema } from 'mongoose';
import { IPortfolio } from './types';

const portfolio = new Schema<IPortfolio>({
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
    },
    views: {
        type: Number,
    },
    rates: {
        type: Number,
    },
    position: {
        type: Number,
    },
    image: {
        type: String,
    },
    title: {
        type: String,
    },
    specialization: {
        type: String,
    },
    description: {
        type: String,
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

export const Portfolio = mongoose.model<IPortfolio>('Portfolio', portfolio);
