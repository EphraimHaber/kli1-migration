import { Document, Schema } from 'mongoose';

export interface IChatList extends Document {
    _id: string | undefined;
    creatorId: Schema.Types.ObjectId;
    usersId: Schema.Types.ObjectId[];
    status: string;
    blacklistUsersId: Schema.Types.ObjectId[];
    type: string;
    projectId: Schema.Types.ObjectId | string;
    date: Date;
    createdAt: Date;
    updatedAt: Date;
    isDelete: boolean;
}
