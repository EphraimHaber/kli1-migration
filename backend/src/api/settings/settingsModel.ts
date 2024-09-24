import mongoose, { Schema } from 'mongoose';
import { ISetting } from './types';

const setting = new Schema<ISetting>({
    percentageMarketplace: {
        type: Number,
        defaull: 10,
    },
});

export const Setting = mongoose.model<ISetting>('review', setting);
