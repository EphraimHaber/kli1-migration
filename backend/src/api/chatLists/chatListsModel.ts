import mongoose, { Schema } from 'mongoose';
import { IChatList } from './types';

const chatList = new Schema<IChatList>({
    creatorId: {
        type: Schema.Types.ObjectId,
        required: true,
    },
    usersId: [
        {
            type: Schema.Types.ObjectId,
        },
    ],
    status: {
        type: String,
        required: true,
    },
    blacklistUsersId: [
        {
            type: Schema.Types.ObjectId,
        },
    ],
    type: {
        type: String,
        required: true,
    },
    projectId: {
        type: Schema.Types.ObjectId,
        required: false,
    },
    date: {
        type: Date,
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
});

chatList.pre('save', function (next) {
    const now = new Date();
    this.updatedAt = now;
    if (!this.createdAt) {
        this.createdAt = now;
    }
    next();
});

export const chatLists = mongoose.model<IChatList>('chatList', chatList);
