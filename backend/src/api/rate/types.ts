import { Document, Schema } from 'mongoose';

export interface IRate extends Document {
    _id: string | undefined;
    name: string;
    freelancerId: Schema.Types.ObjectId;
    projectId: Schema.Types.ObjectId;
    rates: number;
    isDelete: boolean;
    status: string;
    currencyType: string;
    term: number;
    date: Schema.Types.Date;
    comment: string;
    position: number;
    createdAt: Date;
    updatedAt: Date;
    stepNumber: number;
}
