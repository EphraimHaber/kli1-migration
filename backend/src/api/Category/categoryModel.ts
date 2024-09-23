import langSchema, { langInterface } from '@/common/models/admin/langSchema';
import { imageInterface, imageSchema } from '@/common/models/imageModel';
import mongoose, { Schema, Document } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

// import langSchema, { langInterface } from './langSchema'
// import imageSchema, { imageInterface } from './imageSchema'

export interface categoryInterface extends Document {
    _id: string;
    parentCategory?: string | null;
    name: langInterface[];
    shortDesc: langInterface[];
    longDesc: langInterface[];
    metaTitle: langInterface[];
    metaDesc: langInterface[];
    metaKeywords: langInterface[];
    icon: imageInterface;
    images: imageInterface[];
    isVisible: boolean;
    sort: string;
    createdAt?: Date;
    updatedAt?: Date;
    children?: categoryInterface[];
}

const categorySchema: Schema = new Schema({
    parentCategory: {
        type: Schema.Types.ObjectId,
        ref: 'Category',
        default: null,
    },
    name: [langSchema],
    shortDesc: [langSchema],
    longDesc: [langSchema],
    metaTitle: [langSchema],
    metaDesc: [langSchema],
    metaKeywords: [langSchema],
    icon: imageSchema,
    images: [imageSchema],
    isVisible: {
        type: Boolean,
        default: true,
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
    children: {
        type: [this],
        required: false,
    },
});

categorySchema.plugin(mongoosePaginate);

// delete model to fix OverwriteModelError
// delete mongoose.connection.models.Category;
export default mongoose.model<categoryInterface>('Category', categorySchema);
