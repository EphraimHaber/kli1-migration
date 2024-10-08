import mongoose, { Schema } from 'mongoose';
import { IMailChat } from './types';

const mailChat = new Schema<IMailChat>({
    senderId: {
        type: Schema.Types.ObjectId,
        required: true,
    },
    chatRoomId: {
        type: Schema.Types.ObjectId,
        required: true,
    },
    listenerId: [
        {
            type: Schema.Types.ObjectId,
            required: true,
        },
    ],
    nameUserSender: {
        type: String,
        required: true,
    },
    photoUserSender: {
        type: String,
        required: true,
    },
    typeMail: {
        type: String,
        required: true,
    },
    text: {
        type: String,
        required: true,
    },
    serialNumber: {
        type: Number,
        required: true,
    },
    read: {
        type: Boolean,
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    time: {
        type: String,
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

mailChat.pre('save', function (next) {
    const now = new Date();
    this.updatedAt = now;
    if (!this.createdAt) {
        this.createdAt = now;
    }
    next();
});

export const mailChats = mongoose.model<IMailChat>('mailChat', mailChat);
