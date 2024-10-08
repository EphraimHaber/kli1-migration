import { Document, Schema } from 'mongoose';

export interface ISetting extends Document {
    _id: string | undefined;
    percentageMarketplace: Number;
}
