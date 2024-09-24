import { Document, Schema } from 'mongoose';

export interface IMailChat extends Document {
    _id: string | undefined;
    senderId: Schema.Types.ObjectId;
    chatRoomId: Schema.Types.ObjectId;
    listenerId: Schema.Types.ObjectId[];
    nameUserSender: string;
    photoUserSender: string;
    typeMail: string;
    text: string;
    serialNumber: number;
    read: boolean;
    date: Date;
    time: string;
    createdAt: Date;
    updatedAt: Date;
    isDelete: boolean;
}
