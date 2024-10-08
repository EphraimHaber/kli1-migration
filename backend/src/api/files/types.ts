import { Document, Schema } from 'mongoose';

export interface IFiles extends Document {
    _id: string | undefined;
    url: string;
    userId: Schema.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
    fileId: Schema.Types.ObjectId;
}
