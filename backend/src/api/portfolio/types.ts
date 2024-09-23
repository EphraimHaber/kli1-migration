import { Document, Schema } from 'mongoose';

export interface IPortfolio extends Document {
    _id: string | undefined;
    userId: Schema.Types.ObjectId;
    views: number;
    rates: number;
    position: number;
    image: string;
    title: string;
    specialization: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
    isDelete: boolean;
}
