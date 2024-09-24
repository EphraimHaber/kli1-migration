import mongoose, { Schema, Document } from 'mongoose';

// import langSchema, { langInterface } from './langSchema'
import { langInterface, langSchema } from '@/common/models/langModel';
import { replyOptionSchema, replyOptionInterface } from './replyModel';

export interface questionInterface extends Document {
    _id: string;
    product: string | null;
    name: langInterface[];
    desc: langInterface[];
    replyType: string;
    replyOptions: replyOptionInterface[];
    isVisible: boolean;
    isRequired: boolean;
    sort: string;
    createdAt?: Date;
    updatedAt?: Date;
}

const questionSchema: Schema = new Schema({
    product: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        default: null,
    },
    name: [langSchema],
    desc: [langSchema],
    replyType: {
        type: String,
        default: 'textbox',
    },
    replyOptions: [replyOptionSchema],
    isVisible: {
        type: Boolean,
        default: true,
    },
    isRequired: {
        type: Boolean,
        default: false,
    },
    sort: {
        type: String,
        default: '0',
    },
    createdAt: {
        type: Date,
        required: false,
    },
    updatedAt: {
        type: Date,
        required: false,
    },
});

// delete model to fix OverwriteModelError
// delete mongoose.connection.models.Question
export const Question = mongoose.model<questionInterface>('Question', questionSchema);
