import { Document, Schema } from 'mongoose';

export interface IComment extends Document {
    _id: string | undefined;
    userId: Schema.Types.ObjectId;
    projectId: Schema.Types.ObjectId;
    thread: string;
    text: string;
    date: Schema.Types.Date;
    position: number;
    createdAt: Date;
    updatedAt: Date;
    isDelete: boolean;
}
