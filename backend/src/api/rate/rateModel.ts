import mongoose, { Schema } from 'mongoose';
import { IRate } from './types';

const rate = new Schema<IRate>({
    freelancerId: {
        type: Schema.Types.ObjectId,
        required: true,
    },
    projectId: {
        type: Schema.Types.ObjectId,
        required: true,
    },
    rates: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        required: true,
        default: 'underСonsideration',
    },
    currencyType: {
        type: String,
        required: true,
    },
    term: {
        type: Number,
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    comment: {
        type: String,
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
    name: {
        type: String,
        default: '',
    },
    stepNumber: {
        type: Number,
    },
});

rate.pre('save', function (next) {
    const now = new Date();
    this.updatedAt = now;
    if (!this.createdAt) {
        this.createdAt = now;
    }
    next();
});

export const Rate = mongoose.model<IRate>('Rate', rate);
