import { Document, Schema } from 'mongoose';

export interface IReviews extends Document {
    _id: string | undefined;
    createrId: Schema.Types.ObjectId;
    nameUserCreater: string;
    photoUserCreater: string;
    userId: Schema.Types.ObjectId;
    type: string;
    userType: string;
    text: string;
    projectId: Schema.Types.ObjectId;
    categoryProjectId: Schema.Types.ObjectId;
    evaluation: number;
    date: Date;
    createdAt: Date;
    updatedAt: Date;
    isDelete: boolean;
}
