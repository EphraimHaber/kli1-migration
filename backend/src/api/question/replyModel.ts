import { langInterface, langSchema } from '@/common/models/langModel';
import { Schema } from 'mongoose';

export interface replyOptionInterface {
    _id?: string;
    name: langInterface[];
    sort: string;
}

export const replyOptionSchema = new Schema({
    name: [langSchema],
    sort: {
        type: String,
        default: '0',
    },
});
